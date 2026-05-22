/**
 * Budget Overspend Simulation Script
 * 
 * Simulates rapid bid requests against the pacing system to verify
 * that budget limits are enforced and overspend is prevented.
 * 
 * Usage: npx tsx scripts/simulate-overspend.ts
 */

import { TokenBucketPacer } from '../src/pacing/TokenBucketPacer';
import { PIDPacer } from '../src/pacing/PIDPacer';
import { Logger } from '@cleanpath/logging';

// --- Configuration ---
const CAMPAIGN_ID = 'sim-campaign-1';
const DAILY_BUDGET = 100;        // $100 daily budget
const BID_COST = 0.50;           // $0.50 per bid
const TOTAL_REQUESTS = 300;      // 300 requests at $0.50 = $150 potential spend
const REQUEST_INTERVAL_MS = 10;  // 10ms between requests

// --- Logger ---
const logger = {
    info: (msg: string, meta?: any) => console.log(`[INFO]  ${msg}`, meta || ''),
    warn: (msg: string, meta?: any) => console.warn(`[WARN]  ${msg}`, meta || ''),
    error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || ''),
    debug: (_msg: string, _meta?: any) => { }, // Suppress debug noise
    child: function () { return this; },
    performance: (_msg: string, _ms: number, _meta?: any) => { },
} as unknown as Logger;

// --- In-memory Redis mock ---
class SimRedisClient {
    private store: Map<string, string> = new Map();

    async get(key: string): Promise<string | null> {
        return this.store.get(key) || null;
    }

    async set(key: string, value: string, _ttl?: number): Promise<void> {
        this.store.set(key, value);
    }

    async eval(..._args: any[]): Promise<any> {
        // Simple token bucket simulation:
        // Check if tokens remain, decrement if so
        const bucketKey = _args[2] as string;
        const cost = parseFloat(_args[4] as string) || 1;
        const capacity = parseFloat(_args[6] as string) || 100;

        const current = parseFloat(this.store.get(bucketKey) || String(capacity));
        if (current >= cost) {
            this.store.set(bucketKey, String(current - cost));
            return 1; // Allowed
        }
        return 0; // Blocked
    }

    async incr(key: string): Promise<number> {
        const val = parseInt(this.store.get(key) || '0', 10) + 1;
        this.store.set(key, String(val));
        return val;
    }
}

// --- Main Simulation ---
async function runSimulation() {
    console.log('='.repeat(60));
    console.log('  BUDGET OVERSPEND SIMULATION');
    console.log('='.repeat(60));
    console.log(`  Campaign:        ${CAMPAIGN_ID}`);
    console.log(`  Daily Budget:    $${DAILY_BUDGET}`);
    console.log(`  Bid Cost:        $${BID_COST}`);
    console.log(`  Total Requests:  ${TOTAL_REQUESTS}`);
    console.log(`  Max Spend:       $${TOTAL_REQUESTS * BID_COST} (if no pacing)`);
    console.log('='.repeat(60));

    const redis = new SimRedisClient() as any;

    // Seed the budget limit in Redis
    await redis.set(`budget:limit:${CAMPAIGN_ID}`, String(DAILY_BUDGET));

    // --- Test 1: Token Bucket Pacer ---
    console.log('\n--- Token Bucket Pacer ---');
    const tokenPacer = new TokenBucketPacer(redis, logger);
    let tokenAllowed = 0;
    let tokenBlocked = 0;

    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const allowed = await tokenPacer.checkPacing(CAMPAIGN_ID, BID_COST);
        if (allowed) {
            tokenAllowed++;
        } else {
            tokenBlocked++;
        }
        // Small delay to simulate real traffic
        await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL_MS));
    }

    const tokenSpend = tokenAllowed * BID_COST;
    const tokenOverspendPct = ((tokenSpend - DAILY_BUDGET) / DAILY_BUDGET * 100).toFixed(1);

    console.log(`  Allowed:  ${tokenAllowed}`);
    console.log(`  Blocked:  ${tokenBlocked}`);
    console.log(`  Spend:    $${tokenSpend.toFixed(2)}`);
    console.log(`  Budget:   $${DAILY_BUDGET}`);
    console.log(`  Overspend: ${tokenSpend > DAILY_BUDGET ? `⚠️  ${tokenOverspendPct}%` : '✅ None'}`);

    // --- Test 2: PID Pacer ---
    console.log('\n--- PID Pacer ---');
    const pidRedis = new SimRedisClient() as any;
    await pidRedis.set(`budget:limit:${CAMPAIGN_ID}`, String(DAILY_BUDGET));

    const pidPacer = new PIDPacer(pidRedis, logger);
    let pidAllowed = 0;
    let pidBlocked = 0;
    let pidSpend = 0;

    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        // Track spend in Redis for PID to read
        await pidRedis.set(`budget:spend:${CAMPAIGN_ID}`, String(pidSpend));

        const allowed = await pidPacer.checkPacing(CAMPAIGN_ID, BID_COST);
        if (allowed) {
            pidAllowed++;
            pidSpend += BID_COST;
        } else {
            pidBlocked++;
        }
        await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL_MS));
    }

    const pidOverspendPct = ((pidSpend - DAILY_BUDGET) / DAILY_BUDGET * 100).toFixed(1);

    console.log(`  Allowed:  ${pidAllowed}`);
    console.log(`  Blocked:  ${pidBlocked}`);
    console.log(`  Spend:    $${pidSpend.toFixed(2)}`);
    console.log(`  Budget:   $${DAILY_BUDGET}`);
    console.log(`  Overspend: ${pidSpend > DAILY_BUDGET ? `⚠️  ${pidOverspendPct}%` : '✅ None'}`);

    // --- Summary ---
    console.log('\n' + '='.repeat(60));
    console.log('  SIMULATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`  Token Bucket: ${tokenSpend <= DAILY_BUDGET * 1.05 ? '✅ PASS' : '❌ FAIL'} ($${tokenSpend.toFixed(2)} / $${DAILY_BUDGET})`);
    console.log(`  PID Pacer:    ${pidSpend <= DAILY_BUDGET * 1.10 ? '✅ PASS' : '❌ FAIL'} ($${pidSpend.toFixed(2)} / $${DAILY_BUDGET})`);
    console.log('  (Token Bucket: ≤5% overshoot ok, PID: ≤10% overshoot ok)');
    console.log('='.repeat(60));
}

runSimulation().catch(console.error);
