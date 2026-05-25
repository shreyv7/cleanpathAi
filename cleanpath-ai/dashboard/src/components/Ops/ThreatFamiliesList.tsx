import React from 'react';
import { THREAT_FAMILIES, type ThreatFamily } from '@/lib/intelligenceEngine';
import { Shield, AlertOctagon, RefreshCw, Zap, Landmark } from 'lucide-react';

export const ThreatFamiliesList: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Active Programmatic Threat Families
                        </h2>
                        <p className="text-[10px] text-white/40">Continuous clustering & behavioral signatures</p>
                    </div>
                </div>
                <div className="text-[9px] text-white/30 font-mono flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>SYNCHRONIZED</span>
                </div>
            </div>

            {/* Families List */}
            <div className="flex flex-col gap-4">
                {THREAT_FAMILIES.map((family) => {
                    const isCritical = family.riskPressure > 80;

                    return (
                        <div
                            key={family.id}
                            className="p-4 rounded-xl border border-white/5 bg-[#03060a]/60 hover:bg-[#05080f]/80 hover:border-white/10 transition-all duration-300 flex flex-col gap-3"
                        >
                            {/* Top header */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black font-mono text-white/90">{family.name}</span>
                                        <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                            isCritical ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        }`}>
                                            {family.status}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-white/30 font-mono">
                                        First Detected: {family.firstSeenDaysAgo} days ago
                                    </span>
                                </div>

                                <div className="text-right">
                                    <span className={`text-[10px] font-bold font-mono ${
                                        isCritical ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                        Risk Pressure: {family.riskPressure}%
                                    </span>
                                    <div className="w-24 bg-white/5 rounded-full h-1 mt-1 overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${
                                                isCritical ? 'bg-red-500 shadow-[0_0_4px_#ef4444]' : 'bg-yellow-500'
                                            }`}
                                            style={{ width: `${family.riskPressure}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                                {family.description}
                            </p>

                            {/* Traits */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {family.traits.map((trait, idx) => (
                                    <span
                                        key={idx}
                                        className="text-[8.5px] font-mono text-white/45 bg-white/[0.03] border border-white/5 rounded px-2 py-0.5"
                                    >
                                        {trait}
                                    </span>
                                ))}
                            </div>

                            {/* Regional & Financial Info footer */}
                            <div className="flex justify-between items-center text-[9px] font-mono border-t border-white/5 pt-2.5 mt-1 text-white/30">
                                <div className="flex items-center gap-1">
                                    <Landmark className="w-3 h-3 text-emerald-400" />
                                    <span>Fee Impact:</span>
                                    <span className="text-emerald-400 font-bold">{family.feeExtractionPct}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-blue-400" />
                                    <span>Target Regions:</span>
                                    <span className="text-white/60">{family.activeRegions.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
