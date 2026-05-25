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
        <div className="card-elevated gap-4">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-emerald-550 dark:text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Live Data Exchange Fabric
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Real-time enrichment of external programmatic telemetry logs</p>
                    </div>
                </div>
            </div>

            {/* Logs Cascade */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {EXCHANGE_LOGS.map((log) => (
                    <div
                        key={log.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 dark:border-white/5 dark:bg-[#03060a]/60 dark:hover:bg-[#05080f]/80 dark:hover:border-white/10 transition-all duration-300 flex flex-col gap-2 relative shadow-sm"
                    >
                        {/* Top: Source & Status */}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 dark:text-white/95">{log.source}</span>
                            <span className="text-[8.5px] bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded shadow-sm">
                                {log.status}
                            </span>
                        </div>

                        {/* Action details */}
                        <p className="text-[10px] text-slate-500 dark:text-white/45 pl-0 leading-normal font-medium">
                            Action: <span className="text-slate-700 dark:text-white/70 font-semibold">{log.action}</span>
                        </p>

                        {/* Enrichment notes */}
                        <div className="text-[9.5px] text-emerald-755 bg-emerald-50 p-2 rounded border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/5 dark:border-emerald-500/10 leading-relaxed font-sans shadow-inner">
                            <span className="font-bold font-mono">CLEANPATH ENRICHMENT:</span> {log.enrichment}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
