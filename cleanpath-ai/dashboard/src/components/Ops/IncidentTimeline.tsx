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
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-500 infra-pulse-fast" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            NOC Operational Incident Queue
                        </h2>
                        <p className="text-[10px] text-white/40">Real-time threat feeds & dynamic mitigation dispatch</p>
                    </div>
                </div>
                <div className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded">
                    {state.activeIncidents.filter(inc => !inc.resolved).length} ACTIVE
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 space-y-3">
                {state.activeIncidents.map((incident) => (
                    <div
                        key={incident.id}
                        className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between ${
                            incident.resolved 
                                ? 'bg-white/[0.01] border-white/5 opacity-55' 
                                : incident.severity === 'CRITICAL'
                                    ? 'bg-red-950/15 border-red-500/20 hover:border-red-500/40'
                                    : 'bg-yellow-950/10 border-yellow-500/20 hover:border-yellow-500/40'
                        }`}
                    >
                        <div className="flex gap-3 items-start">
                            {/* Icon status */}
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                incident.resolved 
                                    ? 'bg-white/5 text-white/40' 
                                    : incident.severity === 'CRITICAL'
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                                <ShieldAlert className="w-4 h-4" />
                            </div>

                            {/* Text content */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white/90 font-mono">{incident.type}</span>
                                    <span className="text-[9px] text-white/20">•</span>
                                    <span className="text-[10px] text-white/40 flex items-center gap-1 font-mono">
                                        <Clock className="w-3 h-3" />
                                        {incident.timestamp}
                                    </span>
                                </div>
                                <p className="text-xs text-white/70 leading-relaxed max-w-[280px] sm:max-w-md">
                                    {incident.message}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] font-mono mt-1">
                                    <span className="text-white/30">Region:</span>
                                    <span className="text-white/60">{incident.region}</span>
                                    <span className="text-white/20">|</span>
                                    <span className="text-white/30">SSP:</span>
                                    <span className="text-white/60">{incident.ssp}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {!incident.resolved && (
                            <button
                                onClick={() => handleResolve(incident.id)}
                                className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                MITIGATE
                            </button>
                        )}
                        {incident.resolved && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-500/60 font-mono flex items-center gap-1 px-1 py-0.5">
                                MITIGATED
                            </span>
                        )}
                    </div>
                ))}

                {state.activeIncidents.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 text-xs">
                        No active network threats identified.
                    </div>
                )}
            </div>
        </div>
    );
};
