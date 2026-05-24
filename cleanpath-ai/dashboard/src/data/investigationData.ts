/**
 * Investigation Workspace — Enterprise Intelligence Data Layer
 * Rich, internally-consistent, interconnected operational data
 * that feels like it has memory and institutional knowledge.
 */

// ============================================================
// ENTITY PROFILES — Publisher & SSP Intelligence
// ============================================================

export interface EntityProfile {
    id: string;
    domain: string;
    displayName: string;
    type: 'publisher' | 'ssp' | 'dsp' | 'exchange' | 'reseller';
    riskClassification: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW' | 'CLEAN';
    threatSeverity: number; // 0-100
    integrityScore: number; // 0-100
    pathToxicityScore: number; // 0-100
    fraudLikelihood: number; // percentage
    region: string;
    firstSeen: string;
    lastActive: string;
    spendExposure: number;
    historicalReputation: 'TRUSTED' | 'DEGRADED' | 'BLACKLISTED' | 'UNDER_REVIEW';
    deviceDistribution: { type: string; percent: number }[];
    sspRelationships: string[];
    exchangeRelationships: string[];
    incidentCount: number;
    totalBidsProcessed: number;
    blockRate: number;
    avgCpm: number;
    bidDuplicationRate: number;
}

export const ENTITY_PROFILES: Record<string, EntityProfile> = {
    'fakebundle-spoof.xyz': {
        id: 'ent_001',
        domain: 'fakebundle-spoof.xyz',
        displayName: 'FakeBundle Spoof Network',
        type: 'publisher',
        riskClassification: 'CRITICAL',
        threatSeverity: 96,
        integrityScore: 4,
        pathToxicityScore: 92,
        fraudLikelihood: 98.2,
        region: 'Eastern Europe (UA/RO)',
        firstSeen: '2026-03-14T08:22:00Z',
        lastActive: '2026-05-24T15:33:41Z',
        spendExposure: 284750.00,
        historicalReputation: 'BLACKLISTED',
        deviceDistribution: [
            { type: 'Connected TV (Spoofed)', percent: 72 },
            { type: 'Desktop (Emulated)', percent: 18 },
            { type: 'Mobile (Proxy)', percent: 10 },
        ],
        sspRelationships: ['Magnite', 'OpenX', 'PubMatic (Resold)'],
        exchangeRelationships: ['Index Exchange', 'TripleLift'],
        incidentCount: 47,
        totalBidsProcessed: 892340,
        blockRate: 94.8,
        avgCpm: 2.40,
        bidDuplicationRate: 34.2,
    },
    'hulu.com': {
        id: 'ent_002',
        domain: 'hulu.com',
        displayName: 'Hulu Streaming (Verified)',
        type: 'publisher',
        riskClassification: 'ELEVATED',
        threatSeverity: 34,
        integrityScore: 71,
        pathToxicityScore: 41,
        fraudLikelihood: 8.4,
        region: 'United States (US-WEST)',
        firstSeen: '2025-11-02T10:00:00Z',
        lastActive: '2026-05-24T15:45:12Z',
        spendExposure: 1245000.00,
        historicalReputation: 'TRUSTED',
        deviceDistribution: [
            { type: 'Connected TV', percent: 84 },
            { type: 'Mobile App', percent: 12 },
            { type: 'Desktop Web', percent: 4 },
        ],
        sspRelationships: ['Magnite', 'FreeWheel', 'SpotX'],
        exchangeRelationships: ['The Trade Desk', 'DV360'],
        incidentCount: 3,
        totalBidsProcessed: 4521890,
        blockRate: 4.2,
        avgCpm: 18.50,
        bidDuplicationRate: 12.8,
    },
    'roku.freetv': {
        id: 'ent_003',
        domain: 'roku.freetv',
        displayName: 'Roku FreeTV Channel',
        type: 'publisher',
        riskClassification: 'HIGH',
        threatSeverity: 78,
        integrityScore: 22,
        pathToxicityScore: 74,
        fraudLikelihood: 67.5,
        region: 'United States (Mixed CDN)',
        firstSeen: '2026-01-18T14:30:00Z',
        lastActive: '2026-05-24T15:41:08Z',
        spendExposure: 567200.00,
        historicalReputation: 'UNDER_REVIEW',
        deviceDistribution: [
            { type: 'Connected TV', percent: 41 },
            { type: 'Desktop (Masquerading)', percent: 38 },
            { type: 'Mobile (Proxy)', percent: 21 },
        ],
        sspRelationships: ['Magnite', 'OpenX', 'Smaato'],
        exchangeRelationships: ['Index Exchange', 'Xandr'],
        incidentCount: 19,
        totalBidsProcessed: 1893450,
        blockRate: 62.1,
        avgCpm: 6.20,
        bidDuplicationRate: 28.4,
    },
};

