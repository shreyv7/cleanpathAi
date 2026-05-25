import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchDecisionLog } from '@/services/statsService';
import { DecisionLogEntry, DecisionLogResponse } from '@/services/types';
import { Calendar, Filter, ChevronLeft, ChevronRight, Hash, Clock, Globe, Shield } from 'lucide-react';

export const DecisionLog: React.FC = () => {
    const [data, setData] = useState<DecisionLogResponse | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const result = await fetchDecisionLog(page, 20, filter);
                setData(result);
            } catch (err) {
                console.error('Failed to load decision log', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [page, filter]);

    const getDecisionBadge = (decision: string) => {
        switch (decision) {
            case 'BLOCK':
                return <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold uppercase tracking-wider">Block</span>;
            case 'BID_MODIFIER':
                return <span className="px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold uppercase tracking-wider">Modify</span>;
            default:
                return <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">Allow</span>;
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Technical Decision Log</h2>
                    <p className="text-slate-500 dark:text-white/40 text-sm mt-1">Real-time edge classification audit trail</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-lg p-1">
                    {['', 'ALLOW', 'BLOCK', 'BID_MODIFIER'].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${filter === f
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/5'
                                }`}
                        >
                            {f === '' ? 'All Requests' : f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-slate-200 dark:bg-[#080A0F] dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-white/5 dark:bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider"><div className="flex items-center gap-2"><Clock className="w-3 h-3" /> Timestamp</div></th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider"><div className="flex items-center gap-2"><Globe className="w-3 h-3" /> Publisher ID</div></th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider"><div className="flex items-center gap-2"><Shield className="w-3 h-3" /> Score</div></th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">Decision</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider text-right"><div className="flex items-center gap-2 justify-end"><Hash className="w-3 h-3" /> Latency</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/50 dark:bg-white/[0.01]"></td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-white/20 text-sm">No decisions found for selected filters</td>
                                </tr>
                            ) : (
                                data?.data.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => router.push(`/investigate/${encodeURIComponent(entry.publisher_id)}`)}>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70 font-mono whitespace-nowrap" suppressHydrationWarning>
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white/90 font-semibold whitespace-nowrap">
                                            {entry.publisher_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${entry.thermal_score > 70 ? 'bg-red-500' : entry.thermal_score > 30 ? 'bg-yellow-500' : 'bg-emerald-500'
                                                            }`}
                                                        style={{ width: `${entry.thermal_score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-white/50">{entry.thermal_score}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getDecisionBadge(entry.decision)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-mono text-blue-600 dark:text-blue-400 font-bold">
                                            {entry.latency_ms}ms
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-white/30">
                            Showing page {page} of {data.pagination.pages} ({data.pagination.total} total events)
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-white" />
                            </button>
                            <button
                                disabled={page >= data.pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
