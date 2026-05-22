# CleanPath AI

**Enterprise SaaS Infrastructure for Real-Time Ad Fraud Detection and Analytics**

---

## 🎯 Overview

CleanPath AI is a production-grade, enterprise-level platform designed to detect and prevent ad fraud in real-time using advanced machine learning, graph analytics, and scalable microservices architecture.

---

## 🏗️ Architecture

This monorepo contains the following core services:

### **Edge & Gateway**
- **edge-gatekeeper/** - High-performance edge gateway for request filtering, rate limiting, and initial fraud detection

### **Core Services**
- **application-api/** - Main REST API for business logic, user management, and orchestration
- **graph-service/** - Graph database service for relationship analysis and pattern detection
- **analytics-pipeline/** - Real-time data ingestion and processing pipelines
- **ml-engine/** - Machine learning models for fraud detection (rule-based, supervised, reinforcement learning)

### **Frontend**
- **dashboard/** - Executive and technical dashboards with real-time visualizations

### **Infrastructure**
- **infra/** - Terraform, Kubernetes, CI/CD, and secrets management
- **observability/** - Metrics, tracing, and alerting configurations

### **Shared Resources**
- **shared/** - Common types, utilities, logging, and security modules
- **docs/** - Comprehensive documentation
- **tests/** - Integration, performance, load, and security tests
- **scripts/** - Automation and utility scripts
- **architecture/** - System design diagrams and documentation

---

## 📁 Project Structure

```
cleanpath-ai/
├── docs/                          # Documentation
├── infra/                         # Infrastructure as Code
│   ├── terraform/                 # Terraform configurations
│   ├── kubernetes/                # K8s manifests
│   ├── ci-cd/                     # CI/CD pipelines
│   └── secrets/                   # Secret management
├── edge-gatekeeper/               # Edge gateway service
├── application-api/               # Core API service
├── graph-service/                 # Graph analytics service
├── analytics-pipeline/            # Data processing pipelines
├── ml-engine/                     # ML models and training
├── dashboard/                     # Frontend dashboard
├── shared/                        # Shared libraries
├── scripts/                       # Utility scripts
├── tests/                         # End-to-end tests
├── architecture/                  # Architecture documentation
└── observability/                 # Monitoring and alerting
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git >= 2.30.0
- Docker & Docker Compose (for local services)
- Terraform (for infrastructure provisioning)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd cleanpath-ai

# Install pnpm globally (if not already installed)
npm install -g pnpm@8.15.0

# Install all workspace dependencies
pnpm install

# Start development servers for all services
pnpm run dev

# Build all packages
pnpm run build

# Run all tests
pnpm run test
```

For detailed setup instructions, see [SETUP.md](./SETUP.md).

---

## 🧪 Testing

```bash
# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
```

---

## 📊 Key Features

- ✅ **Real-time fraud detection** with sub-100ms latency
- ✅ **Advanced CTV Spoof Guard** (App, Device, Stream validation)
- ✅ **Graph-based pattern recognition** for complex fraud networks
- ✅ **Multi-model ML approach** (XGBoost, ONNX, Reinforcement Learning)
- ✅ **Executive dashboards** for CFO and technical teams
- ✅ **Scalable microservices** architecture
- ✅ **Enterprise-grade security** and compliance
- ✅ **Full observability** with metrics, tracing, and alerts

---

## 📖 Documentation

Detailed documentation is available in the `/docs` directory:
- Architecture overview
- API documentation
- Deployment guides
- Security policies
- Runbooks

---

## 🤝 Contributing

Please read our contributing guidelines before submitting pull requests.

---

## 📄 License

Copyright © 2026 CleanPath AI. All rights reserved.

---

## 🔗 Links

- [Documentation](./docs)
- [Architecture Diagrams](./architecture)
- [API Reference](./docs/api)

---

**Built with ❤️ for a fraud-free advertising ecosystem**
