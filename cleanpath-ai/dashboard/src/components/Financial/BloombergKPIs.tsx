import React, { useState, useEffect } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { TrendingUp, Landmark, ShieldCheck, Activity, LandmarkIcon } from 'lucide-react';

export const BloombergKPIs: React.FC = () => {
    const state = useTelemetry();
    const [animatedBlocked, setAnimatedBlocked] = useState(state.totalBlockedSpend);

    useEffect(() => {
        const step = () => {
            setAnimatedBlocked(prev => {
                const diff = state.totalBlockedSpend - prev;
                if (Math.abs(diff) < 0.05) return state.totalBlockedSpend;
                return prev + diff * 0.15;
            });
        };
        const interval = setInterval(step, 80);
        return () => clearInterval(interval);
    }, [state.totalBlockedSpend]);

    const hiddenTax = parseFloat((25 - state.routeEfficiency * 0.15 + (state.graphToxicity / 6)).toFixed(1));
    const netRecovery = animatedBlocked + state.totalSavingsFromShading;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full select-none">
            {/* Total Media Spend */}
            <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px] group transition-all">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-white/35 font-mono">TOTAL AUDITED SPEND</span>
                    <Landmark className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                    <div className="text-3xl font-black font-mono text-slate-900 dark:text-white/90 tracking-tight">$2,840,000</div>
                    <span className="text-[9px] text-slate-400 dark:text-white/20 mt-1 font-mono">Across all programmatic channels</span>
                </div>
            </div>

            {/* Working Media % */}
            <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px] group transition-all">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-white/35 font-mono">WORKING MEDIA RATIO</span>
                    <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <div className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400 tracking-tight">
                        {state.overallWorkingMediaPercent.toFixed(1)}%
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-white/20 mt-1 font-mono">QoQ Improvement: +4.2%</span>
                </div>
            </div>

            {/* Net Recovery Value */}
            <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px] group transition-all">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-white/35 font-mono">NET RECOVERY VALUE</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                        ${netRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-white/20 mt-1 font-mono">Live waste preventions + AI shadings</span>
                </div>
            </div>
        </div>
    );
};
