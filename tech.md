# CleanPath AI — Full Systems Architecture & Technical Reference

This document serves as your **ultimate technical cheat sheet**. It details the exact stack, architectural paradigms, and design decisions underpinning the **CleanPath AI** ecosystem. If an interviewer asks you about this project, this guide will help you speak about it with the authority of a Principal Systems Architect and Lead ML Engineer.

---

## 🏗️ 1. Architectural Overview & Design Patterns

CleanPath AI is designed as a **hybrid distributed microservices architecture** configured inside a performant monorepo. It solves the core problem of **programmatic ad-fraud, supply path transparency, and budget leakage** at the DSP-exchange layer.

### Core Architectural Pillars:
* **High-Throughput & Low-Latency:** The system sits directly on the ad-bidding hot path. The Edge Gatekeeper has strict **<20ms** latency budgets for parsing OpenRTB requests and deciding whether to `ALLOW`, `BLOCK`, `BID_MODIFIER`, or `REROUTE`.
* **Fail-Open Fault Tolerance:** In ad-tech, downtime means lost revenue. The system implements strict **fail-open** mechanisms across all integration points. If Redis, Neo4j, or the ML Inference service goes down, the Gatekeeper catches the error, logs it as a non-blocking diagnostic, and defaults to standard processing rather than dropping real-time bid streams.
* **Separation of Concerns (Hot Path vs. Cold Path):**
  * **Hot Path (Edge Gatekeeper):** Ultra-lean TypeScript process, optimized caching, no heavy synchronous DB queries.
  * **Cold Path (Application API & Analytics Pipelines):** Batch processing, PostgreSQL logging, Neo4j graph processing, and administrative dashboards.

---

## ⚙️ 2. Backend & Edge Filtration Stack

### Node.js, Express & TypeScript
* **Role:** Serves as the primary runtime environment for `edge-gatekeeper` and `application-api`. 
* **Key Concept for Interviewers:** TypeScript guarantees **type-safety** across the complex OpenRTB schemas, preventing runtime exceptions under heavy load.

### Native Node.js Clustering (`cluster` module)
* **How it works:** Node.js is natively single-threaded. To achieve true parallel horizontal scaling on multi-core servers, we implement Node's native `cluster` module in the Gatekeeper. It dynamically forks worker processes equal to `os.cpus().length` sharing the same port. It also features automatic worker process respawning if a child thread crashes.
* **QPS target:** Built to scale up to **100k+ Queries Per Second (QPS)**.

### Custom Middleware & Real-Time Utilities
* **Token-Bucket Rate Limiter:** Protects the Gatekeeper from being overwhelmed by bad actors.
* **LRU (Least Recently Used) Fallback Cache:** If the Redis service is disconnected, the Gatekeeper seamlessly falls back to a high-speed local in-memory LRU cache to continue checking publisher metrics without performance drops.

---

## 🤖 3. Machine Learning & Inference Architecture

The machine learning architecture separates the **heavy model evaluation** from the core bidding runtime to avoid blocking the Event Loop.

```
[Edge Gatekeeper] --- (HTTP POST /predict venv) ---> [FastAPI Inference Service]
                                                                |
                                                      [ONNX Runtime Engine]
                                                                |
                                                      [XGBoost Classifier]
```

### Python 3.10+, FastAPI & Uvicorn
* **Role:** Dedicated high-performance ML inference microservice (`ctv-spoof-detector`).
* **Why FastAPI:** Python is the gold standard for ML but standard frameworks (like Flask/Django) are slow. FastAPI is built on ASGI (Uvicorn), using `asyncio` loop concepts similar to Node.js, making it one of the fastest Python frameworks available.

### ONNX (Open Neural Network Exchange) & ONNX Runtime
* **Why ONNX:** Originally, running ONNX inside Node.js required native binary bindings (`onnxruntime-node`) which frequently cause build and compiler version conflicts across OS environments (especially Mac vs. Windows).
* **The Solution:** We externalized the ML engine into a dedicated Python microservice. The model is saved in the cross-platform **ONNX** format. We run it via the native C++ backed **ONNX Runtime Engine** inside Python, which evaluates device features in **<1ms**.

### XGBoost (eXtreme Gradient Boosting)
* **The Classifier:** The spoof detector is built on **XGBoost**, an optimized distributed gradient boosting library. It classifies structured tabular data (22 discrete numerical features mapping the `CTVFeatureVector` schema, such as screen size, session duration, bitrate, emulator flags, and device makes) to output an exact fraud probability.

