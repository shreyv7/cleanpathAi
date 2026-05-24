
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
        <div className="bg-[#0D1117] rounded-3xl border border-white/5 glass overflow-hidden flex flex-col transition-all hover:border-white/10">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-orange-500/5 to-transparent">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <ShieldAlert className="text-orange-400 w-6 h-6" />
                        Supply Path Integrity
                    </h3>
                    <p className="text-white/40 text-sm mt-1">
                        Auditing financial leakage from duplicate auction paths and fee stacking.
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-orange-400 font-bold font-mono text-4xl">{anomalies.length}</span>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-black mt-1">Active Alerts</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-white/30 text-[10px] uppercase tracking-widest font-black border-b border-white/5 whitespace-nowrap">
                            <th className="px-8 py-5">Publisher Environment</th>
                            <th className="px-8 py-5">Violation Type</th>
                            <th className="px-8 py-5">Risk Tier</th>
                            <th className="px-8 py-5">Audit Insight</th>
                            <th className="px-8 py-5 text-right">Inventory Audit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {anomalies.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                        <AlertTriangle className="w-8 h-8" />
                                        <p className="font-mono italic text-sm">
                                            [ No supply path anomalies detected. All routes optimized. ]
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : anomalies.map((anomaly, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => router.push(`/investigate/${encodeURIComponent(anomaly.siteDomain)}`)}>
                                <td className="px-8 py-6">
                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer text-base">
                                        {anomaly.siteDomain}
                                    </div>
                                    <div className="text-[10px] text-white/30 font-mono uppercase mt-1">ID: {anomaly.siteId}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-white/80 font-medium tracking-tight">
                                        {anomaly.type.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg ${anomaly.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                        }`}>
                                        {anomaly.severity}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <TrendingDown className={`w-4 h-4 ${anomaly.severity === 'HIGH' ? 'text-red-500' : 'text-orange-500'}`} />
                                        <span>{anomaly.details}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all text-white/40 hover:text-white active:scale-90">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">
                    Last audit sync: {new Date().toLocaleTimeString()}
                </p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-emerald-500/80 font-bold">LIVE AUDIT ACTIVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
