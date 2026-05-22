
import { Pacer } from './Pacer';
import { RedisClient } from '../cache/RedisClient';
import { Logger } from '@cleanpath/logging';

export class TokenBucketPacer implements Pacer {
    private redis: RedisClient;
    private logger: Logger;

    // Lua script:
    // keys: [bucket_key, last_refill_key]
    // args: [cost, refill_rate_per_sec, capacity, now_ms]
    private static BUCKET_SCRIPT = `
        local bucket_key = KEYS[1]
        local last_refill_key = KEYS[2]
        local cost = tonumber(ARGV[1])
        local rate = tonumber(ARGV[2])
        local capacity = tonumber(ARGV[3])
        local now = tonumber(ARGV[4])

        local tokens = tonumber(redis.call('get', bucket_key) or capacity)
        local last_refill = tonumber(redis.call('get', last_refill_key) or now)

        -- Refill
        local delta_sec = (now - last_refill) / 1000
        if delta_sec > 0 then
            local added = delta_sec * rate
            tokens = math.min(capacity, tokens + added)
            redis.call('set', last_refill_key, now)
        end

        -- Consume
        if tokens >= cost then
            tokens = tokens - cost
            redis.call('set', bucket_key, tokens)
            -- Set TTL to 24h to clean up stale keys
            redis.call('expire', bucket_key, 86400)
            redis.call('expire', last_refill_key, 86400)
            return 1 -- Allowed
        else
            return 0 -- Rejected
        end
    `;

    constructor(redis: RedisClient, logger: Logger) {
        this.redis = redis;
        this.logger = logger;
    }

    async init(): Promise<void> {
        // No special init needed
    }

    async checkPacing(campaignId: string, estimatedCost: number = 1): Promise<boolean> {
        if (!this.redis) return true; // Fail open

        try {
            // Fetch campaign config (Capacity/Rate) from Redis or optimized local cache in prod
            // For MVP, we assume a static rate or fetched from a 'budget:config:{id}' key
            // Here we assume a simplified model: Rate pro-rated from daily cap

            const limitKey = `budget:limit:${campaignId}`;
            const limitStr = await this.redis.get(limitKey);

            if (!limitStr) return true; // No strict limit, or 'ASAP' mode implicitly

            const dailyCap = parseFloat(limitStr);
            // Simple logic: Spread daily cap over 24 hours
            // Rate = Cap / 86400 (tokens per second)
            const rate = dailyCap / 86400;
            const capacity = dailyCap / 24; // Allow 1 hour burst

            const now = Date.now();
            const result = await this.redis.eval(
                TokenBucketPacer.BUCKET_SCRIPT,
                2,
                `pacing:bucket:${campaignId}`,
                `pacing:last_refill:${campaignId}`,
                estimatedCost.toString(),
                rate.toString(),
                capacity.toString(),
                now.toString()
            );

            return result === 1;

        } catch (e) {
            this.logger.error('TokenBucket error', e, { campaignId });
            return true; // Fail open
        }
    }
}
