import React from 'react';
import { IMMUTABLE_AUDIT_TRAIL } from '@/lib/platformEngine';
import { ShieldCheck, Check, Fingerprint } from 'lucide-react';

export const GovernanceAuditor: React.FC = () => {
    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 h-[420px] transition-all">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-550 dark:text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Immutable SOC2 Audit Logs & Trails
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">SOC2 compliant cryptographic verification logs of routing modifications</p>
                    </div>
                </div>
            </div>

            {/* Logs Queue */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {IMMUTABLE_AUDIT_TRAIL.map((log) => (
                    <div
                        key={log.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 dark:border-white/5 dark:bg-[#03060a]/60 dark:hover:bg-[#05080f]/80 dark:hover:border-white/10 transition-all duration-300 flex flex-col gap-2 relative overflow-hidden shadow-sm"
                    >
                        {/* Background scanning lines */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500/20" />

                        {/* Top: Actor & Time */}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 dark:text-white/90 flex items-center gap-1.5">
                                <Fingerprint className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                {log.actor}
                            </span>
                            <span className="text-slate-450 dark:text-white/20 text-[9px] font-medium">
                                {log.timestamp}
                            </span>
                        </div>

                        {/* Action text */}
                        <p className="text-[10px] text-slate-600 dark:text-white/50 pl-5 leading-relaxed font-sans font-medium">
                            {log.action}
                        </p>

                        {/* Cryptographic hash signatures */}
                        <div className="text-[7.5px] text-slate-400 dark:text-white/25 pl-5 select-all truncate border-t border-slate-100 dark:border-white/[0.02] pt-1 font-medium">
                            SHA-256: {log.soc2Hash}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
