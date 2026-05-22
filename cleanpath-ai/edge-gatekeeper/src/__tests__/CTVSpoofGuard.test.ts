/**
 * CTV Spoof Guard Module - Unit Tests
 *
 * Tests for all CTV modules:
 * - CTVAppValidator  (Task 4.1)
 * - CTVDeviceChecker (Task 4.2)
 * - CTVStreamValidator (Task 4.3)
 * - CTVSpoofGuard    (Task 4.4)
 */

import { CTVAppValidator } from '../rules/CTVAppValidator';
import { CTVDeviceChecker } from '../rules/CTVDeviceChecker';
import { CTVStreamValidator } from '../rules/CTVStreamValidator';
import { CTVSpoofGuard } from '../rules/CTVSpoofGuard';
import { CTVDeviceCache } from '../cache/CTVDeviceCache';
import {
    CTVDeviceFingerprint,
    StreamingEnvironment,
    CTVSpoofSignal,
    CTVSpoofVerdict,
    DeviceType,
    BidRequest,
    AdFormat,
    AdPosition,
    Device,
} from '@cleanpath/types';
import * as path from 'path';

// ─── Test Fixtures ──────────────────────────────────────────────────────────

function createDevice(overrides?: Partial<Device>): Device {
    return {
        type: DeviceType.CTV,
        ua: 'Roku/DVP-12.0 (12.0.0.1234)',
        ip: '192.168.1.1',
        geo: { country: 'US', region: 'CA', city: 'San Francisco' },
        os: 'Roku OS',
        osVersion: '12.0',
        ...overrides,
    };
}

function createFingerprint(overrides?: Partial<CTVDeviceFingerprint>): CTVDeviceFingerprint {
    return {
        make: 'Roku',
        model: 'Streaming Stick 4K',
        os: 'Roku OS',
        osVersion: '12.0',
        ifa: 'ifa-test-001',
        screenResolution: '1920x1080',
        ...overrides,
    };
}

function createStreamingEnv(overrides?: Partial<StreamingEnvironment>): StreamingEnvironment {
    return {
        sessionId: 'session-001',
        duration: 3600,
        contentGenre: 'drama',
        ...overrides,
    };
}

function createBidRequest(overrides?: Partial<BidRequest>): BidRequest {
    return {
        id: 'bid-001',
        timestamp: Date.now(),
        impressions: [{
            id: 'imp-1',
            format: AdFormat.VIDEO,
            position: AdPosition.ABOVE_FOLD,
            width: 1920,
            height: 1080,
            bidFloor: 10,
            secure: true,
        }],
        site: {
            id: 'site-1',
            name: 'Test Site',
            domain: 'test.com',
            page: 'https://test.com/watch',
            publisher: { id: 'pub-1', name: 'Test Publisher', domain: 'test.com' },
            mobile: false,
        },
        device: createDevice(),
        app: {
            bundleId: 'com.hulu.plus',
            name: 'Hulu',
        },
        ctv: {
            deviceFingerprint: createFingerprint(),
            streamingEnvironment: createStreamingEnv(),
            ifa: 'ifa-test-001',
        },
        ...overrides,
    };
}

// ─── CTVAppValidator Tests (Task 4.1) ───────────────────────────────────────

