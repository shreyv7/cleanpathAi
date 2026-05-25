import React, { useEffect, useState } from 'react';
import { DollarSign, ShieldAlert, Zap, BarChart2, TrendingUp, PiggyBank } from 'lucide-react';
import { fetchDecisionStats } from '@/services/statsService';
import { fetchFinancialSummary, type FinancialSummary } from '@/services/financialService';
import { DecisionStats } from '@/services/types';
import { useTelemetry } from '@/hooks/useTelemetry';

export const MetricsSummary: React.FC = () => {
    const liveState = useTelemetry();
    const [stats, setStats] = useState<DecisionStats | null>(null);
    const [financial, setFinancial] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [decisionData, financialData] = await Promise.all([
                    fetchDecisionStats(),
                    fetchFinancialSummary(),
                ]);
                setStats(decisionData);
                setFinancial(financialData);
            } catch (err) {
                setError('Failed to load metrics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
        const interval = setInterval(loadStats, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) return <div className="text-white/50 animate-pulse">Loading executive metrics...</div>;
    if (error && !stats) return <div className="text-red-400">Error: {error}</div>;

    // Synthesize database values with live telemetry ticking values
    const liveRequestsCount = stats ? (stats.total_requests + (liveState.totalRequests - 849200)) : liveState.totalRequests;
    const liveWastePrevented = financial ? (financial.totalBlocked + (liveState.totalBlockedSpend - 42104.50)) : liveState.totalBlockedSpend;
    const liveShadingSavings = financial ? (financial.totalSavingsFromShading + (liveState.totalSavingsFromShading - 18450.20)) : liveState.totalSavingsFromShading;

    const metrics = [
        {
            title: "Total Bid Requests",
            value: liveRequestsCount.toLocaleString(),
            icon: <BarChart2 className="w-5 h-5 text-blue-400" />,
            description: "Processed by edge filter"
        },
        {
            title: "Waste Recovered",
            value: `$${liveWastePrevented.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
            description: "Blocked fraudulent spend"
        },
        {
            title: "Working Media %",
            value: `${liveState.overallWorkingMediaPercent.toFixed(1)}%`,
            icon: <TrendingUp className="w-5 h-5 text-white/70" />,
            description: "Clean ad spend ratio"
        },
        {
            title: "Block Rate",
            value: `${stats?.block_rate.toFixed(1) || "0"}%`,
            icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
            description: "MFA traffic excluded"
        },
        {
            title: "Avg Thermal Score",
            value: stats?.avg_thermal_score.toFixed(1) || "0",
            icon: <Zap className="w-5 h-5 text-amber-500" />,
            description: "Inventory risk level"
        },
        {
            title: "Bid Shading Savings",
            value: `$${liveShadingSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: <PiggyBank className="w-5 h-5 text-emerald-400" />,
            description: "Saved via AI optimization"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {metrics.map((metric, idx) => (
                <div
                    key={idx}
                    className="rounded-2xl p-6 border border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-white/5 dark:bg-[#090B0F]/50 dark:hover:border-white/10 dark:hover:bg-[#0A0D14]/70 transition-all duration-300"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 dark:bg-white/[0.02] dark:border-white/5">
                            {metric.icon}
                        </div>
                    </div>
                    <h3 className="text-slate-500 dark:text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">{metric.title}</h3>
                    <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        {metric.value}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-white/30 font-medium">{metric.description}</p>
                </div>
            ))}
        </div>
    );
};
