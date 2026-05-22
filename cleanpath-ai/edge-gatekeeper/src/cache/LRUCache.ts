/**
 * LRU Cache Implementation
 * In-memory cache with Least Recently Used eviction policy
 */

export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
    accessCount: number;
}

export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    maxSize: number;
    hitRate: number;
}

export class LRUCache<T> {
    private cache: Map<string, CacheEntry<T>>;
    private maxSize: number;
    private defaultTTL: number;
    private stats: { hits: number; misses: number };

    constructor(maxSize: number = 1000, defaultTTL: number = 300000) {
        // defaultTTL in ms (5 minutes)
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
        this.stats = { hits: 0, misses: 0 };
    }

    /**
     * Get value from cache
     */
    get(key: string): T | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            return undefined;
        }

        // Check if entry has expired
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.stats.misses++;
            return undefined;
        }

        // Update access count and move to end (most recently used)
        entry.accessCount++;
        this.cache.delete(key);
        this.cache.set(key, entry);

        this.stats.hits++;
        return entry.value;
    }

    /**
     * Set value in cache
     */
    set(key: string, value: T, ttl?: number): void {
        // Remove oldest entry if cache is full
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        const entry: CacheEntry<T> = {
            value,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
            accessCount: 0,
        };

        // Remove existing entry if present
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }

        this.cache.set(key, entry);
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete key from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all entries
     */
    clear(): void {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0 };
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: Math.round(hitRate * 10000) / 100, // Percentage with 2 decimals
        };
    }

    /**
     * Get all keys
     */
    keys(): string[] {
        return Array.from(this.cache.keys());
    }

    /**
     * Get all values
     */
    values(): T[] {
        return Array.from(this.cache.values()).map((entry) => entry.value);
    }

    /**
     * Prune expired entries
     */
    prune(): number {
        const now = Date.now();
        let pruned = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                pruned++;
            }
        }

        return pruned;
    }

    /**
     * Get entries sorted by access count (most accessed first)
     */
    getMostAccessed(limit: number = 10): Array<{ key: string; value: T; accessCount: number }> {
        const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
            key,
            value: entry.value,
            accessCount: entry.accessCount,
        }));

        return entries.sort((a, b) => b.accessCount - a.accessCount).slice(0, limit);
    }
}