describe('CTVAppValidator', () => {
    let validator: CTVAppValidator;

    beforeAll(() => {
        const allowlistPath = path.resolve(__dirname, '../../data/ctv-app-allowlist.json');
        validator = new CTVAppValidator(allowlistPath);
    });

    it('should load the allowlist with entries', () => {
        expect(validator.getAllowlistSize()).toBeGreaterThan(0);
    });

    it('should pass a valid allowlisted app bundle', () => {
        const result = validator.validateAppBundle({
            bundleId: 'com.hulu.plus',
            name: 'Hulu',
        });
        expect(result.passed).toBe(true);
        expect(result.signals).toHaveLength(0);
        expect(result.riskScore).toBe(0);
    });

    it('should flag an unknown bundle ID', () => {
        const result = validator.validateAppBundle({
            bundleId: 'com.fake.streaming.app',
            name: 'FakeApp',
        });
        expect(result.passed).toBe(false);
        expect(result.signals.length).toBeGreaterThan(0);
        expect(result.signals[0].signal).toBe(CTVSpoofSignal.BUNDLE_MISMATCH);
    });

    it('should flag store URL domain mismatch', () => {
        const result = validator.validateAppBundle({
            bundleId: 'com.hulu.plus',
            name: 'Hulu',
            storeUrl: 'https://malicious-site.com/hulu',
        });
        expect(result.passed).toBe(false);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.STORE_URL_MISMATCH,
        )).toBe(true);
    });

    it('should pass bundle with matching store URL', () => {
        const result = validator.validateAppBundle({
            bundleId: 'com.hulu.plus',
            name: 'Hulu',
            storeUrl: 'https://channelstore.roku.com/details/hulu',
        });
        expect(result.passed).toBe(true);
    });

    it('should flag name mismatch for allowlisted bundle', () => {
        const result = validator.validateAppBundle({
            bundleId: 'com.netflix.mediaclient',
            name: 'FakeStream',
        });
        expect(result.passed).toBe(false);
        expect(result.signals.some(
            s => s.description.includes('name mismatch'),
        )).toBe(true);
    });

    it('should check isAllowlisted correctly', () => {
        expect(validator.isAllowlisted('com.roku.nbc')).toBe(true);
        expect(validator.isAllowlisted('com.nonexistent.app')).toBe(false);
    });
});

// ─── CTVDeviceChecker Tests (Task 4.2) ──────────────────────────────────────

describe('CTVDeviceChecker', () => {
    let checker: CTVDeviceChecker;

    beforeEach(() => {
        checker = new CTVDeviceChecker();
    });

    it('should pass a consistent Roku device fingerprint', () => {
        const fingerprint = createFingerprint();
        const device = createDevice();
        const result = checker.checkDeviceConsistency(fingerprint, device);
        expect(result.passed).toBe(true);
        expect(result.riskScore).toBe(0);
    });

    it('should detect emulator user-agent patterns', () => {
        const fingerprint = createFingerprint();
        const device = createDevice({ ua: 'Android SDK/30 emulator x86' });
        const result = checker.checkDeviceConsistency(fingerprint, device);
        expect(result.passed).toBe(false);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.EMULATOR_DETECTED,
        )).toBe(true);
        expect(result.riskScore).toBeGreaterThanOrEqual(90);
    });

    it('should flag UA inconsistency when device make does not match UA', () => {
        const fingerprint = createFingerprint({ make: 'Samsung', os: 'Tizen' });
        const device = createDevice({ ua: 'Roku/DVP-12.0' });
        const result = checker.checkDeviceConsistency(fingerprint, device);
        expect(result.passed).toBe(false);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.UA_INCONSISTENCY,
        )).toBe(true);
    });

    it('should flag OS version outside known firmware range', () => {
        const fingerprint = createFingerprint({
            make: 'Roku',
            os: 'roku os',
            osVersion: '2.0',
        });
        const device = createDevice({ ua: 'Roku/DVP-2.0' });
        const result = checker.checkDeviceConsistency(fingerprint, device);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.OS_MISMATCH,
        )).toBe(true);
    });

    it('should flag non-standard screen resolution', () => {
        const fingerprint = createFingerprint({
            make: 'Roku',
            os: 'roku os',
            osVersion: '12.0',
            screenResolution: '800x480',
        });
        const device = createDevice();
        const result = checker.checkDeviceConsistency(fingerprint, device);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.RESOLUTION_MISMATCH,
        )).toBe(true);
    });

    it('should cap risk score at 100', () => {
        const fingerprint = createFingerprint({
            make: 'Samsung',
            os: 'tizen',
            osVersion: '1.0',
            screenResolution: '320x240',
        });
        const device = createDevice({ ua: 'Android SDK/30 emulator' });
        const result = checker.checkDeviceConsistency(fingerprint, device);
        expect(result.riskScore).toBeLessThanOrEqual(100);
    });
});

