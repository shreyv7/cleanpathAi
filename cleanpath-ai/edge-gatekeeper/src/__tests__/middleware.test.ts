/**
 * Middleware Tests
 */

import { createAuthMiddleware } from '../middleware/AuthMiddleware';
import { createRateLimitMiddleware } from '../middleware/RateLimitMiddleware';
import { createRequestParserMiddleware } from '../middleware/RequestParserMiddleware';
import { DeviceType } from '@cleanpath/types';

describe('AuthMiddleware', () => {
    it('should authenticate valid API key', () => {
        const auth = createAuthMiddleware(['client1.secret123'], 'X-API-Key', true);

        const result = auth.authenticate({
            'X-API-Key': 'client1.secret123',
        });

        expect(result.authenticated).toBe(true);
        expect(result.clientId).toBe('client1');
    });

    it('should reject invalid API key', () => {
        const auth = createAuthMiddleware(['client1.secret123'], 'X-API-Key', true);

        const result = auth.authenticate({
            'X-API-Key': 'invalid.key',
        });

        expect(result.authenticated).toBe(false);
        expect(result.error).toBe('Invalid API key');
    });

    it('should reject missing API key', () => {
        const auth = createAuthMiddleware(['client1.secret123'], 'X-API-Key', true);

        const result = auth.authenticate({});

        expect(result.authenticated).toBe(false);
        expect(result.error).toBe('Missing API key');
    });

    it('should allow all requests when disabled', () => {
        const auth = createAuthMiddleware([], 'X-API-Key', false);

        const result = auth.authenticate({});

        expect(result.authenticated).toBe(true);
    });

    it('should handle case-insensitive headers', () => {
        const auth = createAuthMiddleware(['client1.secret123'], 'X-API-Key', true);

        const result = auth.authenticate({
            'x-api-key': 'client1.secret123',
        });

        expect(result.authenticated).toBe(true);
    });

    it('should support runtime key management', () => {
        const auth = createAuthMiddleware([], 'X-API-Key', true);

        auth.addApiKey('client2.secret456');

        const result = auth.authenticate({
            'X-API-Key': 'client2.secret456',
        });

        expect(result.authenticated).toBe(true);

        auth.removeApiKey('client2.secret456');

        const result2 = auth.authenticate({
            'X-API-Key': 'client2.secret456',
        });

        expect(result2.authenticated).toBe(false);
    });
});

describe('RateLimitMiddleware', () => {
    it('should allow requests within limit', () => {
        const rateLimit = createRateLimitMiddleware(10, 1000, true);

        for (let i = 0; i < 10; i++) {
            const result = rateLimit.checkLimit('client1');
            expect(result.allowed).toBe(true);
        }
    });

    it('should reject requests exceeding limit', () => {
        const rateLimit = createRateLimitMiddleware(5, 1000, true);

        for (let i = 0; i < 5; i++) {
            rateLimit.checkLimit('client1');
        }

        const result = rateLimit.checkLimit('client1');
        expect(result.allowed).toBe(false);
        expect(result.error).toBe('Rate limit exceeded');
    });

    it('should track remaining quota', () => {
        const rateLimit = createRateLimitMiddleware(10, 1000, true);

        const result1 = rateLimit.checkLimit('client1');
        expect(result1.remaining).toBe(9);

        const result2 = rateLimit.checkLimit('client1');
        expect(result2.remaining).toBe(8);
    });

    it('should reset after time window', async () => {
        const rateLimit = createRateLimitMiddleware(5, 100, true); // 100ms window

        for (let i = 0; i < 5; i++) {
            rateLimit.checkLimit('client1');
        }

        const result1 = rateLimit.checkLimit('client1');
        expect(result1.allowed).toBe(false);

        await new Promise((resolve) => setTimeout(resolve, 150));

        const result2 = rateLimit.checkLimit('client1');
        expect(result2.allowed).toBe(true);
    });

    it('should support per-client limits', () => {
        const rateLimit = createRateLimitMiddleware(10, 1000, true);

        rateLimit.setClientLimit('client1', 20);

        for (let i = 0; i < 15; i++) {
            const result = rateLimit.checkLimit('client1');
            expect(result.allowed).toBe(true);
        }
    });

    it('should isolate clients', () => {
        const rateLimit = createRateLimitMiddleware(5, 1000, true);

        for (let i = 0; i < 5; i++) {
            rateLimit.checkLimit('client1');
        }

        const result = rateLimit.checkLimit('client2');
        expect(result.allowed).toBe(true);
    });

    it('should allow all requests when disabled', () => {
        const rateLimit = createRateLimitMiddleware(5, 1000, false);

        for (let i = 0; i < 10; i++) {
            const result = rateLimit.checkLimit('client1');
            expect(result.allowed).toBe(true);
        }
    });
});

