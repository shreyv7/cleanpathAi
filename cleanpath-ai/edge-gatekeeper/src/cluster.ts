/**
 * Node.js Cluster Wrapper
 * Multi-core scaling for the edge gatekeeper.
 * Forks worker processes to utilize all available CPU cores.
 *
 * Usage: node cluster.js
 * Env: CLUSTER_WORKERS=<n> (default: CPU count)
 *
 * Governance Reset v1 — Phase 4: Stability & Performance
 */

// Set cluster environment variable so workers import index without auto-starting HTTP server directly
process.env.CLUSTER_ENABLED = 'true';

import cluster from 'cluster';
import os from 'os';
import { createLogger, LogLevel } from '@cleanpath/logging';

const WORKER_COUNT = parseInt(process.env.CLUSTER_WORKERS || '', 10) || os.cpus().length;

const logger = createLogger(
    {
        level: LogLevel.INFO,
        service: 'edge-gatekeeper-cluster',
        environment: (process.env.ENVIRONMENT || 'production') as 'production' | 'development' | 'staging' | 'test',
        prettyPrint: false,
    },
    { service: 'edge-gatekeeper-cluster', version: '1.0.0' }
);

if (cluster.isPrimary) {
    logger.info(`Primary ${process.pid} starting ${WORKER_COUNT} workers`, {
        cpus: os.cpus().length,
        workers: WORKER_COUNT,
        nodeVersion: process.version,
        platform: process.platform,
    });

    // Fork workers
    for (let i = 0; i < WORKER_COUNT; i++) {
        cluster.fork();
    }

    // Handle worker exit — restart with backoff
    let restartCount = 0;
    const MAX_RESTARTS = WORKER_COUNT * 3;

    cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} exited`, { code, signal });

        if (restartCount < MAX_RESTARTS) {
            restartCount++;
            const backoffMs = Math.min(1000 * Math.pow(2, restartCount - 1), 30000);
            logger.info(`Restarting worker in ${backoffMs}ms (restart ${restartCount}/${MAX_RESTARTS})`);
            setTimeout(() => cluster.fork(), backoffMs);
        } else {
            logger.error('Max restarts exceeded — not restarting worker');
        }
    });

    // Graceful shutdown
    const shutdown = () => {
        logger.info('Graceful shutdown initiated');
        for (const id in cluster.workers) {
            cluster.workers[id]?.send('shutdown');
        }
        setTimeout(() => {
            logger.warn('Forcing shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Reset restart count periodically (if workers are stable)
    setInterval(() => {
        if (restartCount > 0) {
            restartCount = Math.max(0, restartCount - 1);
        }
    }, 60000);

} else {
    // Worker process — run the actual edge gatekeeper
    logger.info(`Worker ${process.pid} started`);

    // Import and initialize the edge gatekeeper
    import('./index').then(async (gatekeeper) => {
        // Initialize connections
        await gatekeeper.initialize();
        // Start HTTP Server
        await gatekeeper.startServer();
        logger.info(`Worker ${process.pid} initialized and HTTP server started successfully`);
    }).catch((err) => {
        logger.error(`Worker ${process.pid} failed to initialize`, err);
        process.exit(1);
    });

    // Handle shutdown message from primary
    process.on('message', (msg) => {
        if (msg === 'shutdown') {
            import('./index').then(async (gatekeeper) => {
                await gatekeeper.shutdown();
                process.exit(0);
            });
        }
    });
}
