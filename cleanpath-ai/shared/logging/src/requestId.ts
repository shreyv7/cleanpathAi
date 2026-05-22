/**
 * Request ID Utilities
 * Generate and propagate request IDs for distributed tracing
 */

import { randomBytes } from 'crypto';

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(8).toString('hex');
    return `req_${timestamp}_${random}`;
}

/**
 * Generate a trace ID for distributed tracing
 */
export function generateTraceId(): string {
    return randomBytes(16).toString('hex');
}

/**
 * Generate a span ID for distributed tracing
 */
export function generateSpanId(): string {
    return randomBytes(8).toString('hex');
}

/**
 * Extract request ID from headers
 */
export function extractRequestId(headers: Record<string, string | string[] | undefined>): string | undefined {
    const requestId = headers['x-request-id'] || headers['X-Request-ID'];
    return Array.isArray(requestId) ? requestId[0] : requestId;
}

/**
 * Extract trace ID from headers
 */
export function extractTraceId(headers: Record<string, string | string[] | undefined>): string | undefined {
    const traceId = headers['x-trace-id'] || headers['X-Trace-ID'];
    return Array.isArray(traceId) ? traceId[0] : traceId;
}

/**
 * Create correlation context from headers
 */
export function createCorrelationContext(
    headers: Record<string, string | string[] | undefined>
): {
    requestId: string;
    traceId: string;
    spanId: string;
} {
    return {
        requestId: extractRequestId(headers) || generateRequestId(),
        traceId: extractTraceId(headers) || generateTraceId(),
        spanId: generateSpanId(),
    };
}
