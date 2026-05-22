/**
 * Bid Request Handler
 * Main entry point for processing bid requests at the edge
 * Supports both MFA classification and CTV spoof detection
 */

import {
    BidRequest,
    EdgeDecision,
    EdgeDecisionResponse,
    DecisionType,
    BlockReason,
    DeviceType,
    CTVFeatureVector,
} from '@cleanpath/types';
import { Logger, generateRequestId } from '@cleanpath/logging';
import { MFAThermalEngine } from '../rules/MFAThermalEngine';
import { PublisherCache } from '../cache/PublisherCache';
import { DecisionHandler } from '../handlers/DecisionHandler';
import { PublisherMetrics, DEFAULT_PUBLISHER_METRICS } from '../rules/publisherMetrics';
import { AuditLogger } from '../services/AuditLogger';
import { CTVSpoofGuard } from '../rules/CTVSpoofGuard';
import { CTVDeviceCache } from '../cache/CTVDeviceCache';
import { CTVFeatureExtractor } from '../ml/CTVFeatureExtractor';
import { createRedisClient, DEFAULT_REDIS_CONFIG, RedisClient } from '../cache/RedisClient';

import { PacingOrchestrator } from '../pacing/PacingOrchestrator';
import { BidShader } from '../bidding/BidShader';

export interface BidRequestHandlerConfig {
    maxLatencyMs: number; // Target max latency
    enableMetrics: boolean;
    enableDetailedLogging: boolean;
}

export interface RequestValidationResult {
    valid: boolean;
    errors: string[];
}

export class BidRequestHandler {
    private thermalEngine: MFAThermalEngine;
    private cache: PublisherCache;
    private decisionHandler: DecisionHandler;
    private auditLogger: AuditLogger;
    private config: BidRequestHandlerConfig;
    private logger: Logger;
    private ctvSpoofGuard?: CTVSpoofGuard;
    private ctvDeviceCache?: CTVDeviceCache;
    private ctvFeatureExtractor?: CTVFeatureExtractor;
    private pacingOrchestrator?: PacingOrchestrator;
    private bidShader?: BidShader;
    private redisClient?: RedisClient;

    constructor(
        thermalEngine: MFAThermalEngine,
        cache: PublisherCache,
        decisionHandler: DecisionHandler,
        auditLogger: AuditLogger,
        config: BidRequestHandlerConfig,
        logger: Logger,
        ctvSpoofGuard?: CTVSpoofGuard,
        ctvDeviceCache?: CTVDeviceCache,
        ctvFeatureExtractor?: CTVFeatureExtractor,
        pacingOrchestrator?: PacingOrchestrator,
        bidShader?: BidShader,
    ) {
        this.thermalEngine = thermalEngine;
        this.cache = cache;
        this.decisionHandler = decisionHandler;
        this.auditLogger = auditLogger;
        this.config = config;
        this.logger = logger;
        this.ctvSpoofGuard = ctvSpoofGuard;
        this.ctvDeviceCache = ctvDeviceCache;
        console.log('--- DEBUG: BidRequestHandler constructor received ctvFeatureExtractor: ', ctvFeatureExtractor);
        this.ctvFeatureExtractor = ctvFeatureExtractor || new CTVFeatureExtractor();
        this.pacingOrchestrator = pacingOrchestrator;
        this.bidShader = bidShader;

        // Initialize dedicated Redis client for Pulse (Module C) without key prefixes
        try {
            const redisConfig = {
                ...DEFAULT_REDIS_CONFIG,
                keyPrefix: undefined
            };
            this.redisClient = createRedisClient(redisConfig);
            this.redisClient.connect().catch(err => {
                this.logger.error('Failed to connect to Redis inside BidRequestHandler for Pulse verification', err);
            });
        } catch (error) {
            this.logger.error('Error instantiating Redis inside BidRequestHandler', error);
        }
    }

