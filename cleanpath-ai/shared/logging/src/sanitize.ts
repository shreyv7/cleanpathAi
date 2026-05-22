/**
 * PII Sanitization Utilities
 * Remove or redact personally identifiable information from logs
 */

/**
 * Patterns for detecting PII
 */
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const IP_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const CREDIT_CARD_PATTERN = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;

/**
 * Redact email addresses
 */
export function redactEmail(text: string): string {
    return text.replace(EMAIL_PATTERN, '[EMAIL_REDACTED]');
}

/**
 * Redact phone numbers
 */
export function redactPhone(text: string): string {
    return text.replace(PHONE_PATTERN, '[PHONE_REDACTED]');
}

/**
 * Redact IP addresses
 */
export function redactIP(text: string): string {
    return text.replace(IP_PATTERN, '[IP_REDACTED]');
}

/**
 * Redact credit card numbers
 */
export function redactCreditCard(text: string): string {
    return text.replace(CREDIT_CARD_PATTERN, '[CARD_REDACTED]');
}

/**
 * Redact SSN
 */
export function redactSSN(text: string): string {
    return text.replace(SSN_PATTERN, '[SSN_REDACTED]');
}

/**
 * Sanitize all PII from text
 */
export function sanitizePII(text: string): string {
    let sanitized = text;
    sanitized = redactEmail(sanitized);
    sanitized = redactPhone(sanitized);
    sanitized = redactIP(sanitized);
    sanitized = redactCreditCard(sanitized);
    sanitized = redactSSN(sanitized);
    return sanitized;
}

/**
 * Sanitize object by removing PII from string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizePII(value);
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map((item) =>
                typeof item === 'string'
                    ? sanitizePII(item)
                    : typeof item === 'object' && item !== null
                        ? sanitizeObject(item as Record<string, unknown>)
                        : item
            );
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}

/**
 * Mask sensitive fields in objects
 */
export function maskSensitiveFields<T extends Record<string, unknown>>(
    obj: T,
    sensitiveFields: string[] = ['password', 'token', 'apiKey', 'secret', 'authorization']
): T {
    const masked: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.includes(key)) {
            masked[key] = '[REDACTED]';
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            masked[key] = maskSensitiveFields(value as Record<string, unknown>, sensitiveFields);
        } else if (Array.isArray(value)) {
            masked[key] = value.map((item) =>
                typeof item === 'object' && item !== null
                    ? maskSensitiveFields(item as Record<string, unknown>, sensitiveFields)
                    : item
            );
        } else {
            masked[key] = value;
        }
    }

    return masked as T;
}
