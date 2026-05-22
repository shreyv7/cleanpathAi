
import { RedisClient } from './RedisClient';
import { Logger } from '@cleanpath/logging';

export class BudgetCache {
    private client: RedisClient;
    private logger?: Logger;

    // Lua script for atomic check-and-decrement
    // Keys: [spend_key]
    // Args: [increment_amount, total_limit]
    // Returns: 1 if allowed (and incremented), 0 if blocked (limit exceeded)
    private static ATOMIC_SPEND_SCRIPT = `
        local current = tonumber(redis.call('get', KEYS[1]) or '0')
        local inc = tonumber(ARGV[1])
        local limit = tonumber(ARGV[2])
        
        if current + inc <= limit then
            redis.call('incrbyfloat', KEYS[1], inc)
            return 1
        else
            return 0
        end
    `;

    constructor(client: RedisClient, logger?: Logger) {
        this.client = client;
        this.logger = logger;
    }

    /**
     * Set the total budget cap for a campaign for a specific interval (e.g., today)
     */
    async setBudgetCap(campaignId: string, limit: number, ttlSeconds: number): Promise<void> {
        if (!this.client) return;
        const key = `budget:limit:${campaignId}`;
        try {
            await this.client.set(key, limit.toString(), ttlSeconds);
        } catch (e) {
            this.logger?.error('Failed to set budget cap', e, { campaignId });
        }
    }

    /**
     * Atomically check if spend allows the bid, and increment if so.
     * @param campaignId 
     * @param estimatedCost The max cost we might pay (e.g. bid price)
     * @returns boolean True if allowed, False if budget exceeded
     */
    async requestSpend(campaignId: string, estimatedCost: number): Promise<boolean> {
        if (!this.client) return true; // Fail open if cache down

        const spendKey = `budget:spend:${campaignId}`;
        const limitKey = `budget:limit:${campaignId}`;

        try {
            const limitStr = await this.client.get(limitKey);
            if (!limitStr) return true; // No limit set, allow (or could be fail-closed based on policy)

            const limit = parseFloat(limitStr);

            // Execute atomic check
            const result = await (this.client as any).eval(
                BudgetCache.ATOMIC_SPEND_SCRIPT,
                1,
                spendKey,
                estimatedCost.toString(),
                limit.toString()
            );

            return result === 1;
        } catch (e) {
            this.logger?.error('Budget check failure', e, { campaignId });
            return true; // Fail open
        }
    }

    /**
     * Get current spend for a campaign
     */
    async getCurrentSpend(campaignId: string): Promise<number> {
        if (!this.client) return 0;
        try {
            const val = await this.client.get(`budget:spend:${campaignId}`);
            return val ? parseFloat(val) : 0;
        } catch (e) {
            return 0;
        }
    }
}
