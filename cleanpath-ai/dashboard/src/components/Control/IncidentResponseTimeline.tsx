import React from 'react';
import { THREAT_RESPONSE_CHAIN } from '@/lib/controlEngine';
import { Radio, CheckCircle, Clock } from 'lucide-react';

export const IncidentResponseTimeline: React.FC = () => {
    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 h-[400px] transition-all">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-600 dark:text-red-500 animate-pulse" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Autonomous Threat Mitigation Sequence
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Step-by-step active incident isolation and rerouting cascades</p>
                    </div>
                </div>
            </div>

            {/* Sequence Cascade */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-4 font-mono text-xs relative pl-6">
                {/* Horizontal line mapping */}
                <div className="absolute left-2.5 top-2.5 bottom-8 w-px bg-slate-200 dark:bg-white/5" />

                {THREAT_RESPONSE_CHAIN.map((step) => {
                    const isCompleted = step.status === 'COMPLETED';
                    const isActive = step.status === 'ACTIVE';

                    return (
                        <div key={step.step} className="flex gap-4 relative group items-start">
                            {/* Bullet timeline status */}
                            <div className={`absolute -left-5 w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-bold ${
                                isCompleted 
                                    ? 'bg-emerald-100 border-emerald-250 text-emerald-705 dark:bg-emerald-500/10 dark:border-emerald-500/35 dark:text-emerald-400' 
                                    : isActive 
                                        ? 'bg-blue-100 border-blue-250 text-blue-705 dark:bg-blue-500/10 dark:border-blue-500/35 dark:text-blue-400 animate-pulse' 
                                        : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-white/5 dark:border-white/10 dark:text-white/20'
                            }`}>
                                {step.step}
                            </div>

                            {/* Content Block */}
                            <div className={`flex-1 p-3.5 rounded-xl border transition-all duration-300 shadow-sm ${
                                isCompleted 
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/5 border-emerald-150 dark:border-emerald-500/10' 
                                    : isActive 
                                        ? 'bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-500/20' 
                                        : 'bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 opacity-55'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-slate-900 dark:text-white/90">{step.title}</span>
                                    <span className={`text-[7.5px] font-black tracking-widest uppercase font-bold px-1.5 py-0.5 rounded border ${
                                        isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                        isActive ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : 'bg-slate-105 text-slate-500 border border-slate-200 dark:bg-white/5 dark:text-white/20'
                                    }`}>
                                        {step.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-white/45 mt-1 font-sans leading-normal font-medium">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
