import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { generatePredictiveData } from '@/lib/intelligenceEngine';
import { TrendingUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const PredictiveRiskForecast: React.FC = () => {
    const state = useTelemetry();
    const forecastPoints = generatePredictiveData(state.globalFraudPressure);

    return (
        <div className="card-elevated gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-650 dark:text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Predictive Threat & Leakage Forecast
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">48-Hour mathematical route degradation horizons</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 dark:text-white/30 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>T_HORIZON_48H</span>
                </div>
            </div>

            {/* High-Tech Grid Forecast */}
            <div className="bg-slate-900 border border-slate-950 dark:bg-[#03060a]/90 dark:border-white/5 rounded-xl p-4 flex flex-col gap-4 shadow-inner">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/40 border-b border-white/5 pb-2">
                    <span>TIMELINE INTERVAL</span>
                    <span>ROUTE INSTABILITY PROB.</span>
                    <span>EST. LEAKAGE</span>
                </div>

                <div className="flex flex-col gap-3 font-mono">
                    {forecastPoints.map((point) => {
                        const isHighRisk = point.instabilityProb > 70;

                        return (
                            <div key={point.hour} className="flex justify-between items-center text-xs text-white/80">
                                <span className="text-[10px] text-white/50 flex items-center gap-1.5 w-16">
                                    <span>+{point.hour}h</span>
                                    <span className="text-[8px] text-white/30">horizon</span>
                                </span>

                                {/* Progress Visual meter bar */}
                                <div className="flex-1 max-w-[140px] mx-4 flex items-center gap-2">
                                    <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${
                                                isHighRisk ? 'bg-red-500 shadow-[0_0_3px_#ef4444]' : 'bg-yellow-500'
                                            }`}
                                            style={{ width: `${point.instabilityProb}%` }}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-bold w-8 text-right ${isHighRisk ? 'text-red-400' : 'text-yellow-400'}`}>
                                        {point.instabilityProb}%
                                    </span>
                                </div>

                                <span className="text-[11px] font-bold text-white w-20 text-right">
                                    ${point.leakageUsd}/min
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Predictive summary */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-yellow-500/5 dark:border-yellow-500/10 dark:text-yellow-500/80 flex items-start gap-2.5 text-[10.5px] leading-relaxed font-mono shadow-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-yellow-400 mt-0.5" />
                <p>
                    Accumulated fraud trajectory forecast suggests <span className="text-slate-800 dark:text-white font-bold">14% overall path degradation</span> across SSP networks if duplicate routes operate unmitigated over 48h.
                </p>
            </div>
        </div>
    );
};
