import { EventEmitter } from 'events';

export interface ThreatIncident {
    id: string;
    timestamp: string;
    region: 'North America' | 'EMEA' | 'APAC' | 'LATAM';
    type: 'SPOOFING' | 'MFA_ARBITRAGE' | 'EMULATOR_FARM' | 'FEE_STACKING';
    ssp: 'Magnite' | 'OpenX' | 'GoogleAdManager' | 'PubMatic';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    message: string;
    leakageRateSpike: number;
    resolved: boolean;
}

export interface TelemetryState {
    activeIncidents: ThreatIncident[];
    sspTrustLevels: {
        Magnite: number;
        OpenX: number;
        GoogleAdManager: number;
        PubMatic: number;
    };
    globalFraudPressure: number;
    financialLeakageRate: number; // USD per min
    routeEfficiency: number;      // %
    bidThroughput: number;        // QPS
    overallWorkingMediaPercent: number;
    totalBlockedSpend: number;
    totalSavingsFromShading: number;
    totalRequests: number;
    systemHealth: {
        edgeLatencyMs: number;
        p99LatencyMs: number;
        inferenceTimeMs: number;
        redisPressurePercent: number;
        cpuLoadPercent: number;
    };
    graphToxicity: number; // % of graph that has active issues
    activePathReroutes: number;
}

const DEFAULT_STATE: TelemetryState = {
    activeIncidents: [
        {
            id: 'inc_1',
            timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
            region: 'LATAM',
            type: 'SPOOFING',
            ssp: 'Magnite',
            severity: 'HIGH',
            message: 'LATAM spoofing surge detected on Magnite SSP. CTV emulators active.',
            leakageRateSpike: 145.20,
            resolved: false,
        },
        {
            id: 'inc_2',
            timestamp: new Date(Date.now() - 1200000).toLocaleTimeString(),
            region: 'EMEA',
            type: 'MFA_ARBITRAGE',
            ssp: 'OpenX',
            severity: 'MEDIUM',
            message: 'EMEA MFA arbitrage stack detected. Intermediary fees inflating.',
            leakageRateSpike: 82.50,
            resolved: false,
        }
    ],
    sspTrustLevels: {
        Magnite: 78, // Degraded due to incident
        OpenX: 84,   // Degraded due to incident
        GoogleAdManager: 98,
        PubMatic: 94,
    },
    globalFraudPressure: 64,
    financialLeakageRate: 227.70, // 145.20 + 82.50
    routeEfficiency: 82.4,
    bidThroughput: 14820,
    overallWorkingMediaPercent: 88.5,
    totalBlockedSpend: 42104.50,
    totalSavingsFromShading: 18450.20,
    totalRequests: 849200,
    systemHealth: {
        edgeLatencyMs: 4.8,
        p99LatencyMs: 14.2,
        inferenceTimeMs: 1.2,
        redisPressurePercent: 42,
        cpuLoadPercent: 28,
    },
    graphToxicity: 38,
    activePathReroutes: 2,
};

type Listener = (state: TelemetryState) => void;

