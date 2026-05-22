
/**
 * Supply Path Efficiency Engine
 * Calculates a normalized score (0-100) representing the quality/efficiency of a path.
 */

export interface EfficiencyMetrics {
    hopCount: number;
    totalFeePercentage: number;
    historicalBlockRate: number; // 0 to 1
    averageMfaScore: number; // 0 to 100
}

export class EfficiencyEngine {
    /**
     * Weights for the efficiency score calculation (Total = 1.0)
     */
    private static readonly WEIGHTS = {
        Hops: 0.25,        // Fewer hops = higher efficiency
        Fees: 0.35,        // Lower fees = higher efficiency
        AdQuality: 0.40    // Low MFA risk/Low density = higher efficiency
    };

    /**
     * Calculates a path efficiency score from 0 to 100.
     * 100 = Perfect Path (Direct, Low Fee, High Quality)
     * 0 = Toxic Path (Deep Hops, High Fees, High MFA risk)
     */
    public static calculateScore(metrics: EfficiencyMetrics): number {
        // 1. Hop Efficiency (Normalized 0-1)
        // Optimal is 1 hop. Penalty increases with depth.
        // Score = 1 / hopCount (approximate)
        const hopScore = Math.max(0, 1.2 - (metrics.hopCount * 0.2));

        // 2. Fee Efficiency (Normalized 0-1)
        // Optimal is 0% fees (impossible but theoretical). 
        // Penalize significantly after 15% (0.15)
        const feeScore = Math.max(0, 1.0 - (metrics.totalFeePercentage / 0.30));

        // 3. Quality Efficiency (Normalized 0-1)
        // Combines MFA score and block rate
        const qualityScore = (
            (1.0 - (metrics.averageMfaScore / 100)) +
            (1.0 - metrics.historicalBlockRate)
        ) / 2;

        // Final weighted calculation
        const rawScore = (
            (hopScore * EfficiencyEngine.WEIGHTS.Hops) +
            (feeScore * EfficiencyEngine.WEIGHTS.Fees) +
            (qualityScore * EfficiencyEngine.WEIGHTS.AdQuality)
        ) * 100;

        return Math.min(100, Math.max(0, parseFloat(rawScore.toFixed(2))));
    }

    /**
     * Categorizes the score into actionable tiers
     */
    public static getTier(score: number): 'PREMIUM' | 'EFFICIENT' | 'RISKY' | 'TOXIC' {
        if (score >= 85) return 'PREMIUM';
        if (score >= 60) return 'EFFICIENT';
        if (score >= 30) return 'RISKY';
        return 'TOXIC';
    }
}
