export interface EconomicScorecard {
    name: string;
    type: 'SSP' | 'EXCHANGE' | 'RESELLER' | 'PUBLISHER';
    efficiencyScore: number;  // 0-100
    integrityScore: number;   // 0-100
    taxRating: 'A+' | 'A' | 'B' | 'C-' | 'D+';
    stabilityRating: 'A+' | 'A' | 'B' | 'C' | 'D';
    fraudExposureRating: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PortfolioRecord {
    category: string; // e.g. "Americas Media", "APAC Video", "EMEA Display"
    agency: string;
    spendUsd: number;
    workingMediaPct: number;
    intermediaryTaxPct: number;
    fraudExposurePct: number;
}

export interface IntermediaryCostItem {
    label: string;
    pct: number;
    costUsd: number;
    description: string;
}

export const ECONOMIC_MATRIX: EconomicScorecard[] = [
    {
        name: 'GoogleAdManager',
        type: 'SSP',
        efficiencyScore: 98,
        integrityScore: 98,
        taxRating: 'A+',
        stabilityRating: 'A+',
        fraudExposureRating: 'LOW'
    },
    {
        name: 'PubMatic',
        type: 'SSP',
        efficiencyScore: 91,
        integrityScore: 94,
        taxRating: 'A-',
        stabilityRating: 'A',
        fraudExposureRating: 'LOW'
    },
    {
        name: 'OpenX Exchange',
        type: 'EXCHANGE',
        efficiencyScore: 74,
        integrityScore: 80,
        taxRating: 'C-',
        stabilityRating: 'B',
        fraudExposureRating: 'MEDIUM'
    },
    {
        name: 'Magnite SSP',
        type: 'SSP',
        efficiencyScore: 61,
        integrityScore: 68,
        taxRating: 'D+',
        stabilityRating: 'C',
        fraudExposureRating: 'HIGH'
    }
];

export const PORTFOLIO_DATA: PortfolioRecord[] = [
    {
        category: 'North America CTV',
        agency: 'Horizon Group',
        spendUsd: 1450000,
        workingMediaPct: 91.2,
        intermediaryTaxPct: 6.8,
        fraudExposurePct: 2.0
    },
    {
        category: 'EMEA Premium Video',
        agency: 'Publicis Core',
        spendUsd: 890000,
        workingMediaPct: 82.4,
        intermediaryTaxPct: 11.6,
        fraudExposurePct: 6.0
    },
    {
        category: 'LATAM Mobile Web',
        agency: 'OMD South',
        spendUsd: 420000,
        workingMediaPct: 49.0,
        intermediaryTaxPct: 40.0,
        fraudExposurePct: 11.0
    },
    {
        category: 'APAC programmatic Video',
        agency: 'Dentsu East',
        spendUsd: 780000,
        workingMediaPct: 88.5,
        intermediaryTaxPct: 8.5,
        fraudExposurePct: 3.0
    }
];

export const BASE_INTERMEDIARY_TAX: IntermediaryCostItem[] = [
    { label: 'DSP Fee Structure', pct: 12, costUsd: 0.12, description: 'Standard buy-side execution seat license' },
    { label: 'SSP Layer 1 Extraction', pct: 8, costUsd: 0.08, description: 'Sell-side standard clearing margin' },
    { label: 'Reseller Inflation Tax', pct: 14, costUsd: 0.14, description: 'Multi-path duplicate reseller markups' },
    { label: 'Exchange Arbitrage Spikes', pct: 6, costUsd: 0.06, description: 'Intermediary hop liquidity markups' },
    { label: 'Fraud & MFA Leakage', pct: 11, costUsd: 0.11, description: 'Thermal MFA inventory losses' }
];

export interface ScenarioSimulationResult {
    workingMediaChange: number;
    quarterlySavings: number;
    latencyDeltaMs: number;
    bidDuplicationReduction: number;
    confidence: number;
}

export function runDigitalTwinSimulation(
    removeSspX: boolean,
    enableDirectRouting: boolean,
    bypassArbitrage: boolean,
    mfaSuppression: boolean
): ScenarioSimulationResult {
    let workingMediaChange = 0;
    let quarterlySavings = 0;
    let latencyDeltaMs = 0;
    let bidDuplicationReduction = 0;
    let confidence = 85;

    if (removeSspX) {
        workingMediaChange += 14.2;
        quarterlySavings += 480000;
        latencyDeltaMs -= 22;
        bidDuplicationReduction += 38;
        confidence += 3;
    }
    if (enableDirectRouting) {
        workingMediaChange += 8.4;
        quarterlySavings += 290000;
        latencyDeltaMs -= 14;
        bidDuplicationReduction += 24;
        confidence += 4;
    }
    if (bypassArbitrage) {
        workingMediaChange += 6.2;
        quarterlySavings += 180000;
        latencyDeltaMs -= 8;
        bidDuplicationReduction += 15;
    }
    if (mfaSuppression) {
        workingMediaChange += 11.0;
        quarterlySavings += 370000;
        latencyDeltaMs -= 4;
        bidDuplicationReduction += 12;
        confidence += 2;
    }

    return {
        workingMediaChange: parseFloat(workingMediaChange.toFixed(1)),
        quarterlySavings,
        latencyDeltaMs,
        bidDuplicationReduction,
        confidence: Math.min(99, confidence)
    };
}

export function generateBoardroomReport(quarterlySavings: number, workingMediaPct: number): string {
    return `BOARDROOM FINANCIAL AUDIT SUMMARY - Q2 2026

1. EXECUTIVE BRIEF
CleanPath AI successfully audited programmatic spend allocations across all portfolio segments. Buy-side consolidation actions successfully isolated hidden intermediary extractions, enhancing clean media delivery and reducing duplications.

2. KEY RISK CONSTRAINTS
- Duplicate Reseller Arbitrage: Accounts for 14.2% of structural spend inflation in LATAM pipelines.
- CTV Emulator Spikes: 11% leakage attributed to unverified residential proxy streams.

3. SUPPLY PATH AUDIT METRICS
- Current Working Media: ${workingMediaPct}%
- Projected Q2 Total Savings: $${quarterlySavings.toLocaleString()}
- Average Intermediary Tax: ${parseFloat((100 - workingMediaPct - 11).toFixed(1))}%

4. RECOMMENDED BOARD ACTIONS
- Eliminate duplicate resale hubs on Magnite endpoints.
- Establish private marketplace direct pipelines via GoogleAdManager and PubMatic.`;
}
