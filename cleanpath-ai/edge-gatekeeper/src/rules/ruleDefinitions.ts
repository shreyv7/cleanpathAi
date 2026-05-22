/**
 * MFA Rule Definitions
 * Rule-based heuristics for thermal imaging classification
 */

import { MFARule, MFASignal } from '@cleanpath/types';

/**
 * Default MFA detection rules
 * Each rule contributes to the overall thermal score (0-100)
 */
export const DEFAULT_MFA_RULES: MFARule[] = [
    {
        id: 'rule_ad_density',
        name: 'High Ad Density',
        description: 'Detects excessive ads per viewport (>3 ads)',
        signal: MFASignal.HIGH_AD_DENSITY,
        threshold: 3.0, // Ads per viewport
        weight: 0.3, // 30% contribution to overall score
        enabled: true,
    },
    {
        id: 'rule_engagement',
        name: 'Low Engagement Velocity',
        description: 'Detects low user engagement time (<10 seconds average)',
        signal: MFASignal.LOW_ENGAGEMENT,
        threshold: 10.0, // Seconds
        weight: 0.25, // 25% contribution
        enabled: true,
    },
    {
        id: 'rule_content_ratio',
        name: 'Poor Content-to-Ad Ratio',
        description: 'Detects low content quality (content < 40% of page)',
        signal: MFASignal.POOR_CONTENT_RATIO,
        threshold: 0.4, // 40% content minimum
        weight: 0.25, // 25% contribution
        enabled: true,
    },
    {
        id: 'rule_domain_reputation',
        name: 'Domain Reputation Score',
        description: 'Checks domain against reputation databases',
        signal: MFASignal.DOMAIN_REPUTATION,
        threshold: 50.0, // Reputation score (0-100, lower is worse)
        weight: 0.15, // 15% contribution
        enabled: true,
    },
    {
        id: 'rule_arbitrage_pattern',
        name: 'Arbitrage Traffic Pattern',
        description: 'Detects traffic arbitrage patterns (paid traffic to monetize)',
        signal: MFASignal.ARBITRAGE_PATTERN,
        threshold: 0.7, // 70% paid traffic threshold
        weight: 0.05, // 5% contribution
        enabled: true,
    },
];

/**
 * Rule configuration interface
 */
export interface RuleConfig {
    rules: MFARule[];
    enabledOnly?: boolean;
}

/**
 * Get enabled rules
 */
export function getEnabledRules(config: RuleConfig): MFARule[] {
    return config.enabledOnly !== false
        ? config.rules.filter((rule) => rule.enabled)
        : config.rules;
}

/**
 * Get rule by ID
 */
export function getRuleById(ruleId: string, config: RuleConfig): MFARule | undefined {
    return config.rules.find((rule) => rule.id === ruleId);
}

/**
 * Get rule by signal
 */
export function getRuleBySignal(signal: MFASignal, config: RuleConfig): MFARule | undefined {
    return config.rules.find((rule) => rule.signal === signal);
}

/**
 * Validate rule weights sum to 1.0
 */
export function validateRuleWeights(rules: MFARule[]): boolean {
    const totalWeight = rules.reduce((sum, rule) => sum + rule.weight, 0);
    return Math.abs(totalWeight - 1.0) < 0.001; // Allow small floating point errors
}
