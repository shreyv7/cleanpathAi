export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    triggerCondition: string;
    thenAction: string;
    status: 'ACTIVE' | 'PAUSED';
    category: 'FINANCIAL' | 'SECURITY' | 'LATENCY';
}

export interface AutonomousAction {
    id: string;
    timestamp: string;
    action: string;
    reason: string;
    ssp: string;
    region: string;
    workingMediaDelta: number;
    annualWasteSavings: number;
    status: 'EXECUTED' | 'PENDING' | 'OVERRIDDEN' | 'REJECTED';
}

export interface TrustGovernance {
    node: string;
    type: 'SSP' | 'RESELLER' | 'PUBLISHER';
    status: 'TRUSTED' | 'DEGRADING' | 'QUARANTINED' | 'ECONOMICALLY_TOXIC';
    activeRoutesCount: number;
    efficiencyRating: number;
}

export const ACTIVE_POLICIES: PolicyRule[] = [
    {
        id: 'pol_mfa',
        name: 'Zero-Tolerance MFA Routing',
        description: 'Auto-suppress supply routes when MFA density index exceeds critical limits',
        triggerCondition: 'IF MFA density > 70% AND intermediary tax > 18%',
        thenAction: 'Isolate route, reroute to verified PMPs, raise NOC alert',
        status: 'ACTIVE',
        category: 'SECURITY'
    },
    {
        id: 'pol_latency',
        name: 'Latency-Capped Path optimization',
        description: 'Optimize intermediary hops when auction roundtrips exceed threshold constraints',
        triggerCondition: 'IF route edge latency > 140ms AND trust < 85',
        thenAction: 'Bypass secondary reseller nodes, consolidate SSP hops',
        status: 'ACTIVE',
        category: 'LATENCY'
    },
    {
        id: 'pol_cfo',
        name: 'CFO Maximum Yield Enforcement',
        description: 'Maximum working media media consolidations on premium video campaigns',
        triggerCondition: 'IF working media < 72% AND publisher direct option exists',
        thenAction: 'Consolidate open exchange volume into verified Direct paths',
        status: 'ACTIVE',
        category: 'FINANCIAL'
    }
];

export const INITIAL_AUTONOMOUS_ACTIONS: AutonomousAction[] = [
    {
        id: 'act_001',
        timestamp: '15:42:10',
        action: 'Removed SSP-X duplicate reseller paths',
        reason: 'Rising Roku spoofing correlation & 22% intermediary markups',
        ssp: 'Magnite Reseller Hub',
        region: 'EMEA (Europe)',
        workingMediaDelta: 14.8,
        annualWasteSavings: 1200000,
        status: 'EXECUTED'
    },
    {
        id: 'act_002',
        timestamp: '15:48:32',
        action: 'Isolated APAC CTV mobile paths',
        reason: 'Detected duplicate residential proxy fingerprints',
        ssp: 'OpenX Exchange',
        region: 'APAC (Asia-Pacific)',
        workingMediaDelta: 8.4,
        annualWasteSavings: 680000,
        status: 'EXECUTED'
    },
    {
        id: 'act_003',
        timestamp: '15:55:01',
        action: 'Bypassed secondary reseller nodes',
        reason: 'Latency exceeded 160ms on premium video routes',
        ssp: 'PubMatic Indirect',
        region: 'North America',
        workingMediaDelta: 6.2,
        annualWasteSavings: 450000,
        status: 'PENDING'
    }
];

export const TRUST_GOVERNANCE_MATRIX: TrustGovernance[] = [
    {
        node: 'GoogleAdManager Direct',
        type: 'SSP',
        status: 'TRUSTED',
        activeRoutesCount: 142,
        efficiencyRating: 98
    },
    {
        node: 'PubMatic Verified PMP',
        type: 'SSP',
        status: 'TRUSTED',
        activeRoutesCount: 96,
        efficiencyRating: 92
    },
    {
        node: 'OpenX Exchange Node',
        type: 'SSP',
        status: 'DEGRADING',
        activeRoutesCount: 34,
        efficiencyRating: 74
    },
    {
        node: 'Magnite Reseller Hub-C',
        type: 'RESELLER',
        status: 'QUARANTINED',
        activeRoutesCount: 0,
        efficiencyRating: 28
    },
    {
        node: 'LATAM Roku Emulator Cluster',
        type: 'PUBLISHER',
        status: 'ECONOMICALLY_TOXIC',
        activeRoutesCount: 0,
        efficiencyRating: 5
    }
];

export interface ThreatResponseStep {
    step: number;
    title: string;
    description: string;
    status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

export const THREAT_RESPONSE_CHAIN: ThreatResponseStep[] = [
    { step: 1, title: 'CTV Spoof cluster detected', description: 'Real-time telemetry signals device signature cloning.', status: 'COMPLETED' },
    { step: 2, title: 'SSP trust score degraded', description: 'Magnite Reseller trust lowered from 88 to 52 dynamically.', status: 'COMPLETED' },
    { step: 3, title: 'Duplicate routes isolated', description: 'Identified 18 inflated reseller hops and applied blocks.', status: 'COMPLETED' },
    { step: 4, title: 'Traffic rerouted around hub', description: 'Bidstream successfully directed into verified direct PMP contracts.', status: 'ACTIVE' },
    { step: 5, title: 'Executive narrative compiled', description: 'CFO dashboard and boardroom reports updated.', status: 'PENDING' }
];

export function getStrategicOperationalInsight(): string {
    return `[AI STRATEGIC OPERATIONS AGENT]
Ecosystem health monitoring active. Direct PMP routing strategies successfully reduced intermediary leakage 18.4% more effectively in APAC streaming paths compared to uncoordinated broad domain suppression. Current global media integrity is stabilized.`;
}
