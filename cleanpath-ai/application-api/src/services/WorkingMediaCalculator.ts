/**
 * Working Media Calculator
 * Core financial computation engine for CleanPath AI.
 *
 * Working Media % = (Total Spend - Blocked Spend - Supply Chain Fees) / Total Spend × 100
 * Waste Recovered = Σ (blocked_bid_value)
 *
 * Governance Reset v1 — Phase 2: Financial Core
 */

import { query } from '../database/db';

export interface WorkingMediaResult {
    campaignId: string;
    period: { start: string; end: string };
    totalSpend: number;              // Total bid value of ALLOW decisions
    blockedSpend: number;            // Sum of bid values for BLOCK decisions
    reroutedSpend: number;           // Sum of bid values for REROUTE decisions
    supplyChainFees: number;         // Estimated from graph path fees
    workingMediaDollars: number;     // totalSpend - supplyChainFees
    workingMediaPercent: number;     // workingMediaDollars / (totalSpend + blockedSpend) × 100
    wasteRecovered: number;          // blockedSpend (money NOT wasted)
    totalDecisions: number;
    blockRate: number;               // blockedCount / totalDecisions × 100
    averageProcessingMs: number;
}

export interface SpendTimelinePoint {
    date: string;
    totalSpend: number;
    blockedSpend: number;
    workingMediaPercent: number;
}

export interface FinancialSummary {
    totalCampaigns: number;
    totalDecisions: number;
    totalSpend: number;
    totalBlocked: number;
    overallWorkingMediaPercent: number;
    averageBlockRate: number;
    totalSavingsFromShading: number;
}

export class WorkingMediaCalculator {

    /**
     * Compute Working Media % for a specific campaign over a time period.
     */
    async computeForCampaign(
        campaignId: string,
        startDate?: string,
        endDate?: string
    ): Promise<WorkingMediaResult> {
        const dateFilter = this.buildDateFilter(startDate, endDate);
        const params: any[] = [campaignId];
        let paramIndex = 2;

        let dateClause = '';
        if (startDate) {
            dateClause += ` AND created_at >= $${paramIndex++}`;
            params.push(startDate);
        }
        if (endDate) {
            dateClause += ` AND created_at <= $${paramIndex++}`;
            params.push(endDate);
        }

        const result = await query(`
            SELECT
                COUNT(*)::int AS total_decisions,
                COALESCE(SUM(CASE WHEN decision = 'allow' THEN bid_value_usd ELSE 0 END), 0)::numeric AS total_spend,
                COALESCE(SUM(CASE WHEN decision = 'block' THEN bid_value_usd ELSE 0 END), 0)::numeric AS blocked_spend,
                COALESCE(SUM(CASE WHEN decision = 'reroute' THEN bid_value_usd ELSE 0 END), 0)::numeric AS rerouted_spend,
                COALESCE(SUM(CASE WHEN decision = 'allow' THEN bid_value_usd * COALESCE(supply_chain_fee_pct, 0) ELSE 0 END), 0)::numeric AS supply_chain_fees,
                COUNT(CASE WHEN decision = 'block' THEN 1 END)::int AS blocked_count,
                COALESCE(AVG(processing_time_ms), 0)::numeric AS avg_processing_ms,
                COALESCE(SUM(savings_usd), 0)::numeric AS total_savings
            FROM decision_log
            WHERE campaign_id = $1 ${dateClause}
        `, params);

        const row = result.rows[0];
        const totalSpend = parseFloat(row.total_spend);
        const blockedSpend = parseFloat(row.blocked_spend);
        const reroutedSpend = parseFloat(row.rerouted_spend);
        const supplyChainFees = parseFloat(row.supply_chain_fees);
        const totalDecisions = parseInt(row.total_decisions);
        const blockedCount = parseInt(row.blocked_count);
        const avgProcessingMs = parseFloat(row.avg_processing_ms);

        const totalBidVolume = totalSpend + blockedSpend + reroutedSpend;
        
        // AllowedSpend - FeeStackingLoss - FraudBlockedValue
        const workingMediaDollars = totalSpend - supplyChainFees - blockedSpend;
        const workingMediaPercent = totalBidVolume > 0
            ? (workingMediaDollars / totalBidVolume) * 100
            : 0;
        const blockRate = totalDecisions > 0
            ? (blockedCount / totalDecisions) * 100
            : 0;

        return {
            campaignId,
            period: {
                start: startDate || 'all-time',
                end: endDate || 'now',
            },
            totalSpend: this.round(totalSpend),
            blockedSpend: this.round(blockedSpend),
            reroutedSpend: this.round(reroutedSpend),
            supplyChainFees: this.round(supplyChainFees),
            workingMediaDollars: this.round(workingMediaDollars),
            workingMediaPercent: this.round(workingMediaPercent, 2),
            wasteRecovered: this.round(blockedSpend),
            totalDecisions,
            blockRate: this.round(blockRate, 2),
            averageProcessingMs: this.round(avgProcessingMs, 3),
        };
    }

