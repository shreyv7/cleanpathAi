/**
 * Decision Handler
 * Translates thermal scores and CTV spoof signals into bid decisions
 */

import {
    EdgeDecision,
    DecisionType,
    BlockReason,
    BidModifier,
    MFAClassification,
    CTVSpoofResult,
    DeviceType,
    CTVFeatureVector,
    SupplyChainPath,
} from '@cleanpath/types';
import { CTVModelInference } from '../ml/CTVModelInference';
import { Logger } from '@cleanpath/logging';
import {
    DecisionConfig,
    DEFAULT_DECISION_CONFIG,
    validateDecisionConfig,
} from './decisionConfig';

export interface DecisionContext {
    requestId: string;
    publisherId: string;
    domain: string;
    classification?: MFAClassification;
    cacheHit: boolean;
    processingStartTime: number;
    /** Device type from the bid request */
    deviceType?: DeviceType;
    /** CTV spoof evaluation result (present only for CTV requests) */
    ctvSpoofResult?: CTVSpoofResult;
    /** ML features for CTV requests */
    ctvFeatures?: CTVFeatureVector;
    /** Supply Chain object representing the path the bid request took */
    schain?: SupplyChainPath;
}

export interface DecisionResult {
    decision: EdgeDecision;
    usedFailOpen: boolean;
}

export class DecisionHandler {
    private config: DecisionConfig;
    private logger?: Logger;
    private ctvModel?: CTVModelInference;

    constructor(config: DecisionConfig = DEFAULT_DECISION_CONFIG, logger?: Logger, ctvModel?: CTVModelInference) {
        if (!validateDecisionConfig(config)) {
            throw new Error('Invalid decision configuration');
        }
        this.config = config;
        this.config = config;
        this.logger = logger;
        this.ctvModel = ctvModel;
    }

    /**
     * Make a decision based on MFA classification and/or CTV spoof result.
     * CTV requests are first evaluated for spoof signals; non-CTV requests
     * pass through the existing MFA thermal score path.
     */
    async decide(context: DecisionContext): Promise<DecisionResult> {
        const startTime = Date.now();

        // Route CTV requests through CTV decision logic
        if (context.deviceType === DeviceType.CTV && context.ctvSpoofResult) {
            return this.decideCTV(context, startTime);
        }

        if (!context.classification) {
            return this.handleFailOpen(context, startTime);
        }

        // Financial Core Phase 2: Path Elimination & REROUTE Logic
        // Enforce the shortest valid supply path dynamically.
        // If there is more than 1 intermediary hop, redirect to the most direct hop.
        if (context.schain && context.schain.nodes && context.schain.nodes.length > 1) {
            const directTarget = context.schain.nodes[0].asi; // First hop (most direct)
            const decision: EdgeDecision = {
                requestId: context.requestId,
                decision: DecisionType.REROUTE,
                timestamp: Date.now(),
                processingTimeMs: Date.now() - startTime,
                metadata: {
                    publisherId: context.publisherId,
                    domain: context.domain,
                },
                rerouteTarget: directTarget,
            };

            this.logger?.info('Decision: REROUTE (Suboptimal Path Detected)', {
                requestId: context.requestId,
                publisherId: context.publisherId,
                hopCount: context.schain.nodes.length,
                rerouteTarget: directTarget
            });

            return { decision, usedFailOpen: false };
        }

        const { classification } = context;
        const thermalScore = classification.thermalScore.overall;
        const riskLevel = classification.riskLevel;

        // Determine decision based on thermal score
        let decisionType: DecisionType;
        let blockReason: BlockReason | undefined;
        let bidModifier: BidModifier | undefined;

        if (thermalScore <= this.config.thresholds.clean.maxScore) {
            // Clean publisher - allow
            decisionType = DecisionType.ALLOW;
            this.logger?.debug('Decision: ALLOW', {
                requestId: context.requestId,
                publisherId: context.publisherId,
                thermalScore,
                riskLevel,
            });
        } else if (
            thermalScore >= this.config.thresholds.moderate.minScore &&
            thermalScore <= this.config.thresholds.moderate.maxScore
        ) {
            // Moderate risk - bid modifier
            if (this.config.enableBidModifier) {
                decisionType = DecisionType.BID_MODIFIER;
                bidModifier = {
                    type: 'multiply',
                    value: 1 - (this.config.thresholds.moderate.bidReduction || 0.4),
                    reason: `Moderate MFA risk (score: ${thermalScore})`,
                };
                this.logger?.debug('Decision: BID_MODIFIER', {
                    requestId: context.requestId,
                    publisherId: context.publisherId,
                    thermalScore,
                    riskLevel,
                    reduction: this.config.thresholds.moderate.bidReduction,
                });
            } else {
                // Fallback to ALLOW if bid modifier disabled
                decisionType = DecisionType.ALLOW;
            }
        } else {
            // High risk - block
            decisionType = DecisionType.BLOCK;
            blockReason = BlockReason.MFA_HIGH_RISK;
            this.logger?.info('Decision: BLOCK', {
                requestId: context.requestId,
                publisherId: context.publisherId,
                domain: context.domain,
                thermalScore,
                riskLevel,
                signals: classification.thermalScore.signals,
            });
        }


        const totalProcessingTimeMs = Date.now() - context.processingStartTime;

        const decision: EdgeDecision = {
            requestId: context.requestId,
            decision: decisionType,
            timestamp: Date.now(),
            processingTimeMs: totalProcessingTimeMs,
            metadata: {
                publisherId: context.publisherId,
                domain: context.domain,
                thermalScore,
                riskLevel,
            },
            blockReason,
            bidModifier,
        };

        return {
            decision,
            usedFailOpen: false,
        };
    }

