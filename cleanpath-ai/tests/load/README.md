# CleanPath AI Load Testing

This directory contains [k6](https://k6.io/) load testing scripts to validate the performance and resilience of the `edge-gatekeeper` service.

## Prerequisites

Install k6:
```bash
# MacOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
winget install k6
```

Ensure the `edge-gatekeeper` creates are running:
```bash
cd ../../
npm run dev
# OR
docker compose up -d
npm start --workspace=@cleanpath/edge-gatekeeper
```

## Available Tests

### 1. Baseline Performance Test (`edge-gatekeeper.js`)
Validates that the system meets P99 latency requirements under standard load patterns (ramp-up → peak → ramp-down).

**Run:**
```bash
k6 run tests/load/edge-gatekeeper.js
```

**Goals:**
- **P99 Latency:** < 30ms
- **Error Rate:** < 1%
- **Peak Throughput:** ~2000 RPS

### 2. Chaos / Failure Test (`failure-test.js`)
Validates the **Fail-Open** policy. The system should continue serving 200 OK responses even when infrastructure (Redis, Neo4j) goes down.

**Run:**
```bash
k6 run tests/load/failure-test.js
```

**Execute Failure Scenarios (in another terminal):**
```bash
# 1. Stop Redis (Cache/Pacing failure)
docker stop cleanpath-ai-redis-1
# Result: Should verify 'fail_open_success' rate remains 100%

# 2. Stop Neo4j (Graph failure)
docker stop cleanpath-ai-neo4j-1
# Result: Graph queries fail gracefully, bid decision continues

# 3. Restore
docker start cleanpath-ai-redis-1 cleanpath-ai-neo4j-1
```

## Interpreting Results

- **http_req_duration**: The total time for the request. Look at `p(95)` and `p(99)`.
- **http_req_failed**: The percentage of failed requests (non-200 status).
- **checks**: Specific assertions defined in the tests.

If `fail_open_success` drops below 100% during a Redis outage, the fail-open logic in `RedisClient.ts` or `TokenBucketPacer.ts` is broken.
