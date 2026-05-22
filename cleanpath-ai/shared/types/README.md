# @cleanpath/types

Shared TypeScript type definitions for CleanPath AI monorepo.

## Overview

This package contains all shared type definitions used across the CleanPath AI platform, ensuring type safety and consistency across microservices.

## Type Categories

### BidRequest.ts
OpenRTB-like bid request structures for programmatic advertising:
- `BidRequest` - Main bid request interface
- `Impression` - Ad impression details
- `Publisher`, `Site`, `Device`, `User` - Request context
- `AdFormat`, `DeviceType`, `AdPosition` - Enums

### MFAClassification.ts
Made for Advertising (MFA) detection and thermal scoring:
- `MFAClassification` - Complete classification result
- `ThermalScore` - 0-100 risk scoring with breakdown
- `RiskLevel` - CLEAN, MODERATE, HIGH
- `MFASignal` - Detection signals (ad density, engagement, etc.)
- `MFARule` - Rule engine definitions

### EdgeDecision.ts
Edge layer decision types:
- `EdgeDecision` - ALLOW, BLOCK, BID_MODIFIER, REROUTE
- `DecisionType` - Decision enum
- `BlockReason` - Rejection reasons
- `BidModifier` - Bid price adjustment logic
- `DecisionAuditLog` - Audit trail structure

### Publisher.ts
Publisher metadata and management:
- `PublisherProfile` - Publisher information
- `PublisherMFAProfile` - MFA scoring history
- `PublisherCache` - Cache structure with TTL
- `PublisherStatus`, `PublisherTier` - Classification enums
- CRUD request/response types

## Usage

```typescript
import {
  BidRequest,
  MFAClassification,
  EdgeDecision,
  PublisherProfile,
  RiskLevel,
  DecisionType,
} from '@cleanpath/types';

// Example: Process a bid request
const bidRequest: BidRequest = {
  id: 'req_123',
  timestamp: Date.now(),
  // ... other fields
};

// Example: Create an edge decision
const decision: EdgeDecision = {
  requestId: bidRequest.id,
  decision: DecisionType.BLOCK,
  timestamp: Date.now(),
  processingTimeMs: 15,
  metadata: {
    publisherId: 'pub_456',
    domain: 'example.com',
    thermalScore: 85,
    riskLevel: RiskLevel.HIGH,
  },
  blockReason: BlockReason.MFA_HIGH_RISK,
};
```

## Development

```bash
# Type check
pnpm run typecheck

# Build
pnpm run build

# Clean
pnpm run clean
```

## Path Alias

Import using the alias defined in root `tsconfig.json`:

```typescript
import { BidRequest } from '@cleanpath/types';
```

## Version

Current version: 0.1.0 (MVP Phase 1)
