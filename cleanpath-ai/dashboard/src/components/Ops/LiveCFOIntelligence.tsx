import React, { useState, useEffect } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { DollarSign, ShieldCheck, TrendingUp, Landmark, Calculator } from 'lucide-react';

export const LiveCFOIntelligence: React.FC = () => {
    const state = useTelemetry();
    const [animatedBlocked, setAnimatedBlocked] = useState(state.totalBlockedSpend);
    const [animatedSavings, setAnimatedSavings] = useState(state.totalSavingsFromShading);

    // Smooth counter updates to make numbers feel truly alive!
    useEffect(() => {
        const step = () => {
            setAnimatedBlocked(prev => {
                const diff = state.totalBlockedSpend - prev;
                if (Math.abs(diff) < 0.05) return state.totalBlockedSpend;
                return prev + diff * 0.15;
            });
            setAnimatedSavings(prev => {
                const diff = state.totalSavingsFromShading - prev;
                if (Math.abs(diff) < 0.05) return state.totalSavingsFromShading;
                return prev + diff * 0.15;
            });
        };
        const interval = setInterval(step, 80);
        return () => clearInterval(interval);
    }, [state.totalBlockedSpend, state.totalSavingsFromShading]);

    // Live intermediate tax derived from active incidents and route efficiency
    const intermediaryTax = parseFloat((25 - state.routeEfficiency * 0.15 + (state.graphToxicity / 6)).toFixed(1));
    const projectedRecovery = (animatedBlocked + animatedSavings) * 90; // Projections scaled 90 days out

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-6">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-500" />
                    Live CFO Intelligence Panel
                </h2>
                <p className="text-[10px] text-white/40">Real-time economic verification & supply chain leakage control</p>
            </div>

            {/* Financial Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Waste Prevented */}
                <div className="p-4 rounded-xl border border-white/5 bg-[#03060a]/60 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Total Fraud Excluded</span>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                        ${animatedBlocked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[9px] text-white/30 mt-1">Live programmatic bid-waste prevented</span>
                </div>

                {/* Shading Savings */}
                <div className="p-4 rounded-xl border border-white/5 bg-[#03060a]/60 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Bid Shading Optimization</span>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <DollarSign className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-blue-400 tracking-tight">
                        ${animatedSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[9px] text-white/30 mt-1">AI-driven buy-side cost optimization</span>
                </div>
            </div>

            {/* Sub-KPI List */}
            <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-white/50">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                        <span>Working Media Delta</span>
                    </div>
                    <span className="font-mono font-bold text-purple-400">+{((state.overallWorkingMediaPercent - 75) * 1.2).toFixed(1)}%</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-white/50">
                        <Landmark className="w-3.5 h-3.5 text-orange-400" />
                        <span>Average Intermediary Tax</span>
                    </div>
                    <span className="font-mono font-bold text-orange-400">{intermediaryTax}%</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-white/50">
                        <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Projected 90-Day Recovery</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-400">
                        ${projectedRecovery.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>
            </div>

            {/* Financial Health Status Bar */}
            <div className="bg-[#03060a]/90 border border-white/5 rounded-lg p-3 text-[10px] text-white/50 font-mono leading-relaxed">
                <div className="flex justify-between mb-1 text-[9px] text-white/30">
                    <span>Clean Media Integrity Index</span>
                    <span className="text-emerald-400 font-bold">OPTIMAL</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden mb-2">
                    <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" 
                        style={{ width: `${state.overallWorkingMediaPercent}%` }}
                    />
                </div>
                CFO direct leakage rate is stabilized at <span className="text-red-400">${state.financialLeakageRate.toFixed(2)}/min</span>.
            </div>
        </div>
    );
};