    /**
     * Process a bid request and return a decision
     */
    async process(bidRequest: BidRequest): Promise<EdgeDecisionResponse> {
        const startTime = Date.now();
        const requestId = bidRequest.id || generateRequestId();

        // Create request-scoped logger
        const requestLogger = this.logger.child({ requestId });

        try {
            // Validate request
            const validation = this.validateRequest(bidRequest);
            if (!validation.valid) {
                requestLogger.warn('Invalid bid request', {
                    errors: validation.errors,
                    publisherId: bidRequest.site.publisher.id,
                });

                return this.createErrorResponse(
                    requestId,
                    bidRequest.site.publisher.id,
                    bidRequest.site.domain,
                    BlockReason.INVALID_REQUEST,
                    startTime
                );
            }

            const publisherId = bidRequest.site.publisher.id;
            const domain = bidRequest.site.domain;

            requestLogger.debug('Processing bid request', {
                publisherId,
                domain,
                impressionCount: bidRequest.impressions.length,
            });

            // 1. Check Pulse Human Validation status (Module C)
            const ifa = bidRequest.ctv?.ifa || (bidRequest as any).device?.ifa;
            if (ifa && this.redisClient) {
                try {
                    const pulseVerdict = await this.redisClient.get(`pulse:ifa:${ifa}`);
                    if (pulseVerdict === 'BOT') {
                        requestLogger.info('Blocking bid request due to Pulse Bot Detection', { ifa });
                        return this.createErrorResponse(
                            requestId,
                            publisherId,
                            domain,
                            BlockReason.FRAUD_DETECTED,
                            startTime
                        );
                    }
                } catch (err) {
                    requestLogger.error('Error fetching Pulse validation status from Redis', err);
                }
            }

            // Check cache for publisher data
            const cachedPublisher = await this.cache.get(publisherId);
            let cacheHit = !!cachedPublisher;

            // Get or create publisher metrics
            let metrics: PublisherMetrics;
            if (cachedPublisher?.mfaProfile) {
                // Use cached metrics
                metrics = this.extractMetricsFromCache(cachedPublisher, bidRequest);
            } else {
                // Use default metrics for unknown publishers
                metrics = this.createDefaultMetrics(publisherId, domain);
                cacheHit = false;
            }

            // Classify publisher using thermal engine
            const classificationResult = this.thermalEngine.classify(metrics);

            // CTV spoof detection (extracted for testability)
            const { ctvSpoofResult, ctvFeatures } = this.evaluateCTV(bidRequest, requestId, requestLogger);

            // Pacing check (extracted for testability)
            const campaignId = 'campaign-1'; // Default for MVP
            const pacingBlocked = await this.checkPacing(campaignId, requestLogger);
            if (pacingBlocked) {
                return this.createErrorResponse(
                    requestId, publisherId, domain,
                    BlockReason.BUDGET_EXHAUSTED, startTime
                );
            }

            // Make decision
            const decisionResult = await this.decisionHandler.decide({
                requestId,
                publisherId,
                domain,
                classification: classificationResult.classification,
                cacheHit,
                processingStartTime: startTime,
                deviceType: bidRequest.device.type,
                ctvSpoofResult,
                ctvFeatures,
                schain: bidRequest.schain,
            });

            // Bid shading (extracted for testability)
            await this.applyBidShading(decisionResult, publisherId, campaignId, requestLogger);

            const totalLatency = Date.now() - startTime;

            // Log performance warning if exceeding target
            if (totalLatency > this.config.maxLatencyMs) {
                requestLogger.warn('Latency exceeded target', {
                    latencyMs: totalLatency,
                    targetMs: this.config.maxLatencyMs,
                    publisherId,
                });
            }

            // Log decision
            if (this.config.enableDetailedLogging) {
                requestLogger.info('Decision made', {
                    publisherId,
                    domain,
                    decision: decisionResult.decision.decision,
                    thermalScore: classificationResult.classification.thermalScore.overall,
                    riskLevel: classificationResult.classification.riskLevel,
                    latencyMs: totalLatency,
                    cacheHit,
                });
            }

            // Track metrics
            if (this.config.enableMetrics) {
                this.logger.performance('Bid request processed', totalLatency, {
                    requestId,
                    publisherId,
                    decision: decisionResult.decision.decision,
                    cacheHit,
                });
            }

            // Record decision for auditing
            this.auditLogger.recordDecision(decisionResult.decision);

            return {
                decision: decisionResult.decision,
                cacheHit,
                fallbackUsed: decisionResult.usedFailOpen,
            };
        } catch (error) {
            requestLogger.error('Error processing bid request', error, {
                publisherId: bidRequest.site.publisher.id,
                domain: bidRequest.site.domain,
            });

            const errorResponse = this.createErrorResponse(
                requestId,
                bidRequest.site.publisher.id,
                bidRequest.site.domain,
                BlockReason.INVALID_REQUEST,
                startTime,
                true
            );

            // Record error/fail-open decision
            this.auditLogger.recordDecision(errorResponse.decision);

            return errorResponse;
        }
    }

