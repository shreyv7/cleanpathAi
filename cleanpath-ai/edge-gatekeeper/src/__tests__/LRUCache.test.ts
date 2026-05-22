/**
 * LRUCache Tests
 */

import { LRUCache } from '../cache/LRUCache';

describe('LRUCache', () => {
    let cache: LRUCache<string>;

    beforeEach(() => {
        cache = new LRUCache<string>(3, 1000); // Max 3 items, 1 second TTL
    });

    describe('Basic Operations', () => {
        it('should set and get values', () => {
            cache.set('key1', 'value1');
            expect(cache.get('key1')).toBe('value1');
        });

        it('should return undefined for missing keys', () => {
            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should check if key exists', () => {
            cache.set('key1', 'value1');
            expect(cache.has('key1')).toBe(true);
            expect(cache.has('key2')).toBe(false);
        });

        it('should delete keys', () => {
            cache.set('key1', 'value1');
            expect(cache.delete('key1')).toBe(true);
            expect(cache.get('key1')).toBeUndefined();
            expect(cache.delete('key1')).toBe(false);
        });

        it('should clear all entries', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.clear();
            expect(cache.size()).toBe(0);
        });

        it('should return correct size', () => {
            expect(cache.size()).toBe(0);
            cache.set('key1', 'value1');
            expect(cache.size()).toBe(1);
            cache.set('key2', 'value2');
            expect(cache.size()).toBe(2);
        });
    });

    describe('LRU Eviction', () => {
        it('should evict least recently used item when full', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');
            cache.set('key4', 'value4'); // Should evict key1

            expect(cache.get('key1')).toBeUndefined();
            expect(cache.get('key2')).toBe('value2');
            expect(cache.get('key3')).toBe('value3');
            expect(cache.get('key4')).toBe('value4');
        });

        it('should update LRU order on access', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');

            // Access key1 to make it most recently used
            cache.get('key1');

            // Add key4, should evict key2 (least recently used)
            cache.set('key4', 'value4');

            expect(cache.get('key1')).toBe('value1');
            expect(cache.get('key2')).toBeUndefined();
            expect(cache.get('key3')).toBe('value3');
            expect(cache.get('key4')).toBe('value4');
        });
    });

    describe('TTL Management', () => {
        it('should expire entries after TTL', async () => {
            const shortCache = new LRUCache<string>(10, 100); // 100ms TTL
            shortCache.set('key1', 'value1');

            expect(shortCache.get('key1')).toBe('value1');

            // Wait for expiration
            await new Promise((resolve) => setTimeout(resolve, 150));

            expect(shortCache.get('key1')).toBeUndefined();
        });

        it('should support custom TTL per entry', async () => {
            cache.set('key1', 'value1', 100); // 100ms TTL
            cache.set('key2', 'value2', 500); // 500ms TTL

            await new Promise((resolve) => setTimeout(resolve, 150));

            expect(cache.get('key1')).toBeUndefined();
            expect(cache.get('key2')).toBe('value2');
        });

        it('should prune expired entries', async () => {
            const shortCache = new LRUCache<string>(10, 100);
            shortCache.set('key1', 'value1');
            shortCache.set('key2', 'value2');
            shortCache.set('key3', 'value3');

            await new Promise((resolve) => setTimeout(resolve, 150));

            const pruned = shortCache.prune();
            expect(pruned).toBe(3);
            expect(shortCache.size()).toBe(0);
        });
    });

    describe('Statistics', () => {
        it('should track cache hits and misses', () => {
            cache.set('key1', 'value1');

            cache.get('key1'); // Hit
            cache.get('key2'); // Miss
            cache.get('key1'); // Hit
            cache.get('key3'); // Miss

            const stats = cache.getStats();
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(2);
            expect(stats.hitRate).toBe(50);
        });

        it('should calculate hit rate correctly', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            // 3 hits, 1 miss = 75% hit rate
            cache.get('key1');
            cache.get('key2');
            cache.get('key1');
            cache.get('key3');

            const stats = cache.getStats();
            expect(stats.hitRate).toBe(75);
        });

        it('should reset stats on clear', () => {
            cache.set('key1', 'value1');
            cache.get('key1');
            cache.get('key2');

            cache.clear();

            const stats = cache.getStats();
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
        });
    });

    describe('Access Tracking', () => {
        it('should track access count', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            cache.get('key1');
            cache.get('key1');
            cache.get('key1');
            cache.get('key2');

            const mostAccessed = cache.getMostAccessed(2);
            expect(mostAccessed[0].key).toBe('key1');
            expect(mostAccessed[0].accessCount).toBe(3);
            expect(mostAccessed[1].key).toBe('key2');
            expect(mostAccessed[1].accessCount).toBe(1);
        });

        it('should limit most accessed results', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');

            cache.get('key1');
            cache.get('key2');
            cache.get('key3');

            const mostAccessed = cache.getMostAccessed(2);
            expect(mostAccessed.length).toBe(2);
        });
    });

    describe('Utility Methods', () => {
        it('should return all keys', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            const keys = cache.keys();
            expect(keys).toContain('key1');
            expect(keys).toContain('key2');
            expect(keys.length).toBe(2);
        });

        it('should return all values', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            const values = cache.values();
            expect(values).toContain('value1');
            expect(values).toContain('value2');
            expect(values.length).toBe(2);
        });
    });

    describe('Performance', () => {
        it('should handle large number of entries efficiently', () => {
            const largeCache = new LRUCache<string>(10000, 60000);
            const startTime = Date.now();

            for (let i = 0; i < 10000; i++) {
                largeCache.set(`key${i}`, `value${i}`);
            }

            const setTime = Date.now() - startTime;
            expect(setTime).toBeLessThan(100); // 10k sets in under 100ms

            const getStartTime = Date.now();
            for (let i = 0; i < 10000; i++) {
                largeCache.get(`key${i}`);
            }

            const getTime = Date.now() - getStartTime;
            expect(getTime).toBeLessThan(150); // 10k gets in under 150ms to ensure environmental robustness
        });
    });
});