// ============================================================
// SUPPLY PATH GRAPH TOPOLOGY
// ============================================================

export interface GraphNode {
    id: string;
    label: string;
    type: 'dsp' | 'ssp' | 'exchange' | 'publisher' | 'reseller' | 'gatekeeper';
    domain: string;
    riskScore: number;
    avgCpm: number;
    bidVolume: number;
    trustLevel: 'verified' | 'degraded' | 'suspicious' | 'blacklisted';
    x?: number;
    y?: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    type: 'BID_FLOW' | 'FEE_EXTRACT' | 'DUPLICATE' | 'REROUTE' | 'TRUST_DECAY';
    weight: number;
    feePercent: number;
    latencyMs: number;
    volume: number;
    suspicious: boolean;
}

export function getInvestigationGraph(entityId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const graphs: Record<string, { nodes: GraphNode[]; edges: GraphEdge[] }> = {
        'fakebundle-spoof.xyz': {
            nodes: [
                { id: 'n1', label: 'The Trade Desk', type: 'dsp', domain: 'thetradedesk.com', riskScore: 2, avgCpm: 22.40, bidVolume: 892340, trustLevel: 'verified' },
                { id: 'n2', label: 'CleanPath Edge', type: 'gatekeeper', domain: 'cleanpath.ai', riskScore: 0, avgCpm: 0, bidVolume: 892340, trustLevel: 'verified' },
                { id: 'n3', label: 'Magnite', type: 'ssp', domain: 'magnite.com', riskScore: 8, avgCpm: 18.20, bidVolume: 445000, trustLevel: 'verified' },
                { id: 'n4', label: 'OpenX', type: 'ssp', domain: 'openx.com', riskScore: 12, avgCpm: 14.80, bidVolume: 312000, trustLevel: 'degraded' },
                { id: 'n5', label: 'Shadow Reseller', type: 'reseller', domain: 'adstack-resell.net', riskScore: 88, avgCpm: 3.20, bidVolume: 135340, trustLevel: 'suspicious' },
                { id: 'n6', label: 'PubMatic (Resold)', type: 'exchange', domain: 'pubmatic.com', riskScore: 45, avgCpm: 8.40, bidVolume: 89000, trustLevel: 'degraded' },
                { id: 'n7', label: 'fakebundle-spoof.xyz', type: 'publisher', domain: 'fakebundle-spoof.xyz', riskScore: 96, avgCpm: 2.40, bidVolume: 892340, trustLevel: 'blacklisted' },
            ],
            edges: [
                { source: 'n1', target: 'n2', type: 'BID_FLOW', weight: 1.0, feePercent: 0, latencyMs: 2, volume: 892340, suspicious: false },
                { source: 'n2', target: 'n3', type: 'BID_FLOW', weight: 0.8, feePercent: 5, latencyMs: 8, volume: 445000, suspicious: false },
                { source: 'n2', target: 'n4', type: 'BID_FLOW', weight: 0.6, feePercent: 7, latencyMs: 12, volume: 312000, suspicious: false },
                { source: 'n4', target: 'n5', type: 'FEE_EXTRACT', weight: 0.4, feePercent: 18, latencyMs: 34, volume: 135340, suspicious: true },
                { source: 'n5', target: 'n6', type: 'DUPLICATE', weight: 0.3, feePercent: 12, latencyMs: 22, volume: 89000, suspicious: true },
                { source: 'n3', target: 'n7', type: 'BID_FLOW', weight: 0.7, feePercent: 3, latencyMs: 6, volume: 445000, suspicious: false },
                { source: 'n6', target: 'n7', type: 'TRUST_DECAY', weight: 0.2, feePercent: 8, latencyMs: 45, volume: 89000, suspicious: true },
            ],
        },
    };

    // Default graph for any entity
    return graphs[entityId] || graphs['fakebundle-spoof.xyz'];
}

