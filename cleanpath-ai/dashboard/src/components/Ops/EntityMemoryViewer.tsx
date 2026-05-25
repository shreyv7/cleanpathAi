import React, { useState } from 'react';
import { ENTITY_DIRECTORY, type EntityRecord } from '@/lib/intelligenceEngine';
import { Landmark, ShieldAlert, Award, FileText, Database } from 'lucide-react';

export const EntityMemoryViewer: React.FC = () => {
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const activeEntity = ENTITY_DIRECTORY[selectedIdx];

    return (
        <div className="card-elevated gap-5">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90 flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    Institutional Entity Memory Directory
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Evolving audit records for SSPs, resellers, and exchanges</p>
            </div>

            {/* List & Details layout */}
            <div className="flex-1 flex gap-5 min-h-0 overflow-hidden">
                {/* Selector List */}
                <div className="w-1/3 flex flex-col gap-1.5 overflow-y-auto pr-1 border-r border-slate-200 dark:border-r-white/5 select-none">
                    {ENTITY_DIRECTORY.map((entity, idx) => (
                        <button
                            key={entity.name}
                            onClick={() => setSelectedIdx(idx)}
                            className={`w-full text-left p-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                                selectedIdx === idx
                                    ? 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400'
                                    : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-white/45 dark:hover:bg-white/[0.02]'
                            }`}
                        >
                            {entity.name}
                        </button>
                    ))}
                </div>

                {/* Details Window */}
                <div className="flex-1 flex flex-col gap-4 font-mono overflow-y-auto pr-1">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-250 dark:border-b-white/5 pb-2.5">
                        <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{activeEntity.name}</span>
                            <div className="text-[9px] text-slate-500 dark:text-white/30 font-medium">TYPE: {activeEntity.type}</div>
                        </div>

                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            activeEntity.correlationStrength === 'HIGH' ? 'bg-red-50 border border-red-200 text-red-750 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20' :
                            activeEntity.correlationStrength === 'MEDIUM' ? 'bg-yellow-50 border border-yellow-205 text-yellow-750 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/20' : 'bg-blue-50 border border-blue-200 text-blue-750 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20'
                        }`}>
                            {activeEntity.correlationStrength} CORRELATION
                        </span>
                    </div>

                    {/* Matrix Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-[#03060a]/60 dark:border-white/5 flex flex-col gap-0.5 shadow-sm">
                            <span className="text-[9px] text-slate-500 dark:text-white/30 uppercase font-medium">Observed Incidents</span>
                            <span className="text-slate-800 dark:text-white/80 font-bold">{activeEntity.observedIncidentsCount}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-[#03060a]/60 dark:border-white/5 flex flex-col gap-0.5 shadow-sm">
                            <span className="text-[9px] text-slate-500 dark:text-white/30 uppercase font-medium">Estimated Prior Leakage</span>
                            <span className="text-red-600 dark:text-red-400 font-bold">${(activeEntity.priorLeakageUsd / 1000000).toFixed(1)}M</span>
                        </div>
                    </div>

                    {/* Historical integrity trend timeline */}
                    <div className="flex flex-col gap-1 text-[9px]">
                        <span className="text-slate-550 dark:text-white/30 uppercase mb-0.5 font-medium">Historical Integrity Scores (90d Trend)</span>
                        <div className="flex items-center gap-2">
                            {activeEntity.historicalIntegrityScores.map((score, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center">
                                        <span className={`font-bold ${score > 80 ? 'text-emerald-600 dark:text-emerald-400' : score > 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {score}%
                                        </span>
                                        <span className="text-[7.5px] text-slate-400 dark:text-white/20 font-medium">t-{90 - i * 30}d</span>
                                    </div>
                                    {i < activeEntity.historicalIntegrityScores.length - 1 && (
                                        <span className="text-slate-350 dark:text-white/10">→</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Associated families */}
                    {activeEntity.associatedFamilies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-550 dark:text-white/30 pt-1.5 border-t border-slate-200 dark:border-t-white/5 font-medium">
                            <span>Associated Threat Families:</span>
                            {activeEntity.associatedFamilies.map((fam) => (
                                <span key={fam} className="bg-red-50 border border-red-200 text-red-750 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 font-bold px-1.5 py-0.5 rounded shadow-sm">
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