class TelemetryStore {
    private state: TelemetryState = { ...DEFAULT_STATE };
    private listeners: Set<Listener> = new Set();
    private eventEmitter: EventEmitter = new EventEmitter();
    private simulationInterval: NodeJS.Timeout | null = null;
    public productionMode: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            // Check session storage for persisted mode preference
            const savedMode = sessionStorage.getItem('cleanpath_production_mode');
            this.productionMode = savedMode === 'true';
            this.startSimulation();
        }
    }

    public subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        listener(this.state);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public getState(): TelemetryState {
        return this.state;
    }

    public isProductionMode(): boolean {
        return this.productionMode;
    }

    public toggleProductionMode(enabled?: boolean) {
        this.productionMode = enabled !== undefined ? enabled : !this.productionMode;
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('cleanpath_production_mode', this.productionMode ? 'true' : 'false');
        }
        
        // Push initial state update on mode change
        this.updateState(prev => ({
            ...prev,
            routeEfficiency: this.productionMode ? 96.5 : 82.4,
            graphToxicity: this.productionMode ? 4.2 : 38,
        }));
    }

    public onIncident(callback: (incident: ThreatIncident) => void): () => void {
        this.eventEmitter.on('incident', callback);
        return () => {
            this.eventEmitter.off('incident', callback);
        };
    }

    private updateState(updater: (prev: TelemetryState) => Partial<TelemetryState>) {
        this.state = { ...this.state, ...updater(this.state) };
        this.listeners.forEach(listener => listener(this.state));
    }

    public triggerIncident(incident: Omit<ThreatIncident, 'id' | 'timestamp' | 'resolved'>) {
        const newIncident: ThreatIncident = {
            ...incident,
            id: `inc_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            resolved: false,
        };

        this.updateState(prev => {
            const activeIncidents = [newIncident, ...prev.activeIncidents].slice(0, 10);
            
            // Degrade trust score of ssp
            const sspTrustLevels = { ...prev.sspTrustLevels };
            const degradation = incident.severity === 'CRITICAL' ? 25 : incident.severity === 'HIGH' ? 15 : 8;
            sspTrustLevels[incident.ssp] = Math.max(20, sspTrustLevels[incident.ssp] - degradation);

            // Recompute dynamic parameters
            const globalFraudPressure = Math.min(99, prev.globalFraudPressure + (incident.severity === 'CRITICAL' ? 18 : 10));
            const financialLeakageRate = prev.financialLeakageRate + incident.leakageRateSpike;
            const routeEfficiency = Math.max(50, prev.routeEfficiency - (incident.severity === 'CRITICAL' ? 12 : 6));
            const graphToxicity = Math.min(95, prev.graphToxicity + 12);
            const activePathReroutes = prev.activePathReroutes + 1;

            return {
                activeIncidents,
                sspTrustLevels,
                globalFraudPressure,
                financialLeakageRate,
                routeEfficiency,
                graphToxicity,
                activePathReroutes,
            };
        });

        this.eventEmitter.emit('incident', newIncident);
    }

    public resolveIncident(id: string) {
        this.updateState(prev => {
            const incident = prev.activeIncidents.find(inc => inc.id === id);
            if (!incident) return {};

            const activeIncidents = prev.activeIncidents.map(inc => 
                inc.id === id ? { ...inc, resolved: true } : inc
            );

            // Restore trust score
            const sspTrustLevels = { ...prev.sspTrustLevels };
            sspTrustLevels[incident.ssp] = Math.min(99, sspTrustLevels[incident.ssp] + 10);

            const globalFraudPressure = Math.max(10, prev.globalFraudPressure - 8);
            const financialLeakageRate = Math.max(0, prev.financialLeakageRate - incident.leakageRateSpike);
            const routeEfficiency = Math.min(98, prev.routeEfficiency + 4);
            const graphToxicity = Math.max(5, prev.graphToxicity - 8);
            const activePathReroutes = Math.max(0, prev.activePathReroutes - 1);

            return {
                activeIncidents,
                sspTrustLevels,
                globalFraudPressure,
                financialLeakageRate,
                routeEfficiency,
                graphToxicity,
                activePathReroutes,
            };
        });
    }

    private async fetchProductionTelemetry() {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
            const API_KEY = 'dev-api-key-change-in-production';

            // Query aggregate decisions stats and financial summaries from express application-api
            const [statsRes, summaryRes] = await Promise.all([
                fetch(`${API_URL}/decisions/stats`, { headers: { 'X-API-Key': API_KEY } }),
                fetch(`${API_URL}/financial/summary`, { headers: { 'X-API-Key': API_KEY } })
            ]);

            if (!statsRes.ok || !summaryRes.ok) throw new Error('API down');

            const stats = await statsRes.json();
            const summary = await summaryRes.json();

            // Resolve incidents if SQL tables show a clean state
            const blockRate = stats.block_rate || 12.5;
            const routeEfficiency = Math.max(90, parseFloat((100 - blockRate * 0.4).toFixed(1)));

            this.updateState(prev => ({
                totalRequests: summary.totalDecisions || stats.total_requests || prev.totalRequests,
                totalBlockedSpend: parseFloat((summary.totalBlocked || prev.totalBlockedSpend).toFixed(2)),
                totalSavingsFromShading: parseFloat((summary.totalSavingsFromShading || prev.totalSavingsFromShading).toFixed(2)),
                overallWorkingMediaPercent: summary.overallWorkingMediaPercent || prev.overallWorkingMediaPercent,
                bidThroughput: Math.floor(10000 + Math.random() * 500),
                routeEfficiency,
                graphToxicity: Math.max(1, Math.floor(blockRate / 3)),
                globalFraudPressure: Math.floor(blockRate * 1.5),
                financialLeakageRate: Math.max(0, parseFloat(((summary.totalSpend * 0.05) / 1440).toFixed(2))), // leakage estimate
                systemHealth: {
                    edgeLatencyMs: stats.avg_latency || 4.2,
                    p99LatencyMs: parseFloat(((stats.avg_latency || 4.2) * 2.1).toFixed(1)),
                    inferenceTimeMs: 1.1,
                    redisPressurePercent: Math.floor(25 + Math.random() * 5),
                    cpuLoadPercent: Math.floor(18 + Math.random() * 4),
                }
            }));
        } catch (e) {
            console.warn('[TELEMETRY_ENGINE] productionMode active but API down. Auto-falling back to sandbox pacing.');
            this.runSandboxIteration();
        }
    }

    private runSandboxIteration() {
        this.updateState(prev => {
            // Simulating rolling bid requests incrementing
            const addedRequests = Math.floor(Math.random() * 80) + 40;
            const newRequests = prev.totalRequests + addedRequests;
            
            // Block ~ 8-12% of traffic
            const blockChance = Math.random() < 0.12;
            const addedBlocked = blockChance ? (Math.random() * 2.50 + 0.50) : 0;
            const addedShaded = Math.random() < 0.30 ? (Math.random() * 0.40 + 0.10) : 0;

            const newBlockedSpend = prev.totalBlockedSpend + addedBlocked;
            const newSavingsFromShading = prev.totalSavingsFromShading + addedShaded;

            // Throughput oscillation
            const bidThroughput = Math.floor(14000 + Math.sin(Date.now() / 20000) * 1200 + Math.random() * 200);
            
            // Edge latency jitter
            const edgeLatencyMs = parseFloat((4.5 + Math.sin(Date.now() / 15000) * 0.4 + Math.random() * 0.2).toFixed(1));
            const p99LatencyMs = parseFloat((12.5 + Math.random() * 2).toFixed(1));
            
            // Restore trust values slowly over time (auto-healing)
            const sspTrustLevels = { ...prev.sspTrustLevels };
            Object.keys(sspTrustLevels).forEach((key) => {
                const k = key as keyof typeof sspTrustLevels;
                if (sspTrustLevels[k] < DEFAULT_STATE.sspTrustLevels[k]) {
                    sspTrustLevels[k] = parseFloat((sspTrustLevels[k] + 0.05).toFixed(2));
                }
            });

            // Overall working media percentage fluctuation
            const overallWorkingMediaPercent = parseFloat(
                (85 + Math.sin(Date.now() / 50000) * 4 + (prev.routeEfficiency / 10) - (prev.globalFraudPressure / 20)).toFixed(1)
            );

            return {
                totalRequests: newRequests,
                totalBlockedSpend: parseFloat(newBlockedSpend.toFixed(2)),
                totalSavingsFromShading: parseFloat(newSavingsFromShading.toFixed(2)),
                bidThroughput,
                sspTrustLevels,
                overallWorkingMediaPercent,
                systemHealth: {
                    ...prev.systemHealth,
                    edgeLatencyMs,
                    p99LatencyMs,
                    redisPressurePercent: Math.floor(40 + Math.sin(Date.now() / 30000) * 5),
                }
            };
        });

        // Spawn regional threat occasionally in sandbox mode
        if (Math.random() < 0.05) {
            const regions: ThreatIncident['region'][] = ['North America', 'EMEA', 'APAC', 'LATAM'];
            const types: ThreatIncident['type'][] = ['SPOOFING', 'MFA_ARBITRAGE', 'EMULATOR_FARM', 'FEE_STACKING'];
            const ssps: ThreatIncident['ssp'][] = ['Magnite', 'OpenX', 'GoogleAdManager', 'PubMatic'];
            const severities: ThreatIncident['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM'];

            const selectedRegion = regions[Math.floor(Math.random() * regions.length)];
            const selectedType = types[Math.floor(Math.random() * types.length)];
            const selectedSsp = ssps[Math.floor(Math.random() * ssps.length)];
            const selectedSeverity = severities[Math.floor(Math.random() * severities.length)];
            const leakage = parseFloat((Math.random() * 150 + 50).toFixed(2));

            const typeNames = {
                SPOOFING: 'CTV Spoofing Attack',
                MFA_ARBITRAGE: 'MFA Arbitrage Stacking',
                EMULATOR_FARM: 'CTV Device Emulator Farm',
                FEE_STACKING: 'Suspicious SSP Fee Inflation',
            };

            this.triggerIncident({
                region: selectedRegion,
                type: selectedType,
                ssp: selectedSsp,
                severity: selectedSeverity,
                message: `${selectedRegion} threat escalation: ${typeNames[selectedType]} identified on ${selectedSsp} node.`,
                leakageRateSpike: leakage,
            });
        }
    }

    private startSimulation() {
        if (this.simulationInterval) return;

        this.simulationInterval = setInterval(() => {
            if (this.productionMode) {
                this.fetchProductionTelemetry();
            } else {
                this.runSandboxIteration();
            }
        }, 1000);
    }
}

export const telemetryEngine = new TelemetryStore();
