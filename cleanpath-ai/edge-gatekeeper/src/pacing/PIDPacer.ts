
import { Pacer } from './Pacer';
import { RedisClient } from '../cache/RedisClient';
import { Logger } from '@cleanpath/logging';

export class PIDPacer implements Pacer {
    private redis: RedisClient;
    private logger: Logger;

    // PID Constants (Tunable)
    private Kp = 0.5; // Proportional
    private Ki = 0.1; // Integral
    private Kd = 0.05; // Derivative

    constructor(redis: RedisClient, logger: Logger) {
        this.redis = redis;
        this.logger = logger;
    }

    async init(): Promise<void> {
        // Init logic
    }

    async checkPacing(campaignId: string, _estimatedCost: number = 1): Promise<boolean> {
        // 1. Get State: Current Spend vs Target Spend
        const now = Date.now();
        this.logger.debug(`Checking PID pacing for campaign ${campaignId}`);

        // Target: Ideal spend curve
        // For 'SMOOTH', target is linear: (DailyCap / 24) * current_hour_progress
        const limitStr = await this.redis.get(`budget:limit:${campaignId}`);
        if (!limitStr) return true;

        const dailyCap = parseFloat(limitStr);
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const msSinceStart = now - startOfDay;
        const fractionOfDay = msSinceStart / (86400 * 1000);

        const targetSpend = dailyCap * fractionOfDay;

        // Actual Spend
        const actualSpendStr = await this.redis.get(`budget:spend:${campaignId}`);
        const actualSpend = actualSpendStr ? parseFloat(actualSpendStr) : 0;

        // Error = Target - Actual
        // Positive Error = Under-spending (Needs to speed up)
        // Negative Error = Over-spending (Needs to slow down)
        const error = targetSpend - actualSpend;

        // Calculate Probability Adjustment
        // If error is 0, we are on track.
        // We want an Allow Probability `P`.
        // Base P = (Rate / AvgCost) / ReqPerSec ... complicated to calc exact P
        // Simplified PID control on P:

        // Fetch previous error/integral for this campaign
        const stateKey = `pacing:pid:${campaignId}`;
        const stateStr = await this.redis.get(stateKey);
        let integral = 0;
        let lastError = 0;

        if (stateStr) {
            const state = JSON.parse(stateStr);
            integral = state.integral || 0;
            lastError = state.lastError || 0;
        }

        // Update Integral
        integral += error;

        // Update Derivative
        const derivative = error - lastError;

        // Control Output (Adjustment factor)
        // If Output > 0, we increase aggression. If < 0, we throttle.
        const output = (this.Kp * error) + (this.Ki * integral) + (this.Kd * derivative);

        // Normalize output to a probability 0-1
        // We assume ideal state is getting all bids we want.
        // A simple heuristic: 
        // If output is positive (underspending), P = 1.0
        // If output is negative (overspending), P reduces.

        // Sigmoid or simple clamp?
        // Let's use a "Throttling Factor".
        // If overspending by 10%, throttle 10%?
        // Let's treat 'output' as "Budget surplus/deficit".

        let probability = 1.0;
        if (output < 0) {
            // Overspending. The magnitude of output relative to dailyCap determines severity.
            // heavy overspend -> low probability
            const severity = Math.abs(output) / (dailyCap * 0.1); // 10% deviation is Checkpoint
            probability = Math.max(0.01, 1.0 - severity);
        }

        // Save State
        await this.redis.set(stateKey, JSON.stringify({ integral, lastError: error }), 60);

        // Act
        return Math.random() < probability;
    }
}
