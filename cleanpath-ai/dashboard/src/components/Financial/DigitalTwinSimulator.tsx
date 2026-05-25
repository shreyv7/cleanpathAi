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
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-6 h-[420px]">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    CleanPath Financial Digital Twin Simulator
                </h2>
                <p className="text-[10px] text-white/40">Model buy-side structural routing consolidations and outcome returns</p>
            </div>

            {/* Layout: Switches + Live Projections */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Switches Column */}
                <div className="w-1/2 flex flex-col gap-3 font-mono text-[10px] text-white/55 pr-3 border-r border-white/5 overflow-y-auto investigation-scroll">
                    <span className="text-[9px] text-white/20 uppercase mb-1">Toggle Optimization Hops</span>

                    {/* SSP-X */}
                    <label className="flex items-start gap-2.5 p-2 rounded bg-white/[0.01] border border-white/5 cursor-pointer hover:bg-white/[0.03] select-none">
                        <input
                            type="checkbox"
                            checked={removeSspX}
                            onChange={(e) => setRemoveSspX(e.target.checked)}
                            className="mt-0.5 rounded border-white/10 bg-transparent text-blue-500 focus:ring-0 focus:ring-offset-0"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white/80 font-bold">Consolidate SSP-X</span>
                            <span className="text-[8px] text-white/35">Bypass duplicate reseller nodes</span>
                        </div>
                    </label>

                    {/* Direct routing */}
                    <label className="flex items-start gap-2.5 p-2 rounded bg-white/[0.01] border border-white/5 cursor-pointer hover:bg-white/[0.03] select-none">
                        <input
                            type="checkbox"
                            checked={enableDirectRouting}
                            onChange={(e) => setEnableDirectRouting(e.target.checked)}
                            className="mt-0.5 rounded border-white/10 bg-transparent text-blue-500 focus:ring-0 focus:ring-offset-0"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white/80 font-bold">Direct PMP Routing</span>
                            <span className="text-[8px] text-white/35">Enforce buy-side direct contracts</span>
                        </div>
                    </label>

                    {/* Bypass Arbitrage */}
                    <label className="flex items-start gap-2.5 p-2 rounded bg-white/[0.01] border border-white/5 cursor-pointer hover:bg-white/[0.03] select-none">
                        <input
                            type="checkbox"
                            checked={bypassArbitrage}
                            onChange={(e) => setBypassArbitrage(e.target.checked)}
                            className="mt-0.5 rounded border-white/10 bg-transparent text-blue-500 focus:ring-0 focus:ring-offset-0"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white/80 font-bold">Arbitrage Bypasses</span>
                            <span className="text-[8px] text-white/35">Bypass high-hop liquidity steps</span>
                        </div>
                    </label>

                    {/* MFA Suppression */}
                    <label className="flex items-start gap-2.5 p-2 rounded bg-white/[0.01] border border-white/5 cursor-pointer hover:bg-white/[0.03] select-none">
                        <input
                            type="checkbox"
                            checked={mfaSuppression}
                            onChange={(e) => setMfaSuppression(e.target.checked)}
                            className="mt-0.5 rounded border-white/10 bg-transparent text-blue-500 focus:ring-0 focus:ring-offset-0"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white/80 font-bold">MFA Suppression</span>
                            <span className="text-[8px] text-white/35">Block low-attention arbitrage logs</span>
                        </div>
                    </label>
                </div>

                {/* Outputs Column */}
                <div className="flex-1 flex flex-col justify-between font-mono pr-1 overflow-y-auto investigation-scroll">
                    {/* Simulated Working Media % */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/30 uppercase">Projected Working Media Ratio</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white">{estimatedWorkingMedia.toFixed(1)}%</span>
                            <span className="text-[10px] text-emerald-400 font-bold">+{simulation.workingMediaChange}% delta</span>
                        </div>
                    </div>

                    {/* Projected Quarterly savings */}
                    <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                        <span className="text-[9px] text-white/30 uppercase">Est. Quarterly Spend Recovery</span>
                        <div className="text-xl font-bold text-emerald-400">
                            ${simulation.quarterlySavings.toLocaleString()}
                        </div>
                    </div>

                    {/* Latency and Duplication metrics */}
                    <div className="flex flex-col gap-2 border-t border-white/5 pt-3 text-[10px]">
                        <div className="flex justify-between text-white/45">
                            <span>Latency Savings:</span>
                            <span className="text-emerald-400 font-bold">{simulation.latencyDeltaMs}ms</span>
                        </div>
                        <div className="flex justify-between text-white/45">
                            <span>Auction Duplication:</span>
                            <span className="text-emerald-400 font-bold">-{simulation.bidDuplicationReduction}%</span>
                        </div>
                        <div className="flex justify-between text-white/45">
                            <span>Simulation Confidence:</span>
                            <span className="text-blue-400 font-bold">{simulation.confidence}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
