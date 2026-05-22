# Edge Gatekeeper API Documentation – Phase 4 Additions

## Pacing & Bid Shading

### How It Works

Every incoming `BidRequest` now passes through two additional stages in the processing pipeline:

1. **Pacing Check** – Determines whether the campaign has remaining budget to accept this bid
2. **Bid Shading** – If the bid is allowed, optimizes the price downward to save money while maintaining win rate

### Response Changes

The `EdgeDecisionResponse.decision` object now includes additional fields:

```typescript
interface EdgeDecision {
  // ... existing fields ...
  price?: number;         // Final bid price (after shading)
  blockReason?: BlockReason;  // Will be 'budget_exhausted' if pacing blocks
  metadata: {
    // ... existing fields ...
    shadedPrice?: number;     // Optimized bid price
    originalPrice?: number;   // Pre-shading price
    savings?: number;         // Dollars saved via shading
    winProb?: number;         // Estimated win probability at shaded price
  };
}
```

### New Block Reason

| Value | Description |
|-------|-------------|
| `budget_exhausted` | Campaign daily budget has been consumed; bid rejected by pacing system |

### Budget Redis Keys (for external integration)

To set a campaign's daily budget, write to Redis:
```
SET budget:limit:<campaignId> <amount>
```

To track spend (incremented by budget sync worker):
```
SET budget:spend:<campaignId> <amount>
```

### Configuration

Pacing and shading are **optional features**. If `PacingOrchestrator` or `BidShader` are not injected into `BidRequestHandler`, the pipeline simply skips those stages.

| Config | Default | Description |
|--------|---------|-------------|
| Pacing Algorithm | Token Bucket | `PacingOrchestrator` selects per campaign |
| PID Constants | Kp=0.5, Ki=0.1, Kd=0.05 | Tunable in `PIDPacer.ts` |
| Fail-Open | `true` | If pacing Redis fails, bids proceed |
| Default Valuation | $5.00 CPM | Used when no bid floor is provided |