    /**
     * CTV-specific decision logic.
     * BLOCK for risk >80, BID_MODIFIER for 50-80, ALLOW otherwise.
     */
    private async decideCTV(context: DecisionContext, _startTime: number): Promise<DecisionResult> {
        const ctvResult = context.ctvSpoofResult!;
        const totalProcessingTimeMs = Date.now() - context.processingStartTime;

        let decisionType: DecisionType;
        let blockReason: BlockReason | undefined;
        let bidModifier: BidModifier | undefined;

        // Run ML Inference if model and features are available
        // We do this asynchronously but we need to wait for it.
        // Wait, decideLambda is synchronous usually? 
        // If predict is async, we need to make decide() async. 
        // Refactoring decide() to be async is a big change.
        // For now, if ML is async, we might skip it or make decide async.

        // Typescript limitation: If interface is sync, we can't be async.
        // Let's assume prediction is fast or we fire-and-forget for logging?
        // But we want to BLOCK based on it.

        // I will make this method async in next step if generic 'decide' allows it?
        // 'decide' returns DecisionResult, not Promise.

        // Assuming we fire-and-forget for now or just log? 
        // The implementation plan said "Integrate into DecisionHandler". 
        // If onnxruntime-node is async, we MUST make decide async.

        // Checking DecisionHandler structure... it is synchronous.
        // Refactoring to async is necessary for ONNX.

        // For this step, I'll valid logic based on Rule Engine risk score first, 
        // and add a TODO for ML Async integration, or check if I can make it async.

        // Actually, I can check if onnxruntime has a sync run method? 
        // No, sess.run is async.

        // I will proceed with rule-based logic here as placeholder 
        // and handle async refactor in a separate step if needed.
        // But wait, the user wants ML model.

        // Let's modify 'decide' to return Promise<DecisionResult>.
        // Takes more edits.

        // I will interpret this tool call as preparing the imports and fields first.
        // I won't change method signature yet to avoid breaking everything at once.

        // Run ML Inference if available
        let mlScore = -1;
        if (this.ctvModel && context.ctvFeatures) {
            mlScore = await this.ctvModel.predict(context.ctvFeatures);
            // Log ML score
            if (mlScore >= 0) {
                this.logger?.debug('CTV ML Inference', {
                    requestId: context.requestId,
                    ifa: ctvResult.ifa,
                    mlScore
                });
            }
        }

        // Combine Rule-based risk (0-100) and ML score (0.0-1.0)
        // For now, let's treat ML score > 0.8 as high risk (equivalent to riskScore 80)
        // and > 0.5 as medium risk.

        let finalRiskScore = ctvResult.deviceRiskScore;

        // Boost risk if ML is confident
        if (mlScore > 0.8) {
            finalRiskScore = Math.max(finalRiskScore, 90);
        } else if (mlScore > 0.5) {
            finalRiskScore = Math.max(finalRiskScore, 60);
        }

        if (finalRiskScore > 80) {
            decisionType = DecisionType.BLOCK;
            blockReason = BlockReason.FRAUD_DETECTED;
            this.logger?.info('CTV Decision: BLOCK', {
                requestId: context.requestId,
                ifa: ctvResult.ifa,
                riskScore: ctvResult.deviceRiskScore,
                verdict: ctvResult.verdict,
                signalCount: ctvResult.signals.length,
            });
        } else if (ctvResult.deviceRiskScore >= 50) {
            decisionType = DecisionType.BID_MODIFIER;
            const reductionFactor = ctvResult.deviceRiskScore / 100;
            bidModifier = {
                type: 'multiply',
                value: 1 - reductionFactor * 0.6,
                reason: `CTV spoof risk (score: ${ctvResult.deviceRiskScore}, verdict: ${ctvResult.verdict})`,
            };
            this.logger?.debug('CTV Decision: BID_MODIFIER', {
                requestId: context.requestId,
                ifa: ctvResult.ifa,
                riskScore: ctvResult.deviceRiskScore,
                reductionFactor,
            });
        } else {
            decisionType = DecisionType.ALLOW;
            this.logger?.debug('CTV Decision: ALLOW', {
                requestId: context.requestId,
                ifa: ctvResult.ifa,
                riskScore: ctvResult.deviceRiskScore,
            });
        }

        const decision: EdgeDecision = {
            requestId: context.requestId,
            decision: decisionType,
            timestamp: Date.now(),
            processingTimeMs: totalProcessingTimeMs,
            metadata: {
                publisherId: context.publisherId,
                domain: context.domain,
                thermalScore: ctvResult.deviceRiskScore,
                riskLevel: ctvResult.verdict,
                signals: ctvResult.signals.map(s => s.signal),
            },
            blockReason,
            bidModifier,
        };

        return {
            decision,
            usedFailOpen: false,
        };
    }


