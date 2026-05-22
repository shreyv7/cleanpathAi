/**
 * MFA Thermal Engine
 * Core classification logic for Made for Advertising detection
 */

import {
    MFAClassification,
    MFAClassificationResult,
    MFARule,
    MFASignal,
    RiskLevel,
    ThermalScore,
} from '@cleanpath/types';
import { DEFAULT_MFA_RULES, getEnabledRules, RuleConfig } from './ruleDefinitions';
import { PublisherMetrics } from './publisherMetrics';

export class MFAThermalEngine {
    private ruleConfig: RuleConfig;
    private version: string;

    constructor(customRules?: MFARule[], version: string = '1.0.0') {
        this.ruleConfig = {
            rules: customRules || DEFAULT_MFA_RULES,
            enabledOnly: true,
        };
        this.version = version;
    }

    /**
     * Classify a publisher based on metrics
     */
    classify(metrics: PublisherMetrics): MFAClassificationResult {
        const startTime = Date.now();
        const enabledRules = getEnabledRules(this.ruleConfig);

        // Calculate individual scores
        const adDensityScore = this.calculateAdDensityScore(metrics, enabledRules);
        const engagementScore = this.calculateEngagementScore(metrics, enabledRules);
        const contentQualityScore = this.calculateContentQualityScore(metrics, enabledRules);
        const domainReputationScore = this.calculateDomainReputationScore(metrics, enabledRules);

        // Calculate overall thermal score (weighted average)
        const overallScore = this.calculateOverallScore({
            adDensity: adDensityScore,
            engagement: engagementScore,
            contentQuality: contentQualityScore,
            domainReputation: domainReputationScore,
        }, enabledRules);

        // Determine risk level
        const riskLevel = this.determineRiskLevel(overallScore);

        // Identify triggered signals
        const signals = this.identifySignals(metrics, enabledRules);

        // Calculate confidence
        const confidence = this.calculateConfidence(metrics);

        // Build thermal score
        const thermalScore: ThermalScore = {
            overall: Math.round(overallScore * 100) / 100, // Round to 2 decimals
            breakdown: {
                adDensity: Math.round(adDensityScore * 100) / 100,
                engagement: Math.round(engagementScore * 100) / 100,
                contentQuality: Math.round(contentQualityScore * 100) / 100,
                domainReputation: Math.round(domainReputationScore * 100) / 100,
            },
            signals,
            confidence: Math.round(confidence * 100) / 100,
        };

        // Build classification
        const classification: MFAClassification = {
            publisherId: metrics.publisherId,
            domain: metrics.domain,
            thermalScore,
            riskLevel,
            timestamp: Date.now(),
            version: this.version,
            metadata: {
                adDensityRatio: metrics.adsPerViewport,
                avgEngagementTime: metrics.avgEngagementTime,
                contentToAdRatio: metrics.contentToAdRatio,
            },
        };

        const processingTimeMs = Date.now() - startTime;

        return {
            classification,
            appliedRules: enabledRules,
            processingTimeMs,
        };
    }

    /**
     * Calculate ad density score (0-100)
     */
    private calculateAdDensityScore(metrics: PublisherMetrics, rules: MFARule[]): number {
        const rule = rules.find((r) => r.signal === MFASignal.HIGH_AD_DENSITY);
        if (!rule) return 0;

        const adsPerViewport = metrics.adsPerViewport;
        const threshold = rule.threshold;

        // Score increases linearly above threshold
        // 0 ads = 0, threshold = 50, 2x threshold = 100
        if (adsPerViewport <= threshold) {
            return (adsPerViewport / threshold) * 50;
        } else {
            const excess = adsPerViewport - threshold;
            const excessScore = Math.min((excess / threshold) * 50, 50);
            return 50 + excessScore;
        }
    }

    /**
     * Calculate engagement score (0-100)
     */
    private calculateEngagementScore(metrics: PublisherMetrics, rules: MFARule[]): number {
        const rule = rules.find((r) => r.signal === MFASignal.LOW_ENGAGEMENT);
        if (!rule) return 0;

        const engagementTime = metrics.avgEngagementTime;
        const threshold = rule.threshold;

        // Lower engagement = higher score (inverse relationship)
        // 0 seconds = 100, threshold = 50, 2x threshold = 0
        if (engagementTime >= threshold * 2) {
            return 0;
        } else if (engagementTime >= threshold) {
            return 50 - ((engagementTime - threshold) / threshold) * 50;
        } else {
            return 50 + ((threshold - engagementTime) / threshold) * 50;
        }
    }

    /**
     * Calculate content quality score (0-100)
     */
    private calculateContentQualityScore(metrics: PublisherMetrics, rules: MFARule[]): number {
        const rule = rules.find((r) => r.signal === MFASignal.POOR_CONTENT_RATIO);
        if (!rule) return 0;

        const contentRatio = metrics.contentToAdRatio;
        const threshold = rule.threshold;

        // Lower content ratio = higher score (inverse relationship)
        // 0% content = 100, threshold = 50, 100% content = 0
        if (contentRatio >= threshold) {
            return Math.max(0, 50 - ((contentRatio - threshold) / (1 - threshold)) * 50);
        } else {
            return 50 + ((threshold - contentRatio) / threshold) * 50;
        }
    }

