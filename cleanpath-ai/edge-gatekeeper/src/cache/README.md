# Publisher Cache

## Overview

Two-tier caching system for publisher metadata with LRU (L1) and Redis (L2) support.

## Architecture

```
Request → L1 Cache (LRU) → L2 Cache (Redis) → Database
          ↓ Hit              ↓ Hit              ↓ Miss
          Return             Populate L1         Fetch & Cache
```

### L1 Cache (LRU)
- In-memory cache with Least Recently Used eviction
- Default: 1000 entries, 5-minute TTL
- Sub-millisecond access time
- Process-local (not shared across instances)

### L2 Cache (Redis)
- Distributed cache shared across edge instances
- Default: 1-hour TTL
- Fallback when L1 misses
- Optional (can be disabled for local development)

## Usage

### Basic Usage

```typescript
import { createPublisherCache } from './cache';
import { createLogger, LogLevel } from '@cleanpath/logging';

const logger = createLogger({
  level: LogLevel.INFO,
  service: 'edge-gatekeeper',
  environment: 'production',
});

const cache = createPublisherCache({
  lruMaxSize: 1000,
  lruTTL: 300000, // 5 minutes in ms
  redisTTL: 3600, // 1 hour in seconds
  enableRedis: true,
}, logger);

// Initialize (connects to Redis)
await cache.initialize();

// Get from cache
const publisher = await cache.get('pub_123');

// Set in cache
await cache.set('pub_123', {
  profile: { /* ... */ },
  mfaProfile: { /* ... */ },
  cachedAt: Date.now(),
  ttl: 300,
});

// Check existence
const exists = await cache.has('pub_123');

// Delete from cache
await cache.delete('pub_123');

// Get statistics
const stats = cache.getStats();
console.log(stats.l1.hitRate); // L1 cache hit rate percentage
```

### Cache Warming

Pre-populate cache with top publishers for optimal performance:

```typescript
// Top 1000 publishers by volume
const topPublishers = [
  'pub_001',
  'pub_002',
  // ... 998 more
];

// Fetch function (from database)
async function fetchPublisher(id: string) {
  // Query database for publisher data
  const profile = await db.publishers.findById(id);
  const mfaProfile = await db.mfaProfiles.findByPublisherId(id);
  
  return {
    profile,
    mfaProfile,
    cachedAt: Date.now(),
    ttl: 300,
  };
}

// Warm cache
const result = await cache.warm(
  {
    publisherIds: topPublishers,
    batchSize: 50, // Process 50 at a time
  },
  fetchPublisher
);

console.log(`Loaded: ${result.loaded}, Failed: ${result.failed}`);
```

### Configuration

```typescript
interface PublisherCacheConfig {
  lruMaxSize?: number;      // L1 cache max entries (default: 1000)
  lruTTL?: number;          // L1 TTL in milliseconds (default: 300000)
  redisTTL?: number;        // L2 TTL in seconds (default: 3600)
  redisConfig?: RedisConfig; // Redis connection config
  enableRedis?: boolean;     // Enable L2 cache (default: true)
}

interface RedisConfig {
  host: string;              // Redis host
  port: number;              // Redis port
  password?: string;         // Redis password
  db?: number;              // Redis database number
  keyPrefix?: string;       // Key prefix (default: 'cleanpath')
  connectTimeout?: number;   // Connection timeout in ms
  commandTimeout?: number;   // Command timeout in ms
}
```

### Environment Variables

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret
REDIS_DB=0
```

## Performance

### L1 Cache (LRU)
- Get: <1ms
- Set: <1ms
- Memory: ~1KB per entry × 1000 = ~1MB

### L2 Cache (Redis)
- Get: 1-5ms (local network)
- Set: 1-5ms (local network)
- Memory: Shared across instances

### Cache Hit Rates (Expected)
- L1: 85-90% (for top 1000 publishers)
- L2: 95-98% (for top 10,000 publishers)
- Combined: 99%+ hit rate

## Cache Warming Strategy

For optimal performance, warm the cache with:

1. **Top 1000 publishers** by impression volume
2. **Recently active publishers** (last 24 hours)
3. **High-risk publishers** (frequent classification updates)

Recommended warming schedule:
- On startup: Top 1000 publishers
- Every 1 hour: Recently active publishers
- On-demand: Individual publisher updates

## Statistics

```typescript
const stats = cache.getStats();

// L1 statistics
console.log(stats.l1.hits);      // Total L1 hits
console.log(stats.l1.misses);    // Total L1 misses
console.log(stats.l1.size);      // Current L1 size
console.log(stats.l1.maxSize);   // L1 max size
console.log(stats.l1.hitRate);   // L1 hit rate (%)

// L2 statistics
console.log(stats.l2.enabled);   // Redis enabled
console.log(stats.l2.connected); // Redis connected
```

## Maintenance

### Prune Expired Entries

```typescript
// Remove expired entries from L1 cache
const pruned = cache.prune();
console.log(`Pruned ${pruned} expired entries`);
```

### Clear Cache

```typescript
// Clear all L1 entries
await cache.clear();
```

### Disconnect

```typescript
// Disconnect from Redis (graceful shutdown)
await cache.disconnect();
```

## MVP Notes

- Redis client is mocked for MVP (uses in-memory Map)
- In production, replace `MockRedisClient` with actual Redis client (ioredis or node-redis)
- For local development, set `enableRedis: false` to disable L2 cache

## Next Steps

- Task 2.3: Implement decision logic layer
- Replace MockRedisClient with production Redis client
- Add cache metrics to observability dashboard
