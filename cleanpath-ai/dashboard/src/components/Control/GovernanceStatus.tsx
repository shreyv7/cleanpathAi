import React from 'react';
import { TRUST_GOVERNANCE_MATRIX } from '@/lib/controlEngine';
import { ShieldCheck, Award, AlertOctagon } from 'lucide-react';

export const GovernanceStatus: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Ecosystem Trust & Governance Scorecards
                </h2>
                <p className="text-[10px] text-white/40">Continuous compliance, isolation, and routing statuses</p>
            </div>

            {/* Matrix logs */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {TRUST_GOVERNANCE_MATRIX.map((entity) => {
                    const isTrusted = entity.status === 'TRUSTED';
                    const isDegrading = entity.status === 'DEGRADING';
                    const isQuarantined = entity.status === 'QUARANTINED';

                    return (
                        <div
                            key={entity.node}
                            className="p-3.5 rounded-xl border border-white/5 bg-[#03060a]/60 hover:bg-[#05080f]/80 hover:border-white/10 transition-all duration-300 flex items-center justify-between"
                        >
                            {/* Entity Title */}
                            <div className="space-y-0.5">
                                <span className="text-xs font-black text-white">{entity.node}</span>
                                <div className="text-[9px] text-white/30">TYPE: {entity.type}</div>
                            </div>

                            {/* Statuses and path volume */}
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className={`text-[8.5px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                        isTrusted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        isDegrading ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {entity.status.replace('_', ' ')}
                                    </span>
                                    <div className="text-[8px] text-white/20 mt-1 uppercase font-bold">
                                        Routes: {entity.activeRoutesCount}
                                    </div>
                                </div>

                                {/* Efficiency Index score */}
                                <div className="text-right w-12">
                                    <span className={`text-xs font-bold ${entity.efficiencyRating > 80 ? 'text-emerald-400' : entity.efficiencyRating > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {entity.efficiencyRating}%
                                    </span>
                                    <div className="text-[7.5px] text-white/20 uppercase font-bold">Eff. Index</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
