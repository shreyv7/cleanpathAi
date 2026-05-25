import React from 'react';
import { THREAT_RESPONSE_CHAIN } from '@/lib/controlEngine';
import { Radio, CheckCircle, Clock } from 'lucide-react';

export const IncidentResponseTimeline: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Autonomous Threat Mitigation Sequence
                        </h2>
                        <p className="text-[10px] text-white/40">Step-by-step active incident isolation and rerouting cascades</p>
                    </div>
                </div>
            </div>

            {/* Sequence Cascade */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-4 font-mono text-xs relative pl-6">
                {/* Horizontal line mapping */}
                <div className="absolute left-2.5 top-2.5 bottom-8 w-px bg-white/5" />

                {THREAT_RESPONSE_CHAIN.map((step) => {
                    const isCompleted = step.status === 'COMPLETED';
                    const isActive = step.status === 'ACTIVE';

                    return (
                        <div key={step.step} className="flex gap-4 relative group items-start">
                            {/* Bullet timeline status */}
                            <div className={`absolute -left-5 w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-bold ${
                                isCompleted 
                                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' 
                                    : isActive 
                                        ? 'bg-blue-500/10 border-blue-500/35 text-blue-400 animate-pulse' 
                                        : 'bg-white/5 border-white/10 text-white/20'
                            }`}>
                                {step.step}
                            </div>

                            {/* Content Block */}
                            <div className={`flex-1 p-3.5 rounded-xl border transition-all duration-300 ${
                                isCompleted 
                                    ? 'bg-emerald-950/5 border-emerald-500/10' 
                                    : isActive 
                                        ? 'bg-blue-950/10 border-blue-500/20' 
                                        : 'bg-white/[0.01] border-white/5 opacity-40'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-white/90">{step.title}</span>
                                    <span className={`text-[7.5px] font-black tracking-widest uppercase font-bold px-1.5 py-0.5 rounded border ${
                                        isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        isActive ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/5 text-white/20'
                                    }`}>
                                        {step.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/45 mt-1 font-sans leading-normal">
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
