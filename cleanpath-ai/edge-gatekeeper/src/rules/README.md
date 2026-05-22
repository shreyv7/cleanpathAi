# Edge Gatekeeper - MFA Rule Engine

## Overview

The MFA Thermal Engine is a rule-based classifier that detects Made for Advertising (MFA) sites using thermal imaging heuristics.

## Components

### MFAThermalEngine

Core classification engine that processes publisher metrics and generates thermal scores.

```typescript
import { createThermalEngine } from './rules';

const engine = createThermalEngine();

const result = engine.classify({
  publisherId: 'pub_123',
  domain: 'example.com',
  adsPerViewport: 5.0,
  avgEngagementTime: 8.0,
  contentToAdRatio: 0.3,
  domainReputationScore: 35.0,
  // ... other metrics
});

console.log(result.classification.thermalScore.overall); // 0-100
console.log(result.classification.riskLevel); // CLEAN, MODERATE, HIGH
```

### Rule Definitions

Five core rules contribute to the thermal score:

1. **High Ad Density** (30% weight)
   - Threshold: >3 ads per viewport
   - Signal: `HIGH_AD_DENSITY`

2. **Low Engagement** (25% weight)
   - Threshold: <10 seconds average time
   - Signal: `LOW_ENGAGEMENT`

3. **Poor Content Ratio** (25% weight)
   - Threshold: <40% content
   - Signal: `POOR_CONTENT_RATIO`

4. **Domain Reputation** (15% weight)
   - Threshold: <50 reputation score
   - Signal: `DOMAIN_REPUTATION`

5. **Arbitrage Pattern** (5% weight)
   - Threshold: >70% paid traffic
   - Signal: `ARBITRAGE_PATTERN`

### Thermal Score Calculation

The thermal score (0-100) is calculated as a weighted average of individual component scores:

- **0-30**: CLEAN - Safe publisher
- **31-70**: MODERATE - Suspicious, needs monitoring
- **71-100**: HIGH - MFA site, should be blocked

Each component score is calculated based on how far the metric deviates from the threshold:
- Ad Density: Linear increase above threshold
- Engagement: Inverse relationship (lower engagement = higher score)
- Content Quality: Inverse relationship (lower content = higher score)
- Domain Reputation: Inverse relationship (lower reputation = higher score)

### Publisher Metrics

Input data required for classification:

```typescript
interface PublisherMetrics {
  publisherId: string;
  domain: string;
  
  // Ad density
  adsPerViewport: number;
  totalAds: number;
  viewportArea: number;
  
  // Engagement
  avgEngagementTime: number;
  bounceRate: number;
  pagesPerSession: number;
  
  // Content quality
  contentToAdRatio: number;
  textContentLength: number;
  imageContentCount: number;
  
  // Domain reputation
  domainReputationScore: number;
  domainAge: number;
  
  // Traffic patterns
  paidTrafficRatio: number;
  organicTrafficRatio: number;
  directTrafficRatio: number;
  
  // Historical (optional)
  historicalBlockRate?: number;
  previousThermalScore?: number;
}
```

## Usage Examples

### Basic Classification

```typescript
const engine = createThermalEngine();

const metrics: PublisherMetrics = {
  publisherId: 'pub_456',
  domain: 'mfa-site.com',
  adsPerViewport: 6.0,        // High ad density
  avgEngagementTime: 5.0,     // Low engagement
  contentToAdRatio: 0.25,     // Poor content
  domainReputationScore: 30.0, // Low reputation
  paidTrafficRatio: 0.8,      // High paid traffic
  // ... other required fields
};

const result = engine.classify(metrics);

// Result:
// {
//   classification: {
//     thermalScore: {
//       overall: 78.5,
//       breakdown: {
//         adDensity: 75,
//         engagement: 80,
//         contentQuality: 85,
//         domainReputation: 70
//       },
//       signals: [
//         'HIGH_AD_DENSITY',
//         'LOW_ENGAGEMENT',
//         'POOR_CONTENT_RATIO',
//         'DOMAIN_REPUTATION',
//         'ARBITRAGE_PATTERN'
//       ],
//       confidence: 0.7
//     },
//     riskLevel: 'HIGH'
//   },
//   appliedRules: [...],
//   processingTimeMs: 2.5
// }
```

### Custom Rules

```typescript
import { MFARule, MFASignal } from '@cleanpath/types';

const customRules: MFARule[] = [
  {
    id: 'custom_ad_density',
    name: 'Strict Ad Density',
    signal: MFASignal.HIGH_AD_DENSITY,
    threshold: 2.0, // Stricter threshold
    weight: 0.4,    // Higher weight
    enabled: true,
  },
  // ... other rules
];

const engine = createThermalEngine(customRules, '1.1.0');
```

## Performance

- Target processing time: <5ms per classification
- Actual: ~2-3ms average
- No external dependencies or API calls
- Pure computation based on input metrics

## Next Steps

- Task 2.2: Implement publisher cache with Redis
- Task 2.3: Implement decision logic layer
