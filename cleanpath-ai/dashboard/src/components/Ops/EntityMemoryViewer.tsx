import React, { useState } from 'react';
import { ENTITY_DIRECTORY, type EntityRecord } from '@/lib/intelligenceEngine';
import { Landmark, ShieldAlert, Award, FileText, Database } from 'lucide-react';

export const EntityMemoryViewer: React.FC = () => {
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const activeEntity = ENTITY_DIRECTORY[selectedIdx];

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-5 h-[340px]">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    Institutional Entity Memory Directory
                </h2>
                <p className="text-[10px] text-white/40">Evolving audit records for SSPs, resellers, and exchanges</p>
            </div>

            {/* List & Details layout */}
            <div className="flex-1 flex gap-5 min-h-0 overflow-hidden">
                {/* Selector List */}
                <div className="w-1/3 flex flex-col gap-1.5 overflow-y-auto pr-1 border-r border-white/5 select-none">
                    {ENTITY_DIRECTORY.map((entity, idx) => (
                        <button
                            key={entity.name}
                            onClick={() => setSelectedIdx(idx)}
                            className={`w-full text-left p-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                                selectedIdx === idx
                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                    : 'bg-transparent border-transparent text-white/45 hover:bg-white/[0.02]'
                            }`}
                        >
                            {entity.name}
                        </button>
                    ))}
                </div>

                {/* Details Window */}
                <div className="flex-1 flex flex-col gap-4 font-mono overflow-y-auto pr-1">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-2.5">
                        <div className="space-y-0.5">
                            <span className="text-xs font-black text-white">{activeEntity.name}</span>
                            <div className="text-[9px] text-white/30">TYPE: {activeEntity.type}</div>
                        </div>

                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            activeEntity.correlationStrength === 'HIGH' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                            activeEntity.correlationStrength === 'MEDIUM' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                        }`}>
                            {activeEntity.correlationStrength} CORRELATION
                        </span>
                    </div>

                    {/* Matrix Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#03060a]/60 border border-white/5 flex flex-col gap-0.5">
                            <span className="text-[9px] text-white/30 uppercase">Observed Incidents</span>
                            <span className="text-white/80 font-bold">{activeEntity.observedIncidentsCount}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#03060a]/60 border border-white/5 flex flex-col gap-0.5">
                            <span className="text-[9px] text-white/30 uppercase">Estimated Prior Leakage</span>
                            <span className="text-red-400 font-bold">${(activeEntity.priorLeakageUsd / 1000000).toFixed(1)}M</span>
                        </div>
                    </div>

                    {/* Historical integrity trend timeline */}
                    <div className="flex flex-col gap-1 text-[9px]">
                        <span className="text-white/30 uppercase mb-0.5">Historical Integrity Scores (90d Trend)</span>
                        <div className="flex items-center gap-2">
                            {activeEntity.historicalIntegrityScores.map((score, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center">
                                        <span className={`font-bold ${score > 80 ? 'text-emerald-400' : score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {score}%
                                        </span>
                                        <span className="text-[7.5px] text-white/20">t-{90 - i * 30}d</span>
                                    </div>
                                    {i < activeEntity.historicalIntegrityScores.length - 1 && (
                                        <span className="text-white/10">→</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Associated families */}
                    {activeEntity.associatedFamilies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-white/30 pt-1.5 border-t border-white/5">
                            <span>Associated Threat Families:</span>
                            {activeEntity.associatedFamilies.map((fam) => (
                                <span key={fam} className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded">
                                    {fam}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
