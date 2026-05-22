# Failure Testing Plan

**Governance Reset v1 — Phase 4: Stability & Performance**

## Purpose
Verify that CleanPath AI degrades gracefully when infrastructure components fail.
All tests should confirm the system continues to process bid requests (fail-open policy).

---

## Test Matrix

### 1. Redis Down
**Simulate:** `docker stop cleanpath-ai-redis-1`

| Check | Expected |
|-------|----------|
| Bid processing continues | ✅ Fail-open — all requests ALLOW |
| TokenBucketPacer | ✅ Returns `true` (fail-open line 55) |
| PublisherCache | ✅ Falls back to LRU in-memory cache |
| IoRedisClient errors | ✅ Logged, not thrown |
| Recovery on restart | ✅ Auto-reconnects on `docker start cleanpath-ai-redis-1` |

**Command:**
```bash
docker stop cleanpath-ai-redis-1
# Run load test
k6 run --vus 10 --duration 10s load-test.js
# Verify no crashes, check logs for "Redis connection error"
docker start cleanpath-ai-redis-1
# Verify reconnection
```

---

### 2. Neo4j Down
**Simulate:** `docker stop cleanpath-ai-neo4j-1`

| Check | Expected |
|-------|----------|
| FinancialAuditor | ✅ Returns `[]` (catch block) |
| PathEliminator | ✅ Returns `null` (catch block) |
| Supply path graph endpoint | ✅ Returns empty `{ nodes: [], links: [] }` |
| Recovery | ✅ Neo4jPool reconnects on restart |

**Command:**
```bash
docker stop cleanpath-ai-neo4j-1
curl http://localhost:3000/api/graph/anomalies  # Should return { anomalies: [] }
docker start cleanpath-ai-neo4j-1
```

---

### 3. PostgreSQL Down
**Simulate:** `docker stop cleanpath-ai-postgres-1`

| Check | Expected |
|-------|----------|
| Decision logging | ❌ Fails — decisions not recorded |
| Financial API | ❌ Returns 500 |
| Dashboard stats | ❌ Shows error state |
| Bid processing | ✅ Continues — edge pipeline doesn't depend on PG |

**Mitigation:** Add async decision logging queue (Phase 5 scope).

---

### 4. Memory Pressure (OOM)
**Simulate:** `node --max-old-space-size=128` (128MB limit)

| Check | Expected |
|-------|----------|
| LRU cache eviction | ✅ `maxSize: 1000` caps in-memory cache |
| Process crash | ✅ Cluster restarts worker (exponential backoff) |
| Heap snapshots | Measure baseline and under load |

---

### 5. Network Partition (Audit API unreachable)
**Simulate:** Invalid `AUDIT_API_URL` in .env

| Check | Expected |
|-------|----------|
| AuditLogger.log() | ✅ Fire-and-forget, timeout 1000ms |
| Bid latency | ✅ Not affected (async logging) |

### 6. Python ML Service Down
**Simulate:** Stop FastAPI service on Port 8001 (kill uvicorn process)

| Check | Expected |
|-------|----------|
| Gatekeeper latency | ✅ Stays low, timeout limits to 50ms |
| Fail-Open evaluation | ✅ Returns `-1` for ML score, allowing standard evaluation |
| Recovery | ✅ Auto-recovers once uvicorn is restarted |

---

## Execution Order
1. Run all tests with a single VU first (smoke test)
2. Run under 50 VU sustained load
3. Document P99 latency impact for each failure mode
4. Create regression test for most critical path (Redis down)
