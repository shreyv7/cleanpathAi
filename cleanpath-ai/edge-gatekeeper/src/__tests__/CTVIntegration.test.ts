
import { BidRequestHandler, createBidRequestHandler } from '../handlers/BidRequestHandler';
import { MFAThermalEngine } from '../rules/MFAThermalEngine';
import { PublisherCache } from '../cache/PublisherCache';
import { createDecisionHandler } from '../handlers/DecisionHandler';
import { AuditLogger } from '../services/AuditLogger';
import { CTVSpoofGuard } from '../rules/CTVSpoofGuard';
import { CTVDeviceCache } from '../cache/CTVDeviceCache';
import { CTVFeatureExtractor } from '../ml/CTVFeatureExtractor';
import { CTVAppValidator } from '../rules/CTVAppValidator';
import { CTVDeviceChecker } from '../rules/CTVDeviceChecker';
import { CTVStreamValidator } from '../rules/CTVStreamValidator';
import { Logger } from '@cleanpath/logging';
import { DEFAULT_DECISION_CONFIG } from '../handlers/decisionConfig';
import { BidRequest, DeviceType, DecisionType, AdFormat, AdPosition } from '@cleanpath/types';

describe('CTV Integration Test', () => {
    let handler: BidRequestHandler;
    let mockLogger: Logger;
    let mockAuditLogger: AuditLogger;

    beforeEach(() => {
        mockLogger = new Logger({ level: 'error' as any, service: 'edge-gatekeeper', environment: 'test' });

        // Mock dependencies
        const cache = new PublisherCache({ lruTTL: 60, lruMaxSize: 100, enableRedis: false }, mockLogger);

        // Mock AuditLogger to avoid network calls
        mockAuditLogger = new AuditLogger({ enabled: false, apiUrl: '', timeoutMs: 100 }, mockLogger);
        mockAuditLogger.log = jest.fn().mockResolvedValue(undefined);
        mockAuditLogger.recordDecision = jest.fn().mockResolvedValue(undefined);

        const thermalEngine = new MFAThermalEngine();
        const decisionHandler = createDecisionHandler(DEFAULT_DECISION_CONFIG, mockLogger);

        // CTV components
        const deviceCache = new CTVDeviceCache();
        const appValidator = new CTVAppValidator();
        const deviceChecker = new CTVDeviceChecker();
        const streamValidator = new CTVStreamValidator();
        const spoofGuard = new CTVSpoofGuard({}, appValidator, deviceChecker, streamValidator);
        const featureExtractor = new CTVFeatureExtractor();

        handler = createBidRequestHandler(
            thermalEngine,
            cache,
            decisionHandler,
            mockAuditLogger,
            { maxLatencyMs: 1000, enableMetrics: false, enableDetailedLogging: false },
            mockLogger,
            spoofGuard,
            deviceCache,
            featureExtractor
        );
    });

    const baseRequest: BidRequest = {
        id: 'req-123',
        timestamp: Date.now(),
        impressions: [{
            id: 'imp-1',
            format: AdFormat.VIDEO,
            position: AdPosition.ABOVE_FOLD,
            width: 1920,
            height: 1080,
            secure: true
        }],
        device: {
            ua: 'Roku/DVP-9.10 (519.10E04111A)',
            ip: '192.168.1.1',
            type: DeviceType.CTV,
            make: 'Roku',
            model: 'Ultra',
            os: 'Roku OS',
            osVersion: '9.10',
            h: 1080,
            w: 1920
        },
        site: {
            id: 'site-1',
            name: 'Hulu Site',
            domain: 'hulu.com',
            publisher: { id: 'pub-1', name: 'Hulu', domain: 'hulu.com' },
            page: 'http://hulu.com',
            mobile: false
        },
        app: {
            bundleId: 'com.hulu.plus',
            name: 'Hulu',
            storeUrl: 'https://channelstore.roku.com'
        },
        ctv: {
            ifa: 'clean-ifa-123',
            deviceFingerprint: {
                make: 'Roku',
                model: 'Ultra',
                os: 'Roku OS',
                osVersion: '9.10',
                ifa: 'clean-ifa-123'
            },
            streamingEnvironment: {
                sessionId: 'sess-1',
                protocol: 'vast',
                bitrate: 5000,
                duration: 30,
                concurrentSessions: 1
            }
        },
        user: { id: 'u1' }
    };

    test('allows clean CTV request', async () => {
        const response = await handler.process(baseRequest);

        expect(response.decision.decision).toBe(DecisionType.ALLOW);
        expect(mockAuditLogger.log).toHaveBeenCalledWith('ctv_ml_features', expect.anything());
    });

    test('blocks Emulator request (High Risk)', async () => {
        const emulatorRequest: BidRequest = {
            ...baseRequest,
            device: {
                ...baseRequest.device,
                ua: 'Android SDK built for x86' // Emulator string
            },
            ctv: {
                ...baseRequest.ctv!,
                deviceFingerprint: {
                    ...baseRequest.ctv!.deviceFingerprint!,
                    make: 'Generic',
                    model: 'Android SDK built for x86'
                }
            }
        };

        const response = await handler.process(emulatorRequest);

        // This relies on CTVDeviceChecker catching "Android SDK" or "Generic" patterns
        // and identifying it as spoofed/high risk.
        expect(response.decision.decision).toBe(DecisionType.BLOCK);

        // Verify logs
        expect(mockAuditLogger.log).toHaveBeenCalledWith(
            'ctv_ml_features',
            expect.objectContaining({ verdict: 'spoofed' })
        );
    });
});