// ============================================================
// RISK REASONING — AI Explainability Engine
// ============================================================

export interface RiskSignal {
    signal: string;
    contribution: number; // points
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
}

export interface DecisionExplanation {
    totalRiskScore: number;
    decision: 'BLOCK' | 'REROUTE' | 'SHADE' | 'ALLOW';
    confidence: number;
    signals: RiskSignal[];
    financialImpact: string;
    policyTriggers: string[];
    modelVersion: string;
    processingMs: number;
}

export function getDecisionExplanation(entityId: string): DecisionExplanation {
    const explanations: Record<string, DecisionExplanation> = {
        'fakebundle-spoof.xyz': {
            totalRiskScore: 92,
            decision: 'BLOCK',
            confidence: 98.4,
            signals: [
                { signal: 'App Bundle Mismatch', contribution: 41, severity: 'critical', description: 'Declared com.pluto.tv but resolved to unknown canvas renderer' },
                { signal: 'Historical Fraud Cluster', contribution: 29, severity: 'critical', description: 'IP subnet 45.32.x.x linked to 12 confirmed fraud operations' },
                { signal: 'Path Length Anomaly', contribution: 22, severity: 'high', description: '5-hop supply chain vs. 2-hop industry standard for CTV' },
                { signal: 'Emulator Signature', contribution: 18, severity: 'high', description: 'WebGL renderer fingerprint matches known emulator farm' },
                { signal: 'Geo Entropy Drift', contribution: 11, severity: 'medium', description: 'User timezone EST but IP geolocates to Bucharest, Romania' },
            ],
            financialImpact: 'This intermediary chain adds estimated 18% hidden supply tax. Blocking saves $284,750 annually.',
            policyTriggers: ['CTV_SPOOF_GUARD', 'EMULATOR_DETECTION', 'GEO_MISMATCH', 'PATH_TOXICITY'],
            modelVersion: 'cleanpath-rf-v3.2.1',
            processingMs: 7.2,
        },
        'hulu.com': {
            totalRiskScore: 34,
            decision: 'SHADE',
            confidence: 87.2,
            signals: [
                { signal: 'Bid Duplication (Cross-SSP)', contribution: 18, severity: 'medium', description: 'Same impression auctioned via Magnite + FreeWheel simultaneously' },
                { signal: 'Fee Stacking', contribution: 12, severity: 'medium', description: 'FreeWheel → SpotX resale adds 8% unnecessary intermediary cost' },
                { signal: 'Historical Anomaly (Resolved)', contribution: 4, severity: 'low', description: 'Previous device mismatch incident — cleared after investigation' },
            ],
            financialImpact: 'Direct route through Magnite would improve working media by 17.2%. Estimated annual savings: $214,000.',
            policyTriggers: ['BID_DUPLICATION', 'FEE_OPTIMIZATION'],
            modelVersion: 'cleanpath-rf-v3.2.1',
            processingMs: 4.8,
        },
        'roku.freetv': {
            totalRiskScore: 78,
            decision: 'REROUTE',
            confidence: 91.6,
            signals: [
                { signal: 'Device Type Mismatch', contribution: 35, severity: 'critical', description: 'Claims CTV Roku but User-Agent resolves to Chrome 118 on Windows 11' },
                { signal: 'Proxy Chain Detected', contribution: 24, severity: 'high', description: 'Traffic routes through 3 residential proxy hops before reaching exchange' },
                { signal: 'MFA Density Score', contribution: 19, severity: 'high', description: 'Ad refresh rate 4.2x above CTV industry baseline' },
            ],
            financialImpact: 'Rerouting to verified Roku direct path reduces waste by $124,800 per quarter.',
            policyTriggers: ['DEVICE_SPOOF', 'PROXY_DETECTION', 'MFA_THRESHOLD'],
            modelVersion: 'cleanpath-rf-v3.2.1',
            processingMs: 6.1,
        },
    };

    return explanations[entityId] || explanations['fakebundle-spoof.xyz'];
}

// ============================================================
// FORENSIC TIMELINE — Millisecond Event Replay
// ============================================================

