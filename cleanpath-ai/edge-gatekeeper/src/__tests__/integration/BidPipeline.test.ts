
import { BidRequestHandler } from '../../handlers/BidRequestHandler';
import { MFAThermalEngine } from '../../rules/MFAThermalEngine';
import { PublisherCache } from '../../cache/PublisherCache';
import { DecisionHandler } from '../../handlers/DecisionHandler';
import { AuditLogger } from '../../services/AuditLogger';
import { PacingOrchestrator } from '../../pacing/PacingOrchestrator';
import { BidShader } from '../../bidding/BidShader';
import { Logger } from '@cleanpath/logging';
import { DeviceType, DecisionType, BlockReason } from '@cleanpath/types';

// --- Mocks that match actual method signatures in BidRequestHandler ---

const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    performance: jest.fn(),
    child: jest.fn().mockReturnThis(),
} as unknown as Logger;

const mockThermalEngine = {
    classify: jest.fn().mockReturnValue({
        classification: {
            thermalScore: { overall: 20 },
            riskLevel: 'low',
        },
    }),
    getRuleConfig: jest.fn().mockReturnValue({ rules: [] }),
} as unknown as MFAThermalEngine;

const mockCache = {
    get: jest.fn().mockResolvedValue(null), // Unknown publisher -> use defaults
    getStats: jest.fn().mockReturnValue({
        l1: { size: 0, hitRate: 0 },
        l2: { enabled: false },
    }),
} as unknown as PublisherCache;

const mockDecisionHandler = {
    decide: jest.fn(),
} as unknown as DecisionHandler;

const mockAuditLogger = {
    recordDecision: jest.fn(),
    log: jest.fn(),
} as unknown as AuditLogger;

const mockPacingOrchestrator = {
    getPacer: jest.fn(),
} as unknown as PacingOrchestrator;

const mockBidShader = {
    shadeBid: jest.fn(),
} as unknown as BidShader;

const config = {
    maxLatencyMs: 200,
    enableMetrics: false,
    enableDetailedLogging: false,
};

// A valid BidRequest matching the types/BidRequest.ts schema
const baseRequest = {
    id: 'req-123',
    timestamp: Date.now(),
    impressions: [{
        id: 'imp-1',
        format: 'banner',
        position: 'above_fold',
        width: 300,
        height: 250,
        secure: true,
    }],
    device: { ua: 'Mozilla/5.0', ip: '1.2.3.4', type: DeviceType.MOBILE },
    site: {
        id: 'site-1',
        name: 'Example Site',
        domain: 'example.com',
        page: 'https://example.com/page',
        mobile: true,
        publisher: { id: 'pub-1', name: 'Example Publisher', domain: 'example.com' },
    },
    user: { id: 'user-1' },
} as any;

describe('BidPipeline Integration', () => {
    let handler: BidRequestHandler;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset cache to return null (unknown publisher)
        (mockCache.get as jest.Mock).mockResolvedValue(null);

        handler = new BidRequestHandler(
            mockThermalEngine,
            mockCache,
            mockDecisionHandler,
            mockAuditLogger,
            config,
            mockLogger,
            undefined, // CTVSpoofGuard
            undefined, // CTVDeviceCache
            undefined, // CTVFeatureExtractor
            mockPacingOrchestrator,
            mockBidShader,
        );
    });

    it('should block bid when Pacing Orchestrator denies budget', async () => {
        const mockPacer = { checkPacing: jest.fn().mockResolvedValue(false) };
        (mockPacingOrchestrator.getPacer as jest.Mock).mockResolvedValue(mockPacer);

        const response = await handler.process(baseRequest);

        expect(response.decision.decision).toBe(DecisionType.BLOCK);
        expect(response.decision.blockReason).toBe(BlockReason.BUDGET_EXHAUSTED);
        expect(mockPacer.checkPacing).toHaveBeenCalled();
        // Decision handler should NOT be called (short-circuit)
        expect(mockDecisionHandler.decide).not.toHaveBeenCalled();
    });

    it('should allow and shade bid when pacing allows', async () => {
        // Pacing: ALLOW
        const mockPacer = { checkPacing: jest.fn().mockResolvedValue(true) };
        (mockPacingOrchestrator.getPacer as jest.Mock).mockResolvedValue(mockPacer);

        // Decision: ALLOW with price
        (mockDecisionHandler.decide as jest.Mock).mockResolvedValue({
            decision: {
                requestId: 'req-123',
                decision: DecisionType.ALLOW,
                timestamp: Date.now(),
                processingTimeMs: 5,
                price: 5.0,
                metadata: {
                    publisherId: 'pub-1',
                    domain: 'example.com',
                },
            },
            usedFailOpen: false,
        });

        // Shading: reduce price
        (mockBidShader.shadeBid as jest.Mock).mockReturnValue({
            shadedPrice: 4.25,
            savings: 0.75,
            winProb: 0.8,
        });

        const response = await handler.process(baseRequest);

        expect(response.decision.decision).toBe(DecisionType.ALLOW);
        expect(response.decision.price).toBe(4.25);
        expect(response.decision.metadata?.originalPrice).toBe(5.0);
        expect(response.decision.metadata?.savings).toBe(0.75);

        expect(mockPacer.checkPacing).toHaveBeenCalled();
        expect(mockDecisionHandler.decide).toHaveBeenCalled();
        expect(mockBidShader.shadeBid).toHaveBeenCalled();
        expect(mockAuditLogger.recordDecision).toHaveBeenCalled();
    });
});
