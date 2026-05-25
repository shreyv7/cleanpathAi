import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { telemetryEngine } from '@/lib/telemetryEngine';
import { ShieldAlert, CheckCircle, Radio, Clock } from 'lucide-react';

export const IncidentTimeline: React.FC = () => {
    const state = useTelemetry();

    const handleResolve = (id: string) => {
        telemetryEngine.resolveIncident(id);
    };

    return (
        <div className="card-elevated">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-650 dark:text-red-500 infra-pulse-fast" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            NOC Operational Incident Queue
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Real-time threat feeds & dynamic mitigation dispatch</p>
                    </div>
                </div>
                <div className="text-[9px] bg-red-100 text-red-800 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 font-mono font-bold px-2 py-0.5 rounded">
                    {state.activeIncidents.filter(inc => !inc.resolved).length} ACTIVE
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 space-y-3">
                {state.activeIncidents.map((incident) => (
                    <div
                        key={incident.id}
                        className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between shadow-sm ${
                            incident.resolved 
                                ? 'bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 opacity-70' 
                                : incident.severity === 'CRITICAL'
                                    ? 'bg-red-50 dark:bg-red-950/15 border-red-200 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-500/40'
                                    : 'bg-amber-50/50 dark:bg-yellow-950/10 border-amber-200 dark:border-yellow-500/20 hover:border-amber-400 dark:hover:border-yellow-500/40'
                        }`}
                    >
                        <div className="flex gap-3 items-start">
                            {/* Icon status */}
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${
                                incident.resolved 
                                    ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-white/40' 
                                    : incident.severity === 'CRITICAL'
                                        ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                        : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
                            }`}>
                                <ShieldAlert className="w-4 h-4" />
                            </div>

                            {/* Text content */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 dark:text-white/90 font-mono">{incident.type}</span>
                                    <span className="text-[9px] text-slate-300 dark:text-white/20">•</span>
                                    <span className="text-[10px] text-slate-500 dark:text-white/40 flex items-center gap-1 font-mono font-medium" suppressHydrationWarning>
                                        <Clock className="w-3 h-3" />
                                        {incident.timestamp}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed max-w-[280px] sm:max-w-md font-semibold">
                                    {incident.message}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] font-mono mt-1">
                                    <span className="text-slate-400 dark:text-white/30">Region:</span>
                                    <span className="text-slate-700 dark:text-white/60 font-semibold">{incident.region}</span>
                                    <span className="text-slate-200 dark:text-white/20">|</span>
                                    <span className="text-slate-400 dark:text-white/30">SSP:</span>
                                    <span className="text-slate-700 dark:text-white/60 font-semibold">{incident.ssp}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {!incident.resolved && (
                            <button
                                onClick={() => handleResolve(incident.id)}
                                className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/20 dark:hover:border-emerald-500/40 transition-all cursor-pointer"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                MITIGATE
                            </button>
                        )}
                        {incident.resolved && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-500/60 font-mono flex items-center gap-1 px-1 py-0.5">
                                MITIGATED
                            </span>
                        )}
                    </div>
                ))}

                {state.activeIncidents.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-white/30 text-xs">
                        No active network threats identified.
                    </div>
                )}
            </div>
        </div>
    );
};
