# CleanPath AI — Execution & Migration Guide

This document is the **single source of truth** for setting up, running, and testing the CleanPath AI platform on a fresh machine (migration scenario).

---

## 1. Prerequisites (Install First)

Before cloning, ensure the target machine has:

1. **Node.js** (v18+)
   - Check: `node -v`
2. **pnpm** (Package Manager)
   - Install: `npm install -g pnpm` (or use `npx pnpm` directly if `pnpm` command is not in path)
   - Check: `pnpm -v`
3. **Python** (v3.10+)
   - Check: `python3 --version`
4. **Docker Desktop** (Engine + Compose)
   - Check: `docker info`
5. **k6** (Optional, for load testing)
   - Mac: `brew install k6`
   - Linux: `sudo apt-get install k6` (see official docs)

---

## 2. Initial Setup

### 2.1 Clone & Install
```bash
# CleanPath Edge + Backend (Monorepo)
cd cleanpath-ai
pnpm install

# CTV Spoof Detector (Python ML Microservice)
cd ctv-spoof-detector
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 generate_dummy_model.py
cd ..

# Budget Guardian Frontend
cd ../budget-guardian-main
npm install

# Bid Genius Frontend
cd ../bid-genius-main
npm install
```

### 2.2 Environment Configuration
Create the `.env` file in the root `cleanpath-ai` directory:

```bash
cat > .env << 'EOF'
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=cleanpath
DB_PASSWORD=password
DB_NAME=cleanpath_db

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASS=password

# Edge Gatekeeper
ENVIRONMENT=development
LOG_LEVEL=info
MAX_LATENCY_MS=20
ENABLE_REDIS=true
ENABLE_METRICS=true
ENABLE_AUDIT=true
AUDIT_API_URL=http://localhost:3000/api
API_KEY=dev-api-key-change-in-production

# ML Inference Microservice
ML_SERVICE_URL=http://localhost:8001/predict
EOF
```

---

## 3. Infrastructure Boot-Up

Start the required backing services (Redis, PostgreSQL, Neo4j):

```bash
docker compose -f docker-compose.test.yml up -d
```

**Verify they are running:**
```bash
docker ps
# Operational if you see: cleanpath-ai-redis-1, cleanpath-ai-postgres-1, cleanpath-ai-neo4j-1
```

---

## 4. Database Migrations

**Important:** The system will fail if tables don't exist.

### 4.1 PostgreSQL Schema
Run migrations from `application-api`:

```bash
cd application-api
npm run migrate:up
cd ..
```
*(Note: If `migrate:up` fails, the schema may have already been auto-seeded via Docker init scripts during Phase 1.)*

### 4.2 Neo4j Schema
Load the graph constraints (manual step):

```bash
cat application-api/src/database/graph/schema.cypher | \
  docker exec -i $(docker ps -q -f ancestor=neo4j:5.12.0) \
  cypher-shell -u neo4j -p password
```

---

## 5. Running the Application

You can run all Node services in parallel from the root:

```bash
npx pnpm run dev
```

Or run services individually in separate terminals:

### Terminal 1: Edge Gatekeeper (Port 8000)
*The high-performance bid filter.*
```bash
cd cleanpath-ai
npx pnpm --filter @cleanpath/edge-gatekeeper dev
```

### Terminal 2: Application API (Port 3000)
*The coordination layer and financial engine.*
```bash
cd cleanpath-ai
npx pnpm --filter application-api dev
```

### Terminal 3: Unified Next.js Dashboard (Port 3001)
*The main administration console.*
```bash
cd cleanpath-ai
npx pnpm --filter dashboard dev
```

### Terminal 4: CTV Spoof Detector ML Service (Port 8001)
*The Python machine learning inference classifier.*
```bash
cd cleanpath-ai/ctv-spoof-detector
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### Terminal 5: Budget Guardian (Port 5174)
*The CFO Control Center.*
```bash
cd budget-guardian-main
npm run dev -- --port 5174
```

### Terminal 6: Bid Genius (Port 5173)
*The Bid Efficiency Dashboard.*
```bash
cd bid-genius-main
npm run dev -- --port 5173
```

---

## 6. Verification & Testing

### 6.1 Smoke Test (Is it alive?)
```bash
# Edge Gatekeeper Health
curl http://localhost:8000/health
# Expected: {"healthy":true,"uptime":...}

# Send a sample bid request
curl -X POST http://localhost:8000/api/decisions/process \
  -H "Content-Type: application/json" \
  -d '{"id":"test-1","imp":[{"id":"1","banner":{"w":300,"h":250}}],"site":{"domain":"example.com"},"device":{"ip":"1.2.3.4"}}'
# Expected: {"decision":"ALLOW", ...}
```

### 6.2 Dashboard Access
Open your browser to: 
- **Bid Genius (Efficiency):** [http://localhost:5173](http://localhost:5173)
- **Budget Guardian (CFO Control):** [http://localhost:5174](http://localhost:5174)

### 6.3 Note on Performance Testing
Load testing via k6 and node.js clustering have been explicitly deferred per the latest architectural directives. Performance benchmarking should not be run against local development infrastructure during handoff.

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| **Redis connection Refused** | `docker ps` to check Redis. Ensure `.env` has `REDIS_HOST=localhost`. |
| **Relation "decision_log" does not exist** | You skipped Step 4.1 (PostgreSQL Migrations). |
| **Authentication Failed (Neo4j)** | Check `NEO4J_PASS` in `.env` matches `docker-compose.test.yml`. |
| **Dashboard shows 0/Loading** | Ensure `application-api` is running on port 3000. |

---

**End of Guide**
