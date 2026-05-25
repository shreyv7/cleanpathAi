import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Globe, Radio, ShieldAlert } from 'lucide-react';

interface RegionalMetrics {
    name: string;
    coords: { x: number; y: number };
    pressure: number;
    activity: string;
    color: string;
    degradation: string;
}

export const GlobalThreatMap: React.FC = () => {
    const state = useTelemetry();

    // Map regions dynamically based on global fraud pressure
    const regions: RegionalMetrics[] = [
        {
            name: 'North America',
            coords: { x: 220, y: 120 },
            pressure: Math.floor(state.globalFraudPressure * 0.7),
            activity: 'GoogleAdManager integrity nominal.',
            color: 'text-blue-400',
            degradation: 'LOW',
        },
        {
            name: 'EMEA',
            coords: { x: 480, y: 130 },
            pressure: Math.floor(state.globalFraudPressure * 0.9),
            activity: 'OpenX MFA arbitrage cluster detected.',
            color: 'text-yellow-500',
            degradation: 'MEDIUM',
        },
        {
            name: 'LATAM',
            coords: { x: 300, y: 280 },
            pressure: Math.min(99, Math.floor(state.globalFraudPressure * 1.35)),
            activity: 'Magnite CTV spoofing surge active.',
            color: 'text-red-500',
            degradation: 'CRITICAL',
        },
        {
            name: 'APAC',
            coords: { x: 740, y: 180 },
            pressure: Math.floor(state.globalFraudPressure * 0.8),
            activity: 'PubMatic route stabilization routing.',
            color: 'text-emerald-400',
            degradation: 'STABLE',
        }
    ];

    return (
        <div className="glass card-elevated !border-white/5 !bg-[#080B10]/80 min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500 infra-pulse" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Global Integrity Pulse Map
                        </h2>
                        <p className="text-[10px] text-white/40">Real-time geospatial supply-path threat vectors</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 infra-pulse-fast" />
                        <span className="text-white/60 font-mono">Pressure: {state.globalFraudPressure}%</span>
                    </div>
                </div>
            </div>

            {/* Stylized High-Tech Grid World Map */}
            <div className="flex-1 relative border border-white/5 rounded-xl bg-[#03060a]/90 overflow-hidden flex items-center justify-center">
                {/* Visual Background grid overlay */}
                <div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                    }}
                />

                {/* Cyberpunk Map SVG */}
                <svg className="w-full h-full min-w-[800px] opacity-75 select-none pointer-events-none" viewBox="0 0 960 400" fill="none">
                    {/* Simulated Continent Boundaries */}
                    {/* North America */}
                    <path d="M 80 80 Q 150 40 240 80 T 260 160 T 180 200 Z" fill="#ffffff" fillOpacity="0.02" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3 3" />
                    {/* South America */}
                    <path d="M 220 220 Q 280 240 290 320 T 260 380 T 210 320 Z" fill="#ffffff" fillOpacity="0.02" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3 3" />
                    {/* Eurasia / Africa */}
                    <path d="M 400 80 Q 560 40 680 120 T 560 260 T 480 320 T 420 200 Z" fill="#ffffff" fillOpacity="0.02" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3 3" />
                    {/* Australia */}
                    <path d="M 720 260 Q 800 280 780 340 T 700 320 Z" fill="#ffffff" fillOpacity="0.02" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Animated Bid Arcs / Traffic streams */}
                    {/* NA -> LATAM */}
                    <path d="M 220 120 Q 260 200 300 280" stroke="url(#blue-to-red)" strokeWidth="2" className="particle-flow-suspicious" />
                    {/* EMEA -> LATAM */}
                    <path d="M 480 130 Q 390 200 300 280" stroke="url(#yellow-to-red)" strokeWidth="1.5" className="particle-flow" />
                    {/* APAC -> NA */}
                    <path d="M 740 180 Q 480 80 220 120" stroke="url(#green-to-blue)" strokeWidth="2" className="particle-flow-fast" />

                    {/* Dynamic gradients for lines */}
                    <defs>
                        <linearGradient id="blue-to-red" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="yellow-to-red" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                        </linearGradient>
                        <linearGradient id="green-to-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Pulsing overlay nodes on HTML layer to make resizing easy */}
                {regions.map((region) => {
                    const isActiveThreat = state.activeIncidents.some(
                        (inc) => inc.region === region.name.toUpperCase() || (region.name === 'LATAM' && inc.region === 'LATAM')
                    );

                    return (
                        <div
                            key={region.name}
                            className="absolute flex flex-col items-center select-none"
                            style={{ left: `${region.coords.x}px`, top: `${region.coords.y}px` }}
                        >
                            {/* Glowing Threat Concentric Rings */}
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                <div className={`absolute w-full h-full rounded-full opacity-20 border animate-ping ${
                                    region.degradation === 'CRITICAL' ? 'border-red-500 bg-red-500/20' : 
                                    region.degradation === 'MEDIUM' ? 'border-yellow-500 bg-yellow-500/10' : 'border-blue-500 bg-blue-500/10'
                                }`} style={{ animationDuration: isActiveThreat ? '1s' : '3s' }} />
                                
                                <div className={`w-3 h-3 rounded-full ${
                                    region.degradation === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 
                                    region.degradation === 'MEDIUM' ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'
                                }`} />
                            </div>

                            {/* Info Box */}
                            <div className="mt-1 bg-[#06080d]/90 backdrop-blur-md border border-white/10 rounded px-2 py-1 flex flex-col w-36 shadow-lg shadow-black/80 z-10 hover:border-white/30 transition-all pointer-events-auto">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-black text-white/90 font-mono tracking-tight">{region.name}</span>
                                    <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                                        region.degradation === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                        region.degradation === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {region.degradation}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] mb-0.5">
                                    <span className="text-white/40">Fraud Pressure</span>
                                    <span className="font-mono text-white/80">{region.pressure}%</span>
                                </div>
                                <p className="text-[7.5px] text-white/50 leading-tight border-t border-white/5 pt-0.5 mt-0.5">
                                    {region.activity}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
