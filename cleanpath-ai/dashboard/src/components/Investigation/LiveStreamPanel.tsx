import React, { useState, useEffect } from 'react';
import { Radio, Shield, AlertTriangle, Activity, Zap, Server, XCircle } from 'lucide-react';
import { LIVE_STREAM_EVENTS, type LiveEvent } from '@/data/investigationData';

const typeIcons: Record<string, React.ReactNode> = {
    spoof: <XCircle className="w-3 h-3 text-red-400" />,
    trust_decay: <Shield className="w-3 h-3 text-orange-400" />,
    mfa: <AlertTriangle className="w-3 h-3 text-yellow-400" />,
    reroute: <Activity className="w-3 h-3 text-emerald-400" />,
    emulator: <Zap className="w-3 h-3 text-red-400" />,
    block: <XCircle className="w-3 h-3 text-red-400" />,
    path_anomaly: <Server className="w-3 h-3 text-orange-400" />,
};

const severityDotColors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    info: 'bg-blue-500',
};

export const LiveStreamPanel: React.FC = () => {
    const [events, setEvents] = useState(LIVE_STREAM_EVENTS);
    const [isMinimized, setIsMinimized] = useState(false);

    // Simulate new events arriving
    useEffect(() => {
        const interval = setInterval(() => {
            const types: LiveEvent['type'][] = ['spoof', 'trust_decay', 'mfa', 'reroute', 'emulator', 'block', 'path_anomaly'];
            const messages = [
                'New bid duplication detected on Magnite → OpenX chain',
                'Device fingerprint mutation: IFA hash changed 3x in 60s',
                'Proxy chain detected: 4 residential hops before exchange',
                'SSP latency spike: OpenX response time 340ms (baseline: 12ms)',
                'Fee stacking violation: 23% cumulative extraction detected',
                'CTV bundle mismatch: com.roku.tv declared on desktop canvas',
                'Geo entropy alert: EST timezone from Romanian IP block',
            ];
            const severities: LiveEvent['severity'][] = ['critical', 'high', 'medium', 'info'];

            const newEvent: LiveEvent = {
                id: `ls_${Date.now()}`,
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                type: types[Math.floor(Math.random() * types.length)],
                message: messages[Math.floor(Math.random() * messages.length)],
                severity: severities[Math.floor(Math.random() * severities.length)],
            };

            setEvents(prev => [newEvent, ...prev].slice(0, 20));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0D1117] border border-white/10 hover:border-white/20 transition-all shadow-2xl"
            >
                <Radio className="w-3 h-3 text-emerald-500 infra-pulse" />
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Live Feed</span>
                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono">{events.length}</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-40 w-96 max-h-80 bg-[#0A0C12]/95 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Radio className="w-3 h-3 text-emerald-500 infra-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Operational Feed</span>
                </div>
                <button
                    onClick={() => setIsMinimized(true)}
                    className="text-[9px] text-white/20 hover:text-white/40 transition-colors font-mono"
                >
                    minimize
                </button>
            </div>

            {/* Events */}
            <div className="flex-1 overflow-y-auto investigation-scroll">
                {events.map((event, idx) => (
                    <div
                        key={event.id}
                        className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.02] hover:bg-white/[0.02] transition-all ${idx === 0 ? 'surgical-fade-in' : ''}`}
                    >
                        <div className="shrink-0 mt-1 flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${severityDotColors[event.severity]} ${event.severity === 'critical' ? 'infra-pulse-fast' : ''}`} />
                            {typeIcons[event.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-white/60 leading-relaxed">{event.message}</p>
                            <span className="text-[9px] text-white/15 font-mono">{event.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
