
import React, { useState, useEffect } from 'react';
import { PathGraph } from './PathGraph';
import { fetchPublisherGraph, GraphData } from '../../services/graphService';
import { Search, Loader2, AlertCircle, Info } from 'lucide-react';

/**
 * Task 6.2: Implement Supply Path Topology Component
 * This component acts as the main explorer for supply paths.
 * It manages the state for publisher lookup and displays the graph with analytics.
 */
export const SupplyPathExplorer: React.FC = () => {
    const [publisherId, setPublisherId] = useState('pub_anomaly_1');
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadGraph = async (id: string) => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchPublisherGraph(id);
            setGraphData(data);
            if (data.nodes.length === 0) {
                setError('No graph data found for this publisher.');
            }
        } catch (err) {
            setError('Error connecting to Graph API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGraph(publisherId);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadGraph(publisherId);
    };

    const sspCount = new Set(graphData.nodes.filter(n => n.label === 'SSP').map(n => n.id)).size;
    const pathComplexity = graphData.links.length;

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header and Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Supply Path Intelligence</h2>
                    <p className="text-slate-500 dark:text-white/50 text-lg max-w-2xl">
                        Audit the programmatic topology. Map direct sellers vs. redundant resellers.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                        <input
                            type="text"
                            value={publisherId}
                            onChange={(e) => setPublisherId(e.target.value)}
                            placeholder="Publisher ID (e.g. pub_1)"
                            className="w-full bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl px-8 py-3 font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Explore'}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Graph View */}
                <div className="xl:col-span-3">
                    <PathGraph data={graphData} />
                </div>

                {/* Sidebar Metrics */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 dark:bg-white/5 dark:border-white/5 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 mb-2">
                            <Info className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Topology Health</span>
                        </div>

                        <div>
                            <h4 className="text-slate-500 dark:text-white/40 text-sm mb-1 font-medium">Path Complexity</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white">{pathComplexity}</span>
                                <span className="text-slate-400 dark:text-white/30 text-sm">relationships</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-slate-500 dark:text-white/40 text-sm mb-1 font-medium">Unique Intermediaries</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400">{sspCount}</span>
                                <span className="text-slate-400 dark:text-white/30 text-sm">SSPs</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-6 border-t border-slate-100 dark:border-white/10">
                            <h4 className="text-slate-500 dark:text-white/40 text-sm mb-3 font-medium">Route Efficiency</h4>
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold tracking-widest ${pathComplexity === 0 ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20' :
                                    pathComplexity <= 2 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                        'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                                }`}>
                                {pathComplexity === 0 ? 'N/A' : pathComplexity <= 2 ? 'EFFICIENT' : 'DEGRADED'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-600/10 rounded-3xl p-8 border border-blue-100 dark:border-blue-500/20 flex flex-col gap-2 shadow-sm">
                        <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                            <span className="font-bold text-blue-900 dark:text-white">Insight:</span> Multi-hop paths increase financial "tax" on ad spend. Direct paths provide 15-20% better working media.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
