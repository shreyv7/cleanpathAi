/**
 * Publisher Cache
 * Two-tier caching: LRU (L1) + Redis (L2)
 */

import { PublisherCache as PublisherCacheType } from '@cleanpath/types';
import { LRUCache } from './LRUCache';
import { RedisClient, createRedisClient, RedisConfig, DEFAULT_REDIS_CONFIG } from './RedisClient';
import { Logger } from '@cleanpath/logging';

export interface PublisherCacheConfig {
    lruMaxSize?: number;
    lruTTL?: number; // milliseconds
    redisTTL?: number; // seconds
    redisConfig?: RedisConfig;
    enableRedis?: boolean;
}

export interface CacheWarmingStrategy {
    publisherIds: string[];
    batchSize?: number;
}

export class PublisherCache {
    private l1Cache: LRUCache<PublisherCacheType>;
    private l2Cache?: RedisClient;
    private config: Required<PublisherCacheConfig>;
    private logger?: Logger;

    constructor(config: PublisherCacheConfig = {}, logger?: Logger) {
        this.config = {
            lruMaxSize: config.lruMaxSize || 1000,
            lruTTL: config.lruTTL || 300000, // 5 minutes
            redisTTL: config.redisTTL || 3600, // 1 hour
            redisConfig: config.redisConfig || DEFAULT_REDIS_CONFIG,
            enableRedis: config.enableRedis !== false,
        };

        this.l1Cache = new LRUCache<PublisherCacheType>(
            this.config.lruMaxSize,
            this.config.lruTTL
        );

        if (this.config.enableRedis) {
            this.l2Cache = createRedisClient(this.config.redisConfig);
        }

        this.logger = logger;
    }

    /**
     * Initialize cache (connect to Redis if enabled)
     */
    async initialize(): Promise<void> {
        if (this.l2Cache && 'connect' in this.l2Cache) {
            try {
                await (this.l2Cache as any).connect();
                this.logger?.info('Redis cache connected');
            } catch (error) {
                this.logger?.error('Failed to connect to Redis', error);
                throw error;
            }
        }
    }

    /**
     * Get publisher from cache
     * Checks L1 (LRU) first, then L2 (Redis)
     */
    async get(publisherId: string): Promise<PublisherCacheType | undefined> {
        // Check L1 cache
        const l1Result = this.l1Cache.get(publisherId);
        if (l1Result) {
            this.logger?.debug('L1 cache hit', { publisherId });
            return l1Result;
        }

        // Check L2 cache if enabled
        if (this.l2Cache) {
            try {
                const l2Result = await this.l2Cache.get(publisherId);
                if (l2Result) {
                    this.logger?.debug('L2 cache hit', { publisherId });
                    const parsed = JSON.parse(l2Result) as PublisherCacheType;

                    // Populate L1 cache
                    this.l1Cache.set(publisherId, parsed);

                    return parsed;
                }
            } catch (error) {
                this.logger?.error('Redis get error', error, { publisherId });
            }
        }

        this.logger?.debug('Cache miss', { publisherId });
        return undefined;
    }

    /**
     * Set publisher in cache
     * Writes to both L1 and L2
     */
    async set(publisherId: string, data: PublisherCacheType): Promise<void> {
        // Set in L1 cache
        this.l1Cache.set(publisherId, data);

        // Set in L2 cache if enabled
        if (this.l2Cache) {
            try {
                await this.l2Cache.set(
                    publisherId,
                    JSON.stringify(data),
                    this.config.redisTTL
                );
                this.logger?.debug('Publisher cached', { publisherId });
            } catch (error) {
                this.logger?.error('Redis set error', error, { publisherId });
            }
        }
    }

    /**
     * Delete publisher from cache
     */
    async delete(publisherId: string): Promise<void> {
        this.l1Cache.delete(publisherId);

        if (this.l2Cache) {
            try {
                await this.l2Cache.del(publisherId);
            } catch (error) {
                this.logger?.error('Redis delete error', error, { publisherId });
            }
        }
    }

    /**
     * Check if publisher exists in cache
     */
    async has(publisherId: string): Promise<boolean> {
        if (this.l1Cache.has(publisherId)) {
            return true;
        }

        if (this.l2Cache) {
            try {
                return await this.l2Cache.exists(publisherId);
            } catch (error) {
                this.logger?.error('Redis exists error', error, { publisherId });
                return false;
            }
        }

        return false;
    }

    /**
     * Clear all cache entries
     */
    async clear(): Promise<void> {
        this.l1Cache.clear();
        this.logger?.info('L1 cache cleared');
    }

    /**
     * Warm cache with top publishers
     */
    async warm(
        strategy: CacheWarmingStrategy,
        fetchPublisher: (id: string) => Promise<PublisherCacheType | undefined>
    ): Promise<{ loaded: number; failed: number }> {
        const { publisherIds, batchSize = 50 } = strategy;
        let loaded = 0;
        let failed = 0;

        this.logger?.info('Starting cache warming', {
            totalPublishers: publisherIds.length,
            batchSize,
        });

        // Process in batches
        for (let i = 0; i < publisherIds.length; i += batchSize) {
            const batch = publisherIds.slice(i, i + batchSize);
            const promises = batch.map(async (publisherId) => {
                try {
                    const data = await fetchPublisher(publisherId);
                    if (data) {
                        await this.set(publisherId, data);
                        loaded++;
                    } else {
                        failed++;
                    }
                } catch (error) {
                    this.logger?.error('Cache warming error', error, { publisherId });
                    failed++;
                }
            });

            await Promise.all(promises);
        }

        this.logger?.info('Cache warming complete', { loaded, failed });

        return { loaded, failed };
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const l1Stats = this.l1Cache.getStats();

        return {
            l1: l1Stats,
            l2: {
                enabled: !!this.l2Cache,
                connected: this.l2Cache ? true : false,
            },
        };
    }

    /**
     * Prune expired entries from L1 cache
     */
    prune(): number {
        return this.l1Cache.prune();
    }

    /**
     * Disconnect from Redis
     */
    async disconnect(): Promise<void> {
        if (this.l2Cache) {
            try {
                await this.l2Cache.disconnect();
                this.logger?.info('Redis cache disconnected');
            } catch (error) {
                this.logger?.error('Redis disconnect error', error);
            }
        }
    }
}

/**
 * Create publisher cache instance
 */
export function createPublisherCache(
    config?: PublisherCacheConfig,
    logger?: Logger
): PublisherCache {
    return new PublisherCache(config, logger);
}
