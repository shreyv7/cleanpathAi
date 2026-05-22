import { Router, Request, Response } from 'express';
import { createRedisClient } from '../workers/BudgetSyncWorker';
import { Logger, LogLevel } from '@cleanpath/logging';

const router = Router();
const logger = new Logger({ service: 'pulse-verification-api', environment: 'production', level: LogLevel.INFO });

// Initialize the Redis Client
const redis = createRedisClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
});

// Connect to Redis in the background
redis.connect().catch(err => {
    logger.error('Failed to connect to Redis inside Pulse router', err instanceof Error ? { error: err.message } : { error: String(err) });
});

// Helper: Calculate Standard Deviation
function getStdDev(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

router.post('/verify', async (req: Request, res: Response) => {
    try {
        const { ifa, telemetry } = req.body;

        if (!ifa || !telemetry) {
            res.status(400).json({ error: 'Missing required parameters: ifa or telemetry' });
            return;
        }

        const mouse = telemetry.mouse || [];
        const scroll = telemetry.scroll || [];
        const clicks = telemetry.clicks || [];

        let verdict = 'HUMAN';
        let confidenceScore = 1.0;
        const diagnostic: Record<string, any> = {};

        // 1. Analyze Mouse Entropy
        if (mouse.length >= 5) {
            const speeds = mouse.map((m: any) => m.speed);
            const angles = mouse.map((m: any) => m.angle);
            const intervals = mouse.map((m: any) => m.dt);

            const speedStd = getStdDev(speeds);
            const angleStd = getStdDev(angles);
            const dtStd = getStdDev(intervals);

            diagnostic.mouse = { speedStd, angleStd, dtStd, sampleCount: mouse.length };

            // Real humans have organic muscle wiggles and speed variations.
            // If mouse speeds, angles, or timing intervals are perfectly uniform, it's a bot!
            if (angleStd < 0.005) {
                // Absolute straight line (highly synthetic)
                verdict = 'BOT';
                confidenceScore = 0.99;
            } else if (speedStd < 0.005) {
                // Uniform constant speed (automation behavior)
                verdict = 'BOT';
                confidenceScore = 0.95;
            } else if (dtStd < 1.0) {
                // Perfect clock-like sample timing (automated scheduler)
                verdict = 'BOT';
                confidenceScore = 0.90;
            }
        }

        // 2. Analyze Scroll Entropy
        if (verdict === 'HUMAN' && scroll.length >= 3) {
            const scrollSpeeds = scroll.map((s: any) => s.speed);
            const scrollIntervals = scroll.map((s: any) => s.dt);

            const scrollSpeedStd = getStdDev(scrollSpeeds);
            const scrollDtStd = getStdDev(scrollIntervals);

            diagnostic.scroll = { scrollSpeedStd, scrollDtStd, sampleCount: scroll.length };

            if (scrollSpeedStd < 0.002 || scrollDtStd < 1.0) {
                verdict = 'BOT';
                confidenceScore = 0.88;
            }
        }

        // 3. Analyze Click offset
        if (verdict === 'HUMAN' && clicks.length > 0) {
            const centerOffsets = clicks.map((c: any) => c.distanceToCenter);
            const offsetStd = getStdDev(centerOffsets);

            diagnostic.clicks = { offsetStd, clickCount: clicks.length };

            // Bots usually fire events directly at the absolute center of buttons (offset = 0)
            const allDirectHits = centerOffsets.every((offset: number) => offset === 0);
            if (allDirectHits && clicks.length >= 2) {
                verdict = 'BOT';
                confidenceScore = 0.85;
            }
        }

        // Default case: not enough interaction samples yet, flag as pending/neutral
        if (mouse.length < 5 && scroll.length < 3 && clicks.length === 0) {
            verdict = 'NEUTRAL';
            confidenceScore = 0.5;
        }

        // 4. Save verdict in active Redis Cache
        const redisKey = `pulse:ifa:${ifa}`;
        await redis.set(redisKey, verdict, 86400); // 24-hour expiration

        logger.info(`Validated device '${ifa}' via Pulse telemetry`, {
            verdict,
            confidenceScore,
            diagnostic
        });

        res.json({
            success: true,
            ifa,
            verdict,
            confidenceScore,
            diagnostic
        });

    } catch (error) {
        logger.error('Error processing Pulse validation telemetry', error instanceof Error ? { error: error.message } : { error: String(error) });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