    /**
     * Compute Waste Recovered across all campaigns or a specific campaign.
     */
    async computeWasteRecovered(campaignId?: string): Promise<{
        wasteRecovered: number;
        blockedDecisions: number;
        savingsFromShading: number;
        totalRecovered: number;
    }> {
        const whereClause = campaignId ? 'WHERE campaign_id = $1' : '';
        const params = campaignId ? [campaignId] : [];

        const result = await query(`
            SELECT
                COALESCE(SUM(CASE WHEN decision = 'block' THEN bid_value_usd ELSE 0 END), 0)::numeric AS waste_recovered,
                COUNT(CASE WHEN decision = 'block' THEN 1 END)::int AS blocked_decisions,
                COALESCE(SUM(savings_usd), 0)::numeric AS savings_from_shading,
                COALESCE(SUM(CASE WHEN decision = 'reroute' THEN savings_usd ELSE 0 END), 0)::numeric AS reroute_savings
            FROM decision_log
            ${whereClause}
        `, params);

        const row = result.rows[0];
        const wasteRecovered = parseFloat(row.waste_recovered);
        const savingsFromShading = parseFloat(row.savings_from_shading);
        const rerouteSavings = parseFloat(row.reroute_savings);

        return {
            wasteRecovered: this.round(wasteRecovered),
            blockedDecisions: parseInt(row.blocked_decisions),
            savingsFromShading: this.round(savingsFromShading),
            totalRecovered: this.round(wasteRecovered + savingsFromShading + rerouteSavings),
        };
    }

    /**
     * Get spend timeline for charts (daily aggregation).
     */
    async getSpendTimeline(
        campaignId: string,
        days: number = 30
    ): Promise<SpendTimelinePoint[]> {
        const result = await query(`
            SELECT
                DATE(created_at) AS date,
                COALESCE(SUM(CASE WHEN decision = 'allow' THEN bid_value_usd ELSE 0 END), 0)::numeric AS total_spend,
                COALESCE(SUM(CASE WHEN decision = 'block' THEN bid_value_usd ELSE 0 END), 0)::numeric AS blocked_spend,
                COUNT(*)::int AS total_decisions
            FROM decision_log
            WHERE campaign_id = $1
                AND created_at >= NOW() - INTERVAL '1 day' * $2
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [campaignId, days]);

        return result.rows.map(row => {
            const totalSpend = parseFloat(row.total_spend);
            const blockedSpend = parseFloat(row.blocked_spend);
            const totalBidVolume = totalSpend + blockedSpend;
            const workingMediaPercent = totalBidVolume > 0
                ? (totalSpend / totalBidVolume) * 100
                : 100;

            return {
                date: row.date,
                totalSpend: this.round(totalSpend),
                blockedSpend: this.round(blockedSpend),
                workingMediaPercent: this.round(workingMediaPercent, 2),
            };
        });
    }

    /**
     * Get global financial summary across all campaigns.
     */
    async getFinancialSummary(): Promise<FinancialSummary> {
        const result = await query(`
            SELECT
                COUNT(DISTINCT campaign_id)::int AS total_campaigns,
                COUNT(*)::int AS total_decisions,
                COALESCE(SUM(CASE WHEN decision = 'allow' THEN bid_value_usd ELSE 0 END), 0)::numeric AS total_spend,
                COALESCE(SUM(CASE WHEN decision = 'block' THEN bid_value_usd ELSE 0 END), 0)::numeric AS total_blocked,
                COUNT(CASE WHEN decision = 'block' THEN 1 END)::int AS blocked_count,
                COALESCE(SUM(savings_usd), 0)::numeric AS total_savings
            FROM decision_log
        `);

        const row = result.rows[0];
        const totalSpend = parseFloat(row.total_spend);
        const totalBlocked = parseFloat(row.total_blocked);
        const totalBidVolume = totalSpend + totalBlocked;
        const totalDecisions = parseInt(row.total_decisions);
        const blockedCount = parseInt(row.blocked_count);

        return {
            totalCampaigns: parseInt(row.total_campaigns),
            totalDecisions,
            totalSpend: this.round(totalSpend),
            totalBlocked: this.round(totalBlocked),
            overallWorkingMediaPercent: totalBidVolume > 0
                ? this.round((totalSpend / totalBidVolume) * 100, 2)
                : 100,
            averageBlockRate: totalDecisions > 0
                ? this.round((blockedCount / totalDecisions) * 100, 2)
                : 0,
            totalSavingsFromShading: this.round(parseFloat(row.total_savings)),
        };
    }

    /**
     * Record an edge decision to the financial log.
     * Called from the edge pipeline after each decision.
     */
    async recordDecision(params: {
        requestId: string;
        campaignId?: string;
        decision: string;
        decisionSource?: string;
        thermalScore?: number;
        ctvRiskScore?: number;
        bidValueUsd?: number;
        shadedBidUsd?: number;
        savingsUsd?: number;
        publisherId?: string;
        domain?: string;
        processingTimeMs?: number;
        blockReason?: string;
        rerouteTarget?: string;
        supplyChainFeePct?: number;
    }): Promise<void> {
        await query(`
            INSERT INTO decision_log (
                request_id, campaign_id, decision, decision_source,
                thermal_score, ctv_risk_score, bid_value_usd,
                shaded_bid_usd, savings_usd, publisher_id, domain,
                processing_time_ms, block_reason, reroute_target,
                supply_chain_fee_pct
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            )
        `, [
            params.requestId,
            params.campaignId || null,
            params.decision,
            params.decisionSource || null,
            params.thermalScore || null,
            params.ctvRiskScore || null,
            params.bidValueUsd || null,
            params.shadedBidUsd || null,
            params.savingsUsd || null,
            params.publisherId || null,
            params.domain || null,
            params.processingTimeMs || null,
            params.blockReason || null,
            params.rerouteTarget || null,
            params.supplyChainFeePct || null,
        ]);
    }

    private buildDateFilter(startDate?: string, endDate?: string): string {
        const parts: string[] = [];
        if (startDate) parts.push(`created_at >= '${startDate}'`);
        if (endDate) parts.push(`created_at <= '${endDate}'`);
        return parts.length > 0 ? `AND ${parts.join(' AND ')}` : '';
    }

    private round(value: number, decimals: number = 6): number {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
}
