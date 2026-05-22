
import { query } from '../database/db';
import { Logger, LogLevel } from '@cleanpath/logging';

export interface RedisClient {
    connect(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    ping(): Promise<boolean>;
    disconnect(): Promise<void>;
    eval(script: string, numkeys: number, ...args: (string | number)[]): Promise<any>;
}

export function createRedisClient(config: any): RedisClient {
    const Redis = require('ioredis');
    const host = config.host || process.env.REDIS_HOST || 'localhost';
    const port = config.port || parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = config.password || process.env.REDIS_PASSWORD;
    const client = new Redis({
        host,
        port,
        password,
        lazyConnect: true
    });

    return {
        async connect() {
            await client.connect();
        },
        async get(key: string) {
            return await client.get(key);
        },
        async set(key: string, value: string, ttl?: number) {
            if (ttl) {
                await client.set(key, value, 'EX', ttl);
            } else {
                await client.set(key, value);
            }
        },
        async del(key: string) {
            await client.del(key);
        },
        async exists(key: string) {
            const res = await client.exists(key);
            return res === 1;
        },
        async ping() {
            const res = await client.ping();
            return res === 'PONG';
        },
        async disconnect() {
            await client.disconnect();
        },
        async eval(script: string, numkeys: number, ...args: any[]) {
            return await client.eval(script, numkeys, ...args);
        }
    };
}

export class BudgetSyncWorker {
    private redis: RedisClient;
    private logger: Logger;
    private intervalMs: number;
    private intervalId?: NodeJS.Timeout;

    constructor(redisUrl?: string, intervalMs: number = 30000) {
        this.redis = createRedisClient({ host: 'localhost', port: 6379 });
        this.logger = new Logger({ service: 'budget-sync-worker', environment: 'production', level: LogLevel.INFO });
        this.intervalMs = intervalMs;
    }

    async start() {
        this.logger.info('Starting Budget Sync Worker...');
        await (this.redis as any).connect();

        this.runSync(); // Run immediately
        this.intervalId = setInterval(() => this.runSync(), this.intervalMs);
    }

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        (this.redis as any).disconnect();
        this.logger.info('Budget Sync Worker stopped');
    }

    private async runSync() {
        try {
            const today = new Date();

            // Fetch active campaigns
            const result = await query(`
                SELECT campaign_id, remaining_budget, daily_cap, end_date 
                FROM campaign_budgets 
                WHERE start_date <= $1 AND end_date >= $1
            `, [today]);

            for (const row of result.rows) {
                const { campaign_id, remaining_budget, daily_cap, end_date } = row;

                // Determine the effective limit for Redis (min of remaining or daily cap)
                let limit = parseFloat(remaining_budget);
                if (daily_cap) {
                    limit = Math.min(limit, parseFloat(daily_cap));
                }

                // Calculate TTL based on end_date
                const ttl = Math.floor((new Date(end_date).getTime() - Date.now()) / 1000);

                if (ttl > 0) {
                    await this.redis.set(`budget:limit:${campaign_id}`, limit.toString(), ttl);
                }
            }

            this.logger.info(`Synced ${result.rows.length} budgets to Redis`);
        } catch (e) {
            this.logger.error('Error syncing budgets', e);
        }
    }
}
