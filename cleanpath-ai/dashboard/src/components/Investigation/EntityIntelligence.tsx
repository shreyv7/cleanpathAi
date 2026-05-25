import React from 'react';
import {
    Globe, Shield, Activity, AlertTriangle, Clock, MapPin,
    Server, DollarSign, BarChart3, TrendingDown, Eye, Fingerprint
} from 'lucide-react';
import { type EntityProfile } from '@/data/investigationData';

interface EntityIntelligenceProps {
    entity: EntityProfile;
}

const repColor: Record<string, string> = {
    TRUSTED: 'text-emerald-400',
    DEGRADED: 'text-orange-400',
    BLACKLISTED: 'text-red-400',
    UNDER_REVIEW: 'text-yellow-400',
};

export const EntityIntelligence: React.FC<EntityIntelligenceProps> = ({ entity }) => {
    return (
        <aside className="w-72 xl:w-80 border-r border-white/5 bg-[#080A0F] flex flex-col overflow-y-auto investigation-scroll">
            {/* Entity Header */}
            <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Entity Profile</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{entity.domain}</h3>
                <p className="text-xs text-white/40 mt-1">{entity.displayName}</p>
                <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        entity.riskClassification === 'CRITICAL' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                        entity.riskClassification === 'HIGH' ? 'bg-orange-500/15 text-orange-400 border-orange-500/20' :
                        entity.riskClassification === 'ELEVATED' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' :
                        'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                    }`}>
                        {entity.riskClassification}
                    </span>
                    <span className="text-[10px] text-white/20 font-mono">{entity.type.toUpperCase()}</span>
                </div>
            </div>

            {/* Integrity Score Meter */}
            <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">Integrity Score</span>
                    <span className={`text-xl font-mono font-bold ${
                        entity.integrityScore > 70 ? 'text-emerald-400' :
                        entity.integrityScore > 30 ? 'text-yellow-400' : 'text-red-400'
                    }`}>{entity.integrityScore}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full meter-fill ${
                            entity.integrityScore > 70 ? 'bg-emerald-500' :
                            entity.integrityScore > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${entity.integrityScore}%` }}
                    />
                </div>
            </div>

            {/* Key Metrics */}
            <div className="p-5 border-b border-white/5 space-y-4">
                <MetricRow icon={<Shield className="w-3.5 h-3.5" />} label="Threat Severity" value={`${entity.threatSeverity}/100`} color={entity.threatSeverity > 70 ? 'text-red-400' : entity.threatSeverity > 40 ? 'text-orange-400' : 'text-emerald-400'} />
                <MetricRow icon={<Activity className="w-3.5 h-3.5" />} label="Path Toxicity" value={`${entity.pathToxicityScore}%`} color={entity.pathToxicityScore > 60 ? 'text-red-400' : 'text-yellow-400'} />
                <MetricRow icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Fraud Likelihood" value={`${entity.fraudLikelihood}%`} color={entity.fraudLikelihood > 50 ? 'text-red-400' : 'text-yellow-400'} />
                <MetricRow icon={<DollarSign className="w-3.5 h-3.5" />} label="Spend Exposure" value={`$${(entity.spendExposure / 1000).toFixed(0)}K`} color="text-blue-400" />
                <MetricRow icon={<BarChart3 className="w-3.5 h-3.5" />} label="Avg CPM" value={`$${entity.avgCpm.toFixed(2)}`} color="text-white/70" />
                <MetricRow icon={<TrendingDown className="w-3.5 h-3.5" />} label="Block Rate" value={`${entity.blockRate}%`} color={entity.blockRate > 50 ? 'text-red-400' : 'text-white/70'} />
                <MetricRow icon={<Fingerprint className="w-3.5 h-3.5" />} label="Bid Duplication" value={`${entity.bidDuplicationRate}%`} color={entity.bidDuplicationRate > 20 ? 'text-orange-400' : 'text-white/70'} />
            </div>

            {/* Temporal Intelligence */}
            <div className="p-5 border-b border-white/5 space-y-3">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Temporal
                </span>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-white/30">First Seen</span>
                        <span className="text-white/60 font-mono" suppressHydrationWarning>{new Date(entity.firstSeen).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/30">Last Active</span>
                        <span className="text-white/60 font-mono" suppressHydrationWarning>{new Date(entity.lastActive).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/30">Incidents</span>
                        <span className={`font-mono font-bold ${entity.incidentCount > 10 ? 'text-red-400' : 'text-white/60'}`}>{entity.incidentCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/30">Reputation</span>
                        <span className={`font-bold text-[10px] uppercase tracking-wider ${repColor[entity.historicalReputation]}`}>
                            {entity.historicalReputation.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Region */}
            <div className="p-5 border-b border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3 h-3" /> Region
                </span>
                <span className="text-sm text-white/70">{entity.region}</span>
            </div>

            {/* Device Distribution */}
            <div className="p-5 border-b border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5 mb-3">
                    <Eye className="w-3 h-3" /> Device Distribution
                </span>
                <div className="space-y-2">
                    {entity.deviceDistribution.map((d, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-white/50">{d.type}</span>
                                <span className="text-white/70 font-mono">{d.percent}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-blue-500/60 meter-fill"
                                    style={{ width: `${d.percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SSP Relationships */}
            <div className="p-5 border-b border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5 mb-3">
                    <Server className="w-3 h-3" /> SSP Relationships
                </span>
                <div className="flex flex-wrap gap-1.5">
                    {entity.sspRelationships.map((ssp, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5 text-white/50 font-mono">
                            {ssp}
                        </span>
                    ))}
                </div>
            </div>

            {/* Bids Processed */}
            <div className="p-5">
                <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">Total Bids</span>
                    <span className="text-lg font-mono font-bold text-white">{entity.totalBidsProcessed.toLocaleString()}</span>
                </div>
            </div>
        </aside>
    );
};

function MetricRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/30">
                {icon}
                <span className="text-[11px]">{label}</span>
            </div>
            <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
        </div>
    );
}
