/**
 * DecisionHandler Tests
 */

import { DecisionHandler } from '../handlers/DecisionHandler';
import { DecisionType, RiskLevel, BlockReason } from '@cleanpath/types';
import { createLogger, LogLevel } from '@cleanpath/logging';

describe('DecisionHandler', () => {
    let handler: DecisionHandler;
    let logger: any;

    beforeEach(() => {
        logger = createLogger({
            level: LogLevel.ERROR,
            service: 'test',
            environment: 'test',
        });
        handler = new DecisionHandler(undefined, logger);
    });

    describe('Decision Logic', () => {
        it('should ALLOW clean publishers (score 0-30)', async () => {
            const result = await handler.decide({
                requestId: 'req_1',
                publisherId: 'pub_clean',
                domain: 'clean.com',
                classification: {
                    publisherId: 'pub_clean',
                    domain: 'clean.com',
                    timestamp: Date.now(),
                    version: '1.0.0',
                    riskLevel: RiskLevel.CLEAN,
                    thermalScore: {
                        overall: 25,
                        breakdown: {
                            adDensity: 20,
                            engagement: 30,
                            contentQuality: 25,
                            domainReputation: 25,
                        },
                        signals: [],
                        confidence: 0.9,
                    },
                },
                cacheHit: true,
                processingStartTime: Date.now(),
            });

            expect(result.decision.decision).toBe(DecisionType.ALLOW);
            expect(result.decision.blockReason).toBeUndefined();
            expect(result.decision.bidModifier).toBeUndefined();
            expect(result.usedFailOpen).toBe(false);
        });

        it('should apply BID_MODIFIER for moderate risk (score 31-70)', async () => {
            const result = await handler.decide({
                requestId: 'req_2',
                publisherId: 'pub_moderate',
                domain: 'moderate.com',
                classification: {
                    publisherId: 'pub_moderate',
                    domain: 'moderate.com',
                    timestamp: Date.now(),
                    version: '1.0.0',
                    riskLevel: RiskLevel.MODERATE,
                    thermalScore: {
                        overall: 50,
                        breakdown: {
                            adDensity: 50,
                            engagement: 50,
                            contentQuality: 50,
                            domainReputation: 50,
                        },
                        signals: [],
                        confidence: 0.8,
                    },
                },
                cacheHit: true,
                processingStartTime: Date.now(),
            });

            expect(result.decision.decision).toBe(DecisionType.BID_MODIFIER);
            expect(result.decision.bidModifier).toBeDefined();
            expect(result.decision.bidModifier?.type).toBe('multiply');
            expect(result.decision.bidModifier?.value).toBe(0.6); // 1 - 0.4
            expect(result.usedFailOpen).toBe(false);
        });

        it('should BLOCK high-risk publishers (score 71-100)', async () => {
            const result = await handler.decide({
                requestId: 'req_3',
                publisherId: 'pub_mfa',
                domain: 'mfa.com',
                classification: {
                    publisherId: 'pub_mfa',
                    domain: 'mfa.com',
                    timestamp: Date.now(),
                    version: '1.0.0',
                    riskLevel: RiskLevel.HIGH,
                    thermalScore: {
                        overall: 85,
                        breakdown: {
                            adDensity: 90,
                            engagement: 80,
                            contentQuality: 85,
                            domainReputation: 85,
                        },
                        signals: [],
                        confidence: 0.95,
                    },
                },
                cacheHit: true,
                processingStartTime: Date.now(),
            });

            expect(result.decision.decision).toBe(DecisionType.BLOCK);
            expect(result.decision.blockReason).toBe(BlockReason.MFA_HIGH_RISK);
            expect(result.decision.bidModifier).toBeUndefined();
            expect(result.usedFailOpen).toBe(false);
        });
    });

    describe('Fail-Open Mechanism', () => {
        it('should fail-open when classification is missing', async () => {
            const result = await handler.decide({
                requestId: 'req_4',
                publisherId: 'pub_unknown',
                domain: 'unknown.com',
                classification: undefined,
                cacheHit: false,
                processingStartTime: Date.now(),
            });

            expect(result.decision.decision).toBe(DecisionType.ALLOW);
            expect(result.usedFailOpen).toBe(true);
        });

        it('should fail-closed when disabled', async () => {
            const failClosedHandler = new DecisionHandler(
                {
                    thresholds: {
                        clean: { maxScore: 30, decision: DecisionType.ALLOW },
                        moderate: {
                            minScore: 31,
                            maxScore: 70,
                            decision: DecisionType.BID_MODIFIER,
                            bidReduction: 0.4,
                        },
                        high: { minScore: 71, decision: DecisionType.BLOCK },
                    },
                    failOpen: {
                        enabled: false,
                        defaultDecision: DecisionType.ALLOW,
                        logFailures: true,
                    },
                    enableBidModifier: true,
                },
                logger
            );

            const result = await failClosedHandler.decide({
                requestId: 'req_5',
                publisherId: 'pub_unknown',
                domain: 'unknown.com',
                classification: undefined,
                cacheHit: false,
                processingStartTime: Date.now(),
            });

            expect(result.decision.decision).toBe(DecisionType.BLOCK);
            expect(result.decision.blockReason).toBe(BlockReason.INVALID_PUBLISHER);
            expect(result.usedFailOpen).toBe(true);
        });
    });

    describe('Configuration', () => {
        it('should validate decision against thresholds', () => {
            expect(handler.validateDecision(25, DecisionType.ALLOW)).toBe(true);
            expect(handler.validateDecision(50, DecisionType.BID_MODIFIER)).toBe(true);
            expect(handler.validateDecision(85, DecisionType.BLOCK)).toBe(true);

            expect(handler.validateDecision(25, DecisionType.BLOCK)).toBe(false);
            expect(handler.validateDecision(85, DecisionType.ALLOW)).toBe(false);
        });

        it('should calculate bid reduction correctly', async () => {
            expect(handler.calculateBidReduction(25)).toBe(0);
            expect(handler.calculateBidReduction(50)).toBe(0.4);
            expect(handler.calculateBidReduction(85)).toBe(0);
        });

        it('should allow configuration updates', async () => {
            const newConfig = {
                thresholds: {
                    clean: { maxScore: 30, decision: DecisionType.ALLOW },
                    moderate: {
                        minScore: 31,
                        maxScore: 70,
                        decision: DecisionType.BID_MODIFIER,
                        bidReduction: 0.5, // Increased reduction
                    },
                    high: { minScore: 71, decision: DecisionType.BLOCK },
                },
                failOpen: {
                    enabled: true,
                    defaultDecision: DecisionType.ALLOW,
                    logFailures: true,
                },
                enableBidModifier: true,
            };

            handler.updateConfig(newConfig);

            const result = await handler.decide({
                requestId: 'req_6',
                publisherId: 'pub_test',
                domain: 'test.com',
                classification: {
                    publisherId: 'pub_test',
                    domain: 'test.com',
                    timestamp: Date.now(),
                    version: '1.0.0',
                    riskLevel: RiskLevel.MODERATE,
                    thermalScore: {
                        overall: 50,
                        breakdown: {
                            adDensity: 50,
                            engagement: 50,
                            contentQuality: 50,
                            domainReputation: 50,
                        },
                        signals: [],
                        confidence: 0.8,
                    },
                },
                cacheHit: true,
                processingStartTime: Date.now(),
            });

            expect(result.decision.bidModifier?.value).toBe(0.5); // 1 - 0.5
        });
    });

    describe('Statistics', () => {
        it('should generate decision summary', () => {
            const decisions = [
                {
                    requestId: 'req_1',
                    decision: DecisionType.ALLOW,
                    timestamp: Date.now(),
                    processingTimeMs: 10,
                    metadata: { publisherId: 'pub_1', domain: 'test.com' },
                },
                {
                    requestId: 'req_2',
                    decision: DecisionType.ALLOW,
                    timestamp: Date.now(),
                    processingTimeMs: 15,
                    metadata: { publisherId: 'pub_2', domain: 'test.com' },
                },
                {
                    requestId: 'req_3',
                    decision: DecisionType.BID_MODIFIER,
                    timestamp: Date.now(),
                    processingTimeMs: 12,
                    metadata: { publisherId: 'pub_3', domain: 'test.com' },
                },
                {
                    requestId: 'req_4',
                    decision: DecisionType.BLOCK,
                    timestamp: Date.now(),
                    processingTimeMs: 8,
                    metadata: { publisherId: 'pub_4', domain: 'test.com' },
                },
            ];

            const summary = handler.getDecisionSummary(decisions);

            expect(summary.total).toBe(4);
            expect(summary.allowed).toBe(2);
            expect(summary.blocked).toBe(1);
            expect(summary.modified).toBe(1);
            expect(summary.avgProcessingTimeMs).toBeCloseTo(11.25, 2);
        });
    });

    describe('Performance', () => {
        it('should make decisions in under 1ms', async () => {
            const startTime = Date.now();

            await handler.decide({
                requestId: 'req_perf',
                publisherId: 'pub_perf',
                domain: 'perf.com',
                classification: {
                    publisherId: 'pub_perf',
                    domain: 'perf.com',
                    timestamp: Date.now(),
                    version: '1.0.0',
                    riskLevel: RiskLevel.MODERATE,
                    thermalScore: {
                        overall: 50,
                        breakdown: {
                            adDensity: 50,
                            engagement: 50,
                            contentQuality: 50,
                            domainReputation: 50,
                        },
                        signals: [],
                        confidence: 0.8,
                    },
                },
                cacheHit: true,
                processingStartTime: Date.now(),
            });

            const elapsed = Date.now() - startTime;
            expect(elapsed).toBeLessThan(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle boundary thermal scores correctly', async () => {
            // Exactly 30 - should ALLOW
            const result30 = await handler.decide({
                requestId: 'req_30',
                publisherId: 'pub_30',
                domain: 'test.com',
                classification: {
                    publisherId: 'pub_30',
                    domain: 'test.com',
                    timestamp: Date.now(),
                    version: '1.0.0',
                    riskLevel: RiskLevel.CLEAN,
                    thermalScore: {
                        overall: 30,
                        breakdown: { adDensity: 30, engagement: 30, contentQuality: 30, domainReputation: 30 },
                        signals: [],
                        confidence: 0.8,
                    },
                },
                cacheHit: true,
                processingStartTime: Date.now(),
            });
            expect(result30.decision.decision).toBe(DecisionType.ALLOW);

            // Exactly 31 - should BID_MODIFIER
            const result31 = await handler.decide({
                requestId: 'req_31',
                publisherId: 'pub_31',
                domain: 'test.com',
                classification: {
                    publisherId: 'pub_31',
                    domain: 'test.com',
                    timestamp: Date.now(),
                    version: '1.0.0',
                    riskLevel: RiskLevel.MODERATE,
                    thermalScore: {
                        overall: 31,
                        breakdown: { adDensity: 31, engagement: 31, contentQuality: 31, domainReputation: 31 },
                        signals: [],
                        confidence: 0.8,
                    },
                },
                cacheHit: true,
                processingStartTime: Date.now(),
            });
            expect(result31.decision.decision).toBe(DecisionType.BID_MODIFIER);

            // Exactly 71 - should BLOCK
            const result71 = await handler.decide({
                requestId: 'req_71',
                publisherId: 'pub_71',
                domain: 'test.com',
                classification: {
                    publisherId: 'pub_71',
                    domain: 'test.com',
                    timestamp: Date.now(),
                    version: '1.0.0',
                    riskLevel: RiskLevel.HIGH,
                    thermalScore: {
                        overall: 71,
                        breakdown: { adDensity: 71, engagement: 71, contentQuality: 71, domainReputation: 71 },
                        signals: [],
                        confidence: 0.8,
                    },
                },
                cacheHit: true,
                processingStartTime: Date.now(),
            });
            expect(result71.decision.decision).toBe(DecisionType.BLOCK);
        });
    });
});
