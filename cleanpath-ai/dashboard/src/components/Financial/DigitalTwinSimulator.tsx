import React, { useState } from 'react';
import { runDigitalTwinSimulation } from '@/lib/financialTwin';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Cpu, ShieldCheck, ArrowRight, Activity, Percent } from 'lucide-react';

export const DigitalTwinSimulator: React.FC = () => {
    const state = useTelemetry();
    
    // Switch states
    const [removeSspX, setRemoveSspX] = useState<boolean>(true);
    const [enableDirectRouting, setEnableDirectRouting] = useState<boolean>(false);
    const [bypassArbitrage, setBypassArbitrage] = useState<boolean>(true);
    const [mfaSuppression, setMfaSuppression] = useState<boolean>(false);

    const simulation = runDigitalTwinSimulation(
        removeSspX,
        enableDirectRouting,
        bypassArbitrage,
        mfaSuppression
    );

    const estimatedWorkingMedia = Math.min(99.5, state.overallWorkingMediaPercent + simulation.workingMediaChange);

    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-6 h-[420px] transition-all">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    CleanPath Financial Digital Twin Simulator
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Model buy-side structural routing consolidations and outcome returns</p>
            </div>

            {/* Layout: Switches + Live Projections */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Switches Column */}
                <div className="w-1/2 flex flex-col gap-3 font-mono text-[10px] text-slate-600 dark:text-white/55 pr-3 border-r border-slate-200 dark:border-white/5 overflow-y-auto investigation-scroll">
                    <span className="text-[9px] text-slate-400 dark:text-white/20 uppercase mb-1 font-bold">Toggle Optimization Hops</span>

                    {/* SSP-X */}
                    <label className="flex items-start gap-2.5 p-2 rounded bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.03] select-none shadow-sm transition-colors">
                        <input
                            type="checkbox"
                            checked={removeSspX}
                            onChange={(e) => setRemoveSspX(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 dark:border-white/10 bg-transparent text-blue-600 dark:text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-900 dark:text-white/80 font-bold">Consolidate SSP-X</span>
                            <span className="text-[8px] text-slate-500 dark:text-white/35">Bypass duplicate reseller nodes</span>
                        </div>
                    </label>

                    {/* Direct routing */}
                    <label className="flex items-start gap-2.5 p-2 rounded bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.03] select-none shadow-sm transition-colors">
                        <input
                            type="checkbox"
                            checked={enableDirectRouting}
                            onChange={(e) => setEnableDirectRouting(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 dark:border-white/10 bg-transparent text-blue-600 dark:text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-900 dark:text-white/80 font-bold">Direct PMP Routing</span>
                            <span className="text-[8px] text-slate-500 dark:text-white/35">Enforce buy-side direct contracts</span>
                        </div>
                    </label>

                    {/* Bypass Arbitrage */}
                    <label className="flex items-start gap-2.5 p-2 rounded bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.03] select-none shadow-sm transition-colors">
                        <input
                            type="checkbox"
                            checked={bypassArbitrage}
                            onChange={(e) => setBypassArbitrage(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 dark:border-white/10 bg-transparent text-blue-600 dark:text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-900 dark:text-white/80 font-bold">Arbitrage Bypasses</span>
                            <span className="text-[8px] text-slate-500 dark:text-white/35">Bypass high-hop liquidity steps</span>
                        </div>
                    </label>

                    {/* MFA Suppression */}
                    <label className="flex items-start gap-2.5 p-2 rounded bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.03] select-none shadow-sm transition-colors">
                        <input
                            type="checkbox"
                            checked={mfaSuppression}
                            onChange={(e) => setMfaSuppression(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 dark:border-white/10 bg-transparent text-blue-600 dark:text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-900 dark:text-white/80 font-bold">MFA Suppression</span>
                            <span className="text-[8px] text-slate-500 dark:text-white/35">Block low-attention arbitrage logs</span>
                        </div>
                    </label>
                </div>

                {/* Outputs Column */}
                <div className="flex-1 flex flex-col justify-between font-mono pr-1 overflow-y-auto investigation-scroll">
                    {/* Simulated Working Media % */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-slate-500 dark:text-white/30 uppercase font-semibold">Projected Working Media Ratio</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{estimatedWorkingMedia.toFixed(1)}%</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+{simulation.workingMediaChange}% delta</span>
                        </div>
                    </div>

                    {/* Projected Spend Recovery */}
                    <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-white/5 pt-3">
                        <span className="text-[9px] text-slate-500 dark:text-white/30 uppercase font-semibold">Est. Quarterly Spend Recovery</span>
                        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            ${simulation.quarterlySavings.toLocaleString()}
                        </div>
                    </div>

                    {/* Latency metrics */}
                    <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-white/5 pt-3 text-[10px]">
                        <div className="flex justify-between text-slate-600 dark:text-white/45 font-medium">
                            <span>Latency Savings:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{simulation.latencyDeltaMs}ms</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-white/45 font-medium">
                            <span>Auction Duplication:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{simulation.bidDuplicationReduction}%</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-white/45 font-medium">
                            <span>Simulation Confidence:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{simulation.confidence}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
