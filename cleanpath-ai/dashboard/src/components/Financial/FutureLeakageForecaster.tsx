import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { TrendingUp, Award, Calendar, AlertTriangle } from 'lucide-react';

interface ForecastQuarter {
    quarter: string;
    baselineLeakageUsd: number;
    optimizedLeakageUsd: number;
    efficiencyGainPct: number;
}

const QUARTERLY_FORECASTS: ForecastQuarter[] = [
    { quarter: 'Q2 2026', baselineLeakageUsd: 480000, optimizedLeakageUsd: 140000, efficiencyGainPct: 8.2 },
    { quarter: 'Q3 2026', baselineLeakageUsd: 620000, optimizedLeakageUsd: 180000, efficiencyGainPct: 14.5 },
    { quarter: 'Q4 2026', baselineLeakageUsd: 790000, optimizedLeakageUsd: 210000, efficiencyGainPct: 22.4 },
    { quarter: 'Q1 2027', baselineLeakageUsd: 940000, optimizedLeakageUsd: 240000, efficiencyGainPct: 28.0 }
];

export const FutureLeakageForecaster: React.FC = () => {
    const state = useTelemetry();

    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 h-[400px] transition-all">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Predictive Strategic Financial Horizons
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Multi-quarter programmatic leakage growth & optimized recovery bounds</p>
                    </div>
                </div>
            </div>

            {/* Visual list */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {QUARTERLY_FORECASTS.map((fc) => {
                    const totalSavings = fc.baselineLeakageUsd - fc.optimizedLeakageUsd;

                    return (
                        <div
                            key={fc.quarter}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[#03060a]/60 dark:hover:bg-[#05080f]/80 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 flex flex-col gap-2.5 shadow-sm"
                        >
                            {/* Quarter Title & Saving */}
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 dark:text-white/90 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    {fc.quarter}
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                    Saved: ${totalSavings.toLocaleString()}
                                </span>
                            </div>

                            {/* Performance bars compared */}
                            <div className="space-y-1.5 text-[9.5px]">
                                {/* Baseline Leakage */}
                                <div className="flex justify-between items-center text-slate-500 dark:text-white/45 font-medium">
                                    <span>Unmitigated Leakage:</span>
                                    <span className="text-slate-750 dark:text-white/80 font-bold">${fc.baselineLeakageUsd.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                                    <div className="bg-red-500/60 h-full" style={{ width: `${(fc.baselineLeakageUsd / 1000000) * 100}%` }} />
                                </div>

                                {/* Optimized Leakage */}
                                <div className="flex justify-between items-center text-slate-500 dark:text-white/45 pt-1 font-medium">
                                    <span>Optimized Leakage (CleanPath Active):</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">${fc.optimizedLeakageUsd.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${(fc.optimizedLeakageUsd / 1000000) * 100}%` }} />
                                </div>
                            </div>

                            {/* Working media delta */}
                            <div className="flex justify-between items-center text-[9px] border-t border-slate-150 dark:border-white/5 pt-2 mt-0.5 text-slate-400 dark:text-white/30 font-medium">
                                <span>Projected Path Efficiency Improvement:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{fc.efficiencyGainPct}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