// ─── CTVStreamValidator Tests (Task 4.3) ────────────────────────────────────

describe('CTVStreamValidator', () => {
    let validator: CTVStreamValidator;

    beforeEach(() => {
        validator = new CTVStreamValidator();
    });

    it('should pass a normal streaming session', () => {
        const env = createStreamingEnv({ duration: 3600 });
        const device = createDevice();
        const result = validator.validateStreamingEnv(env, device);
        expect(result.passed).toBe(true);
        expect(result.riskScore).toBe(0);
    });

    it('should flag excessive session duration', () => {
        const env = createStreamingEnv({ duration: 100000 });
        const device = createDevice();
        const result = validator.validateStreamingEnv(env, device);
        expect(result.passed).toBe(false);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.SESSION_ANOMALY,
        )).toBe(true);
    });

    it('should flag zero-duration sessions', () => {
        const env = createStreamingEnv({ duration: 0 });
        const device = createDevice();
        const result = validator.validateStreamingEnv(env, device);
        expect(result.passed).toBe(false);
        expect(result.signals.some(s =>
            s.signal === CTVSpoofSignal.SESSION_ANOMALY && s.description.includes('bot'),
        )).toBe(true);
    });

    it('should flag excessive concurrent sessions', () => {
        const env = createStreamingEnv({ concurrentSessions: 10 });
        const device = createDevice();
        const result = validator.validateStreamingEnv(env, device);
        expect(result.passed).toBe(false);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.CONCURRENT_SESSION_ABUSE,
        )).toBe(true);
    });

    it('should flag geo inconsistency between IP and declared region', () => {
        const env = createStreamingEnv({
            declaredRegion: 'DE',
            ipGeo: { country: 'US', city: 'New York' },
        });
        const device = createDevice();
        const result = validator.validateStreamingEnv(env, device);
        expect(result.passed).toBe(false);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.GEO_ANOMALY,
        )).toBe(true);
    });

    it('should flag implausible bitrate', () => {
        const env = createStreamingEnv({ bitrate: 100 });
        const device = createDevice();
        const result = validator.validateStreamingEnv(env, device);
        expect(result.passed).toBe(false);
    });

    it('should pass valid bitrate', () => {
        const env = createStreamingEnv({ bitrate: 5000 });
        const device = createDevice();
        const result = validator.validateStreamingEnv(env, device);
        // Only bitrate-related signal would fire — 5000 is in range
        expect(result.signals.filter(s =>
            s.description.includes('bitrate'),
        )).toHaveLength(0);
    });
});

// ─── CTVSpoofGuard Orchestrator Tests (Task 4.4) ───────────────────────────

