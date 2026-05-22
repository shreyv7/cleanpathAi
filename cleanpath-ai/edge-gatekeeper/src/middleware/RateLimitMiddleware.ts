/**
 * Rate Limit Middleware
 * Per-client QPS limits
 */

import { Logger } from '@cleanpath/logging';

export interface RateLimitConfig {
    defaultQPS: number; // Queries per second
    clientLimits: Map<string, number>; // Client-specific limits
    windowMs: number; // Time window in milliseconds
    enabled: boolean;
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
    error?: string;
}

interface ClientBucket {
    count: number;
    resetAt: number;
}

export class RateLimitMiddleware {
    private config: RateLimitConfig;
    private buckets: Map<string, ClientBucket>;
    private logger?: Logger;
    private cleanupInterval?: NodeJS.Timeout;

    constructor(config: RateLimitConfig, logger?: Logger) {
        this.config = config;
        this.buckets = new Map();
        this.logger = logger;

        // Start cleanup interval to remove expired buckets
        this.startCleanup();
    }

    /**
     * Check if request is allowed
     */
    checkLimit(clientId: string = 'anonymous'): RateLimitResult {
        if (!this.config.enabled) {
            return {
                allowed: true,
                limit: this.config.defaultQPS,
                remaining: this.config.defaultQPS,
                resetAt: Date.now() + this.config.windowMs,
            };
        }

        const now = Date.now();
        const limit = this.getClientLimit(clientId);
        let bucket = this.buckets.get(clientId);

        // Create new bucket or reset if expired
        if (!bucket || now >= bucket.resetAt) {
            bucket = {
                count: 0,
                resetAt: now + this.config.windowMs,
            };
            this.buckets.set(clientId, bucket);
        }

        // Increment count
        bucket.count++;

        const remaining = Math.max(0, limit - bucket.count);
        const allowed = bucket.count <= limit;

        if (!allowed) {
            this.logger?.warn('Rate limit exceeded', {
                clientId,
                limit,
                count: bucket.count,
                resetAt: bucket.resetAt,
            });
        }

        return {
            allowed,
            limit,
            remaining,
            resetAt: bucket.resetAt,
            error: allowed ? undefined : 'Rate limit exceeded',
        };
    }

    /**
     * Get client-specific limit or default
     */
    private getClientLimit(clientId: string): number {
        return this.config.clientLimits.get(clientId) || this.config.defaultQPS;
    }

    /**
     * Set client-specific limit
     */
    setClientLimit(clientId: string, qps: number): void {
        this.config.clientLimits.set(clientId, qps);
        this.logger?.info('Client rate limit updated', { clientId, qps });
    }

    /**
     * Remove client-specific limit
     */
    removeClientLimit(clientId: string): void {
        this.config.clientLimits.delete(clientId);
        this.logger?.info('Client rate limit removed', { clientId });
    }

    /**
     * Get current bucket stats for a client
     */
    getClientStats(clientId: string): {
        count: number;
        limit: number;
        remaining: number;
        resetAt: number;
    } | null {
        const bucket = this.buckets.get(clientId);
        const limit = this.getClientLimit(clientId);

        if (!bucket) {
            return null;
        }

        const now = Date.now();
        if (now >= bucket.resetAt) {
            return null;
        }

        return {
            count: bucket.count,
            limit,
            remaining: Math.max(0, limit - bucket.count),
            resetAt: bucket.resetAt,
        };
    }

    /**
     * Get all active buckets
     */
    getActiveBuckets(): Map<string, ClientBucket> {
        const now = Date.now();
        const active = new Map<string, ClientBucket>();

        for (const [clientId, bucket] of this.buckets.entries()) {
            if (now < bucket.resetAt) {
                active.set(clientId, bucket);
            }
        }

        return active;
    }

    /**
     * Reset all buckets
     */
    reset(): void {
        this.buckets.clear();
        this.logger?.info('All rate limit buckets reset');
    }

    /**
     * Start cleanup interval
     */
    private startCleanup(): void {
        // Clean up expired buckets every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);
    }

    /**
     * Clean up expired buckets
     */
    private cleanup(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [clientId, bucket] of this.buckets.entries()) {
            if (now >= bucket.resetAt) {
                this.buckets.delete(clientId);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            this.logger?.debug('Cleaned up expired rate limit buckets', { count: cleaned });
        }
    }

    /**
     * Stop cleanup interval
     */
    stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }
}

/**
 * Create rate limit middleware
 */
export function createRateLimitMiddleware(
    defaultQPS: number = 1000,
    windowMs: number = 1000,
    enabled: boolean = true,
    logger?: Logger
): RateLimitMiddleware {
    return new RateLimitMiddleware(
        {
            defaultQPS,
            clientLimits: new Map(),
            windowMs,
            enabled,
        },
        logger
    );
}
