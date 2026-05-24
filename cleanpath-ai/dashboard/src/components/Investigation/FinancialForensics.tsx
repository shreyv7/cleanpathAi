import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowRight, AlertTriangle } from 'lucide-react';
import { type FinancialForensicsData } from '@/data/investigationData';

interface FinancialForensicsProps {
    data: FinancialForensicsData;
}

export const FinancialForensics: React.FC<FinancialForensicsProps> = ({ data }) => {
    const workingMediaDelta = data.directRouteWorkingMedia - data.currentRouteWorkingMedia;

    return (
        <div className="bg-[#080A0F] rounded-xl border border-white/5 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white/80 tracking-tight">Financial Forensics</h3>
                </div>
                <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">Leakage intelligence</span>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <KPICard
                    label="Hidden Tax"
                    value={`${data.hiddenIntermediaryTax}%`}
                    color="text-red-400"
                    icon={<AlertTriangle className="w-3.5 h-3.5 text-red-400/50" />}
                />
                <KPICard
                    label="Duplicated Cost"
                    value={`$${(data.duplicatedBidCost / 1000).toFixed(1)}K`}
                    color="text-orange-400"
                    icon={<TrendingDown className="w-3.5 h-3.5 text-orange-400/50" />}
                />
                <KPICard
                    label="Waste Recovery"
                    value={`$${(data.estimatedWasteRecovery / 1000).toFixed(0)}K`}
                    color="text-emerald-400"
                    icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-400/50" />}
                />
                <KPICard
                    label="Annual Savings"
                    value={`$${(data.projectedAnnualSavings / 1000000).toFixed(2)}M`}
                    color="text-blue-400"
                    icon={<DollarSign className="w-3.5 h-3.5 text-blue-400/50" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Fee Extraction Ladder */}
                <div className="bg-white/[0.02] rounded-lg border border-white/5 p-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 block mb-3">
                        Fee Extraction Ladder
                    </span>
                    <div className="space-y-2.5">
                        {data.feeBreakdown.map((fee, idx) => (
                            <div key={idx} className="surgical-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${fee.feePercent > 10 ? 'bg-red-500' : fee.feePercent > 5 ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                        <span className="text-xs text-white/60">{fee.intermediary}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-mono font-bold ${fee.feePercent > 10 ? 'text-red-400' : 'text-white/50'}`}>
                                            {fee.feePercent}%
                                        </span>
                                        <span className="text-[10px] font-mono text-white/25">
                                            ${fee.dollarAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full meter-fill ${
                                            fee.feePercent > 10 ? 'bg-red-500/60' : fee.feePercent > 5 ? 'bg-orange-500/60' : 'bg-blue-500/60'
                                        }`}
                                        style={{ width: `${(fee.feePercent / 20) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Working Media Comparison */}
                <div className="bg-white/[0.02] rounded-lg border border-white/5 p-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 block mb-4">
                        Working Media Efficiency
                    </span>

                    {/* Current vs Direct comparison */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-center">
                            <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Current Route</div>
                            <div className="text-2xl font-mono font-bold text-orange-400">{data.currentRouteWorkingMedia}%</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/10" />
                        <div className="text-center">
                            <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Direct Route</div>
                            <div className="text-2xl font-mono font-bold text-emerald-400">{data.directRouteWorkingMedia}%</div>
                        </div>
                    </div>

                    {/* Delta */}
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-bold">+{workingMediaDelta.toFixed(1)}% improvement</span>
                        </div>
                        <p className="text-[10px] text-emerald-400/50 leading-relaxed">
                            Direct route would improve working media by {workingMediaDelta.toFixed(1)}%.
                            Estimated annual savings: ${(data.projectedAnnualSavings / 1000).toFixed(0)}K.
                        </p>
                    </div>

                    {/* Route Efficiency */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] text-white/30">Route Efficiency Score</span>
                            <span className={`text-sm font-mono font-bold ${
                                data.routeEfficiencyScore > 60 ? 'text-emerald-400' :
                                data.routeEfficiencyScore > 30 ? 'text-yellow-400' : 'text-red-400'
                            }`}>{data.routeEfficiencyScore}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full meter-fill ${
                                    data.routeEfficiencyScore > 60 ? 'bg-emerald-500' :
                                    data.routeEfficiencyScore > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${data.routeEfficiencyScore}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function KPICard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white/[0.02] rounded-lg border border-white/5 p-3">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-white/25 uppercase tracking-wider">{label}</span>
                {icon}
            </div>
            <div className={`text-lg font-mono font-bold ${color}`}>{value}</div>
        </div>
    );
}
