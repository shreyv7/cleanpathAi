# Pacing Architecture – CleanPath AI Edge Gatekeeper

## Overview

The pacing system controls how quickly a campaign's budget is spent over time. It sits in the **bid request hot path** inside `BidRequestHandler`, executing *before* the decision handler and *after* request validation.

```
BidRequest → Validate → [Pacing Check] → Classify → Decide → [Bid Shade] → Response
```

## Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Low Latency** | All pacing state lives in Redis; no database calls on the hot path |
| **Fail-Open** | If Redis is unavailable, bids are allowed (revenue > precision) |
| **Pluggable** | `PacingOrchestrator` returns a `Pacer` via strategy pattern |
| **Atomic** | Token bucket uses Lua scripts for race-free Redis operations |

## Components

### 1. `Pacer` Interface (`src/pacing/Pacer.ts`)
```typescript
interface Pacer {
  init(): Promise<void>;
  checkPacing(campaignId: string, estimatedCost?: number): Promise<boolean>;
}
```

### 2. Token Bucket Pacer (`src/pacing/TokenBucketPacer.ts`)
- **Algorithm**: Classic token-bucket with continuous refill
- **State**: Two Redis keys per campaign (`pacing:bucket:{id}`, `pacing:last_refill:{id}`)
- **Atomicity**: Single Lua `EVAL` computes refill + consume in one round-trip
- **Rate Calculation**: `dailyCap / 86400` tokens per second

### 3. PID Pacer (`src/pacing/PIDPacer.ts`)
- **Algorithm**: PID controller (Proportional-Integral-Derivative)
- **Goal**: Smooth spend curve that tracks `targetSpend = dailyCap × fractionOfDay`
- **Error Signal**: `target − actual` (positive = underspending, negative = overspending)
- **Tuning Constants**: `Kp=0.5`, `Ki=0.1`, `Kd=0.05`
- **Output → Probability**: Positive output → P=1.0; negative output → P throttled proportionally

### 4. Pacing Orchestrator (`src/pacing/PacingOrchestrator.ts`)
Factory that selects the correct `Pacer` implementation per campaign based on configuration (defaults to Token Bucket).

## Redis Key Schema

| Key Pattern | Type | TTL | Purpose |
|-------------|------|-----|---------|
| `budget:limit:{campaignId}` | String (float) | — | Daily budget cap |
| `budget:spend:{campaignId}` | String (float) | 24h | Running spend counter |
| `pacing:bucket:{campaignId}` | String (float) | 60s | Token bucket level |
| `pacing:last_refill:{campaignId}` | String (timestamp) | 60s | Last refill time |
| `pacing:pid:{campaignId}` | String (JSON) | 60s | PID integral + last error |

## Bid Shading

After pacing allows a bid, `BidShader` optimizes the bid price:

1. `WinRateEstimator` predicts the probability of winning at various price points
2. `BidShader` iterates from minimum to maximum price, finding the point where `price × winProb` is maximized
3. The shaded price and savings are attached to `EdgeDecision.metadata`

### Shading Metadata (added to `EdgeDecision`)
```typescript
metadata: {
  shadedPrice?: number;   // Optimized bid price
  originalPrice?: number; // Pre-shading valuation
  savings?: number;       // originalPrice - shadedPrice
  winProb?: number;       // Estimated win probability
}
```

## Integration Points

- **`BidRequestHandler.process()`** – Lines 192-245: Pacing check + bid shading
- **`index.ts`** – Wiring: creates `PacingOrchestrator` and `BidShader`, injects into handler
- **`BlockReason.BUDGET_EXHAUSTED`** – New enum value in `@cleanpath/types`

## Error Handling

All pacing/shading errors are caught and logged. The system **fails open** – if Redis is down or the pacer throws, the bid proceeds without pacing.
