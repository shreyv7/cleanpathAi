/**
 * Financial Service
 * Frontend service layer for the Financial Core API.
 * Replaces mock financial data with real API calls.
 *
 * Governance Reset v1 — Phase 3: Dashboard Realization
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-change-in-production';

export interface FinancialSummary {
    totalCampaigns: number;
    totalDecisions: number;
    totalSpend: number;
    totalBlocked: number;
    overallWorkingMediaPercent: number;
    averageBlockRate: number;
    totalSavingsFromShading: number;
}

export interface WorkingMediaResult {
    campaignId: string;
    period: { start: string; end: string };
    totalSpend: number;
    blockedSpend: number;
    reroutedSpend: number;
    supplyChainFees: number;
    workingMediaDollars: number;
    workingMediaPercent: number;
    wasteRecovered: number;
    totalDecisions: number;
    blockRate: number;
    averageProcessingMs: number;
}

export interface WasteRecoveredResult {
    wasteRecovered: number;
    blockedDecisions: number;
    savingsFromShading: number;
    totalRecovered: number;
}

export interface SpendTimelinePoint {
    date: string;
    totalSpend: number;
    blockedSpend: number;
    workingMediaPercent: number;
}

/**
 * Fetch global financial summary for the executive dashboard.
 */
export async function fetchFinancialSummary(): Promise<FinancialSummary> {
    try {
        const response = await fetch(`${API_BASE_URL}/financial/summary`, {
            headers: { 'X-API-Key': API_KEY }
        });
        if (!response.ok) throw new Error('Failed to fetch financial summary');
        return response.json();
    } catch (error) {
        console.error('financialService: fetchFinancialSummary failed', error);
        return {
            totalCampaigns: 0,
            totalDecisions: 0,
            totalSpend: 0,
            totalBlocked: 0,
            overallWorkingMediaPercent: 0,
            averageBlockRate: 0,
            totalSavingsFromShading: 0,
        };
    }
}

/**
 * Fetch Working Media % for a specific campaign.
 */
export async function fetchWorkingMedia(
    campaignId: string,
    start?: string,
    end?: string
): Promise<WorkingMediaResult> {
    try {
        let url = `${API_BASE_URL}/financial/working-media/${campaignId}`;
        const params = new URLSearchParams();
        if (start) params.set('start', start);
        if (end) params.set('end', end);
        if (params.toString()) url += `?${params}`;

        const response = await fetch(url, {
            headers: { 'X-API-Key': API_KEY }
        });
        if (!response.ok) throw new Error('Failed to fetch working media');
        return response.json();
    } catch (error) {
        console.error('financialService: fetchWorkingMedia failed', error);
        return {
            campaignId,
            period: { start: start || 'all-time', end: end || 'now' },
            totalSpend: 0,
            blockedSpend: 0,
            reroutedSpend: 0,
            supplyChainFees: 0,
            workingMediaDollars: 0,
            workingMediaPercent: 0,
            wasteRecovered: 0,
            totalDecisions: 0,
            blockRate: 0,
            averageProcessingMs: 0,
        };
    }
}

/**
 * Fetch waste recovered stats.
 */
export async function fetchWasteRecovered(campaignId?: string): Promise<WasteRecoveredResult> {
    try {
        const url = campaignId
            ? `${API_BASE_URL}/financial/waste-recovered/${campaignId}`
            : `${API_BASE_URL}/financial/waste-recovered`;
        const response = await fetch(url, {
            headers: { 'X-API-Key': API_KEY }
        });
        if (!response.ok) throw new Error('Failed to fetch waste recovered');
        return response.json();
    } catch (error) {
        console.error('financialService: fetchWasteRecovered failed', error);
        return {
            wasteRecovered: 0,
            blockedDecisions: 0,
            savingsFromShading: 0,
            totalRecovered: 0,
        };
    }
}

/**
 * Fetch spend timeline for charts.
 */
export async function fetchSpendTimeline(
    campaignId: string,
    days: number = 30
): Promise<SpendTimelinePoint[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/financial/spend-timeline/${campaignId}?days=${days}`,
            { headers: { 'X-API-Key': API_KEY } }
        );
        if (!response.ok) throw new Error('Failed to fetch spend timeline');
        const data = await response.json();
        return data.timeline || [];
    } catch (error) {
        console.error('financialService: fetchSpendTimeline failed', error);
        return [];
    }
}

/**
 * Fetch campaign budgets from the budgets API.
 */
export async function fetchCampaignBudgets(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/budgets`, {
            headers: { 'X-API-Key': API_KEY }
        });
        if (!response.ok) throw new Error('Failed to fetch campaign budgets');
        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('financialService: fetchCampaignBudgets failed', error);
        return [];
    }
}