### 🔄 Active Online Reinforcement Learning (Thompson Sampling MAB)
* **What we built:** A live, closed-loop **Multi-Armed Bandit (MAB)** reinforcement learning pipeline for dynamic bid shading!
* **How it works:** 
  1. We store dynamic `alpha` (high-value human view rewards) and `beta` (wasted click/bot impression penalties) parameters in Redis for each campaign and publisher.
  2. Inside `BidShader.ts`, we implement a statistically exact **Marsaglia and Tsang method** for drawing samples from a Gamma distribution, yielding perfect, sub-millisecond Beta distribution draws: $\theta \sim \text{Beta}(\alpha, \beta)$.
  3. The draw value $\theta$ is applied as a dynamic reinforcement bid multiplier to shade (minimize) the CPM valuation price based on live, historical performance.
  4. An asynchronous outcome endpoint `/api/telemetry/pixel` receives click and conversion telemetry, automatically incrementing `alpha` or `beta` weights in Redis to close the loop!

---

## 🗄️ 4. Data Layer & Graph Engineering

Our databases are selected for their high specialization:

### 1. Redis (In-Memory Cache & Pacing)
* **Library:** `ioredis` (high-performance Node driver).
* **Use Case:** Stores high-frequency, transient data: rate-limit counters, active session states, and publisher profiles.
* **Budget Pacing:** Implements a token-bucket algorithm using Redis transactions to enforce budget pacing across campaigns in real-time.

### 2. Neo4j (Graph Database for Supply Paths)
* **Library:** Neo4j JavaScript Driver (`neo4j-driver`).
* **Use Case:** Supply Path Optimization (SPO). Programmatic exchanges often route bids through redundant paths (fee stacking). Neo4j maps these entities (DSP → SSP → Reseller → Publisher) as a graph.
* **Cypher Queries:** We write custom Graph Traversal queries in **Cypher** (like `findHighFeePaths` and `findDuplicateAuctions`) to detect hops taking excessive commissions or duplicating auction signals, letting the Gatekeeper issue immediate `REROUTE` commands.

### 3. PostgreSQL (Relational Transaction Storage)
* **Library:** `pg` with `db-migrate` for version-controlled database migrations.
* **Use Case:** Holds persistent logs of all edge decisions, campaign budgets, and publisher metadata.

---

## 🎨 5. Frontend & UI Engineering Stack

We built three distinct web apps utilizing state-of-the-art developer tools:

### Next.js 14 (App Router) & Vite + React
* **Unified Console:** Built in **Next.js** for server-side rendering, routing, and centralized security.
* **Client Dashboards:** Both `bid-genius` and `budget-guardian` are built using **Vite**, offering sub-second Hot Module Replacement (HMR) during development.

### Dynamic Telemetry Environment Switcher
* **Implementation:** The `EnvironmentToggle.tsx` acts as a reactive state controller. It allows operators to dynamically shift the dashboard data stream between **Sandbox Simulator** (which executes client-side pacing loops) and **Live Production DB** (which executes direct SQL aggregate queries against PostgreSQL through the Express API).
* **Sync Architecture:** Leverages session storage persistence and custom window event dispatchers to synchronize the data state across unrelated dashboard sub-widgets in real-time.

### Stripe-Grade Premium SaaS Console & ROI Engine
* **Pre-Bid Integration Workspace:** Renders actual SDK configurations for TTD (custom pre-bid JS wrappers), DV360 (Python Custom Bidding models), and Xandr APB JSON configurations. Allows customized configurations of latency timeout limits (ms) and fail-safe triggers.
* **Net Campaign ROI Calculator:** Embedded a live calculation slider where users adjust their monthly campaign spend ($100k - $10M) to compute:
  $$\text{Gross Recovery Savings} = \text{Monthly Spend} \times 18.4\% \text{ average programmatic waste}$$
  $$\text{Licensing CPM Fees} = \text{Base Tier} + \left( \frac{\text{Spend}}{\text{Est. CPM}} \times \text{CPM Surcharge} \right)$$
  $$\text{Net Recovered Spend} = \text{Gross Recovery} - \text{Licensing Fees}$$

### TanStack Query (React Query)
* **State Synchronization:** Manages server-state on the frontend. It implements automated background polling, query retries, dynamic caching, and optimistic UI updates, keeping the CFO dashboards up-to-date with live PostgreSQL decision-log metrics without manual refreshes.

### TailwindCSS & Radix UI (ShadcnUI)
* **Design System:** Utility-first CSS coupled with unstyled, highly accessible Radix primitives (via `shadcn/ui`). It implements clean dark modes, seamless borders, and premium modern components (cards, interactive charts, and collapsible tables).