    /**
     * Calculate domain reputation score (0-100)
     */
    private calculateDomainReputationScore(metrics: PublisherMetrics, rules: MFARule[]): number {
        const rule = rules.find((r) => r.signal === MFASignal.DOMAIN_REPUTATION);
        if (!rule) return 0;

        const reputation = metrics.domainReputationScore;
        const threshold = rule.threshold;

        // Lower reputation = higher score (inverse relationship)
        // 0 reputation = 100, threshold = 50, 100 reputation = 0
        if (reputation >= threshold) {
            return Math.max(0, 50 - ((reputation - threshold) / (100 - threshold)) * 50);
        } else {
            return 50 + ((threshold - reputation) / threshold) * 50;
        }
    }

    /**
     * Calculate overall thermal score using weighted average
     */
    private calculateOverallScore(
        breakdown: {
            adDensity: number;
            engagement: number;
            contentQuality: number;
            domainReputation: number;
        },
        rules: MFARule[]
    ): number {
        let totalScore = 0;
        let totalWeight = 0;

        const adDensityRule = rules.find((r) => r.signal === MFASignal.HIGH_AD_DENSITY);
        if (adDensityRule) {
            totalScore += breakdown.adDensity * adDensityRule.weight;
            totalWeight += adDensityRule.weight;
        }

        const engagementRule = rules.find((r) => r.signal === MFASignal.LOW_ENGAGEMENT);
        if (engagementRule) {
            totalScore += breakdown.engagement * engagementRule.weight;
            totalWeight += engagementRule.weight;
        }

        const contentRule = rules.find((r) => r.signal === MFASignal.POOR_CONTENT_RATIO);
        if (contentRule) {
            totalScore += breakdown.contentQuality * contentRule.weight;
            totalWeight += contentRule.weight;
        }

        const reputationRule = rules.find((r) => r.signal === MFASignal.DOMAIN_REPUTATION);
        if (reputationRule) {
            totalScore += breakdown.domainReputation * reputationRule.weight;
            totalWeight += reputationRule.weight;
        }

        // Normalize by total weight (in case not all rules are enabled)
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    /**
     * Determine risk level based on thermal score
     */
    private determineRiskLevel(score: number): RiskLevel {
        if (score <= 30) {
            return RiskLevel.CLEAN;
        } else if (score <= 70) {
            return RiskLevel.MODERATE;
        } else {
            return RiskLevel.HIGH;
        }
    }

    /**
     * Identify which signals were triggered
     */
    private identifySignals(metrics: PublisherMetrics, rules: MFARule[]): MFASignal[] {
        const signals: MFASignal[] = [];

        rules.forEach((rule) => {
            let triggered = false;

            switch (rule.signal) {
                case MFASignal.HIGH_AD_DENSITY:
                    triggered = metrics.adsPerViewport > rule.threshold;
                    break;
                case MFASignal.LOW_ENGAGEMENT:
                    triggered = metrics.avgEngagementTime < rule.threshold;
                    break;
                case MFASignal.POOR_CONTENT_RATIO:
                    triggered = metrics.contentToAdRatio < rule.threshold;
                    break;
                case MFASignal.DOMAIN_REPUTATION:
                    triggered = metrics.domainReputationScore < rule.threshold;
                    break;
                case MFASignal.ARBITRAGE_PATTERN:
                    triggered = metrics.paidTrafficRatio > rule.threshold;
                    break;
            }

            if (triggered) {
                signals.push(rule.signal);
            }
        });

        return signals;
    }

    /**
     * Calculate confidence in classification (0-1)
     * Higher confidence when we have more data
     */
    private calculateConfidence(metrics: PublisherMetrics): number {
        let confidence = 0.5; // Base confidence

        // Increase confidence if we have historical data
        if (metrics.previousThermalScore !== undefined) {
            confidence += 0.2;
        }

        if (metrics.historicalBlockRate !== undefined) {
            confidence += 0.1;
        }

        // Increase confidence for established domains
        if (metrics.domainAge > 365) {
            confidence += 0.1;
        }

        // Increase confidence if we have engagement data
        if (metrics.avgEngagementTime > 0) {
            confidence += 0.1;
        }

        return Math.min(confidence, 1.0);
    }

    /**
     * Get current rule configuration
     */
    getRuleConfig(): RuleConfig {
        return { ...this.ruleConfig };
    }

    /**
     * Update rule configuration
     */
    updateRuleConfig(config: RuleConfig): void {
        this.ruleConfig = config;
    }
}

/**
 * Create a thermal engine instance
 */
export function createThermalEngine(customRules?: MFARule[], version?: string): MFAThermalEngine {
    return new MFAThermalEngine(customRules, version);
}
