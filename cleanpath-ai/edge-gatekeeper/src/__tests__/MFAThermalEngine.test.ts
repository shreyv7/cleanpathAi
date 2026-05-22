/**
 * MFAThermalEngine Tests
 */

import { MFAThermalEngine } from '../rules/MFAThermalEngine';
import { PublisherMetrics } from '../rules/publisherMetrics';
import { RiskLevel } from '@cleanpath/types';

describe('MFAThermalEngine', () => {
    let engine: MFAThermalEngine;

    beforeEach(() => {
        engine = new MFAThermalEngine();
    });

    describe('Classification', () => {
        it('should classify clean publisher with low thermal score', () => {
            const metrics: PublisherMetrics = {
                publisherId: 'pub_clean',
                domain: 'clean-site.com',
                adsPerViewport: 1.5,
                totalAds: 2,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 120.0,
                bounceRate: 0.3,
                pagesPerSession: 3.0,
                contentToAdRatio: 0.8,
                textContentLength: 10000,
                imageContentCount: 20,
                domainReputationScore: 85.0,
                domainAge: 1825,
                paidTrafficRatio: 0.1,
                organicTrafficRatio: 0.7,
                directTrafficRatio: 0.2,
            };

            const result = engine.classify(metrics);

            expect(result.classification.riskLevel).toBe(RiskLevel.CLEAN);
            expect(result.classification.thermalScore.overall).toBeLessThanOrEqual(30);
            expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
            expect(result.processingTimeMs).toBeLessThan(10);
        });

        it('should classify moderate-risk publisher', () => {
            const metrics: PublisherMetrics = {
                publisherId: 'pub_moderate',
                domain: 'moderate-site.com',
                adsPerViewport: 3.0,
                totalAds: 4,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 20.0,
                bounceRate: 0.6,
                pagesPerSession: 1.2,
                contentToAdRatio: 0.5,
                textContentLength: 3000,
                imageContentCount: 8,
                domainReputationScore: 50.0,
                domainAge: 365,
                paidTrafficRatio: 0.4,
                organicTrafficRatio: 0.4,
                directTrafficRatio: 0.2,
            };

            const result = engine.classify(metrics);

            expect(result.classification.riskLevel).toBe(RiskLevel.MODERATE);
            expect(result.classification.thermalScore.overall).toBeGreaterThan(30);
            expect(result.classification.thermalScore.overall).toBeLessThanOrEqual(70);
        });

        it('should classify high-risk MFA publisher', () => {
            const metrics: PublisherMetrics = {
                publisherId: 'pub_mfa',
                domain: 'mfa-site.com',
                adsPerViewport: 6.0,
                totalAds: 10,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 5.0,
                bounceRate: 0.9,
                pagesPerSession: 1.0,
                contentToAdRatio: 0.2,
                textContentLength: 500,
                imageContentCount: 2,
                domainReputationScore: 20.0,
                domainAge: 30,
                paidTrafficRatio: 0.8,
                organicTrafficRatio: 0.1,
                directTrafficRatio: 0.1,
            };

            const result = engine.classify(metrics);

            expect(result.classification.riskLevel).toBe(RiskLevel.HIGH);
            expect(result.classification.thermalScore.overall).toBeGreaterThan(70);
            expect(result.classification.thermalScore.overall).toBeLessThanOrEqual(100);
        });

        it('should include thermal score breakdown', () => {
            const metrics: PublisherMetrics = {
                publisherId: 'pub_test',
                domain: 'test.com',
                adsPerViewport: 2.5,
                totalAds: 3,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 30.0,
                bounceRate: 0.5,
                pagesPerSession: 1.5,
                contentToAdRatio: 0.6,
                textContentLength: 5000,
                imageContentCount: 10,
                domainReputationScore: 50.0,
                domainAge: 365,
                paidTrafficRatio: 0.3,
                organicTrafficRatio: 0.5,
                directTrafficRatio: 0.2,
            };

            const result = engine.classify(metrics);

            expect(result.classification.thermalScore.breakdown).toBeDefined();
            expect(result.classification.thermalScore.breakdown.adDensity).toBeGreaterThanOrEqual(0);
            expect(result.classification.thermalScore.breakdown.adDensity).toBeLessThanOrEqual(100);
            expect(result.classification.thermalScore.breakdown.engagement).toBeGreaterThanOrEqual(0);
            expect(result.classification.thermalScore.breakdown.contentQuality).toBeGreaterThanOrEqual(0);
            expect(result.classification.thermalScore.breakdown.domainReputation).toBeGreaterThanOrEqual(0);
        });

        it('should identify triggered signals', () => {
            const metrics: PublisherMetrics = {
                publisherId: 'pub_signals',
                domain: 'signals.com',
                adsPerViewport: 5.0, // High ad density
                totalAds: 8,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 8.0, // Low engagement
                bounceRate: 0.8,
                pagesPerSession: 1.0,
                contentToAdRatio: 0.3, // Poor content ratio
                textContentLength: 1000,
                imageContentCount: 5,
                domainReputationScore: 30.0, // Low reputation
                domainAge: 60,
                paidTrafficRatio: 0.7, // High paid traffic
                organicTrafficRatio: 0.2,
                directTrafficRatio: 0.1,
            };

            const result = engine.classify(metrics);

            expect(result.classification.thermalScore.signals.length).toBeGreaterThan(0);
            expect(result.classification.thermalScore.confidence).toBeGreaterThan(0);
            expect(result.classification.thermalScore.confidence).toBeLessThanOrEqual(1);
        });
    });

    describe('Rule Configuration', () => {
        it('should return current rule configuration', () => {
            const config = engine.getRuleConfig();

            expect(config.rules).toBeDefined();
            expect(config.rules.length).toBeGreaterThan(0);
            expect(config.rules.every((r) => r.enabled)).toBe(true);
        });

        it('should allow updating rule configuration', () => {
            const config = engine.getRuleConfig();
            const updatedRules = config.rules.map((r) => ({
                ...r,
                weight: r.weight * 1.1,
            }));

            engine.updateRuleConfig({ rules: updatedRules });

            const newConfig = engine.getRuleConfig();
            expect(newConfig.rules[0].weight).not.toBe(config.rules[0].weight);
        });
    });

    describe('Performance', () => {
        it('should complete classification in under 5ms', () => {
            const metrics: PublisherMetrics = {
                publisherId: 'pub_perf',
                domain: 'perf.com',
                adsPerViewport: 2.0,
                totalAds: 3,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 60.0,
                bounceRate: 0.4,
                pagesPerSession: 2.0,
                contentToAdRatio: 0.7,
                textContentLength: 8000,
                imageContentCount: 15,
                domainReputationScore: 70.0,
                domainAge: 730,
                paidTrafficRatio: 0.2,
                organicTrafficRatio: 0.6,
                directTrafficRatio: 0.2,
            };

            const result = engine.classify(metrics);

            expect(result.processingTimeMs).toBeLessThan(5);
        });

        it('should handle batch classification efficiently', () => {
            const metricsArray: PublisherMetrics[] = Array.from({ length: 100 }, (_, i) => ({
                publisherId: `pub_${i}`,
                domain: `site${i}.com`,
                adsPerViewport: 2.0 + Math.random() * 3,
                totalAds: 3,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 30.0 + Math.random() * 60,
                bounceRate: 0.3 + Math.random() * 0.4,
                pagesPerSession: 1.5 + Math.random() * 2,
                contentToAdRatio: 0.4 + Math.random() * 0.4,
                textContentLength: 5000,
                imageContentCount: 10,
                domainReputationScore: 40.0 + Math.random() * 40,
                domainAge: 365,
                paidTrafficRatio: 0.3,
                organicTrafficRatio: 0.5,
                directTrafficRatio: 0.2,
            }));

            const startTime = Date.now();
            metricsArray.forEach((metrics) => engine.classify(metrics));
            const totalTime = Date.now() - startTime;

            expect(totalTime).toBeLessThan(500); // 100 classifications in under 500ms
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing optional metrics', () => {
            const metrics: PublisherMetrics = {
                publisherId: 'pub_minimal',
                domain: 'minimal.com',
                adsPerViewport: 2.0,
                totalAds: 2,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 30.0,
                bounceRate: 0.5,
                pagesPerSession: 1.5,
                contentToAdRatio: 0.6,
                textContentLength: 5000,
                imageContentCount: 10,
                domainReputationScore: 50.0,
                domainAge: 365,
                paidTrafficRatio: 0.3,
                organicTrafficRatio: 0.5,
                directTrafficRatio: 0.2,
            };

            const result = engine.classify(metrics);

            expect(result.classification).toBeDefined();
            expect(result.classification.thermalScore.overall).toBeGreaterThanOrEqual(0);
            expect(result.classification.thermalScore.overall).toBeLessThanOrEqual(100);
        });

        it('should handle extreme metric values', () => {
            const metrics: PublisherMetrics = {
                publisherId: 'pub_extreme',
                domain: 'extreme.com',
                adsPerViewport: 100.0, // Extreme ad density
                totalAds: 200,
                viewportArea: 1920 * 1080,
                avgEngagementTime: 0.1, // Extremely low engagement
                bounceRate: 1.0,
                pagesPerSession: 1.0,
                contentToAdRatio: 0.01, // Almost no content
                textContentLength: 10,
                imageContentCount: 0,
                domainReputationScore: 0.0, // Worst reputation
                domainAge: 1,
                paidTrafficRatio: 1.0, // All paid traffic
                organicTrafficRatio: 0.0,
                directTrafficRatio: 0.0,
            };

            const result = engine.classify(metrics);

            expect(result.classification.riskLevel).toBe(RiskLevel.HIGH);
            expect(result.classification.thermalScore.overall).toBeGreaterThanOrEqual(95);
        });
    });
});