---

## 🛠️ 6. DevOps, Monorepo & Build Tooling

### Turborepo (Vercel)
* **Build System:** Monorepo orchestrator. It creates a build-dependency graph of all local workspaces (Gatekeeper, API, shared libraries, and dashboard).
* **Smart Caching:** Cache-hashes previous builds. If the code in `@cleanpath/types` hasn't changed, Turborepo skips compiling it and instantly pulls it from cache during build, cutting deployment time.

### pnpm (Performant npm)
* **Package Manager:** Relies on a global **content-addressable store** and hardlinks dependencies rather than copying `node_modules` recursively. This saves gigabytes of disk space and guarantees strict, workspace-isolated dependency resolution.

### Docker & Docker Compose
* **Containerization:** Packages the PostgreSQL, Redis, and Neo4j systems into isolated virtual services (`docker-compose.test.yml`) to ensure local development environments perfectly match production cloud topology.

### DSP Bidstream Traffic Emulator (`simulate-dsp-traffic.js`)
* **Role:** A highly reliable programmatic background script built using standard, zero-dependency Node.js `http.request`.
* **Behavior:** It acts as the DSP bidder node, sending real HTTP POST bid requests to the Edge Gatekeeper (Port 8000 `/api/decisions/process`). It programmatically rotates through valid allowed supply domains, suspected multi-hop resellers, high-exposure mobile MFA sites, and spoofed CTV emulators, generating active database telemetry entries in PostgreSQL to prove the real-time efficacy of the dashboard under load.

---

## 💡 Quick Interview Q&A Cheatsheet

### Q: "How did you scale the system to handle the high volume of programmatic traffic?"
> **A:** *"We implemented a clean split between the hot path and the cold path. The Edge Gatekeeper runs on a clustered Node.js setup using the native `cluster` module to utilize all available CPU cores. For caching, we set up a high-performance Redis cache using the `ioredis` client with a safe in-memory LRU cache fallback. Any heavy analytical workloads, Cypher graph traversals, or telemetry logging are handled asynchronously off the main bidding loop."*

### Q: "Why did you choose to build a separate Python microservice for ML rather than running it natively in Node?"
> **A:** *"Deploying native ONNX or TensorFlow C++ bindings directly in Node (`onnxruntime-node`) is highly unstable, hard to package in Docker, and frequently causes system build errors across environments. By creating a dedicated FastAPI service with Uvicorn, we decoupled our ML stack. This allows our data science team to deploy, benchmark, and update the ONNX models independently. We integrated an AbortController with a strict 50ms HTTP timeout in Node to ensure that if the ML service is under heavy load, the Gatekeeper safely fails open and never blocks the bidding engine."*

### Q: "What database pattern did you use to model ad supply chain hops?"
> **A:** *"We modeled the supply chain as a directed graph in Neo4j. Programmatic auctions involve complex relationships between DSPs, SSPs, intermediate resellers, and publishers. By storing these as nodes and relationships, we used Cypher graph queries to inspect the OpenRTB `schain` path in real-time, instantly identifying auction duplication and high fee stacking anomalies to calculate Working Media %."*

### Q: "How does your system implement real-time Machine Learning model optimization without adding latency?"
> **A:** *"We designed a hybrid machine learning pipeline. For security and fraud detection, we run static **supervised XGBoost models** compiled in ONNX format to block bots immediately on the hot path in under 1ms. For allowed traffic, we optimize bid shading using an active **online Thompson Sampling Multi-Armed Bandit (MAB) reinforcement loop**. We store dynamic success (`alpha`) and failure (`beta`) parameters in Redis. In the real-time path, our bid shader draws from a Beta distribution using an optimized Marsaglia and Tsang Gamma sampling approximation in sub-milliseconds to adjust the bid price. When users convert, an asynchronous `/api/telemetry/pixel` webhook increments the parameters in Redis, creating a closed-loop learning engine that runs at extreme scale."*

### Q: "How did you transition the platform to support direct commercial B2B DSP subscription monetization?"
> **A:** *"We moved from isolated mock interfaces to a Stripe-grade pre-bid integration SaaS model. We implemented direct pre-bid JavaScript and Python filters for The Trade Desk, Google DV360, and Xandr, paired with a dynamic Campaign Net ROI Calculator showing custom CPM licensing pricing relative to recovery yields. To prove systems credibility, we built a global environment toggle linking React views to active PostgreSQL aggregate database tables and designed a Node.js traffic simulator that continuously fires real RTB decision requests, proving edge latency and database write telemetry under realistic ad exchange loads."*