export interface TimelineEvent {
    timestamp: string;
    offsetMs: number;
    event: string;
    category: 'ingress' | 'detection' | 'analysis' | 'decision' | 'action';
    severity: 'info' | 'warning' | 'critical';
    detail: string;
}

export function getForensicTimeline(entityId: string): TimelineEvent[] {
    return [
        { timestamp: '09:33:31.021', offsetMs: 0, event: 'Bid Request Received', category: 'ingress', severity: 'info', detail: 'OpenRTB 2.6 bid request from The Trade Desk via Magnite SSP' },
        { timestamp: '09:33:31.024', offsetMs: 3, event: 'Header Enrichment', category: 'ingress', severity: 'info', detail: 'Device fingerprint extracted: IFA=FAIL...9999, UA=Chrome/118.0' },
        { timestamp: '09:33:31.027', offsetMs: 6, event: 'SSP Duplication Detected', category: 'detection', severity: 'warning', detail: 'Same impression ID seen via OpenX 4ms earlier — cross-SSP auction' },
        { timestamp: '09:33:31.029', offsetMs: 8, event: 'App Bundle Verification', category: 'analysis', severity: 'critical', detail: 'Declared: com.pluto.tv — Resolved: unknown canvas renderer on desktop' },
        { timestamp: '09:33:31.031', offsetMs: 10, event: 'Device Mismatch Flagged', category: 'detection', severity: 'critical', detail: 'CTV claim invalidated: WebGL fingerprint matches emulator signature' },
        { timestamp: '09:33:31.033', offsetMs: 12, event: 'Geo Entropy Analysis', category: 'analysis', severity: 'warning', detail: 'Timezone offset -5 (EST) conflicts with IP geolocation 44.43°N (Romania)' },
        { timestamp: '09:33:31.035', offsetMs: 14, event: 'Path Toxicity Scored', category: 'analysis', severity: 'warning', detail: 'Supply chain: 5 hops detected. Fee stacking: 18% cumulative extraction' },
        { timestamp: '09:33:31.037', offsetMs: 16, event: 'Risk Threshold Exceeded', category: 'decision', severity: 'critical', detail: 'Composite score: 92/100. Threshold: 70. Decision: BLOCK' },
        { timestamp: '09:33:31.038', offsetMs: 17, event: 'BLOCK Issued', category: 'action', severity: 'critical', detail: 'Bid rejected. No-bid response sent to Magnite. Processing: 17ms total' },
        { timestamp: '09:33:31.041', offsetMs: 20, event: 'Audit Log Written', category: 'action', severity: 'info', detail: 'Decision persisted to PostgreSQL. Incident auto-created: INC-2026-0547' },
    ];
}

// ============================================================
// LIVE STREAM EVENTS — Operational Feed
// ============================================================

export interface LiveEvent {
    id: string;
    timestamp: string;
    type: 'spoof' | 'trust_decay' | 'mfa' | 'reroute' | 'emulator' | 'block' | 'path_anomaly';
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'info';
    entityDomain?: string;
}

export const LIVE_STREAM_EVENTS: LiveEvent[] = [
    { id: 'ls_001', timestamp: '15:33:41', type: 'spoof', message: 'New CTV spoof cluster detected: 45.32.x.x subnet', severity: 'critical', entityDomain: 'fakebundle-spoof.xyz' },
    { id: 'ls_002', timestamp: '15:33:38', type: 'trust_decay', message: 'SSP trust degradation: OpenX integrity score dropped 12pts', severity: 'high', entityDomain: 'openx.com' },
    { id: 'ls_003', timestamp: '15:33:35', type: 'mfa', message: 'MFA density anomaly on roku.freetv — refresh rate 4.2x baseline', severity: 'high', entityDomain: 'roku.freetv' },
    { id: 'ls_004', timestamp: '15:33:31', type: 'reroute', message: 'Path reroute triggered: Hulu traffic redirected from SpotX → Magnite direct', severity: 'medium', entityDomain: 'hulu.com' },
    { id: 'ls_005', timestamp: '15:33:28', type: 'emulator', message: 'Emulator farm signature matched: 8 devices sharing WebGL hash', severity: 'critical' },
    { id: 'ls_006', timestamp: '15:33:22', type: 'block', message: 'High-value block: $18.50 CPM bid rejected — device spoof confirmed', severity: 'critical', entityDomain: 'fakebundle-spoof.xyz' },
    { id: 'ls_007', timestamp: '15:33:18', type: 'path_anomaly', message: 'Triple-hop fee stacking: Magnite → OpenX → PubMatic resale chain', severity: 'high' },
    { id: 'ls_008', timestamp: '15:33:14', type: 'trust_decay', message: 'Publisher reputation downgrade: roku.freetv → UNDER_REVIEW', severity: 'medium', entityDomain: 'roku.freetv' },
];

