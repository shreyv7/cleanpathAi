import React from 'react';
import { ECONOMIC_MATRIX } from '@/lib/financialTwin';
import { ShieldCheck, Award, Star } from 'lucide-react';

export const EconomicTrustMatrix: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[350px]">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Economic Trust & Reputational Scorecard
                </h2>
                <p className="text-[10px] text-white/40">Financial trust profiles, stability metrics, and tax indexes</p>
            </div>

            {/* Matrix list table */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {ECONOMIC_MATRIX.map((entity) => {
                    const isOptimal = entity.efficiencyScore > 80;

                    return (
                        <div
                            key={entity.name}
                            className="p-3.5 rounded-xl border border-white/5 bg-[#03060a]/60 hover:bg-[#05080f]/80 hover:border-white/10 transition-all duration-300 flex items-center justify-between"
                        >
                            {/* Entity Title */}
                            <div className="space-y-0.5">
                                <span className="text-xs font-black text-white">{entity.name}</span>
                                <div className="text-[9px] text-white/30">TYPE: {entity.type}</div>
                            </div>

                            {/* Scores */}
                            <div className="flex items-center gap-6">
                                {/* Efficiency rating */}
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${isOptimal ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {entity.efficiencyScore}% Eff.
                                    </div>
                                    <span className="text-[8px] text-white/20 uppercase font-bold">Consolidation</span>
                                </div>

                                {/* Economic trust rank */}
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${isOptimal ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                        {entity.integrityScore}% Integ.
                                    </div>
                                    <span className="text-[8px] text-white/20 uppercase font-bold">Reputation</span>
                                </div>

                                {/* Tax Grade Badge */}
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                                    isOptimal 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    {entity.taxRating}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
