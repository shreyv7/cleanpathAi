# Decision Handler

## Overview

The Decision Handler translates MFA thermal scores into actionable bid decisions with configurable thresholds and fail-open safety mechanisms.

## Decision Logic

### Thermal Score Ranges

| Score Range | Risk Level | Decision | Action |
|-------------|------------|----------|--------|
| 0-30 | CLEAN | ALLOW | Pass through without modification |
| 31-70 | MODERATE | BID_MODIFIER | Reduce bid by 40% |
| 71-100 | HIGH | BLOCK | Reject the bid request |

### Decision Flow

```
Thermal Score → Risk Level → Decision Type → Action
     15       →   CLEAN    →    ALLOW      → Pass through
     50       →  MODERATE  → BID_MODIFIER  → Reduce bid 40%
     85       →    HIGH    →    BLOCK      → Reject
```

## Usage

### Basic Usage

```typescript
import { createDecisionHandler } from './handlers';
import { createLogger, LogLevel } from '@cleanpath/logging';

const logger = createLogger({
  level: LogLevel.INFO,
  service: 'edge-gatekeeper',
  environment: 'production',
});

const handler = createDecisionHandler(undefined, logger);

// Make a decision
const result = handler.decide({
  requestId: 'req_123',
  publisherId: 'pub_456',
  domain: 'example.com',
  classification: mfaClassification, // From thermal engine
  cacheHit: true,
  processingStartTime: Date.now(),
});

console.log(result.decision.decision); // ALLOW, BLOCK, or BID_MODIFIER
console.log(result.usedFailOpen); // false
```

### Custom Configuration

```typescript
import { DecisionConfig } from './handlers';

const customConfig: DecisionConfig = {
  thresholds: {
    clean: {
      maxScore: 30,
      decision: DecisionType.ALLOW,
    },
    moderate: {
      minScore: 31,
      maxScore: 70,
      decision: DecisionType.BID_MODIFIER,
      bidReduction: 0.5, // 50% reduction (more aggressive)
    },
    high: {
      minScore: 71,
      decision: DecisionType.BLOCK,
    },
  },
  failOpen: {
    enabled: true,
    defaultDecision: DecisionType.ALLOW,
    logFailures: true,
  },
  enableBidModifier: true,
};

const handler = createDecisionHandler(customConfig, logger);
```

## Fail-Open Safety Mechanism

### What is Fail-Open?

When the cache misses or classification fails, the system can either:
- **Fail-open**: Allow the request (default)
- **Fail-closed**: Block the request

### Configuration

```typescript
failOpen: {
  enabled: true,              // Enable fail-open
  defaultDecision: DecisionType.ALLOW, // Decision on failure
  logFailures: true,          // Log fail-open events
}
```

### When Fail-Open Triggers

1. **Cache miss**: Publisher not in L1 or L2 cache
2. **Classification error**: Thermal engine throws exception
3. **Missing data**: Required metrics unavailable

### Example: Fail-Open Scenario

```typescript
// No classification available (cache miss)
const result = handler.decide({
  requestId: 'req_789',
  publisherId: 'pub_unknown',
  domain: 'unknown.com',
  classification: undefined, // No data
  cacheHit: false,
  processingStartTime: Date.now(),
});

// Result:
// {
//   decision: {
//     decision: 'ALLOW',
//     metadata: { publisherId: 'pub_unknown', domain: 'unknown.com' }
//   },
//   usedFailOpen: true
// }
```

## Decision Types

### ALLOW

Pass through without modification.

```typescript
{
  decision: DecisionType.ALLOW,
  metadata: {
    publisherId: 'pub_123',
    domain: 'clean-site.com',
    thermalScore: 15,
    riskLevel: 'CLEAN'
  }
}
```

### BID_MODIFIER

Reduce bid price by configured percentage.

```typescript
{
  decision: DecisionType.BID_MODIFIER,
  bidModifier: {
    type: 'multiply',
    value: 0.6,  // Multiply bid by 0.6 (40% reduction)
    reason: 'Moderate MFA risk (score: 50)'
  },
  metadata: {
    publisherId: 'pub_456',
    domain: 'moderate-site.com',
    thermalScore: 50,
    riskLevel: 'MODERATE'
  }
}
```

### BLOCK

Reject the bid request entirely.

```typescript
{
  decision: DecisionType.BLOCK,
  blockReason: BlockReason.MFA_HIGH_RISK,
  metadata: {
    publisherId: 'pub_789',
    domain: 'mfa-site.com',
    thermalScore: 85,
    riskLevel: 'HIGH'
  }
}
```

## Bid Modifier Calculation

### Default: 40% Reduction

For moderate risk publishers (score 31-70):
- Original bid: $10 CPM
- Modifier: 0.6 (1 - 0.4)
- Adjusted bid: $6 CPM

### Custom Reduction

```typescript
moderate: {
  bidReduction: 0.5, // 50% reduction
}

// Original: $10 CPM
// Modifier: 0.5 (1 - 0.5)
// Adjusted: $5 CPM
```

### Calculate Expected Reduction

```typescript
const reduction = handler.calculateBidReduction(50);
console.log(reduction); // 0.4 (40%)
```

## Decision Validation

Validate that a decision matches expected thresholds:

```typescript
const isValid = handler.validateDecision(
  85,                    // Thermal score
  DecisionType.BLOCK     // Expected decision
);

console.log(isValid); // true
```

## Statistics

Get summary statistics for a batch of decisions:

```typescript
const decisions: EdgeDecision[] = [
  // ... array of decisions
];

const summary = handler.getDecisionSummary(decisions);

console.log(summary);
// {
//   total: 1000,
//   allowed: 600,
//   blocked: 200,
//   modified: 200,
//   avgProcessingTimeMs: 2.5
// }
```

## Performance

- **Decision time**: <1ms (pure logic, no I/O)
- **Total processing time**: Includes classification + decision
- **Target**: <20ms end-to-end (classification + decision)

## Configuration Updates

Update configuration at runtime:

```typescript
const newConfig: DecisionConfig = {
  // ... new configuration
};

handler.updateConfig(newConfig);
```

## Best Practices

1. **Enable fail-open**: Prevents blocking legitimate traffic on errors
2. **Log failures**: Monitor fail-open events for debugging
3. **Tune bid reduction**: Start with 40%, adjust based on performance
4. **Monitor block rate**: High block rates may indicate aggressive thresholds
5. **Validate decisions**: Use `validateDecision()` in tests

## Next Steps

- Task 3.1: Implement edge request handler
- Task 3.2: Implement middleware pipeline
- Task 3.3: Deploy to edge infrastructure
