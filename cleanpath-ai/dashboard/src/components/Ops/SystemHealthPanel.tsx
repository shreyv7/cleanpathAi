import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Server, Activity, Cpu, Database, Network } from 'lucide-react';

export const SystemHealthPanel: React.FC = () => {
    const state = useTelemetry();

    return (
        <div className="card-elevated gap-4">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                    Infrastructure & Telemetry Health
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">CleanPath Gatekeeper cluster status & execution latency</p>
            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Global QPS */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[#03060a]/60 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 dark:text-white/30 mb-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider">Bid Throughput</span>
                        <Network className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-800 dark:text-white/90" suppressHydrationWarning={true}>
                        {state.bidThroughput.toLocaleString()} <span className="text-xs text-slate-500 dark:text-white/30 font-sans">QPS</span>
                    </div>
                </div>

                {/* Edge Latency */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[#03060a]/60 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 dark:text-white/30 mb-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider">Edge Latency</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {state.systemHealth.edgeLatencyMs} <span className="text-xs text-emerald-600/60 dark:text-emerald-400/50 font-sans">ms</span>
                    </div>
                </div>

                {/* Model Inference */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[#03060a]/60 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 dark:text-white/30 mb-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider">AI Inference</span>
                        <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                        {state.systemHealth.inferenceTimeMs} <span className="text-xs text-purple-600/60 dark:text-purple-400/50 font-sans">ms</span>
                    </div>
                </div>

                {/* Redis Load */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[#03060a]/60 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 dark:text-white/30 mb-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider">Redis Pressure</span>
                        <Database className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-orange-600 dark:text-orange-400">
                        {state.systemHealth.redisPressurePercent}%
                    </div>
                </div>
            </div>

            {/* Live Progress Bar indicator */}
            <div className="border-t border-slate-200 dark:border-white/5 pt-3 mt-1 flex flex-col gap-2 font-mono text-[9px] text-slate-500 dark:text-white/40 font-medium">
                <div className="flex justify-between items-center">
                    <span>Cluster CPU Load</span>
                    <span className="text-slate-700 dark:text-white/80 font-bold">{state.systemHealth.cpuLoadPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                    <div 
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${state.systemHealth.cpuLoadPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
