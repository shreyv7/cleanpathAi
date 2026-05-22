import { Router, Request, Response } from 'express';
import { createRedisClient } from '../workers/BudgetSyncWorker';
import { Logger, LogLevel } from '@cleanpath/logging';

const router = Router();
const logger = new Logger({ service: 'telemetry-feedback-api', environment: 'production', level: LogLevel.INFO });

// Initialize the Redis Client
const redis = createRedisClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
});

// Connect to Redis in the background
redis.connect().catch(err => {
    logger.error('Failed to connect to Redis inside Telemetry router', err);
});

/**
 * Outcome Telemetry Pixel Endpoint
 * Called when browser click, conversion, or session quality tracking events fire.
 * Receives the reward signal to update Thompson Sampling Bandit Alpha/Beta parameters in Redis.
 */
router.post('/pixel', async (req: Request, res: Response) => {
    try {
        const { campaignId, publisherId, success } = req.body;

        if (!campaignId || !publisherId || success === undefined) {
            res.status(400).json({ error: 'Missing required parameters: campaignId, publisherId, or success' });
            return;
        }

        const redisKey = `bandit:pacing:${campaignId}:${publisherId}`;
        const existingDataString = await redis.get(redisKey);

        let alpha = 1;
        let beta = 1;

        if (existingDataString) {
            try {
                const parsed = JSON.parse(existingDataString);
                alpha = Math.max(1, parseInt(parsed.alpha || '1', 10));
                beta = Math.max(1, parseInt(parsed.beta || '1', 10));
            } catch (e) {
                logger.warn('Failed to parse existing bandit parameters, resetting to defaults', { redisKey });
            }
        }

        // Update counts (Alpha = high-value views, Beta = wasted/bot impressions)
        if (success === true || success === 'true' || success === 1) {
            alpha++;
        } else {
            beta++;
        }

        // Store back in Redis with a 7-day expiration (604800 seconds)
        const updatedPayload = JSON.stringify({ alpha, beta });
        await redis.set(redisKey, updatedPayload, 604800);

        logger.info(`Feedback processed for ${redisKey}`, {
            success,
            alpha,
            beta
        });

        res.json({
            success: true,
            campaignId,
            publisherId,
            alpha,
            beta
        });

    } catch (error) {
        logger.error('Error processing telemetry outcome reward pixel', error instanceof Error ? { error: error.message } : { error: String(error) });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
