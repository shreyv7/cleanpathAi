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
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 h-[400px] transition-all">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Autonomous Routing Action Queue
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Real-time supply-path optimization and isolated endpoints</p>
                    </div>
                </div>
                <div className="text-[9px] text-slate-400 dark:text-white/30 font-mono flex items-center gap-1 font-semibold">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>MONITORING</span>
                </div>
            </div>

            {/* Actions list */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {actions.map((act) => {
                    const isExecuted = act.status === 'EXECUTED';
                    const isPending = act.status === 'PENDING';

                    return (
                        <div
                            key={act.id}
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between shadow-sm ${
                                isExecuted 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-500/20' 
                                    : isPending 
                                        ? 'bg-blue-50/55 dark:bg-blue-950/15 border-blue-200 dark:border-blue-500/25 hover:border-blue-400 dark:hover:border-blue-500/40' 
                                        : 'bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 opacity-70'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white/90">{act.action}</span>
                                    <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                        isExecuted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                        isPending ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/5 dark:text-white/40'
                                    }`}>
                                        {act.status}
                                    </span>
                                </div>
                                <p className="text-[10.5px] text-slate-600 dark:text-white/50 leading-relaxed font-sans pr-4 font-medium">
                                    Reason: {act.reason}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] text-slate-400 dark:text-white/30 pt-1">
                                    <span>SSP: <span className="text-slate-700 dark:text-white/60 font-semibold">{act.ssp}</span></span>
                                    <span>•</span>
                                    <span>Region: <span className="text-slate-700 dark:text-white/60 font-semibold">{act.region}</span></span>
                                </div>
                            </div>

                            {/* Control triggers */}
                            <div className="shrink-0 flex flex-col gap-2 items-end">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10.5px]">
                                    +{act.workingMediaDelta}% WM
                                </span>

                                {/* Approve/Reject actions for Pending items */}
                                {isPending && (
                                    <div className="flex gap-1.5 pt-1">
                                        <button
                                            onClick={() => updateActionStatus(act.id, 'EXECUTED')}
                                            className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-250 text-emerald-755 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/25 dark:text-emerald-400 dark:hover:bg-emerald-500/25 text-[8.5px] font-bold cursor-pointer transition-all"
                                        >
                                            APPROVE
                                        </button>
                                        <button
                                            onClick={() => updateActionStatus(act.id, 'REJECTED')}
                                            className="px-2 py-0.5 rounded bg-red-50 border border-red-250 text-red-755 hover:bg-red-100 dark:bg-red-500/15 dark:border-red-500/25 dark:text-red-400 dark:hover:bg-red-500/25 text-[8.5px] font-bold cursor-pointer transition-all"
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
