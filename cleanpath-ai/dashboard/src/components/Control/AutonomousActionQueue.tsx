import React, { useState } from 'react';
import { INITIAL_AUTONOMOUS_ACTIONS, type AutonomousAction } from '@/lib/controlEngine';
import { Cpu, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const AutonomousActionQueue: React.FC = () => {
    const [actions, setActions] = useState<AutonomousAction[]>(INITIAL_AUTONOMOUS_ACTIONS);

    const updateActionStatus = (id: string, newStatus: AutonomousAction['status']) => {
        setActions(prev =>
            prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
        );
    };

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Autonomous Routing Action Queue
                        </h2>
                        <p className="text-[10px] text-white/40">Real-time supply-path optimization and isolated endpoints</p>
                    </div>
                </div>
                <div className="text-[9px] text-white/30 font-mono flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>MONITORING</span>
                </div>
            </div>

            {/* Actions list */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {actions.map((act) => {
                    const isExecuted = act.status === 'EXECUTED';
                    const isPending = act.status === 'PENDING';
                    const isOverridden = act.status === 'OVERRIDDEN';

                    return (
                        <div
                            key={act.id}
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between ${
                                isExecuted 
                                    ? 'bg-emerald-950/10 border-emerald-500/20' 
                                    : isPending 
                                        ? 'bg-blue-950/15 border-blue-500/25 hover:border-blue-500/40' 
                                        : 'bg-white/[0.01] border-white/5 opacity-60'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white/90">{act.action}</span>
                                    <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                        isExecuted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        isPending ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-white/40'
                                    }`}>
                                        {act.status}
                                    </span>
                                </div>
                                <p className="text-[10.5px] text-white/50 leading-relaxed font-sans pr-4">
                                    Reason: {act.reason}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] text-white/30 pt-1">
                                    <span>SSP: <span className="text-white/60">{act.ssp}</span></span>
                                    <span>•</span>
                                    <span>Region: <span className="text-white/60">{act.region}</span></span>
                                </div>
                            </div>

                            {/* Control triggers */}
                            <div className="shrink-0 flex flex-col gap-2 items-end">
                                <span className="text-emerald-400 font-bold text-[10.5px]">
                                    +{act.workingMediaDelta}% WM
                                </span>

                                {/* Approve/Reject actions for Pending items */}
                                {isPending && (
                                    <div className="flex gap-1.5 pt-1">
                                        <button
                                            onClick={() => updateActionStatus(act.id, 'EXECUTED')}
                                            className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 text-[8.5px] font-bold cursor-pointer"
                                        >
                                            APPROVE
                                        </button>
                                        <button
                                            onClick={() => updateActionStatus(act.id, 'REJECTED')}
                                            className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 text-[8.5px] font-bold cursor-pointer"
                                        >
                                            OVERRIDE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
