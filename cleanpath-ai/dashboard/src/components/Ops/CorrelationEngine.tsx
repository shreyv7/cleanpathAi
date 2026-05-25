import React, { useState, useEffect } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Brain, Cpu, MessageSquare, ArrowRight } from 'lucide-react';

export const CorrelationEngine: React.FC = () => {
    const state = useTelemetry();
    const [insight, setInsight] = useState<string>('Synthesizing operational telemetry. Model converging...');

    useEffect(() => {
        // Find if there is a critical or high severity active incident
        const urgentInc = state.activeIncidents.find(inc => !inc.resolved);
        
        let dynamicInsight = '';
        if (urgentInc) {
            if (urgentInc.type === 'SPOOFING') {
                dynamicInsight = `Active ${urgentInc.region} spoofing surge on ${urgentInc.ssp} shares 84.7% behavioral similarity with historical MFA arbitrage loops. Recommend auto-pacing suppression.`;
            } else if (urgentInc.type === 'MFA_ARBITRAGE') {
                dynamicInsight = `MFA stack identified on ${urgentInc.ssp} is inflating intermediary hop count to ${state.activePathReroutes + 2}. Estimated working media dilution: $${(urgentInc.leakageRateSpike * 60).toFixed(0)}/hour.`;
            } else if (urgentInc.type === 'EMULATOR_FARM') {
                dynamicInsight = `CTV device emulator fingerprint detected in ${urgentInc.region}. Multi-hop signature matches known spoofing cluster targeting premium linear streaming slots.`;
            } else {
                dynamicInsight = `Fee stacking anomaly correlates directly with SSP trust degradation on ${urgentInc.ssp} and bid duplication spikes in ${urgentInc.region}.`;
            }
        } else {
            dynamicInsight = 'Operational parameters stabilized. Live traffic patterns demonstrate 98.4% brand-safety alignment across all SSP pipelines.';
        }

        setInsight(dynamicInsight);
    }, [state.activeIncidents, state.activePathReroutes, state.routeEfficiency]);

    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-650 dark:text-purple-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Multi-Signal Correlation Engine
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">CleanPath AI Deep Synthesis & Threat Attribution</p>
                    </div>
                </div>
                <div className="p-1 rounded bg-purple-55 border border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400 flex items-center gap-1 text-[9px] font-mono shadow-sm">
                    <Cpu className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>L4_MODEL_ACTIVE</span>
                </div>
            </div>

            {/* Simulated AI Log Output */}
            <div className="flex-1 bg-slate-900 border border-slate-950 dark:bg-[#03060a]/90 dark:border-white/5 rounded-xl p-4 font-mono text-xs text-purple-300 relative overflow-hidden min-h-[140px] flex flex-col justify-between shadow-inner">
                {/* Visual scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

                <div className="space-y-3 z-10">
                    <div className="flex items-center gap-1.5 text-white/40 text-[9px]">
                        <span>[CORE_ATTRIBUTION_MODEL]</span>
                        <span>•</span>
                        <span>CONFIDENCE: 92.4%</span>
                    </div>
                    <p className="leading-relaxed text-white/90">
                        {insight}
                    </p>
                </div>

                <div className="flex items-center justify-between text-[9px] border-t border-purple-500/10 pt-3 mt-4 text-purple-400/80 z-10 font-bold">
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Attributed Group: AP-2094
                    </span>
                    <button className="flex items-center gap-1 hover:text-purple-300 transition-colors uppercase font-bold tracking-wider cursor-pointer">
                        Inspect Signatures
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};
