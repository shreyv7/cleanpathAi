
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

interface CTVStats {
    totalRequests: number;
    spoofRate: number;
    verdictBreakdown: {
        clean: number;
        suspicious: number;
        spoofed: number;
    };
    topSignals: { signal: string; count: number }[];
    recentAlerts: { id: string; severity: string; message: string; timestamp: number }[];
}

const COLORS = {
    clean: '#10B981', // Emerald-500
    suspicious: '#F59E0B', // Amber-500
    spoofed: '#EF4444', // Red-500
};

export const CTVIntegrityWidget = () => {
    const [data, setData] = useState<CTVStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch from API
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard/ctv/stats');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else {
                    // Fallback mock if API not running
                    console.warn('API unavailable, using fallback mock data');
                    setData({
                        totalRequests: 15420,
                        spoofRate: 4.8,
                        verdictBreakdown: { clean: 14200, suspicious: 850, spoofed: 370 },
                        topSignals: [
                            { signal: 'app_bundle_mismatch', count: 150 },
                            { signal: 'emulator_detected', count: 95 },
                            { signal: 'os_version_mismatch', count: 80 },
                            { signal: 'geo_anomaly', count: 45 }
                        ],
                        recentAlerts: []
                    });
                }
            } catch (e) {
                console.error('Failed to fetch stats', e);
                setData({
                    totalRequests: 15420,
                    spoofRate: 4.8,
                    verdictBreakdown: { clean: 14200, suspicious: 850, spoofed: 370 },
                    topSignals: [
                        { signal: 'app_bundle_mismatch', count: 150 },
                        { signal: 'emulator_detected', count: 95 },
                        { signal: 'os_version_mismatch', count: 80 },
                        { signal: 'geo_anomaly', count: 45 }
                    ],
                    recentAlerts: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading || !data) return <div className="animate-pulse h-64 bg-white/5 rounded-xl"></div>;

    const pieData = [
        { name: 'Clean', value: data.verdictBreakdown.clean, color: COLORS.clean },
        { name: 'Suspicious', value: data.verdictBreakdown.suspicious, color: COLORS.suspicious },
        { name: 'Spoofed', value: data.verdictBreakdown.spoofed, color: COLORS.spoofed },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verdict Distribution */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Traffic Verdicts
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                        <div className="text-emerald-400 font-bold">{data.verdictBreakdown.clean.toLocaleString()}</div>
                        <div className="text-white/50">Clean</div>
                    </div>
                    <div>
                        <div className="text-amber-400 font-bold">{data.verdictBreakdown.suspicious.toLocaleString()}</div>
                        <div className="text-white/50">Suspicious</div>
                    </div>
                    <div>
                        <div className="text-red-400 font-bold">{data.verdictBreakdown.spoofed.toLocaleString()}</div>
                        <div className="text-white/50">Spoofed</div>
                    </div>
                </div>
            </div>

            {/* Top Signals */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-orange-400" />
                    Top Risk Signals
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.topSignals} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="signal"
                                width={150}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'white', opacity: 0.1 }}
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                            />
                            <Bar dataKey="count" fill="#60A5FA" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
