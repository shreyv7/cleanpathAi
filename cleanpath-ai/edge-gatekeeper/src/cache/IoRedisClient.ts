/**
 * Real Redis Client using ioredis
 * Production-grade Redis client with connection management,
 * eval() support for Lua scripts, and automatic reconnection.
 *
 * Governance Reset v1: Replaces MockRedisClient for all non-test usage.
 */

import Redis from 'ioredis';
import { RedisClient, RedisConfig } from './RedisClient';

export class IoRedisClient implements RedisClient {
    private client: Redis;
    private isConnected: boolean = false;

    constructor(config: RedisConfig) {
        this.client = new Redis({
            host: config.host,
            port: config.port,
            password: config.password || undefined,
            db: config.db || 0,
            keyPrefix: config.keyPrefix ? `${config.keyPrefix}:` : undefined,
            connectTimeout: config.connectTimeout || 5000,
            commandTimeout: config.commandTimeout || 3000,
            retryStrategy: (times: number) => {
                if (times > 10) return null; // Stop retrying after 10 attempts
                return Math.min(times * 200, 2000); // Exponential backoff, max 2s
            },
            lazyConnect: true, // Don't connect until first command or explicit connect()
            maxRetriesPerRequest: 3,
        });

        this.client.on('connect', () => {
            this.isConnected = true;
        });

        this.client.on('close', () => {
            this.isConnected = false;
        });

        this.client.on('error', (err) => {
            // ioredis handles reconnection automatically
            // We log but don't throw to maintain fail-open behavior
            console.error('[IoRedisClient] Redis error:', err.message);
        });
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;
        try {
            await this.client.connect();
            this.isConnected = true;
        } catch (err) {
            console.error('[IoRedisClient] Initial connect error:', err);
            // Fail open, ioredis will retry in background
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (err) {
            console.error('[IoRedisClient] GET error:', err);
            return null; // Fail-open: return null on error
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            if (ttl && ttl > 0) {
                await this.client.set(key, value, 'EX', ttl);
            } else {
                await this.client.set(key, value);
            }
        } catch (err) {
            console.error('[IoRedisClient] SET error:', err);
            // Fail-open: silently fail
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error('[IoRedisClient] DEL error:', err);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (err) {
            console.error('[IoRedisClient] EXISTS error:', err);
            return false; // Fail-open
        }
    }

    async ping(): Promise<boolean> {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (err) {
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
        await this.client.quit();
    }

    /**
     * Execute a Lua script via EVAL.
     * Required for TokenBucketPacer and any atomic Redis operations.
     */
    async eval(
        script: string,
        numkeys: number,
        ...args: (string | number)[]
    ): Promise<any> {
        try {
            return await this.client.eval(script, numkeys, ...args);
        } catch (err) {
            console.error('[IoRedisClient] EVAL error:', err);
            return null; // Fail-open
        }
    }
}
