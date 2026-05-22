"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactEmail = redactEmail;
exports.redactPhone = redactPhone;
exports.redactIP = redactIP;
exports.redactCreditCard = redactCreditCard;
exports.redactSSN = redactSSN;
exports.sanitizePII = sanitizePII;
exports.sanitizeObject = sanitizeObject;
exports.maskSensitiveFields = maskSensitiveFields;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const IP_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const CREDIT_CARD_PATTERN = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;
function redactEmail(text) {
    return text.replace(EMAIL_PATTERN, '[EMAIL_REDACTED]');
}
function redactPhone(text) {
    return text.replace(PHONE_PATTERN, '[PHONE_REDACTED]');
}
function redactIP(text) {
    return text.replace(IP_PATTERN, '[IP_REDACTED]');
}
function redactCreditCard(text) {
    return text.replace(CREDIT_CARD_PATTERN, '[CARD_REDACTED]');
}
function redactSSN(text) {
    return text.replace(SSN_PATTERN, '[SSN_REDACTED]');
}
function sanitizePII(text) {
    let sanitized = text;
    sanitized = redactEmail(sanitized);
    sanitized = redactPhone(sanitized);
    sanitized = redactIP(sanitized);
    sanitized = redactCreditCard(sanitized);
    sanitized = redactSSN(sanitized);
    return sanitized;
}
function sanitizeObject(obj) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizePII(value);
        }
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        }
        else if (Array.isArray(value)) {
            sanitized[key] = value.map((item) => typeof item === 'string'
                ? sanitizePII(item)
                : typeof item === 'object' && item !== null
                    ? sanitizeObject(item)
                    : item);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
function maskSensitiveFields(obj, sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization']) {
    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.includes(key)) {
            masked[key] = '[REDACTED]';
        }
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
            masked[key] = maskSensitiveFields(value, sensitiveFields);
        }
        else if (Array.isArray(value)) {
            masked[key] = value.map((item) => typeof item === 'object' && item !== null
                ? maskSensitiveFields(item, sensitiveFields)
                : item);
        }
        else {
            masked[key] = value;
        }
    }
    return masked;
}
//# sourceMappingURL=sanitize.js.map