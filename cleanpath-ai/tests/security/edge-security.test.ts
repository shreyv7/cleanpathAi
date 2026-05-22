
import { createAuthMiddleware, DEV_API_KEYS } from '../../edge-gatekeeper/src/middleware/AuthMiddleware';
import { createRateLimitMiddleware } from '../../edge-gatekeeper/src/middleware/RateLimitMiddleware';
import { sanitizePII, maskSensitiveFields } from '../../shared/logging/src/sanitize';

describe('Security Layer Validation', () => {

    describe('Authentication Middleware', () => {
        const auth = createAuthMiddleware(DEV_API_KEYS);

        it('should allow requests with valid API keys', () => {
            const result = auth.authenticate({ 'X-API-Key': DEV_API_KEYS[0] });
            expect(result.authenticated).toBe(true);
            expect(result.clientId).toBeDefined();
        });

        it('should reject requests with missing API keys', () => {
            const result = auth.authenticate({});
            expect(result.authenticated).toBe(false);
            expect(result.error).toBe('Missing API key');
        });

        it('should reject requests with invalid API keys', () => {
            const result = auth.authenticate({ 'X-API-Key': 'invalid-key' });
            expect(result.authenticated).toBe(false);
            expect(result.error).toBe('Invalid API key');
        });
    });

    describe('Rate Limiting Middleware', () => {
        it('should block requests exceeding QPS limit', () => {
            const rateLimit = createRateLimitMiddleware(2, 1000); // 2 QPS

            expect(rateLimit.checkLimit('test-client').allowed).toBe(true);
            expect(rateLimit.checkLimit('test-client').allowed).toBe(true);
            expect(rateLimit.checkLimit('test-client').allowed).toBe(false);
        });

        it('should allow requests after window reset', async () => {
            const rateLimit = createRateLimitMiddleware(1, 100); // 1 QPS, 100ms window

            expect(rateLimit.checkLimit('test-client').allowed).toBe(true);
            expect(rateLimit.checkLimit('test-client').allowed).toBe(false);

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(rateLimit.checkLimit('test-client').allowed).toBe(true);
        });
    });

    describe('PII Sanitization & Logging Security', () => {
        it('should redact emails from logs', () => {
            const raw = 'User email is test@example.com';
            expect(sanitizePII(raw)).toBe('User email is [EMAIL_REDACTED]');
        });

        it('should redact IP addresses from logs', () => {
            const raw = 'Request from 192.168.1.1';
            expect(sanitizePII(raw)).toBe('Request from [IP_REDACTED]');
        });

        it('should mask sensitive object fields', () => {
            const data = {
                apiKey: 'secret-key-123',
                user: 'admin',
                nested: {
                    token: 'abc-xyz'
                }
            };
            const masked = maskSensitiveFields(data);
            expect(masked.apiKey).toBe('[REDACTED]');
            expect(masked.nested.token).toBe('[REDACTED]');
            expect(masked.user).toBe('admin');
        });
    });
});
