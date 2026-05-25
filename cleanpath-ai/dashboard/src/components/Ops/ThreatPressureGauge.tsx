import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const ThreatPressureGauge: React.FC = () => {
    const state = useTelemetry();

    // Derived global integrity score: invert fraud pressure and adjust by toxic count
    const integrityScore = Math.max(12, 100 - state.globalFraudPressure - Math.floor(state.graphToxicity * 0.15));

    // Circle properties for a beautiful SVG ring
    const radius = 50;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (integrityScore / 100) * circumference;

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col items-center justify-between h-[240px]">
            {/* Top info */}
            <div className="w-full text-left self-start">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                    Global Integrity Index
                </h2>
                <p className="text-[10px] text-white/40">CleanPath continuous buy-side protection efficiency</p>
            </div>

            {/* Gauge Graphic */}
            <div className="relative flex items-center justify-center my-2 shrink-0 select-none">
                <svg className="w-28 h-28 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        stroke="#ffffff"
                        strokeOpacity="0.04"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Glowing outer aura for critical levels */}
                    {integrityScore < 70 && (
                        <circle
                            cx="56"
                            cy="56"
                            r={radius}
                            stroke={integrityScore < 50 ? '#ef4444' : '#eab308'}
                            strokeOpacity="0.1"
                            strokeWidth={strokeWidth + 6}
                            fill="transparent"
                            className="blur-sm animate-pulse"
                        />
                    )}
                    {/* Animated arc representing clean traffic factor */}
                    <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        stroke={integrityScore > 75 ? '#10b981' : integrityScore > 50 ? '#eab308' : '#ef4444'}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                    />
                </svg>

                {/* Score text overlay inside circle */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black font-mono text-white/90 tracking-tight">
                        {integrityScore}%
                    </span>
                    <span className={`text-[8px] font-black font-mono tracking-widest uppercase mt-0.5 ${
                        integrityScore > 75 ? 'text-emerald-400' : integrityScore > 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                        {integrityScore > 75 ? 'optimal' : integrityScore > 50 ? 'degraded' : 'critical'}
                    </span>
                </div>
            </div>

            {/* Bottom info */}
            <div className="w-full text-xs font-mono flex items-center justify-between text-white/40 border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5">
                    {integrityScore > 75 ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
                    )}
                    <span>Graph Toxicity:</span>
                </div>
                <span className="font-bold text-white/80">{state.graphToxicity}%</span>
            </div>
        </div>
    );
};
