import React, { useState } from 'react';
import { PLATFORM_INTEGRATIONS, type IntegrationItem } from '@/lib/platformEngine';
import { Layers, CheckCircle2, RefreshCw, Star } from 'lucide-react';

export const IntegrationMarketplace: React.FC = () => {
    const [integrations, setIntegrations] = useState<IntegrationItem[]>(PLATFORM_INTEGRATIONS);

    const toggleSync = (id: string) => {
        setIntegrations(prev =>
            prev.map(i => {
                if (i.id === id) {
                    const nextStatus = i.status === 'CONNECTED' ? 'SYNCING' : 'CONNECTED';
                    return { ...i, status: nextStatus };
                }
                return i;
            })
        );
    };

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[420px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Enterprise Integration Marketplace
                        </h2>
                        <p className="text-[10px] text-white/40">Sync programmatic spend pipelines with TTD, DV360, & Snowflake</p>
                    </div>
                </div>
            </div>

            {/* Marketplace Grid list */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {integrations.map((item) => {
                    const isSyncing = item.status === 'SYNCING';

                    return (
                        <div
                            key={item.id}
                            className="p-3.5 rounded-xl border border-white/5 bg-[#03060a]/60 hover:bg-[#05080f]/80 hover:border-white/10 transition-all duration-300 flex items-center justify-between"
                        >
                            {/* App title and category */}
                            <div className="space-y-0.5">
                                <span className="text-xs font-black text-white">{item.name}</span>
                                <div className="text-[9px] text-white/30">TYPE: {item.type}</div>
                            </div>

                            {/* Sync values and active indicators */}
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-white/80">
                                        {item.eventsSynced.toLocaleString()} Events
                                    </div>
                                    <span className="text-[8px] text-white/20 uppercase font-bold">Synchronized</span>
                                </div>

                                <div className="text-right">
                                    <button
                                        onClick={() => toggleSync(item.id)}
                                        className={`text-[8.5px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                                            isSyncing
                                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}
                                    >
                                        {isSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                                        <span>{item.status}</span>
                                    </button>
                                    <div className="text-[8px] text-white/25 mt-1 font-bold">
                                        Sync: {item.lastSync}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
