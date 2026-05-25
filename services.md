# CleanPath AI — Services & Frontends Catalog

This document details the entire software ecosystem inside the `CPFINAL` workspace. The workspace consists of a highly modular layout containing a multi-service monorepo and two external standalone analytics dashboards.

---

## 📊 Summary Table

| Category | Component Name | Tech Stack | Port | Directory Path | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend** | **`dashboard`** | Next.js (React), TailwindCSS, TypeScript | `3001` | `cleanpath-ai/dashboard` | Main unified management console for system configuration. |
| **Frontend** | **`bid-genius-main`** | Vite (React), TypeScript, TailwindCSS | `5173` | `bid-genius-main` | Real-time bid efficiency and AI recommendation panel. |
| **Frontend** | **`budget-guardian-main`** | Vite (React), TypeScript, TailwindCSS | `5174` | `budget-guardian-main` | CFO budget control center and financial pacing monitor. |
| **Backend** | **`edge-gatekeeper`** | Node.js (Express-like HTTP), tsx | `8000` | `cleanpath-ai/edge-gatekeeper` | High-performance edge bid request filter & security router. |
| **Backend** | **`application-api`** | Node.js (Express), PostgreSQL, Neo4j | `3000` | `cleanpath-ai/application-api` | Core business logic API and data integration layer. |
| **ML Service**| **`ctv-spoof-detector`**| Python (FastAPI), ONNX Runtime, XGBoost | `8001` | `cleanpath-ai/ctv-spoof-detector` | CTV spoof-detection classifier and feature evaluation service. |
| **SDK** | **`pulse.js`** | Vanilla JavaScript | Local | `cleanpath-ai/dashboard/public/pulse.js` | Client-side micro-interaction tracking SDK (Module C). |
| **Script** | **`simulate-dsp-traffic`** | Node.js (http.request) | N/A | `cleanpath-ai/dashboard/scripts` | Background programmatic bid request simulator acting as a DSP client. |

---

## 🎨 Frontend & SDK Applications (4 Total)

### 1. Unified Next.js Console (`dashboard`)
* **Path:** `cleanpath-ai/dashboard`
* **Role:** This is the primary administration console. It coordinates database views, manages active campaigns, controls API authentication credentials, and aggregates platform health statistics.
* **Special Upgrades:**
  * **DSP Pre-Bid Integration Hub:** Displays direct JavaScript/Python/JSON integration script blocks for TTD, DV360, and Xandr APB setups with interactive latency cutoff parameters and entitlement token generators.
  * **Stripe-Grade Subscription Console:** Hosts pricing tiers (Starter, Growth, custom Enterprise schedules) with an interactive **Campaign Net ROI Calculator** dynamically showing ad-spend savings vs. licensing fees.
  * **Global Environment Toggle:** Provides dynamic header toggles (`[ Sandbox Simulator ] <---> [ Live Production DB ]`) across all pages to shift between simulated pacing models and live PostgreSQL telemetry instantly.
* **Commands to Run:**
  ```bash
  npx pnpm --filter dashboard dev
  ```

### 2. Bid Genius App (`bid-genius-main`)
* **Path:** `bid-genius-main`
* **Role:** A client-facing Vite + React dashboard focused entirely on showing bidding efficiency metrics, visual decision flow nodes, and deep optimization suggestions powered by ML models.
* **Commands to Run:**
  ```bash
  npm run dev -- --port 5173
  ```

### 3. CFO Budget Guardian (`budget-guardian-main`)
* **Path:** `budget-guardian-main`
* **Role:** A dedicated controller for financial professionals to govern pacing budgets, prevent ad campaign overspending, set smart budget limits, and configure alert triggers.
* **Commands to Run:**
  ```bash
  npm run dev -- --port 5174
  ```

### 4. Pulse Telemetry SDK (`pulse.js`)
* **Path:** `cleanpath-ai/dashboard/public/pulse.js`
* **Role:** A lightweight client-side script loaded by publishers. It tracks mouse velocity wiggles, scroll curves, and coordinate tap precision, sending a structured payload to the `/verify` route of `application-api` to evaluate user entropy.
* **Accessing the File:** Served directly by the dashboard Next.js public workspace.

---

## ⚙️ Backend & Machine Learning Services (4 Total)

### 1. Edge Gatekeeper (`edge-gatekeeper`)
* **Path:** `cleanpath-ai/edge-gatekeeper`
* **Role:** The first line of defense inside the RTB (Real-Time Bidding) pipeline. It intercepts incoming bid streams, parses client request metadata, runs fast thermal heuristics, pulls publisher profiles, and communicates with the Python ML service to block invalid spoof traffic before it eats budget.
* **Commands to Run:**
  ```bash
  npx pnpm --filter @cleanpath/edge-gatekeeper dev
  ```

### 2. Application Coordinator API (`application-api`)
* **Path:** `cleanpath-ai/application-api`
* **Role:** The core relational and graph coordinator. It manages operational schemas in PostgreSQL, visualizes supply paths through Neo4j, handles telemetry tracking, and supplies secure endpoints for frontend queries.
* **Commands to Run:**
  ```bash
  npx pnpm --filter application-api dev
  ```

### 3. CTV Spoof Detector (`ctv-spoof-detector`)
* **Path:** `cleanpath-ai/ctv-spoof-detector`
* **Role:** Dedicated microservice performing deep machine learning classification. It runs an ONNX model that evaluates the CTV feature vectors forwarded by the Gatekeeper to output extremely precise device fraud verdicts within <20ms.
* **Commands to Run:**
  ```bash
  # Inside cleanpath-ai/ctv-spoof-detector
  source venv/bin/activate
  uvicorn main:app --host 127.0.0.1 --port 8001 --reload
  ```

### 4. DSP Traffic Simulator (`simulate-dsp-traffic`)
* **Path:** `cleanpath-ai/dashboard/scripts/simulate-dsp-traffic.js`
* **Role:** Background programmatic client script built using standard, zero-dependency Node.js `http.request`. It acts as a live DSP client sending high-frequency bid requests (valid, MFA, CTV emulators) to the Edge Gatekeeper to feed the active PostgreSQL database telemetry logs.
* **Commands to Run:**
  ```bash
  node dashboard/scripts/simulate-dsp-traffic.js
  ```

---

## 🗄️ Auxiliary Database Services
* **PostgreSQL (Port 5432):** Stores campaign configurations, user sessions, active blocklists, and transaction logs.
* **Redis (Port 6379):** Ultra-fast cache storing publisher metadata and real-time rate limit tracking.
* **Neo4j (Port 7687):** Graph database holding all supply path node networks for auditing path transparency.
