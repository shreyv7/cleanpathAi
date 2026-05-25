
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchAnomalies } from '../../services/graphService';
import { AlertTriangle, TrendingDown, ExternalLink, ShieldAlert } from 'lucide-react';

/**
 * Task 6.3: Implement Anomaly Dashboard Widget
 * Provides an executive overview of detected supply path waste.
 * Integrated into the CFO View to highlight financial impact.
 */
export const AnomalyAlerts: React.FC = () => {
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            const data = await fetchAnomalies();
            setAnomalies(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return (
        <div className="w-full h-48 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
    );

    return (
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 hover:border-slate-300 dark:bg-[#090B0E]/50 dark:border-white/5 dark:hover:border-white/10">
            <div className="p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                        <ShieldAlert className="text-red-500 dark:text-red-400 w-5 h-5" />
                        Supply Path Integrity
                    </h3>
                    <p className="text-slate-500 dark:text-white/40 text-xs mt-1">
                        Auditing financial leakage from duplicate auction paths and fee stacking.
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-red-500 dark:text-red-400 font-bold font-mono text-3xl">{anomalies.length}</span>
                    <p className="text-slate-400 dark:text-white/30 text-[9px] uppercase tracking-wider font-bold mt-1">Active Alerts</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 dark:text-white/30 text-[9px] uppercase tracking-wider font-bold border-b border-slate-200 dark:border-white/5 whitespace-nowrap">
                            <th className="px-8 py-4">Publisher Environment</th>
                            <th className="px-8 py-4">Violation Type</th>
                            <th className="px-8 py-4">Risk Tier</th>
                            <th className="px-8 py-4">Audit Insight</th>
                            <th className="px-8 py-4 text-right">Inventory Audit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {anomalies.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                        <AlertTriangle className="w-8 h-8 text-slate-400" />
                                        <p className="font-mono italic text-sm text-slate-500">
                                            [ No supply path anomalies detected. All routes optimized. ]
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : anomalies.map((anomaly, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group cursor-pointer border-b border-slate-200 dark:border-white/5" onClick={() => router.push(`/investigate/${encodeURIComponent(anomaly.siteDomain)}`)}>
                                <td className="px-8 py-5">
                                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer text-sm">
                                        {anomaly.siteDomain}
                                    </div>
                                    <div className="text-[10px] text-slate-400 dark:text-white/30 font-mono mt-1">ID: {anomaly.siteId}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-slate-700 dark:text-white/70 font-medium text-xs">
                                        {anomaly.type.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`text-[9px] font-bold tracking-wider px-2 py-1 rounded ${anomaly.severity === 'HIGH' ? 'bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400'
                                        }`}>
                                        {anomaly.severity}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-white/40 text-xs">
                                        <TrendingDown className={`w-3.5 h-3.5 ${anomaly.severity === 'HIGH' ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}`} />
                                        <span>{anomaly.details}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 p-2.5 rounded-lg transition-all text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white active:scale-95 border border-slate-200 dark:border-transparent">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-8 py-4 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                <p className="text-[9px] text-slate-400 dark:text-white/20 font-mono" suppressHydrationWarning>
                    Last audit sync: {new Date().toLocaleTimeString()}
                </p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">LIVE AUDIT ACTIVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