describe('RequestParserMiddleware', () => {
    let parser: any;

    beforeEach(() => {
        parser = createRequestParserMiddleware();
    });

    it('should parse valid bid request', () => {
        const rawRequest = {
            id: 'req_123',
            imp: [
                {
                    id: 'imp_1',
                    banner: { w: 728, h: 90 },
                    bidfloor: 1.5,
                },
            ],
            site: {
                id: 'site_1',
                domain: 'example.com',
                mobile: false,
                publisher: {
                    id: 'pub_1',
                    name: 'Example Publisher',
                    domain: 'example.com',
                    categories: [],
                },
            },
            device: {
                devicetype: 2, // Desktop
                ua: 'Mozilla/5.0...',
                ip: '192.168.1.1',
            },
        };

        const result = parser.parse(rawRequest);

        expect(result.success).toBe(true);
        expect(result.bidRequest).toBeDefined();
        expect(result.bidRequest.id).toBe('req_123');
        expect(result.bidRequest.impressions).toHaveLength(1);
        expect(result.bidRequest.site.domain).toBe('example.com');
        expect(result.bidRequest.device.type).toBe(DeviceType.DESKTOP);
    });

    it('should normalize OpenRTB field names', () => {
        const rawRequest = {
            id: 'req_123',
            imp: [{ id: 'imp_1', w: 300, h: 250, bidfloor: 1.0 }],
            site: {
                domain: 'example.com',
                mobile: false,
                pub: { id: 'pub_1', domain: 'example.com', categories: [] },
            },
            device: { devicetype: 1, ua: 'Mozilla', ip: '1.2.3.4' },
            tmax: 100,
        };

        const result = parser.parse(rawRequest);

        expect(result.success).toBe(true);
        expect(result.bidRequest.impressions).toBeDefined();
        expect(result.bidRequest.timeout).toBe(100);
        expect(result.bidRequest.impressions[0].width).toBe(300);
    });

    it('should detect device types correctly', () => {
        const testCases = [
            { devicetype: 1, expected: DeviceType.MOBILE },
            { devicetype: 2, expected: DeviceType.DESKTOP },
            { devicetype: 4, expected: DeviceType.TABLET },
            { devicetype: 7, expected: DeviceType.CTV },
        ];

        testCases.forEach(({ devicetype, expected }) => {
            const result = parser.parse({
                id: 'req_1',
                imp: [{ id: 'imp_1' }],
                site: { domain: 'test.com', mobile: false, publisher: { id: 'pub_1', domain: 'test.com', categories: [] } },
                device: { devicetype, ua: 'test', ip: '1.2.3.4' },
            });

            expect(result.bidRequest.device.type).toBe(expected);
        });
    });

    it('should handle missing optional fields', () => {
        const minimalRequest = {
            id: 'req_123',
            imp: [{ id: 'imp_1' }],
            site: {
                domain: 'example.com',
                mobile: false,
                publisher: { id: 'pub_1', domain: 'example.com', categories: [] },
            },
            device: { ua: 'Mozilla', ip: '1.2.3.4' },
        };

        const result = parser.parse(minimalRequest);

        expect(result.success).toBe(true);
        expect(result.bidRequest.timestamp).toBeDefined();
        expect(result.bidRequest.test).toBe(false);
    });

    it('should reject invalid requests', () => {
        const invalidRequests = [
            {}, // Empty
            { id: 'req_1' }, // Missing site
            { id: 'req_1', site: {} }, // Missing publisher
            { id: 'req_1', site: { publisher: { id: 'pub_1' } } }, // Missing device
        ];

        invalidRequests.forEach((req) => {
            const result = parser.parse(req);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    it('should parse JSON strings', () => {
        const jsonString = JSON.stringify({
            id: 'req_123',
            imp: [{ id: 'imp_1' }],
            site: { domain: 'test.com', mobile: false, publisher: { id: 'pub_1', domain: 'test.com', categories: [] } },
            device: { ua: 'test', ip: '1.2.3.4' },
        });

        const result = parser.parse(jsonString);

        expect(result.success).toBe(true);
        expect(result.bidRequest.id).toBe('req_123');
    });

    it('should generate request ID if missing', () => {
        const result = parser.parse({
            imp: [{ id: 'imp_1' }],
            site: { domain: 'test.com', mobile: false, publisher: { id: 'pub_1', domain: 'test.com', categories: [] } },
            device: { ua: 'test', ip: '1.2.3.4' },
        });

        expect(result.success).toBe(true);
        expect(result.bidRequest.id).toMatch(/^req_/);
    });
});
