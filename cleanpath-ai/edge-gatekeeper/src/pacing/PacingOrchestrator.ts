
import { Pacer } from './Pacer';
import { TokenBucketPacer } from './TokenBucketPacer';
import { PIDPacer } from './PIDPacer';
import { RedisClient } from '../cache/RedisClient';
import { Logger } from '@cleanpath/logging';

export class PacingOrchestrator {
    private tokenBucket: TokenBucketPacer;
    private pidPacer: PIDPacer;
    private redis: RedisClient;
    private logger: Logger;

    constructor(redis: RedisClient, logger: Logger) {
        this.redis = redis;
        this.logger = logger;
        this.tokenBucket = new TokenBucketPacer(redis, logger);
        this.pidPacer = new PIDPacer(redis, logger);
    }

    async getPacer(campaignId: string): Promise<Pacer> {
        // In a real system, we'd cache the campaign config locally to avoid a Redis lookup just for strategy.
        // For now, we'll check a key or assume based on a convention.

        try {
            const strategy = await this.redis.get(`budget:pacing_mode:${campaignId}`);

            if (strategy === 'SMOOTH') {
                return this.pidPacer;
            }
            // Default to Token Bucket ('ASAP' or undefined)
            return this.tokenBucket;
        } catch (e) {
            this.logger.error('Failed to resolve pacer', e);
            return this.tokenBucket; // Fail safe
        }
    }
}
