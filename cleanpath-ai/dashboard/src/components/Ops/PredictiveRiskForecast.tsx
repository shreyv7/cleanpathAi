import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { generatePredictiveData } from '@/lib/intelligenceEngine';
import { TrendingUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const PredictiveRiskForecast: React.FC = () => {
    const state = useTelemetry();
    const forecastPoints = generatePredictiveData(state.globalFraudPressure);

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Predictive Threat & Leakage Forecast
                        </h2>
                        <p className="text-[10px] text-white/40">48-Hour mathematical route degradation horizons</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono text-white/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>T_HORIZON_48H</span>
                </div>
            </div>

            {/* High-Tech Grid Forecast */}
            <div className="bg-[#03060a]/90 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/30 border-b border-white/5 pb-2">
                    <span>TIMELINE INTERVAL</span>
                    <span>ROUTE INSTABILITY PROB.</span>
                    <span>EST. LEAKAGE</span>
                </div>

                <div className="flex flex-col gap-3 font-mono">
                    {forecastPoints.map((point) => {
                        const isHighRisk = point.instabilityProb > 70;

                        return (
                            <div key={point.hour} className="flex justify-between items-center text-xs text-white/70">
                                <span className="text-[10px] text-white/45 flex items-center gap-1.5 w-16">
                                    <span>+{point.hour}h</span>
                                    <span className="text-[8px] text-white/20">horizon</span>
                                </span>

                                {/* Progress Visual meter bar */}
                                <div className="flex-1 max-w-[140px] mx-4 flex items-center gap-2">
                                    <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
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

                                <span className="text-[11px] font-bold text-white/95 w-20 text-right">
                                    ${point.leakageUsd}/min
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Predictive summary */}
            <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-2.5 text-[10.5px] text-yellow-500/80 leading-relaxed font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-400 mt-0.5" />
                <p>
                    Accumulated fraud trajectory forecast suggests <span className="text-white font-bold">14% overall path degradation</span> across SSP networks if duplicate routes operate unmitigated over 48h.
                </p>
            </div>
        </div>
    );
};
