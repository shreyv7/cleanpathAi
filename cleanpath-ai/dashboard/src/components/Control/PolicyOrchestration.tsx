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
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Enterprise Policy Orchestration
                        </h2>
                        <p className="text-[10px] text-white/40">Manage financial, security, and latency enforcement policies</p>
                    </div>
                </div>

                <button className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40 text-[9px] font-bold font-mono uppercase transition-all cursor-pointer">
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
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between ${
                                isActive 
                                    ? 'bg-blue-950/10 border-blue-500/20 hover:border-blue-500/40' 
                                    : 'bg-white/[0.01] border-white/5 opacity-60'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white/90">{p.name}</span>
                                    <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                        p.category === 'SECURITY' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                        p.category === 'FINANCIAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {p.category}
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/45 pl-0 leading-normal font-sans">
                                    {p.description}
                                </p>
                                <div className="text-[9.5px] text-blue-400/80 bg-[#03060a]/60 p-2 rounded border border-white/5 mt-2 leading-relaxed">
                                    <span className="text-white/30 font-bold">TRIGGER:</span> {p.triggerCondition} <br />
                                    <span className="text-white/30 font-bold">ACTION:</span> {p.thenAction}
                                </div>
                            </div>

                            {/* Toggle switch controls */}
                            <button
                                onClick={() => togglePolicy(p.id)}
                                className="shrink-0 text-white/40 hover:text-white transition-all cursor-pointer mt-0.5"
                            >
                                {isActive ? (
                                    <ToggleRight className="w-8 h-8 text-blue-500" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-white/20" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