// ============================================================
// FINANCIAL FORENSICS — Leakage Intelligence
// ============================================================

export interface FinancialForensicsData {
    hiddenIntermediaryTax: number;
    duplicatedBidCost: number;
    estimatedWasteRecovery: number;
    projectedAnnualSavings: number;
    routeEfficiencyScore: number;
    directRouteWorkingMedia: number;
    currentRouteWorkingMedia: number;
    feeBreakdown: { intermediary: string; feePercent: number; dollarAmount: number }[];
}

export function getFinancialForensics(entityId: string): FinancialForensicsData {
    const data: Record<string, FinancialForensicsData> = {
        'fakebundle-spoof.xyz': {
            hiddenIntermediaryTax: 18.4,
            duplicatedBidCost: 42350.00,
            estimatedWasteRecovery: 284750.00,
            projectedAnnualSavings: 1139000.00,
            routeEfficiencyScore: 12,
            directRouteWorkingMedia: 91.2,
            currentRouteWorkingMedia: 54.8,
            feeBreakdown: [
                { intermediary: 'Magnite SSP', feePercent: 5.0, dollarAmount: 14237 },
                { intermediary: 'OpenX SSP', feePercent: 7.0, dollarAmount: 19932 },
                { intermediary: 'Shadow Reseller', feePercent: 18.0, dollarAmount: 51255 },
                { intermediary: 'PubMatic (Resold)', feePercent: 12.0, dollarAmount: 34170 },
            ],
        },
        'hulu.com': {
            hiddenIntermediaryTax: 8.2,
            duplicatedBidCost: 18940.00,
            estimatedWasteRecovery: 102250.00,
            projectedAnnualSavings: 408000.00,
            routeEfficiencyScore: 68,
            directRouteWorkingMedia: 92.8,
            currentRouteWorkingMedia: 78.4,
            feeBreakdown: [
                { intermediary: 'Magnite SSP', feePercent: 5.0, dollarAmount: 62250 },
                { intermediary: 'FreeWheel', feePercent: 4.5, dollarAmount: 56025 },
                { intermediary: 'SpotX (Resale)', feePercent: 8.0, dollarAmount: 99600 },
            ],
        },
    };

    return data[entityId] || data['fakebundle-spoof.xyz'];
}

// ============================================================
// COLLABORATION — Investigation Status
// ============================================================

export interface InvestigationStatus {
    incidentId: string;
    status: 'ACTIVE' | 'MONITORING' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE';
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    assignedTo: string;
    createdAt: string;
    activityLog: { timestamp: string; action: string; user: string }[];
    notes: string[];
}

export function getInvestigationStatus(entityId: string): InvestigationStatus {
    return {
        incidentId: 'INC-2026-0547',
        status: 'ACTIVE',
        priority: 'P0',
        assignedTo: 'Risk Operations',
        createdAt: '2026-05-24T09:33:31Z',
        activityLog: [
            { timestamp: '15:45:12', action: 'Investigation opened by automated threat detection', user: 'SYSTEM' },
            { timestamp: '15:46:01', action: 'Assigned to Risk Operations team', user: 'SYSTEM' },
            { timestamp: '15:48:33', action: 'Supply path forensics initiated', user: 'S. Vashistha' },
            { timestamp: '15:52:14', action: 'Emulator farm cluster confirmed — 8 devices', user: 'S. Vashistha' },
            { timestamp: '15:55:00', action: 'Escalated to P0 — financial exposure exceeds $250K', user: 'S. Vashistha' },
        ],
        notes: [
            'IP subnet 45.32.x.x has been flagged across 12 separate fraud investigations since March 2026.',
            'Shadow reseller adstack-resell.net appears to be a front for traffic laundering operations.',
        ],
    };
}
