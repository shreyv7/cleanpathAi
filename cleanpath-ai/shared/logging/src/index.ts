/**
 * CleanPath AI - Logging Module
 * Structured logging with PII compliance
 */

// Core logger
export { Logger, createLogger } from './logger';

// Types
export { LogLevel, LoggerConfig, LogContext, LogMetadata } from './types';

// Request ID utilities
export {
    generateRequestId,
    generateTraceId,
    generateSpanId,
    extractRequestId,
    extractTraceId,
    createCorrelationContext,
} from './requestId';

// PII sanitization
export {
    sanitizePII,
    sanitizeObject,
    maskSensitiveFields,
    redactEmail,
    redactPhone,
    redactIP,
    redactCreditCard,
    redactSSN,
} from './sanitize';