    /**
     * Validate bid request
     */
    private validateRequest(bidRequest: BidRequest): RequestValidationResult {
        const errors: string[] = [];

        if (!bidRequest.id) {
            errors.push('Missing request ID');
        }

        if (!bidRequest.site) {
            errors.push('Missing site information');
        } else {
            if (!bidRequest.site.publisher) {
                errors.push('Missing publisher information');
            } else {
                if (!bidRequest.site.publisher.id) {
                    errors.push('Missing publisher ID');
                }
                if (!bidRequest.site.publisher.domain) {
                    errors.push('Missing publisher domain');
                }
            }

            if (!bidRequest.site.domain) {
                errors.push('Missing site domain');
            }
        }

        if (!bidRequest.impressions || bidRequest.impressions.length === 0) {
            errors.push('Missing impressions');
        }

        if (!bidRequest.device) {
            errors.push('Missing device information');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Extract metrics from cached publisher data
     */
    private extractMetricsFromCache(
        cachedPublisher: any,
        bidRequest: BidRequest
    ): PublisherMetrics {
        const mfaProfile = cachedPublisher.mfaProfile;
        const breakdown = mfaProfile.currentThermalScore?.breakdown;

        return {
            publisherId: cachedPublisher.profile.id,
            domain: cachedPublisher.profile.domain,
            // Reconstruct metrics to match cached breakdown scores (higher breakdown score means high ad density, low engagement, poor content quality, low domain reputation)
            adsPerViewport: breakdown?.adDensity !== undefined ? (breakdown.adDensity > 50 ? 6.0 : 2.5) : 2.5,
            totalAds: bidRequest.impressions.length,
            viewportArea: 1920 * 1080, // Default viewport
            avgEngagementTime: breakdown?.engagement !== undefined ? (breakdown.engagement > 50 ? 5.0 : 30.0) : 30.0,
            bounceRate: 0.5,
            pagesPerSession: 1.5,
            contentToAdRatio: breakdown?.contentQuality !== undefined ? (breakdown.contentQuality > 50 ? 0.15 : 0.6) : 0.6,
            textContentLength: 5000,
            imageContentCount: 10,
            domainReputationScore: breakdown?.domainReputation !== undefined ? (100 - breakdown.domainReputation) : 50.0,
            domainAge: 365,
            paidTrafficRatio: 0.3,
            organicTrafficRatio: 0.5,
            directTrafficRatio: 0.2,
            previousThermalScore: mfaProfile.currentThermalScore?.overall,
            historicalBlockRate: 0.1,
        };
    }

    /**
     * Create default metrics for unknown publishers
     */
    private createDefaultMetrics(publisherId: string, domain: string): PublisherMetrics {
        return {
            publisherId,
            domain,
            ...DEFAULT_PUBLISHER_METRICS,
            totalAds: 2,
            viewportArea: 1920 * 1080,
            textContentLength: 5000,
            imageContentCount: 10,
            domainAge: 365,
        } as PublisherMetrics;
    }

    /**
     * Evaluate CTV spoof detection for a bid request.
     * Extracted from process() for testability and separation of concerns.
     */
    private evaluateCTV(
        bidRequest: BidRequest,
        requestId: string,
        requestLogger: any
    ): { ctvSpoofResult: any; ctvFeatures: CTVFeatureVector | undefined } {
        let ctvSpoofResult = undefined;
        let ctvFeatures: CTVFeatureVector | undefined;

        if (
            bidRequest.device.type === DeviceType.CTV &&
            bidRequest.ctv &&
            this.ctvSpoofGuard
        ) {
            ctvSpoofResult = this.ctvSpoofGuard.evaluate(bidRequest);

            // Track device fingerprint mutations via cache
            if (this.ctvDeviceCache && bidRequest.ctv.ifa && bidRequest.ctv.deviceFingerprint) {
                const mutationResult = this.ctvDeviceCache.set(
                    bidRequest.ctv.ifa,
                    bidRequest.ctv.deviceFingerprint,
                );

                if (mutationResult.hasMutations && ctvSpoofResult) {
                    ctvSpoofResult = {
                        ...ctvSpoofResult,
                        signals: [...ctvSpoofResult.signals, ...mutationResult.signals],
                        deviceRiskScore: Math.min(
                            100,
                            ctvSpoofResult.deviceRiskScore + mutationResult.riskIncrease,
                        ),
                    };
                }
            }

            // Extract ML features for training data collection
            if (this.ctvFeatureExtractor && ctvSpoofResult) {
                const ctvHistory = (this.ctvDeviceCache && bidRequest.ctv?.ifa)
                    ? this.ctvDeviceCache.get(bidRequest.ctv.ifa)
                    : null;

                ctvFeatures = this.ctvFeatureExtractor?.extractFeatures?.(
                    bidRequest,
                    ctvSpoofResult,
                    ctvHistory
                );

                if (ctvFeatures) {
                    this.auditLogger.log('ctv_ml_features', {
                        requestId,
                        ifa: bidRequest.ctv?.ifa,
                        verdict: ctvSpoofResult.verdict,
                        features: ctvFeatures
                    });
                }
            }

            requestLogger.debug('CTV evaluation complete', {
                ifa: bidRequest.ctv.ifa,
                riskScore: ctvSpoofResult.deviceRiskScore,
                verdict: ctvSpoofResult.verdict,
                signalCount: ctvSpoofResult.signals.length,
            });
        }

        return { ctvSpoofResult, ctvFeatures };
    }

    /**
     * Check pacing budget for a campaign.
     * Returns true if the request should be BLOCKED due to pacing limits.
     */
    private async checkPacing(campaignId: string, requestLogger: any): Promise<boolean> {
        if (!this.pacingOrchestrator) return false;

        const pacer = await this.pacingOrchestrator.getPacer(campaignId);
        const allowed = await pacer.checkPacing(campaignId);

        if (!allowed) {
            requestLogger.info('Pacing limit reached', { campaignId });
            return true;
        }
        return false;
    }

    /**
     * Apply bid shading to reduce overpayment on allowed bids.
     * Modifies the decision in-place with shaded price.
     */
    private async applyBidShading(
        decisionResult: any,
        publisherId: string,
        campaignId: string,
        requestLogger: any
    ): Promise<void> {
        if (decisionResult.decision.decision !== DecisionType.ALLOW || !this.bidShader) return;

        const valuation = 5.0; // Default CPM $5.00
        const shadingResult = await this.bidShader.shadeBid(publisherId, valuation, 0.7, this.redisClient);

        decisionResult.decision.metadata = {
            ...decisionResult.decision.metadata,
            shadedPrice: shadingResult.shadedPrice,
            originalPrice: valuation,
            savings: shadingResult.savings
        };

        decisionResult.decision.price = shadingResult.shadedPrice;

        requestLogger.debug('Bid Shaded', {
            campaignId,
            original: valuation,
            shaded: shadingResult.shadedPrice,
            savings: shadingResult.savings,
            strategy: (shadingResult as any).strategy
        });
    }

    /**
     * Create error response
     */
    private createErrorResponse(
        requestId: string,
        publisherId: string,
        domain: string,
        blockReason: BlockReason,
        startTime: number,
        fallbackUsed: boolean = false
    ): EdgeDecisionResponse {
        const decision: EdgeDecision = {
            requestId,
            decision: fallbackUsed ? DecisionType.ALLOW : DecisionType.BLOCK,
            timestamp: Date.now(),
            processingTimeMs: Date.now() - startTime,
            metadata: {
                publisherId,
                domain,
            },
            blockReason: fallbackUsed ? undefined : blockReason,
        };

        return {
            decision,
            cacheHit: false,
            fallbackUsed,
        };
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<{ healthy: boolean; details: any }> {
        try {
            const cacheStats = this.cache.getStats();

            return {
                healthy: true,
                details: {
                    cache: {
                        l1Size: cacheStats.l1.size,
                        l1HitRate: cacheStats.l1.hitRate,
                        l2Enabled: cacheStats.l2.enabled,
                    },
                    thermalEngine: {
                        version: '1.0.0',
                        rulesEnabled: this.thermalEngine.getRuleConfig().rules.filter((r) => r.enabled)
                            .length,
                    },
                },
            };
        } catch (error) {
            this.logger.error('Health check failed', error);
            return {
                healthy: false,
                details: { error: (error as Error).message },
            };
        }
    }
}

/**
 * Create bid request handler
 */
export function createBidRequestHandler(
    thermalEngine: MFAThermalEngine,
    cache: PublisherCache,
    decisionHandler: DecisionHandler,
    auditLogger: AuditLogger,
    config: BidRequestHandlerConfig,
    logger: Logger,
    ctvSpoofGuard?: CTVSpoofGuard,
    ctvDeviceCache?: CTVDeviceCache,
    ctvFeatureExtractor?: CTVFeatureExtractor,
    pacingOrchestrator?: PacingOrchestrator,
    bidShader?: BidShader,
): BidRequestHandler {
    return new BidRequestHandler(
        thermalEngine, cache, decisionHandler, auditLogger,
        config, logger, ctvSpoofGuard, ctvDeviceCache, ctvFeatureExtractor,
        pacingOrchestrator, bidShader
    );
}
