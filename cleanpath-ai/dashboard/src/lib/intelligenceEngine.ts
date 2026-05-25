export interface ThreatFamily {
    id: string;
    name: string;
    traits: string[];
    firstSeenDaysAgo: number;
    activeRegions: string[];
    riskPressure: number; // 0-100
    feeExtractionPct: string;
    status: 'ACTIVE' | 'MITIGATED' | 'MONITORING';
    description: string;
}

export interface EntityRecord {
    name: string;
    type: 'SSP' | 'RESELLER' | 'DEVICE_FARM' | 'PUBLISHER';
    observedIncidentsCount: number;
    historicalIntegrityScores: number[]; // Last 4 periods: e.g. [88, 79, 71, 61]
    associatedFamilies: string[];
    priorLeakageUsd: number;
    correlationStrength: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PredictivePoint {
    hour: number;
    instabilityProb: number;
    leakageUsd: number;
    sspDegradationRisk: number;
}

export interface RootCauseDecomposition {
    primaryCause: string;
    factors: { title: string; description: string; score: number }[];
    impactScore: number;
    suggestedAction: string;
}

export const THREAT_FAMILIES: ThreatFamily[] = [
    {
        id: 'fam_hydra7',
        name: 'HYDRA-7',
        traits: ['Duplicate reseller paths', 'Roku emulator spoofing', 'Aggressive refresh cadence', 'LATAM traffic concentration', '18–24% fee extraction pattern'],
        firstSeenDaysAgo: 42,
        activeRegions: ['LATAM', 'EMEA'],
        riskPressure: 84,
        feeExtractionPct: '18% - 24%',
        status: 'ACTIVE',
        description: 'Coordinated emulator farm targeting Roku inventory via duplicate reseller routes to bypass standard ads.cert verification.'
    },
    {
        id: 'fam_specter4',
        name: 'SPECTER-4',
        traits: ['MFA arbitrage looping', 'Rapid domain rotation', 'APAC traffic concentration', 'Hidden intermediary hops', '12% cumulative markup'],
        firstSeenDaysAgo: 15,
        activeRegions: ['APAC', 'EMEA'],
        riskPressure: 58,
        feeExtractionPct: '10% - 15%',
        status: 'MONITORING',
        description: 'Aggressive multi-hop exchange arbitrage chain dynamically rerouting bids to unverified publishers using rotating domains.'
    },
    {
        id: 'fam_vortex9',
        name: 'VORTEX-9',
        traits: ['Residential proxy spoofing', 'Desktop TV bundle spoofing', 'Global distribution', 'IFA rotation', '35% direct media tax'],
        firstSeenDaysAgo: 7,
        activeRegions: ['North America', 'EMEA'],
        riskPressure: 92,
        feeExtractionPct: '30% - 38%',
        status: 'ACTIVE',
        description: 'Sophisticated spoof cluster proxying standard desktop bidstreams to represent premium CTV targets in high-value NA auctions.'
    }
];

export const ENTITY_DIRECTORY: EntityRecord[] = [
    {
        name: 'Magnite SSP',
        type: 'SSP',
        observedIncidentsCount: 142,
        historicalIntegrityScores: [88, 79, 71, 61],
        associatedFamilies: ['HYDRA-7', 'VORTEX-9'],
        priorLeakageUsd: 4200000,
        correlationStrength: 'HIGH'
    },
    {
        name: 'OpenX Exchange',
        type: 'SSP',
        observedIncidentsCount: 89,
        historicalIntegrityScores: [94, 91, 84, 76],
        associatedFamilies: ['SPECTER-4'],
        priorLeakageUsd: 1850000,
        correlationStrength: 'MEDIUM'
    },
    {
        name: 'PubMatic',
        type: 'SSP',
        observedIncidentsCount: 32,
        historicalIntegrityScores: [98, 96, 94, 91],
        associatedFamilies: [],
        priorLeakageUsd: 450000,
        correlationStrength: 'LOW'
    },
    {
        name: 'Roku Emulator Farm (LATAM)',
        type: 'DEVICE_FARM',
        observedIncidentsCount: 204,
        historicalIntegrityScores: [52, 38, 20, 8],
        associatedFamilies: ['HYDRA-7'],
        priorLeakageUsd: 2900000,
        correlationStrength: 'HIGH'
    }
];

export function generatePredictiveData(basePressure: number): PredictivePoint[] {
    const data: PredictivePoint[] = [];
    for (let i = 0; i <= 48; i += 6) {
        const factor = Math.sin(i / 10) * 0.15 + 1;
        data.push({
            hour: i,
            instabilityProb: Math.min(99, Math.round((basePressure * 0.8 + i * 0.3) * factor)),
            leakageUsd: Math.round((basePressure * 3.5 + i * 8) * factor),
            sspDegradationRisk: Math.min(99, Math.round((basePressure * 0.6 + i * 0.4) * factor))
        });
    }
    return data;
}

export function getRootCause(incidentType: string): RootCauseDecomposition {
    if (incidentType === 'SPOOFING' || incidentType === 'CRITICAL') {
        return {
            primaryCause: 'Duplicate reseller arbitrage chain (Magnite/OpenX hub)',
            factors: [
                { title: 'SSP trust degradation', description: 'Exchange nodes failed to enforce ads.txt verification bounds', score: 85 },
                { title: 'Emulator signature reuse', description: 'Roku device signatures cloned and broadcast simultaneously', score: 92 },
                { title: 'Route inflation', description: 'Bid paths stacked with 4 redundant intermediary exchange hops', score: 74 },
                { title: 'Geo entropy mismatch', description: 'Device timezone differed from client IP block routing', score: 68 }
            ],
            impactScore: 88,
            suggestedAction: 'Enforce direct-path buy-side consolidation; bypass Magnite resale loops on LATAM endpoints.'
        };
    }
    return {
        primaryCause: 'Multi-hop exchange arbitrage chain (SPECTER-4 family)',
        factors: [
            { title: 'MFA domain rotations', description: 'Dynamic publisher networks rotating domain mappings under 5s', score: 78 },
            { title: 'Hidden markup tax', description: 'Supply intermediaries stacking 14% unnecessary auction margins', score: 82 },
            { title: 'Publisher trust decay', description: 'Target sites falling below minimum programmatic viewability indices', score: 60 }
        ],
        impactScore: 62,
        suggestedAction: 'Engage pacing suppression constraints; reroute open auctions directly to clean private marketplaces.'
    };
}

export function parseInvestigatorPrompt(prompt: string): string {
    const p = prompt.toLowerCase().trim();

    if (p.includes('hydra') || p.includes('fam_hydra7')) {
        return `[INTELLIGENCE AT-A-GLANCE: HYDRA-7 THREAT FAMILY]
- CLASSIFICATION: High-Density Reseller Spoofing Loop
- CORE TRAIT: Multi-path bid duplication & CTV emulator injection.
- ACTIVE ATTRIBUTION: Coordinated farm operating out of LATAM regional subnets.
- SSP EMBEDDINGS: 84% correlation to Magnite reseller configurations.
- MITIGATION VECTOR: Direct-path rerouting active. Prevents duplicate auctions.
- FINANCIAL FORECAST: Prevents an estimated $12,400 in hidden supply markup per hour.`;
    }

    if (p.includes('vortex') || p.includes('fam_vortex9')) {
        return `[INTELLIGENCE AT-A-GLANCE: VORTEX-9 THREAT FAMILY]
- CLASSIFICATION: Premium CTV Spoofing Network
- CORE TRAIT: Direct residential proxy node clusters.
- ACTIVE ATTRIBUTION: Highly sophisticated emulator rigs mimicking AppleTV & Roku signatures.
- RISK LEVEL: CRITICAL (92% pressure index).
- SYSTEM IMPACT: Stacks up to 35% duplicate fee markups on unshaded bids.
- REACTION: Edge gatekeeper auto-blocking and shading active.`;
    }

    if (p.includes('magnite') || p.includes('ssp')) {
        return `[ENTITY RECONSTRUCTION: MAGNITE SSP]
- TYPE: Programmatic Sell-Side Platform Hub
- INTEGRITY PROFILE: 88% -> 61% degradation over 90 days.
- INCIDENT LOG: 142 historical anomalies recorded.
- ASSOCIATED THREATS: HYDRA-7, VORTEX-9.
- RECOMMENDATION: Consolidate NA/LATAM inventory directly via alternative PMP nodes. Direct paths yield +14.2% media efficiency.`;
    }

    if (p.includes('forecast') || p.includes('predict')) {
        return `[PREDICTIVE ESCALATION MODEL: 48H HORIZON]
- ROUTE INSTABILITY PROBABILITY: Trending toward 74% in NA clusters.
- EST. PROBABLE LEAKAGE: $340 - $480/min if duplicate paths remain unmitigated.
- POTENTIAL RECOVERY: Direct path consolidation mitigates 92.4% of forecasted exposure.`;
    }

    return `[CLEANPATH COGNITIVE ASSISTANT CORE]
Supported Commands:
- "analyze hydra" -> Audit the active HYDRA-7 threat family profile.
- "analyze vortex" -> Audit the critical VORTEX-9 CTV spoof cluster.
- "inspect magnite" -> Fetch historical integrity audit of Magnite SSP.
- "forecast risk" -> Load predictive risk analysis over the next 48 hours.`;
}

export function generateOperationalNarrative(incidentsCount: number, savings: number): string {
    return `Over the last 6 hours, CleanPath identified a coordinated CTV spoofing escalation affecting Roku inventory across LATAM reseller chains. 

The attack leveraged duplicate SSP paths and emulator-based device signatures to inflate premium streaming CPMs.

The system automatically rerouted 71% of affected traffic and applied aggressive buy-side bid shading, preventing an estimated $${savings.toLocaleString('en-US', { maximumFractionDigits: 0 })} in programmatic intermediary leakage. The current threat pressure index is controlled.`;
}
