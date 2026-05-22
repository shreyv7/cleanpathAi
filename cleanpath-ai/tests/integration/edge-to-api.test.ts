
import { BidRequestHandler } from '../../edge-gatekeeper/src/handlers/BidRequestHandler';
import { MFAThermalEngine } from '../../edge-gatekeeper/src/rules/MFAThermalEngine';
import { PublisherCache } from '../../edge-gatekeeper/src/cache/PublisherCache';
import { DecisionHandler } from '../../edge-gatekeeper/src/handlers/DecisionHandler';
import { AuditLogger } from '../../edge-gatekeeper/src/services/AuditLogger';
import { createLogger, LogLevel } from '@cleanpath/logging';
import { BidRequest, DeviceType, AdFormat, AdPosition } from '@cleanpath/types';
import axios from 'axios';

// Mock axios for API calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Edge to API Integration', () => {
    let handler: BidRequestHandler;
    let logger = createLogger({
        level: LogLevel.ERROR,
        service: 'test',
        environment: 'test'
    });

    const mockBidRequest: BidRequest = {
        id: 'test-request-123',
        timestamp: Date.now(),
        site: {
            id: 'site-1',
            name: 'Test Site',
            domain: 'mfa-junk.com',
            page: 'https://mfa-junk.com/article/1',
            mobile: false,
            publisher: {
                id: 'pub-high-risk',
                name: 'High Risk Publisher',
                domain: 'mfa-junk.com'
            }
        },
        device: {
            ua: 'Mozilla/5.0',
            ip: '1.2.3.4',
            type: DeviceType.DESKTOP
        },
        user: { id: 'user-1' },
        impressions: [{
            id: 'imp-1',
            format: AdFormat.BANNER,
            position: AdPosition.ABOVE_FOLD,
            width: 300,
            height: 250,
            secure: true
        }]
    };

    beforeEach(() => {
        const thermalEngine = new MFAThermalEngine();
        const cache = new PublisherCache({ lruMaxSize: 100, lruTTL: 60000, enableRedis: false }, logger);
        const decisionHandler = new DecisionHandler();
        const auditLogger = new AuditLogger({
            apiUrl: 'http://api.test',
            enabled: true,
            timeoutMs: 100
        }, logger);

        handler = new BidRequestHandler(
            thermalEngine,
            cache,
            decisionHandler,
            auditLogger,
            { maxLatencyMs: 20, enableMetrics: false, enableDetailedLogging: false },
            logger
        );

        mockedAxios.post.mockResolvedValue({ status: 201, data: { id: 'db-id-123' } });
    });

    it('should process bid request and attempt to persist decision', async () => {
        const response = await handler.process(mockBidRequest);

        expect(response.decision.decision).toBeDefined();
        // Since it's a high risk domain in our mock logic (mfa-junk.com might trigger high thermal score)
        // Let's check if axios.post was called to record this
        expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining('/decisions'),
            expect.objectContaining({
                request_id: mockBidRequest.id,
                publisher_id: mockBidRequest.site.publisher.id
            }),
            expect.any(Object)
        );
    });

    it('should handle API failure gracefully (fail-open for auditing)', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('API Down'));

        // This should not throw because recordDecision is fire-and-forget/handled
        const response = await handler.process(mockBidRequest);

        expect(response.decision.decision).toBeDefined();
    });
});
