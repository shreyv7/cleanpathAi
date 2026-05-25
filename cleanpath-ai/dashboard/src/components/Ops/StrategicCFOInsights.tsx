import React, { useState } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Landmark, ArrowRight, ShieldCheck, Percent, HelpCircle } from 'lucide-react';

export const StrategicCFOInsights: React.FC = () => {
    const state = useTelemetry();
    const [sliderVal, setSliderVal] = useState<number>(50); // Direct consolidation percent

    // Dynamic calculations
    const cleanMediaDelta = parseFloat((18.4 * (sliderVal / 100)).toFixed(1));
    const duplicateExposureReduction = Math.round(41 * (sliderVal / 100));
    const estimatedYearlyRecovery = Math.round((state.totalBlockedSpend * 365) * (sliderVal / 100));

    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-5 h-[340px] transition-all">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    CFO strategic Buy-Side Insights Engine
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Automated supply chain consolidation projections</p>
            </div>

            {/* Strategic Insights */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/10 dark:bg-emerald-500/5 dark:text-emerald-400 flex flex-col gap-1 text-[11px] font-mono leading-relaxed shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Direct SSP Consolidation Recommendation</span>
                    </div>
                    <p className="text-slate-705 dark:text-white/70 font-semibold">
                        Consolidating EMEA/LATAM traffic directly to clean PMP exchange endpoints is projected to improve overall working media efficiency by <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cleanMediaDelta}%</span> while lowering duplicate auctions by <span className="text-emerald-600 dark:text-emerald-400 font-bold">{duplicateExposureReduction}%</span>.
                    </p>
                </div>

                {/* Simulation Slider */}
                <div className="flex flex-col gap-2 font-mono text-[10px] text-slate-500 dark:text-white/40 mt-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                        <span>PMP Consolidation Simulation Ratio</span>
                        <span className="text-slate-800 dark:text-white font-bold">{sliderVal}% Consolidated</span>
                    </div>
                    
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={sliderVal}
                        onChange={(e) => setSliderVal(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />

                    <div className="flex justify-between items-center text-[9px] border-t border-slate-200 dark:border-white/5 pt-2.5 mt-1 text-slate-500 dark:text-white/30 font-medium">
                        <span className="flex items-center gap-0.5">
                            Estimated Annual Recovery:
                        </span>
                        <span className="text-emerald-650 dark:text-emerald-400 font-bold text-xs font-mono">
                            ${estimatedYearlyRecovery.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
