
import express from 'express';
import { createBidRequestHandler } from '../src/handlers/BidRequestHandler';
import { MFAThermalEngine } from '../src/rules/MFAThermalEngine';
import { PublisherCache } from '../src/cache/PublisherCache';
import { createDecisionHandler } from '../src/handlers/DecisionHandler';
import { AuditLogger } from '../src/services/AuditLogger';
import { Logger, LogLevel } from '@cleanpath/logging';
import { CTVSpoofGuard } from '../src/rules/CTVSpoofGuard';
import { CTVDeviceCache } from '../src/cache/CTVDeviceCache';
import { CTVFeatureExtractor } from '../src/ml/CTVFeatureExtractor';
import { RLRewardService } from '../src/rl/RLRewardService';
import { ExperienceReplayBuffer } from '../src/rl/ExperienceReplayBuffer';
import { DEFAULT_DECISION_CONFIG } from '../src/handlers/decisionConfig';

// Initialize minimal logger
const logger = new Logger({
    level: LogLevel.ERROR, // Minimize logging for load test
    service: 'load-test-server',
    environment: 'test'
});

// Components
const cache = new PublisherCache({ lruTTL: 60000, lruMaxSize: 10000, enableRedis: false }, logger);
const thermalEngine = new MFAThermalEngine();
const decisionHandler = createDecisionHandler(DEFAULT_DECISION_CONFIG, logger);
// Mock audit logger to avoid external dependencies during load test
const auditLogger = new AuditLogger({ enabled: false, apiUrl: '', timeoutMs: 100 }, logger);
auditLogger.log = async () => { };
auditLogger.recordDecision = async () => { };

// CTV/ML Components
const deviceCache = new CTVDeviceCache();
const featureExtractor = new CTVFeatureExtractor();
const spoofGuard = new CTVSpoofGuard();

const bidHandler = createBidRequestHandler(
    thermalEngine,
    cache,
    decisionHandler,
    auditLogger,
    { maxLatencyMs: 100, enableMetrics: false, enableDetailedLogging: false },
    logger,
    spoofGuard,
    deviceCache,
    featureExtractor
);

const app = express();
app.use(express.json());

app.post('/bid', async (req, res) => {
    try {
        const response = await bidHandler.process(req.body);
        res.json(response);
    } catch (err) {
        logger.error('Error processing bid', err);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Load Test Server running on port ${PORT}`);
});
