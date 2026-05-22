/**
 * Edge Gatekeeper Main Entry Point
 * Governance Reset v1: Clean wiring with real CTV, Pacing and Security components.
 */

import { createLogger, LogLevel } from '@cleanpath/logging';
import { createThermalEngine } from './rules';
import { createPublisherCache, createRedisClient, DEFAULT_REDIS_CONFIG } from './cache';
import { createDecisionHandler } from './handlers';
import { createBidRequestHandler } from './handlers/BidRequestHandler';
import { AuditLogger } from './services/AuditLogger';
import { CTVSpoofGuard } from './rules/CTVSpoofGuard';
import { CTVDeviceCache } from './cache/CTVDeviceCache';
import { PacingOrchestrator } from './pacing/PacingOrchestrator';
import { BidShader } from './bidding/BidShader';
import { createAuthMiddleware, createRateLimitMiddleware } from './middleware';
import http from 'http';

// Configuration from environment
const config = {
    logLevel: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    environment: (process.env.ENVIRONMENT as any) || 'development',
    maxLatencyMs: parseInt(process.env.MAX_LATENCY_MS || '20', 10),
    enableRedis: process.env.ENABLE_REDIS !== 'false',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    enableDetailedLogging: process.env.ENABLE_DETAILED_LOGGING === 'true',
    auditApiUrl: process.env.AUDIT_API_URL || 'http://localhost:3000/api',
    enableAudit: process.env.ENABLE_AUDIT !== 'false',
};

// Create logger
const logger = createLogger(
    {
        level: config.logLevel,
        service: 'edge-gatekeeper',
        environment: config.environment,
        prettyPrint: config.environment === 'development',
    },
    {
        service: 'edge-gatekeeper',
        version: '1.0.0',
    }
);

// Initialize core components
const thermalEngine = createThermalEngine();
const cache = createPublisherCache(
    {
        lruMaxSize: 1000,
        lruTTL: 300000,
        redisTTL: 3600,
        enableRedis: config.enableRedis,
    },
    logger
);
const auditLogger = new AuditLogger({
    apiUrl: config.auditApiUrl,
    enabled: config.enableAudit,
    timeoutMs: 1000
}, logger);

// Initialize CTV Spoof Guard components
const ctvSpoofGuard = new CTVSpoofGuard();
const ctvDeviceCache = new CTVDeviceCache();

// Initialize ML Inference & Feature Extractor
import { CTVModelInference } from './ml/CTVModelInference';
import { CTVFeatureExtractor } from './ml/CTVFeatureExtractor';
const ctvModelInference = new CTVModelInference('remote', logger);
const ctvFeatureExtractor = new CTVFeatureExtractor();

// Initialize Decision Handler with ML model
const decisionHandler = createDecisionHandler(undefined, logger, ctvModelInference);

// Initialize Pacing & Bid Shading
const pacingRedis = createRedisClient(DEFAULT_REDIS_CONFIG);
const pacingOrchestrator = new PacingOrchestrator(pacingRedis, logger);
const bidShader = new BidShader(logger);

// Create bid request handler with all components wired
console.log('--- DEBUG: ctvFeatureExtractor instance: ', ctvFeatureExtractor);
const bidRequestHandler = createBidRequestHandler(
    thermalEngine,
    cache,
    decisionHandler,
    auditLogger,
    {
        maxLatencyMs: config.maxLatencyMs,
        enableMetrics: config.enableMetrics,
        enableDetailedLogging: config.enableDetailedLogging,
    },
    logger,
    ctvSpoofGuard,
    ctvDeviceCache,
    ctvFeatureExtractor,
    pacingOrchestrator,
    bidShader
);

// Authentication & Rate Limiting Middleware instances
const apiKeysEnv = (process.env.API_KEYS || 'dev-api-key-change-in-production').split(',');
const authEnabled = process.env.AUTH_ENABLED !== 'false';
const authMiddleware = createAuthMiddleware(apiKeysEnv, 'X-API-Key', authEnabled, logger);

const defaultQPS = parseInt(process.env.DEFAULT_QPS || '1000', 10);
const rateLimitMiddleware = createRateLimitMiddleware(defaultQPS, 1000, authEnabled, logger);

/**
 * Initialize edge gatekeeper
 */
export async function initialize(): Promise<void> {
    logger.info('Initializing Edge Gatekeeper', {
        config: {
            maxLatencyMs: config.maxLatencyMs,
            enableRedis: config.enableRedis,
            enableMetrics: config.enableMetrics,
        },
    });

    // Initialize cache (connect to Redis if enabled)
    await cache.initialize();

    // Connect Pacing Redis
    if (config.enableRedis) {
        await pacingRedis.connect();
    }

    logger.info('Edge Gatekeeper initialized successfully');
}

/**
 * Process bid request
 */
export { bidRequestHandler };

/**
 * Health check endpoint
 */
export async function healthCheck() {
    return bidRequestHandler.healthCheck();
}

/**
 * Graceful shutdown
 */
export async function shutdown(): Promise<void> {
    logger.info('Shutting down Edge Gatekeeper');

    await cache.disconnect();
    await pacingRedis.disconnect();
    await logger.flush();

    logger.info('Edge Gatekeeper shutdown complete');
}

// Export components for testing
export { thermalEngine, cache, decisionHandler, logger };

const PORT = process.env.PORT || 8000;
let server: http.Server;

/**
 * Start HTTP server instance
 */
export async function startServer(port: number | string = PORT): Promise<http.Server> {
    server = http.createServer(async (req, res) => {
        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        // Health Check
        if (req.method === 'GET' && req.url === '/health') {
            const health = await bidRequestHandler.healthCheck();
            res.writeHead(health.healthy ? 200 : 503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(health));
            return;
        }

        // Bid Processing
        if (req.method === 'POST' && req.url === '/api/decisions/process') {
            // Authentication check
            const authResult = authMiddleware.authenticate(req.headers as Record<string, string | string[] | undefined>);
            if (!authResult.authenticated) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: authResult.error || 'Unauthorized' }));
                return;
            }

            // Rate Limit check
            const clientId = authResult.clientId || 'anonymous';
            const rateLimitResult = rateLimitMiddleware.checkLimit(clientId);

            // Add Rate Limit headers
            res.setHeader('X-RateLimit-Limit', rateLimitResult.limit.toString());
            res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
            res.setHeader('X-RateLimit-Reset', rateLimitResult.resetAt.toString());

            if (!rateLimitResult.allowed) {
                res.writeHead(429, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Too Many Requests' }));
                return;
            }

            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const bidRequest = JSON.parse(body);
                    const result = await bidRequestHandler.process(bidRequest);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                } catch (error) {
                    logger.error('Error processing request', error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid request' }));
                }
            });
            return;
        }

        // 404
        res.writeHead(404);
        res.end();
    });

    return new Promise((resolve) => {
        server.listen(port, () => {
            logger.info(`Edge Gatekeeper running on port ${port} (PID ${process.pid})`);
            resolve(server);
        });
    });
}

// Start HTTP Server directly if NOT running in cluster mode
if (require.main === module && process.env.CLUSTER_ENABLED !== 'true') {
    initialize().then(() => {
        startServer(PORT).catch(err => {
            logger.error('Failed to start Edge Gatekeeper HTTP Server', err);
            process.exit(1);
        });
    }).catch(err => {
        logger.error('Failed to initialize Edge Gatekeeper', err);
        process.exit(1);
    });
}
