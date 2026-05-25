import React, { useState } from 'react';
import { ACTIVE_POLICIES, type PolicyRule } from '@/lib/controlEngine';
import { Shield, ToggleLeft, ToggleRight, CheckCircle2, Play, Plus } from 'lucide-react';

export const PolicyOrchestration: React.FC = () => {
    const [policies, setPolicies] = useState<PolicyRule[]>(ACTIVE_POLICIES);

    const togglePolicy = (id: string) => {
        setPolicies(prev =>
            prev.map(p => (p.id === id ? { ...p, status: p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : p))
        );
    };

    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 h-[400px] transition-all">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Enterprise Policy Orchestration
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Manage financial, security, and latency enforcement policies</p>
                    </div>
                </div>

                <button className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/20 dark:hover:border-blue-500/40 text-[9px] font-bold font-mono uppercase transition-all cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Policy</span>
                </button>
            </div>

            {/* Policies Queue */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {policies.map((p) => {
                    const isActive = p.status === 'ACTIVE';

                    return (
                        <div
                            key={p.id}
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between shadow-sm ${
                                isActive 
                                    ? 'bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-500/20 hover:border-blue-400 dark:hover:border-blue-500/40' 
                                    : 'bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 opacity-70'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white/90">{p.name}</span>
                                    <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                        p.category === 'SECURITY' ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                        p.category === 'FINANCIAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                                    }`}>
                                        {p.category}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-white/45 pl-0 leading-normal font-sans font-medium">
                                    {p.description}
                                </p>
                                <div className="text-[9.5px] text-blue-750 dark:text-blue-400/80 bg-slate-100 dark:bg-[#03060a]/60 p-2 rounded border border-slate-200 dark:border-white/5 mt-2 leading-relaxed font-medium">
                                    <span className="text-slate-400 dark:text-white/30 font-bold">TRIGGER:</span> {p.triggerCondition} <br />
                                    <span className="text-slate-400 dark:text-white/30 font-bold">ACTION:</span> {p.thenAction}
                                </div>
                            </div>

                            {/* Toggle switch controls */}
                            <button
                                onClick={() => togglePolicy(p.id)}
                                className="shrink-0 text-white/40 hover:text-white transition-all cursor-pointer mt-0.5"
                            >
                                {isActive ? (
                                    <ToggleRight className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-white/20" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
