# Deployment Guide: CleanPath AI

## 1. Prerequisites
- **Node.js**: v20 or higher
- **pnpm**: v8+ (Monorepo management)
- **Docker & Docker Compose**: For local/containerized infrastructure
- **Terraform**: For cloud infrastructure provisioning
- **PostgreSQL**: v15+ (Application state)
- **Redis**: v7+ (Edge cache)

---

## 2. Infrastructure Setup
### Local Environment
Use the provided Docker Compose to spin up required databases:
```bash
docker-compose -f docker-compose.test.yml up -d
```

### Cloud Environment (AWS)
Provision regional infrastructure using Terraform:
```bash
cd infra/terraform/edge
terraform init
terraform apply
```

---

## 3. Application API Deployment
1. **Build**:
   ```bash
   cd application-api
   pnpm install
   pnpm run build
   ```
2. **Environment Variables**:
   Configure `.env` with:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
   - `PORT` (Default: 3000)
3. **Run**:
   ```bash
   npm start
   ```

---

## 4. Edge Gatekeeper Deployment
The Gatekeeper is optimized for edge runtimes (Lambda@Edge / Cloudflare Workers).
1. **Configuration**:
   - Set `ENABLE_REDIS=true`
   - Set `AUDIT_API_URL` to point to your Application API.
2. **Deployment**:
   Deploy the bundled worker/lambda through your CI/CD pipeline or directly via Terraform.

---

## 5. Dashboard Deployment
1. **Build**:
   ```bash
   cd dashboard
   pnpm install
   pnpm run build
   ```
2. **Configuration**:
   - `NEXT_PUBLIC_API_URL`: Public URL of the Application API.
3. **Serve**:
   Deploy to Vercel, Netlify, or self-host:
   ```bash
   npm run start
   ```

---

## 6. Monitoring & Maintenance
- **Logs**: Centralized via Pino streams to CloudWatch or Datadog.
- **Metrics**: Prometheus/Grafana integration available in `infra/terraform/monitoring`.
- **Cache**: Monitor Redis hit rates to ensure <5ms edge latency.
