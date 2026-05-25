import React from 'react';
import { ShieldCheck, ShieldAlert, Play, ArrowRight } from 'lucide-react';

export const ControlPlaneVisualizer: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col justify-between h-[400px]">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500 animate-pulse" />
                    Live Control Plane Rerouting Map
                </h2>
                <p className="text-[10px] text-white/40">Real-time programmatic auction paths and quarantine zones</p>
            </div>

            {/* Visual mapping of bid flow bypasses */}
            <div className="flex-1 bg-[#03060a]/90 border border-white/5 rounded-xl p-4 my-2 relative overflow-hidden flex items-center justify-center min-h-[220px]">
                {/* Background scanning lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Node structure */}
                <div className="w-full flex items-center justify-between px-6 z-10 font-mono text-[9px] relative">
                    {/* Source Node */}
                    <div className="flex flex-col items-center gap-1.5 w-20">
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center">
                            DSP BIDS
                        </div>
                        <span className="text-white/40">Gross Ingress</span>
                    </div>

                    {/* Flow Paths Vector lines */}
                    <div className="flex-1 h-20 relative select-none">
                        {/* Upper path: Bypass Reroute */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                            {/* Path */}
                            <path
                                d="M 0 40 Q 60 5, 120 40"
                                fill="transparent"
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                className="animate-[dash_10s_linear_infinite]"
                            />
                            {/* Lower path: Compromised quarantined path */}
                            <path
                                d="M 0 40 Q 60 75, 120 40"
                                fill="transparent"
                                stroke="#ef4444"
                                strokeWidth="1.5"
                                strokeOpacity="0.4"
                            />
                        </svg>

                        {/* Reroute flow badge */}
                        <span className="absolute top-0.5 left-1/2 transform -translate-x-1/2 bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 font-black px-1 py-0.5 rounded text-[7.5px] uppercase tracking-wider animate-pulse">
                            ACTIVE REROUTE
                        </span>
                        
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-red-500/10 border border-red-500/20 text-red-400/60 font-black px-1 py-0.5 rounded text-[7.5px] uppercase tracking-wider">
                            QUARANTINED
                        </span>
                    </div>

                    {/* Destination Node */}
                    <div className="flex flex-col items-center gap-1.5 w-20">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                            VERIFIED PMP
                        </div>
                        <span className="text-white/40">Publisher Net</span>
                    </div>
                </div>
            </div>

            {/* Sub summary metrics */}
            <div className="text-[10px] font-mono text-white/45 flex justify-between items-center border-t border-white/5 pt-3">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Bypassed: Magnite Reseller-C
                </span>
                <span className="text-emerald-400 font-bold">Rerouting: 100% of affected traffic</span>
            </div>
        </div>
    );
};
