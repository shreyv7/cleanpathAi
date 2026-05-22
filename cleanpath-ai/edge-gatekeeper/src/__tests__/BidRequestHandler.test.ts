/**
 * BidRequestHandler Integration Tests
 */

import { BidRequestHandler } from '../handlers/BidRequestHandler';
import { MFAThermalEngine } from '../rules/MFAThermalEngine';
import { PublisherCache } from '../cache/PublisherCache';
import { DecisionHandler } from '../handlers/DecisionHandler';
import { createLogger, LogLevel } from '@cleanpath/logging';
import { BidRequest, DeviceType, AdFormat, DecisionType, BlockReason, AdPosition, PublisherStatus, PublisherTier } from '@cleanpath/types';

describe('BidRequestHandler Integration', () => {
    let handler: BidRequestHandler;
    let cache: PublisherCache;
    let thermalEngine: MFAThermalEngine;
    let decisionHandler: DecisionHandler;
    let logger: any;

    beforeEach(() => {
        logger = createLogger({
            level: LogLevel.ERROR,
            service: 'test',
            environment: 'test',
        });

        thermalEngine = new MFAThermalEngine();

        cache = new PublisherCache({
            lruMaxSize: 100,
            lruTTL: 1000,
            enableRedis: false,
        });

        decisionHandler = new DecisionHandler(undefined, logger);

        const mockAuditLogger = {
            recordDecision: jest.fn(),
        };

        handler = new BidRequestHandler(
            thermalEngine,
            cache,
            decisionHandler,
            mockAuditLogger as any,
            {
                maxLatencyMs: 50,
                enableMetrics: false,
                enableDetailedLogging: false,
            },
            logger
        );
    });

    const validBidRequest: BidRequest = {
        id: 'req_123',
        timestamp: Date.now(),
        impressions: [
            {
                id: 'imp_1',
                format: AdFormat.BANNER,
                position: AdPosition.ABOVE_FOLD,
                width: 300,
                height: 250,
                bidFloor: 1.0,
                secure: true,
            },
        ],
        site: {
            id: 'site_1',
            name: 'Example Site',
            domain: 'example.com',
            page: 'https://example.com/article',
            mobile: false,
            publisher: {
                id: 'pub_1',
                name: 'Example Publisher',
                domain: 'example.com',
                categories: ['news'],
            },
        },
        device: {
            type: DeviceType.DESKTOP,
            ua: 'Mozilla/5.0...',
            ip: '1.2.3.4',
        },
        test: true,
    };

    it('should process valid request and return decision', async () => {
        const response = await handler.process(validBidRequest);

        expect(response.decision).toBeDefined();
        expect(response.decision.requestId).toBe('req_123');
        expect(response.decision.decision).toBeDefined();
        expect(response.cacheHit).toBe(false);
        expect(response.fallbackUsed).toBe(false);
    });

    it('should validate request fields', async () => {
        const invalidRequest = { ...validBidRequest, id: '' }; // Missing ID

        const response = await handler.process(invalidRequest as BidRequest);

        expect(response.decision.decision).toBe(DecisionType.BLOCK);
        expect(response.decision.blockReason).toBe(BlockReason.INVALID_REQUEST);
    });

    it('should use cached publisher data when available', async () => {
        // Seed cache
        await cache.set('pub_1', {
            profile: {
                id: 'pub_1',
                name: 'Cached Publisher',
                domain: 'example.com',
                status: PublisherStatus.ACTIVE,
                tier: PublisherTier.STANDARD,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                metadata: {
                    categories: [],
                },
            },
            mfaProfile: {
                publisherId: 'pub_1',
                currentRiskLevel: 'CLEAN' as any,
                currentThermalScore: {
                    overall: 10,
                    breakdown: { adDensity: 10, engagement: 10, contentQuality: 10, domainReputation: 10 },
                    signals: [],
                    confidence: 1.0,
                },
                historicalScores: [],
                lastEvaluated: Date.now(),
                evaluationCount: 1,
            },
            cachedAt: Date.now(),
            ttl: 300,
        });

        const response = await handler.process(validBidRequest);

        expect(response.cacheHit).toBe(true);
        expect(response.decision.decision).toBe(DecisionType.ALLOW);
    });

    it('should handle MFA publishers correctly', async () => {
        // Seed cache with MFA profile
        await cache.set('pub_mfa', {
            profile: {
                id: 'pub_mfa',
                name: 'MFA Publisher',
                domain: 'mfa.com',
                status: PublisherStatus.ACTIVE,
                tier: PublisherTier.PROBATION,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                metadata: {
                    categories: [],
                },
            },
            mfaProfile: {
                publisherId: 'pub_mfa',
                currentRiskLevel: 'HIGH' as any,
                currentThermalScore: {
                    overall: 90,
                    breakdown: { adDensity: 90, engagement: 90, contentQuality: 90, domainReputation: 90 },
                    signals: [],
                    confidence: 1.0,
                },
                historicalScores: [],
                lastEvaluated: Date.now(),
                evaluationCount: 1,
            },
            cachedAt: Date.now(),
            ttl: 300,
        });

        const mfaRequest = {
            ...validBidRequest,
            site: {
                ...validBidRequest.site,
                publisher: { id: 'pub_mfa', name: 'MFA Publisher', domain: 'mfa.com', categories: [] },
            },
        };

        const response = await handler.process(mfaRequest);

        expect(response.decision.decision).toBe(DecisionType.BLOCK);
        expect(response.decision.blockReason).toBe(BlockReason.MFA_HIGH_RISK);
    });

    it('should track processing latency', async () => {
        const response = await handler.process(validBidRequest);

        expect(response.decision.processingTimeMs).toBeGreaterThanOrEqual(0);
        expect(response.decision.processingTimeMs).toBeLessThan(50);
    });

    it('should return health check status', async () => {
        const health = await handler.healthCheck();

        expect(health.healthy).toBe(true);
        expect(health.details.cache).toBeDefined();
        expect(health.details.thermalEngine).toBeDefined();
    });

    it('should handle component failures gracefully', async () => {
        // Mock thermal engine to throw error
        jest.spyOn(thermalEngine, 'classify').mockImplementation(() => {
            throw new Error('Simulation of engine failure');
        });

        const response = await handler.process(validBidRequest);

        // Should fail open (Allow)
        expect(response.decision.decision).toBe(DecisionType.ALLOW);
        expect(response.fallbackUsed).toBe(true);
    });
});
