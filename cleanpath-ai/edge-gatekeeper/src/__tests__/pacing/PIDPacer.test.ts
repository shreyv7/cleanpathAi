
import { PIDPacer } from '../../pacing/PIDPacer';
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
} as unknown as RedisClient;

describe('PIDPacer', () => {
    let pacer: PIDPacer;

    beforeEach(() => {
        jest.clearAllMocks();
        pacer = new PIDPacer(mockRedis, mockLogger);
        jest.useFakeTimers();
        // Set time to Noon (12:00 PM) on some day
        jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should allow request when no budget limit is set', async () => {
        (mockRedis.get as jest.Mock).mockResolvedValue(null);

        const result = await pacer.checkPacing('campaign-1', 1);
        expect(result).toBe(true);
    });

    it('should calculate aggressive probability when underspending', async () => {
        // Setup:
        // Daily Cap: 1000
        // Time: Noon (50% of day) -> Target Spend should be 500
        // Actual Spend: 100 -> We are WAY behind (Underspending)
        // Error = 400 (Positive)

        (mockRedis.get as jest.Mock).mockImplementation((key: string) => {
            if (key === 'budget:limit:campaign-1') return Promise.resolve('1000');
            if (key === 'budget:spend:campaign-1') return Promise.resolve('100');
            if (key === 'pacing:pid:campaign-1') return Promise.resolve(JSON.stringify({ integral: 0, lastError: 0 }));
            return Promise.resolve(null);
        });

        const result = await pacer.checkPacing('campaign-1', 1);

        // Since we are underspending, probability should be 1.0 (or very high)
        expect(result).toBe(true);
        expect(mockRedis.set).toHaveBeenCalled(); // Should update state
    });

    it('should throttle requests when overspending', async () => {
        // Setup:
        // Daily Cap: 1000
        // Time: Noon (50% of day) -> Target Spend 500
        // Actual Spend: 900 -> Way ahead (Overspending)
        // Error = -400.

        (mockRedis.get as jest.Mock).mockImplementation((key: string) => {
            if (key === 'budget:limit:campaign-1') return Promise.resolve('1000');
            if (key === 'budget:spend:campaign-1') return Promise.resolve('900');
            if (key === 'pacing:pid:campaign-1') return Promise.resolve(JSON.stringify({ integral: 0, lastError: 0 }));
            return Promise.resolve(null);
        });

        // Mock Math.random to return 0.99 (high) to force failure
        jest.spyOn(Math, 'random').mockReturnValue(0.99);

        const result = await pacer.checkPacing('campaign-1', 1);

        expect(result).toBe(false);

        jest.restoreAllMocks();
    });
});
