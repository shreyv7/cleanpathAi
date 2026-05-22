import { TokenBucketPacer } from '../../pacing/TokenBucketPacer';
import { createRedisClient, RedisClient } from '../../cache/RedisClient';
import { Logger } from '@cleanpath/logging';

// A minimal logger
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
} as unknown as Logger;

describe('TokenBucketPacer Integration', () => {
    let redis: RedisClient;
    let pacer: TokenBucketPacer;

    beforeAll(async () => {
        // Must connect to real Redis (Docker running localhost:6379)
        redis = createRedisClient({
            host: 'localhost',
            port: 6379,
            keyPrefix: 'test-pacing'
        });
        await redis.connect();
    });

    afterAll(async () => {
        await redis.disconnect();
    });

    beforeEach(async () => {
        pacer = new TokenBucketPacer(redis, mockLogger);
        // Clear out test data
        await redis.del('budget:limit:integration-campaign');
        await redis.del('pacing:bucket:integration-campaign');
        await redis.del('pacing:last_refill:integration-campaign');
    });

    it('should allow request when no cap is set', async () => {
        const result = await pacer.checkPacing('integration-campaign', 1);
        expect(result).toBe(true);
    });

    it('should block requests when budget is exhausted', async () => {
        // 86400 cap -> 1 token per second, capacity 3600
        await redis.set('budget:limit:integration-campaign', '86400');
        
        // Cost > Capacity should be rejected immediately or drain it
        // Let's consume 4000 tokens (which is > capacity of 3600)
        const result = await pacer.checkPacing('integration-campaign', 4000);
        expect(result).toBe(false);
    });

    it('should fail open when Redis is physically unreachable', async () => {
        // Create a bogus redis client pointing to a dead port
        const badRedis = createRedisClient({
            host: 'localhost',
            port: 9999, // Nothing running here
            connectTimeout: 500
        });

        // We don't await badRedis.connect() since it will fail or hang
        const badPacer = new TokenBucketPacer(badRedis, mockLogger);

        const result = await badPacer.checkPacing('integration-campaign', 1);
        expect(result).toBe(true); // Should fail open
        
        await badRedis.disconnect();
    });
});
