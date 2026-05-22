
import { TokenBucketPacer } from '../../pacing/TokenBucketPacer';
import { RedisClient } from '../../cache/RedisClient';
import { Logger } from '@cleanpath/logging';

// Mock Logger
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
} as unknown as Logger;

// Mock Redis
const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    eval: jest.fn(),
} as unknown as RedisClient;

describe('TokenBucketPacer', () => {
    let pacer: TokenBucketPacer;

    beforeEach(() => {
        jest.clearAllMocks();
        pacer = new TokenBucketPacer(mockRedis, mockLogger);
    });

    it('should allow request when budget is unlimited (no cap set)', async () => {
        (mockRedis.get as jest.Mock).mockResolvedValue(null); // No limit

        const result = await pacer.checkPacing('campaign-1', 1);

        expect(result).toBe(true);
        expect((mockRedis as any).eval).not.toHaveBeenCalled();
    });

    it('should call Lua script with correct parameters when cap is set', async () => {
        (mockRedis.get as jest.Mock).mockResolvedValue('86400'); // Cap = 86400, so Rate = 1/sec
        (mockRedis as any).eval.mockResolvedValue(1); // Lua returns Allowed

        const result = await pacer.checkPacing('campaign-1', 1);

        expect(result).toBe(true);

        expect(mockRedis.get).toHaveBeenCalledWith('budget:limit:campaign-1');

        // Verify Lua arguments
        const evalCall = (mockRedis as any).eval.mock.calls[0];
        // Args: script, numKeys, key1, key2, cost, rate, capacity, now
        expect(evalCall[2]).toBe('pacing:bucket:campaign-1');
        expect(evalCall[3]).toBe('pacing:last_refill:campaign-1');
        expect(parseFloat(evalCall[5])).toBeCloseTo(1.0); // Rate = 86400 / 86400 = 1
    });

    it('should block request when Lua script returns 0', async () => {
        (mockRedis.get as jest.Mock).mockResolvedValue('100');
        (mockRedis as any).eval.mockResolvedValue(0); // Lua returns Blocked

        const result = await pacer.checkPacing('campaign-1', 1);

        expect(result).toBe(false);
    });

    it('should fail open (allow) on redis error', async () => {
        (mockRedis.get as jest.Mock).mockRejectedValue(new Error('Redis down'));

        const result = await pacer.checkPacing('campaign-1', 1);

        expect(result).toBe(true);
        expect(mockLogger.error).toHaveBeenCalled();
    });
});
