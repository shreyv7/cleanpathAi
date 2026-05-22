/**
 * Decision Configuration
 * Thresholds and rules for translating thermal scores to decisions
 */

import { DecisionType } from '@cleanpath/types';

export interface DecisionThresholds {
    clean: {
        maxScore: number; // 0-30
        decision: DecisionType;
    };
    moderate: {
        minScore: number; // 31
        maxScore: number; // 70
        decision: DecisionType;
        bidReduction?: number; // Percentage (0-1)
    };
    high: {
        minScore: number; // 71
        decision: DecisionType;
    };
}

export interface FailOpenConfig {
    enabled: boolean;
    defaultDecision: DecisionType;
    logFailures: boolean;
}

export interface DecisionConfig {
    thresholds: DecisionThresholds;
    failOpen: FailOpenConfig;
    enableBidModifier: boolean;
}

/**
 * Default decision configuration
 */
export const DEFAULT_DECISION_CONFIG: DecisionConfig = {
    thresholds: {
        clean: {
            maxScore: 30,
            decision: DecisionType.ALLOW,
        },
        moderate: {
            minScore: 31,
            maxScore: 70,
            decision: DecisionType.BID_MODIFIER,
            bidReduction: 0.4, // Reduce bid by 40%
        },
        high: {
            minScore: 71,
            decision: DecisionType.BLOCK,
        },
    },
    failOpen: {
        enabled: true,
        defaultDecision: DecisionType.ALLOW,
        logFailures: true,
    },
    enableBidModifier: true,
};

/**
 * Validate decision configuration
 */
export function validateDecisionConfig(config: DecisionConfig): boolean {
    const { thresholds } = config;

    // Validate score ranges
    if (thresholds.clean.maxScore !== 30) return false;
    if (thresholds.moderate.minScore !== 31) return false;
    if (thresholds.moderate.maxScore !== 70) return false;
    if (thresholds.high.minScore !== 71) return false;

    // Validate bid reduction
    if (
        thresholds.moderate.bidReduction !== undefined &&
        (thresholds.moderate.bidReduction < 0 || thresholds.moderate.bidReduction > 1)
    ) {
        return false;
    }

    return true;
}
