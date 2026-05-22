# Middleware Pipeline

## Overview

Request preprocessing and authentication middleware for the edge gatekeeper.

## Components

### 1. AuthMiddleware

API key validation for client authentication.

```typescript
import { createAuthMiddleware } from './middleware';

const auth = createAuthMiddleware(
  ['client1.secret123', 'client2.secret456'],
  'X-API-Key',
  true,
  logger
);

const result = auth.authenticate(headers);

if (!result.authenticated) {
  // Return 401 Unauthorized
  console.log(result.error); // "Missing API key" or "Invalid API key"
} else {
  console.log(result.clientId); // "client1"
}
```

#### Features

- API key validation from headers
- Client ID extraction
- API key masking for logs
- Runtime key management (add/remove)
- Development mode with test keys

#### Configuration

```typescript
interface AuthConfig {
  apiKeys: Set<string>;      // Valid API keys
  headerName: string;        // Header name (default: 'X-API-Key')
  enabled: boolean;          // Enable/disable auth
}
```

#### API Key Format

```
client_id.secret
```

Example: `prod_advertiser1.a8f3d9e2c1b4`

### 2. RateLimitMiddleware

Per-client QPS (queries per second) limits with token bucket algorithm.

```typescript
import { createRateLimitMiddleware } from './middleware';

const rateLimit = createRateLimitMiddleware(
  1000,  // Default 1000 QPS
  1000,  // 1 second window
  true,  // Enabled
  logger
);

// Set client-specific limit
rateLimit.setClientLimit('client1', 5000); // 5000 QPS for client1

// Check limit
const result = rateLimit.checkLimit('client1');

if (!result.allowed) {
  // Return 429 Too Many Requests
  console.log(`Rate limit exceeded. Reset at: ${result.resetAt}`);
  console.log(`Limit: ${result.limit}, Remaining: ${result.remaining}`);
} else {
  // Process request
  console.log(`Remaining: ${result.remaining}`);
}
```

#### Features

- Per-client QPS limits
- Token bucket algorithm
- Configurable time windows
- Client-specific overrides
- Automatic bucket cleanup
- Real-time stats

#### Configuration

```typescript
interface RateLimitConfig {
  defaultQPS: number;              // Default queries per second
  clientLimits: Map<string, number>; // Client-specific limits
  windowMs: number;                // Time window in milliseconds
  enabled: boolean;                // Enable/disable rate limiting
}
```

#### Response Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 850
X-RateLimit-Reset: 1234567890
```

### 3. RequestParserMiddleware

Bid request normalization and OpenRTB compatibility.

```typescript
import { createRequestParserMiddleware } from './middleware';

const parser = createRequestParserMiddleware(logger);

// Parse raw request
const result = parser.parse(rawBody);

if (!result.success) {
  // Return 400 Bad Request
  console.log(result.error); // "Invalid request body"
} else {
  const bidRequest = result.bidRequest;
  console.log(bidRequest.id);
  console.log(bidRequest.site.publisher.id);
}
```

#### Features

- JSON parsing and validation
- OpenRTB field normalization
- Device type detection
- Ad format normalization
- Request ID generation
- Request enrichment

#### Normalization

**Device Types:**
- OpenRTB codes (1=mobile, 2=desktop, 4=tablet, 7=ctv)
- String detection ("mobile", "desktop", "tablet", "ctv")

**Ad Formats:**
- "banner" → AdFormat.BANNER
- "native" → AdFormat.NATIVE
- "video" → AdFormat.VIDEO
- "interstitial" → AdFormat.INTERSTITIAL

**Field Mapping:**
- `imp` → `impressions`
- `tmax` → `timeout`
- `w`/`h` → `width`/`height`
- `bidfloor` → `bidFloor`

## Middleware Pipeline

### Execution Order

```
1. AuthMiddleware      → Validate API key
2. RateLimitMiddleware → Check QPS limit
3. RequestParser       → Parse and normalize
4. BidRequestHandler   → Process request
```

### Example Integration

```typescript
import {
  createAuthMiddleware,
  createRateLimitMiddleware,
  createRequestParserMiddleware,
} from './middleware';

// Initialize middleware
const auth = createAuthMiddleware(['client1.secret'], 'X-API-Key', true, logger);
const rateLimit = createRateLimitMiddleware(1000, 1000, true, logger);
const parser = createRequestParserMiddleware(logger);

// Process request
async function handleRequest(headers: Record<string, string>, body: string) {
  // 1. Authenticate
  const authResult = auth.authenticate(headers);
  if (!authResult.authenticated) {
    return { status: 401, error: authResult.error };
  }

  // 2. Rate limit
  const rateLimitResult = rateLimit.checkLimit(authResult.clientId!);
  if (!rateLimitResult.allowed) {
    return {
      status: 429,
      error: 'Rate limit exceeded',
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit,
        'X-RateLimit-Remaining': rateLimitResult.remaining,
        'X-RateLimit-Reset': rateLimitResult.resetAt,
      },
    };
  }

  // 3. Parse request
  const parseResult = parser.parse(body);
  if (!parseResult.success) {
    return { status: 400, error: parseResult.error };
  }

  // 4. Process bid request
  const response = await bidRequestHandler.process(parseResult.bidRequest!);

  return {
    status: 200,
    body: response,
    headers: {
      'X-RateLimit-Limit': rateLimitResult.limit,
      'X-RateLimit-Remaining': rateLimitResult.remaining,
    },
  };
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Invalid API key",
  "code": "UNAUTHORIZED"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "limit": 1000,
  "remaining": 0,
  "resetAt": 1234567890
}
```

### 400 Bad Request

```json
{
  "error": "Invalid request body",
  "code": "INVALID_REQUEST"
}
```

## Performance

- **AuthMiddleware**: <0.1ms (Set lookup)
- **RateLimitMiddleware**: <0.1ms (Map lookup + increment)
- **RequestParserMiddleware**: <1ms (JSON parse + normalization)
- **Total Middleware Overhead**: <2ms

## Development Mode

### Test API Keys

```typescript
import { DEV_API_KEYS } from './middleware';

// Development keys
const devKeys = [
  'dev_client1.secret123',
  'dev_client2.secret456',
  'test_client.testsecret',
];
```

### Disable Middleware

```typescript
// Disable authentication
const auth = createAuthMiddleware([], 'X-API-Key', false);

// Disable rate limiting
const rateLimit = createRateLimitMiddleware(1000, 1000, false);
```

## Monitoring

### Metrics to Track

- Authentication failures
- Rate limit hits
- Parse errors
- Average middleware latency
- Client request distribution

### Logging

```typescript
// Authentication
logger.warn('Invalid API key', { apiKey: 'cli1...3456' });

// Rate limiting
logger.warn('Rate limit exceeded', {
  clientId: 'client1',
  limit: 1000,
  count: 1001,
});

// Parsing
logger.error('Failed to parse bid request', error);
```

## Next Steps

- Task 3.3: Deploy to edge infrastructure
- Add CORS middleware
- Add compression middleware
- Add request/response logging middleware