describe('CTVSpoofGuard', () => {
    let guard: CTVSpoofGuard;

    beforeAll(() => {
        const allowlistPath = path.resolve(__dirname, '../../data/ctv-app-allowlist.json');
        const appValidator = new CTVAppValidator(allowlistPath);
        guard = new CTVSpoofGuard(undefined, appValidator);
    });

    it('should return CLEAN for non-CTV requests', () => {
        const req = createBidRequest({
            device: createDevice({ type: DeviceType.DESKTOP }),
            ctv: undefined,
        });
        const result = guard.evaluate(req);
        expect(result.verdict).toBe(CTVSpoofVerdict.CLEAN);
        expect(result.deviceRiskScore).toBe(0);
    });

    it('should return CLEAN for a legitimate CTV request', () => {
        const req = createBidRequest();
        const result = guard.evaluate(req);
        expect(result.verdict).toBe(CTVSpoofVerdict.CLEAN);
        expect(result.signals).toHaveLength(0);
    });

    it('should detect a spoofed CTV request with emulator UA', () => {
        const req = createBidRequest({
            device: createDevice({ ua: 'BlueStacks/4.0 Android SDK' }),
        });
        const result = guard.evaluate(req);
        expect(result.verdict).not.toBe(CTVSpoofVerdict.CLEAN);
        expect(result.deviceRiskScore).toBeGreaterThan(0);
        expect(result.signals.length).toBeGreaterThan(0);
    });

    it('should flag unknown app bundle combined with emulator', () => {
        const req = createBidRequest({
            device: createDevice({ ua: 'Genymotion/3.0' }),
            app: { bundleId: 'com.spoofed.fake', name: 'FakeStream' },
        });
        const result = guard.evaluate(req);
        expect(result.deviceRiskScore).toBeGreaterThan(50);
    });

    it('should include confidence based on available data', () => {
        const req = createBidRequest();
        const result = guard.evaluate(req);
        // All 3 validators should contribute
        expect(result.confidence).toBeGreaterThan(0);
    });

    it('should have processing time measured', () => {
        const req = createBidRequest();
        const result = guard.evaluate(req);
        expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should return configurable thresholds', () => {
        const config = guard.getConfig();
        expect(config.suspiciousThreshold).toBe(40);
        expect(config.spoofedThreshold).toBe(75);
    });
});

// ─── CTVDeviceCache Tests ───────────────────────────────────────────────────

describe('CTVDeviceCache', () => {
    let cache: CTVDeviceCache;

    beforeEach(() => {
        cache = new CTVDeviceCache(100, 30);
    });

    afterEach(() => {
        cache.clear();
    });

    it('should store and retrieve a device entry', () => {
        const fp = createFingerprint({ make: 'Roku', model: 'Stick' });
        cache.set('ifa-1', fp);
        const entry = cache.get('ifa-1');
        expect(entry).not.toBeNull();
        expect(entry?.fingerprint.make).toBe('Roku');
    });

    it('should return null for unknown IFA', () => {
        expect(cache.get('unknown-ifa')).toBeNull();
    });

    it('should detect device make mutation', () => {
        const fp1 = createFingerprint({ make: 'Roku', model: 'Stick' });
        cache.set('ifa-2', fp1);

        const fp2 = createFingerprint({ make: 'Samsung', model: 'Stick' });
        const result = cache.set('ifa-2', fp2);

        expect(result.hasMutations).toBe(true);
        expect(result.signals.some(
            s => s.signal === CTVSpoofSignal.DEVICE_ATTRIBUTE_CHANGE,
        )).toBe(true);
        expect(result.riskIncrease).toBeGreaterThan(0);
    });

    it('should detect OS version downgrade', () => {
        const fp1 = createFingerprint({ osVersion: '14.0' });
        cache.set('ifa-3', fp1);

        const fp2 = createFingerprint({ osVersion: '10.0' });
        const result = cache.set('ifa-3', fp2);

        expect(result.hasMutations).toBe(true);
        expect(result.signals.some(
            s => s.description.includes('downgraded'),
        )).toBe(true);
    });

    it('should not flag identical fingerprints', () => {
        const fp = createFingerprint();
        cache.set('ifa-4', fp);
        const result = cache.set('ifa-4', { ...fp });
        expect(result.hasMutations).toBe(false);
    });

    it('should evict LRU entries at capacity', () => {
        const smallCache = new CTVDeviceCache(3, 30);
        smallCache.set('a', createFingerprint());
        smallCache.set('b', createFingerprint());
        smallCache.set('c', createFingerprint());
        smallCache.set('d', createFingerprint()); // should evict 'a'

        expect(smallCache.get('a')).toBeNull();
        expect(smallCache.get('d')).not.toBeNull();
        expect(smallCache.size()).toBe(3);
    });

    it('should report correct cache size', () => {
        cache.set('x', createFingerprint());
        cache.set('y', createFingerprint());
        expect(cache.size()).toBe(2);
    });
});
