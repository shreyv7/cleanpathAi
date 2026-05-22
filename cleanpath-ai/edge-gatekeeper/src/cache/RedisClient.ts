/**
 * Redis Client Wrapper
 * Distributed caching with Redis
 */

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    connectTimeout?: number;
    commandTimeout?: number;
}

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

/**
 * Create Redis client
 * Returns IoRedisClient (real Redis) for all environments.
 */
export function createRedisClient(config: RedisConfig): RedisClient {
    const { IoRedisClient } = require('./IoRedisClient');
    return new IoRedisClient(config);
}

/**
 * Default Redis configuration
 */
export const DEFAULT_REDIS_CONFIG: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: 'cleanpath',
    connectTimeout: 5000,
    commandTimeout: 3000,
};
