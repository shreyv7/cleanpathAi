
import React, { useEffect, useState } from 'react';
import { Smartphone, MonitorPlay, AlertTriangle, CheckCircle } from 'lucide-react';

interface CTVDevice {
    ifa: string;
    make: string;
    model: string;
    os: string;
    ip: string;
    riskScore: number;
    lastSeen: number;
    mutationCount: number;
}

export const CTVDeviceExplorer = () => {
    const [devices, setDevices] = useState<CTVDevice[]>([]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await fetch('/api/dashboard/ctv/devices');
                if (res.ok) {
                    const json = await res.json();
                    setDevices(json.data);
                } else {
                    // Fallback
                    setDevices([
                        { ifa: '8A9D...1234', make: 'Roku', model: 'Ultra', os: 'Roku OS 10.5', ip: '192.168.1.10', riskScore: 10, lastSeen: Date.now(), mutationCount: 0 },
                        { ifa: 'B2C1...5678', make: 'Samsung', model: 'Tizen TV', os: 'Tizen 5.0', ip: '10.0.0.5', riskScore: 0, lastSeen: Date.now() - 5000, mutationCount: 0 },
                        { ifa: 'FAIL...9999', make: 'Generic', model: 'Android Box', os: 'Android 7.1', ip: '45.32.1.1', riskScore: 95, lastSeen: Date.now() - 120000, mutationCount: 5 },
                    ]);
                }
            } catch (e) {
                console.error(e);
                setDevices([
                    { ifa: '8A9D...1234', make: 'Roku', model: 'Ultra', os: 'Roku OS 10.5', ip: '192.168.1.10', riskScore: 10, lastSeen: Date.now(), mutationCount: 0 },
                    { ifa: 'B2C1...5678', make: 'Samsung', model: 'Tizen TV', os: 'Tizen 5.0', ip: '10.0.0.5', riskScore: 0, lastSeen: Date.now() - 5000, mutationCount: 0 },
                    { ifa: 'FAIL...9999', make: 'Generic', model: 'Android Box', os: 'Android 7.1', ip: '45.32.1.1', riskScore: 95, lastSeen: Date.now() - 120000, mutationCount: 5 },
                ]);
            }
        };
        fetchDevices();
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <MonitorPlay className="w-5 h-5 text-blue-400" />
                    Device Fingerprint Explorer
                </h3>
                <span className="text-xs uppercase tracking-wider text-white/50 bg-white/5 px-2 py-1 rounded">
                    {devices.length} Devices Tracked
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/50 font-medium">
                        <tr>
                            <th className="px-6 py-4">IFA / IP</th>
                            <th className="px-6 py-4">Device Details</th>
                            <th className="px-6 py-4">OS Version</th>
                            <th className="px-6 py-4">Risk Score</th>
                            <th className="px-6 py-4">Mutations</th>
                            <th className="px-6 py-4">Last Seen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {devices.map((device, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">
                                    <div className="text-white">{device.ifa}</div>
                                    <div className="text-white/40">{device.ip}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{device.make}</div>
                                    <div className="text-white/50">{device.model}</div>
                                </td>
                                <td className="px-6 py-4 text-white/70">{device.os}</td>
                                <td className="px-6 py-4">
                                    <RiskBadge score={device.riskScore} />
                                </td>
                                <td className="px-6 py-4 text-white/70">{device.mutationCount}</td>
                                <td className="px-6 py-4 text-white/50 text-xs">
                                    {new Date(device.lastSeen).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

function RiskBadge({ score }: { score: number }) {
    if (score > 70) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-3 h-3" />
                High ({score})
            </span>
        );
    } else if (score > 30) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-3 h-3" />
                Medium ({score})
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Low ({score})
        </span>
    );
}
