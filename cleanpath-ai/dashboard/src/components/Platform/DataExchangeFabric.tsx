import React from 'react';
import { RefreshCw, Activity, ArrowRightLeft } from 'lucide-react';

interface TelemetryExchangeLog {
    id: string;
    source: string;
    action: string;
    enrichment: string;
    status: 'ENRICHED' | 'SYNCED';
}

const EXCHANGE_LOGS: TelemetryExchangeLog[] = [
    { id: 'log_01', source: 'The Trade Desk Bidstream', action: 'Ingested raw spend attributes for campaign Horizon CTV', enrichment: 'Mapped reseller hops & isolated 4 emulator domains', status: 'ENRICHED' },
    { id: 'log_02', source: 'Snowflake Database Core', action: 'Synchronized integrity indices with local tables', enrichment: 'SOC2 hash verification checked successfully', status: 'SYNCED' },
    { id: 'log_03', source: 'Datadog Agent Hub', action: 'Propagated routing edge latencies statistics', enrichment: 'Decayed OpenX trust ratings globally due to 160ms spikes', status: 'ENRICHED' }
];

export const DataExchangeFabric: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Live Data Exchange Fabric
                        </h2>
                        <p className="text-[10px] text-white/40">Real-time enrichment of external programmatic telemetry logs</p>
                    </div>
                </div>
            </div>

            {/* Logs Cascade */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {EXCHANGE_LOGS.map((log) => (
                    <div
                        key={log.id}
                        className="p-3.5 rounded-xl border border-white/5 bg-[#03060a]/60 hover:bg-[#05080f]/80 hover:border-white/10 transition-all duration-300 flex flex-col gap-2 relative"
                    >
                        {/* Top: Source & Status */}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-white/95">{log.source}</span>
                            <span className="text-[8.5px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                                {log.status}
                            </span>
                        </div>

                        {/* Action details */}
                        <p className="text-[10px] text-white/45 pl-0 leading-normal">
                            Action: <span className="text-white/70">{log.action}</span>
                        </p>

                        {/* Enrichment notes */}
                        <div className="text-[9.5px] text-emerald-400 bg-emerald-500/5 p-2 rounded border border-emerald-500/10 leading-relaxed font-sans">
                            <span className="font-bold font-mono">CLEANPATH ENRICHMENT:</span> {log.enrichment}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
