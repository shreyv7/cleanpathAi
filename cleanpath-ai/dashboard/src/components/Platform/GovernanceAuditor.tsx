import React from 'react';
import { IMMUTABLE_AUDIT_TRAIL } from '@/lib/platformEngine';
import { ShieldCheck, Check, Fingerprint } from 'lucide-react';

export const GovernanceAuditor: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Immutable SOC2 Audit Logs & Trails
                        </h2>
                        <p className="text-[10px] text-white/40">SOC2 compliant cryptographic verification logs of routing modifications</p>
                    </div>
                </div>
            </div>

            {/* Logs Queue */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {IMMUTABLE_AUDIT_TRAIL.map((log) => (
                    <div
                        key={log.id}
                        className="p-3.5 rounded-xl border border-white/5 bg-[#03060a]/60 hover:bg-[#05080f]/80 hover:border-white/10 transition-all duration-300 flex flex-col gap-2 relative overflow-hidden"
                    >
                        {/* Background scanning lines */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500/20" />

                        {/* Top: Actor & Time */}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-white/90 flex items-center gap-1.5">
                                <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                                {log.actor}
                            </span>
                            <span className="text-white/20 text-[9px]">
                                {log.timestamp}
                            </span>
                        </div>

                        {/* Action text */}
                        <p className="text-[10px] text-white/50 pl-5 leading-relaxed font-sans">
                            {log.action}
                        </p>

                        {/* Cryptographic hash signatures */}
                        <div className="text-[7.5px] text-white/25 pl-5 select-all truncate border-t border-white/[0.02] pt-1">
                            SHA-256: {log.soc2Hash}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
