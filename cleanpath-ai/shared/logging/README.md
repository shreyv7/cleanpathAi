# @cleanpath/logging

Structured logging library with PII compliance for CleanPath AI.

## Overview

This package provides a production-ready logging solution built on Pino with:
- Structured JSON logging
- Request ID propagation for distributed tracing
- Automatic PII redaction and sanitization
- Performance metrics tracking
- Context management
- GDPR/CCPA compliance

## Features

### Logger

High-performance structured logger with multiple log levels:

```typescript
import { createLogger, LogLevel } from '@cleanpath/logging';

const logger = createLogger({
  level: LogLevel.INFO,
  service: 'edge-gatekeeper',
  environment: 'production',
  prettyPrint: false,
});

logger.info('Processing bid request', { requestId: 'req_123', publisherId: 'pub_456' });
logger.error('Failed to process request', error, { requestId: 'req_123' });
logger.performance('Request processed', 15.5, { requestId: 'req_123' });
```

### Context Management

Attach context to all logs from a logger instance:

```typescript
// Create child logger with context
const requestLogger = logger.child({ requestId: 'req_123', userId: 'user_456' });
requestLogger.info('User action'); // Automatically includes requestId and userId

// Set context dynamically
logger.setContext({ sessionId: 'sess_789' });
logger.info('Session started'); // Includes sessionId

// Clear context
logger.clearContext();
```

### Request ID Propagation

Generate and propagate request IDs for distributed tracing:

```typescript
import { generateRequestId, createCorrelationContext } from '@cleanpath/logging';

// Generate new request ID
const requestId = generateRequestId(); // req_abc123_def456

// Extract from headers
const context = createCorrelationContext(headers);
// { requestId: '...', traceId: '...', spanId: '...' }
```

### PII Sanitization

Automatically redact personally identifiable information:

```typescript
import { sanitizePII, sanitizeObject, maskSensitiveFields } from '@cleanpath/logging';

// Sanitize text
const clean = sanitizePII('Contact: user@example.com, Phone: 555-1234');
// 'Contact: [EMAIL_REDACTED], Phone: [PHONE_REDACTED]'

// Sanitize objects
const sanitized = sanitizeObject({
  email: 'user@example.com',
  ip: '192.168.1.1',
  message: 'Hello world',
});
// { email: '[EMAIL_REDACTED]', ip: '[IP_REDACTED]', message: 'Hello world' }

// Mask sensitive fields
const masked = maskSensitiveFields(
  { password: 'secret123', username: 'john' },
  ['password', 'token']
);
// { password: '[REDACTED]', username: 'john' }
```

## Log Levels

- `TRACE` - Very detailed debugging information
- `DEBUG` - Debugging information
- `INFO` - General informational messages
- `WARN` - Warning messages
- `ERROR` - Error messages
- `FATAL` - Fatal errors that cause termination

## Configuration

```typescript
interface LoggerConfig {
  level: LogLevel;
  service: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  prettyPrint?: boolean; // Enable colored output for development
  redactPaths?: string[]; // Additional paths to redact
}
```

## Default Redaction

The following fields are automatically redacted:
- `password`
- `token`
- `apiKey`
- `secret`
- `authorization`
- `cookie`
- `user.email`
- `user.phone`
- `device.ip`

## Performance Logging

Track operation performance:

```typescript
const start = Date.now();
// ... perform operation
const duration = Date.now() - start;

logger.performance('Operation completed', duration, {
  operation: 'bid_processing',
  requestId: 'req_123',
});
```

Output includes memory usage:
```json
{
  "level": "info",
  "message": "Operation completed",
  "performance": {
    "durationMs": 15.5,
    "memoryUsageMB": 45
  }
}
```

## Usage in Edge Functions

For serverless/edge environments, flush logs before returning:

```typescript
logger.info('Processing request');
await logger.flush(); // Ensure logs are written
return response;
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
import { createLogger, LogLevel } from '@cleanpath/logging';
```

## Compliance

This logging library is designed to be GDPR and CCPA compliant:
- Automatic PII redaction
- No storage of sensitive personal data in logs
- Configurable redaction paths
- IP address masking
- Email and phone number redaction

## Version

Current version: 0.1.0 (MVP Phase 1)
