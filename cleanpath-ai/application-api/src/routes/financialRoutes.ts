/**
 * Financial Routes
 * API endpoints for Working Media %, Waste Recovered, and financial analytics.
 *
 * Governance Reset v1 — Phase 2: Financial Core
 */

import { Router, Request, Response } from 'express';
import { WorkingMediaCalculator } from '../services/WorkingMediaCalculator';

const router = Router();
const calculator = new WorkingMediaCalculator();

/**
 * GET /api/financial/summary
 * Global financial summary across all campaigns.
 */
router.get('/summary', async (_req: Request, res: Response) => {
    try {
        const summary = await calculator.getFinancialSummary();
        res.json(summary);
    } catch (e) {
        console.error('Financial summary error:', e);
        res.status(500).json({ error: 'Failed to compute financial summary' });
    }
});

/**
 * GET /api/financial/working-media/:campaignId
 * Working Media % for a specific campaign.
 * Query params: ?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
router.get('/working-media/:campaignId', async (req: Request, res: Response) => {
    try {
        const { campaignId } = req.params;
        const { start, end } = req.query;

        const result = await calculator.computeForCampaign(
            campaignId,
            start as string | undefined,
            end as string | undefined
        );

        res.json(result);
    } catch (e) {
        console.error('Working media error:', e);
        res.status(500).json({ error: 'Failed to compute working media' });
    }
});

/**
 * GET /api/financial/waste-recovered/:campaignId?
 * Waste recovered by blocking fraudulent bids.
 * campaignId is optional — omit for global stats.
 */
router.get('/waste-recovered/:campaignId?', async (req: Request, res: Response) => {
    try {
        const { campaignId } = req.params;
        const result = await calculator.computeWasteRecovered(campaignId || undefined);
        res.json(result);
    } catch (e) {
        console.error('Waste recovered error:', e);
        res.status(500).json({ error: 'Failed to compute waste recovered' });
    }
});

/**
 * GET /api/financial/spend-timeline/:campaignId
 * Daily spend timeline for charts.
 * Query params: ?days=30
 */
router.get('/spend-timeline/:campaignId', async (req: Request, res: Response) => {
    try {
        const { campaignId } = req.params;
        const days = parseInt(req.query.days as string) || 30;

        const timeline = await calculator.getSpendTimeline(campaignId, days);
        res.json({ campaignId, days, timeline });
    } catch (e) {
        console.error('Spend timeline error:', e);
        res.status(500).json({ error: 'Failed to compute spend timeline' });
    }
});

/**
 * POST /api/financial/record-decision
 * Record an edge decision to the financial log.
 * Called by the edge gatekeeper after making a decision.
 */
router.post('/record-decision', async (req: Request, res: Response) => {
    try {
        const {
            requestId,
            campaignId,
            decision,
            decisionSource,
            thermalScore,
            ctvRiskScore,
            bidValueUsd,
            shadedBidUsd,
            savingsUsd,
            publisherId,
            domain,
            processingTimeMs,
            blockReason,
            rerouteTarget,
            supplyChainFeePct,
        } = req.body;

        if (!requestId || !decision) {
            res.status(400).json({ error: 'requestId and decision are required' });
            return;
        }

        await calculator.recordDecision({
            requestId,
            campaignId,
            decision,
            decisionSource,
            thermalScore,
            ctvRiskScore,
            bidValueUsd,
            shadedBidUsd,
            savingsUsd,
            publisherId,
            domain,
            processingTimeMs,
            blockReason,
            rerouteTarget,
            supplyChainFeePct,
        });

        res.status(201).json({ status: 'recorded' });
    } catch (e) {
        console.error('Record decision error:', e);
        res.status(500).json({ error: 'Failed to record decision' });
    }
});

export default router;