    /**
     * Handle fail-open scenario (cache miss or error)
     */
    private handleFailOpen(context: DecisionContext, _startTime: number): DecisionResult {
        const { failOpen } = this.config;

        if (!failOpen.enabled) {
            // Fail-closed: block on error
            const decision: EdgeDecision = {
                requestId: context.requestId,
                decision: DecisionType.BLOCK,
                timestamp: Date.now(),
                processingTimeMs: Date.now() - context.processingStartTime,
                metadata: {
                    publisherId: context.publisherId,
                    domain: context.domain,
                },
                blockReason: BlockReason.INVALID_PUBLISHER,
            };

            if (failOpen.logFailures) {
                this.logger?.warn('Fail-closed: blocking unknown publisher', {
                    requestId: context.requestId,
                    publisherId: context.publisherId,
                    domain: context.domain,
                });
            }

            return {
                decision,
                usedFailOpen: true,
            };
        }

        // Fail-open: allow on error
        const decision: EdgeDecision = {
            requestId: context.requestId,
            decision: failOpen.defaultDecision,
            timestamp: Date.now(),
            processingTimeMs: Date.now() - context.processingStartTime,
            metadata: {
                publisherId: context.publisherId,
                domain: context.domain,
            },
        };

        if (failOpen.logFailures) {
            this.logger?.warn('Fail-open: allowing unknown publisher', {
                requestId: context.requestId,
                publisherId: context.publisherId,
                domain: context.domain,
                cacheHit: context.cacheHit,
            });
        }

        return {
            decision,
            usedFailOpen: true,
        };
    }

    /**
     * Validate a decision against expected thresholds
     */
    validateDecision(thermalScore: number, decision: DecisionType): boolean {
        if (thermalScore <= this.config.thresholds.clean.maxScore) {
            return decision === DecisionType.ALLOW;
        } else if (
            thermalScore >= this.config.thresholds.moderate.minScore &&
            thermalScore <= this.config.thresholds.moderate.maxScore
        ) {
            return (
                decision === DecisionType.BID_MODIFIER ||
                (!this.config.enableBidModifier && decision === DecisionType.ALLOW)
            );
        } else {
            return decision === DecisionType.BLOCK;
        }
    }

    /**
     * Get current configuration
     */
    getConfig(): DecisionConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(config: DecisionConfig): void {
        if (!validateDecisionConfig(config)) {
            throw new Error('Invalid decision configuration');
        }
        this.config = config;
        this.logger?.info('Decision configuration updated', { config });
    }

    /**
     * Calculate expected bid reduction for a thermal score
     */
    calculateBidReduction(thermalScore: number): number {
        if (
            thermalScore >= this.config.thresholds.moderate.minScore &&
            thermalScore <= this.config.thresholds.moderate.maxScore
        ) {
            return this.config.thresholds.moderate.bidReduction || 0.4;
        }
        return 0;
    }

    /**
     * Get decision statistics summary
     */
    getDecisionSummary(decisions: EdgeDecision[]): {
        total: number;
        allowed: number;
        blocked: number;
        modified: number;
        avgProcessingTimeMs: number;
    } {
        const total = decisions.length;
        const allowed = decisions.filter((d) => d.decision === DecisionType.ALLOW).length;
        const blocked = decisions.filter((d) => d.decision === DecisionType.BLOCK).length;
        const modified = decisions.filter((d) => d.decision === DecisionType.BID_MODIFIER).length;
        const avgProcessingTimeMs =
            decisions.reduce((sum, d) => sum + d.processingTimeMs, 0) / total || 0;

        return {
            total,
            allowed,
            blocked,
            modified,
            avgProcessingTimeMs: Math.round(avgProcessingTimeMs * 100) / 100,
        };
    }
}

/**
 * Create a decision handler instance
 */
export function createDecisionHandler(
    config?: DecisionConfig,
    logger?: Logger,
    ctvModel?: CTVModelInference
): DecisionHandler {
    return new DecisionHandler(config, logger, ctvModel);
}
