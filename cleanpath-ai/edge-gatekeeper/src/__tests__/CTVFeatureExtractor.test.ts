
import { CTVFeatureExtractor } from '../ml/CTVFeatureExtractor';
import {
    BidRequest,
    DeviceType,
    CTVSpoofResult,
    CTVSpoofSignal,
    CTVSpoofVerdict
} from '@cleanpath/types';

describe('CTVFeatureExtractor', () => {
    let extractor: CTVFeatureExtractor;

    beforeEach(() => {
        extractor = new CTVFeatureExtractor();
    });

    const mockRequest: BidRequest = {
        id: 'test-req-1',
        timestamp: Date.now(),
        impressions: [],
        device: {
            ua: 'Mozilla/5.0 (Roku)',
            ip: '1.2.3.4',
            type: DeviceType.CTV,
            make: 'Roku',
            model: 'Ultra',
            os: 'Roku OS',
            osVersion: '10.0',
            h: 1080,
            w: 1920
        },
        site: {
            id: 'site-1',
            name: 'Hulu Site',
            domain: 'hulu.com',
            publisher: { id: 'pub-1', name: 'Hulu', domain: 'hulu.com' },
            page: 'http://hulu.com/watch',
            mobile: false
        },
        app: {
            bundleId: 'com.hulu.plus',
            name: 'Hulu',
            storeUrl: 'https://channelstore.roku.com/details/hulu'
        },
        ctv: {
            ifa: 'test-ifa',
            deviceFingerprint: {
                make: 'Roku',
                model: 'Ultra',
                os: 'Roku OS',
                osVersion: '10.0',
                ifa: 'test-ifa'
            },
            streamingEnvironment: {
                sessionId: 'sess-1',
                protocol: 'vast 4.0',
                bitrate: 5000,
                duration: 30,
                concurrentSessions: 1
            }
        }
    };

    const mockSpoofResult: CTVSpoofResult = {
        verdict: CTVSpoofVerdict.CLEAN,
        deviceRiskScore: 10,
        signals: [],
        confidence: 0.9,
        processingTimeMs: 5
    };

    test('extracts features from a clean request', () => {
        const features = extractor.extractFeatures(mockRequest, mockSpoofResult, null);

        expect(features).toBeDefined();
        // Check specific feature values
        expect(features.feat_device_risk_score).toBe(10);
        expect(features.feat_is_emulator).toBe(0);
        expect(features.feat_app_risk_score).toBe(0);
        expect(features.feat_screen_width).toBe(1920);
        expect(features.feat_screen_height).toBe(1080);
    });

    test('extracts features with spoof signals', () => {
        const spoofResult: CTVSpoofResult = {
            verdict: CTVSpoofVerdict.SPOOFED,
            deviceRiskScore: 90,
            signals: [
                { signal: CTVSpoofSignal.EMULATOR_DETECTED, severity: 90, description: 'Emulator', evidence: {} },
                { signal: CTVSpoofSignal.BUNDLE_MISMATCH, severity: 50, description: 'Bundle', evidence: {} }
            ],
            confidence: 0.95,
            processingTimeMs: 10
        };

        const features = extractor.extractFeatures(mockRequest, spoofResult, null);

        expect(features.feat_device_risk_score).toBe(90);
        expect(features.feat_is_emulator).toBe(1.0);
        expect(features.feat_bundle_anomaly).toBe(1.0);
        expect(features.feat_app_risk_score).toBeGreaterThan(0);
    });

    test('handles missing optional fields gracefully', () => {
        const minimalRequest: BidRequest = {
            ...mockRequest,
            ctv: undefined,
            app: undefined
        };

        const features = extractor.extractFeatures(minimalRequest, mockSpoofResult, null);

        expect(features.feat_session_duration).toBe(0);
        expect(features.feat_is_allowlisted).toBe(0); // No app -> not allowlisted
        expect(features.feat_screen_width).toBe(1920); // Fallback to device object
    });

    test('calculates historical features correctly', () => {
        const cachedEntry = {
            ifa: 'test-ifa',
            fingerprint: mockRequest.ctv!.deviceFingerprint!,
            firstSeen: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
            lastSeen: Date.now(),
            mutationCount: 3,
            riskScore: 45,
            lastMutations: []
        };

        const features = extractor.extractFeatures(mockRequest, mockSpoofResult, cachedEntry);

        expect(features.feat_mutation_count).toBe(3);
        expect(features.feat_days_since_first_seen).toBe(5);
        expect(features.feat_historical_risk).toBe(45);
    });
});
