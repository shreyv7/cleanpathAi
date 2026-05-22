import { WinRateEstimator } from './WinRateEstimator';
import { Logger } from '@cleanpath/logging';

export class BidShader {
    private estimator: WinRateEstimator;
    private logger: Logger;

    constructor(logger: Logger) {
        this.estimator = new WinRateEstimator();
        this.logger = logger;
    }

    /**
     * Mathematically correct Beta Distribution sampler using the Marsaglia and Tsang method.
     * Generates exact draws from Beta(alpha, beta) in <0.01ms.
     */
    private sampleBeta(alpha: number, beta: number): number {
        const sampleGamma = (k: number): number => {
            if (k < 1) {
                return sampleGamma(k + 1) * Math.pow(Math.random(), 1 / k);
            }
            const d = k - 1 / 3;
            const c = 1 / Math.sqrt(9 * d);
            while (true) {
                let z = 0;
                let v = 0;
                do {
                    // Box-Muller transform for gaussian distribution sample
                    const u1 = Math.random();
                    const u2 = Math.random();
                    z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                    v = 1 + c * z;
                } while (v <= 0);
                v = v * v * v;
                const u = Math.random();
                if (u < 1 - 0.0331 * z * z * z * z) {
                    return d * v;
                }
                if (Math.log(u) < 0.5 * z * z + d * (1 - v + Math.log(v))) {
                    return d * v;
                }
            }
        };

        const y1 = sampleGamma(alpha);
        const y2 = sampleGamma(beta);
        if (y1 + y2 === 0) return 0.5; // Neutral fallback
        return y1 / (y1 + y2);
    }

    /**
     * Calculate the optimal shaded bid price using a hybrid model:
     * Sigmoid Win-Rate Sigmoid Check + Dynamic Online Thompson Sampling.
     * 
     * @param siteId 
     * @param valuation Maximum bid price allowed
     * @param targetWinRate Desired win probability threshold (default 0.7)
     * @param redisClient Optional active Redis client to pull bandit feedback state
     */
    async shadeBid(
        siteId: string,
        valuation: number,
        targetWinRate: number = 0.7,
        redisClient?: any
    ): Promise<{ shadedPrice: number; savings: number; strategy: string }> {
        let bestPrice = valuation;
        let strategy = 'WinRateSigmoid';

        // 1. Sigmoid-based fallback check (Standard win-rate pricing search)
        for (let i = 0; i < 20; i++) {
            const testPrice = valuation * (1 - (i * 0.05));
            if (testPrice <= 0) break;

            const prob = this.estimator.estimateWinRate(siteId, testPrice);
            if (prob >= targetWinRate) {
                bestPrice = testPrice;
            } else {
                break;
            }
        }

        // 2. Active Thompson Sampling Reinforcement Loop (Online bandit)
        if (redisClient) {
            try {
                const redisKey = `bandit:pacing:campaign-1:${siteId}`;
                const banditString = await redisClient.get(redisKey);
                
                let alpha = 1;
                let beta = 1;

                if (banditString) {
                    const data = JSON.parse(banditString);
                    alpha = Math.max(1, parseInt(data.alpha || '1', 10));
                    beta = Math.max(1, parseInt(data.beta || '1', 10));
                }

                // Draw standard probability multiplier using our Beta Sampler
                const expectedValue = this.sampleBeta(alpha, beta);
                
                // Keep the dynamic multiplier within secure bounds (40% - 100%) to preserve bidding win-rates
                const reinforcementMultiplier = Math.max(0.4, Math.min(1.0, expectedValue));
                const banditPrice = valuation * reinforcementMultiplier;

                // Hybrid integration: Choose the more optimal (lower) price of the two strategies
                if (banditPrice < bestPrice) {
                    bestPrice = banditPrice;
                    strategy = `ThompsonSampling(A:${alpha},B:${beta},Theta:${expectedValue.toFixed(4)})`;
                }
            } catch (err) {
                this.logger.warn('Failed to execute Thompson Sampling bid shading fallback', err instanceof Error ? { error: err.message } : { error: String(err) });
            }
        }

        const finalPrice = parseFloat(bestPrice.toFixed(2));
        const savings = parseFloat((valuation - finalPrice).toFixed(2));

        this.logger.debug('Bid shading calculations completed', {
            siteId,
            valuation,
            shadedPrice: finalPrice,
            savings,
            strategy
        });

        return {
            shadedPrice: finalPrice,
            savings,
            strategy
        };
    }
}
