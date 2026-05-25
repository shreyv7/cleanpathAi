import React, { useState, useEffect } from 'react';
import { telemetryEngine } from '@/lib/telemetryEngine';
import { Activity, Play, ShieldAlert } from 'lucide-react';

export const EnvironmentToggle: React.FC = () => {
    const [isProd, setIsProd] = useState<boolean>(false);

    useEffect(() => {
        setIsProd(telemetryEngine.isProductionMode());
        const unsubscribe = telemetryEngine.subscribe((state) => {
            setIsProd(telemetryEngine.isProductionMode());
        });
        return unsubscribe;
    }, []);

    const toggleMode = (prod: boolean) => {
        if (prod === isProd) return;
        telemetryEngine.toggleProductionMode(prod);
        setIsProd(prod);
        // Dispatch custom event to notify all listeners immediately
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('cleanpath_mode_change'));
        }
    };

    return (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5 font-mono select-none">
            <button
                onClick={() => toggleMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all duration-300 cursor-pointer ${
                    !isProd
                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                        : 'bg-transparent border-transparent text-white/35 hover:text-white/70'
                }`}
            >
                <Play className="w-2.5 h-2.5 animate-pulse" />
                <span>Sandbox Simulator</span>
            </button>
            
            <button
                onClick={() => toggleMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all duration-300 cursor-pointer ${
                    isProd
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-transparent border-transparent text-white/35 hover:text-white/70'
                }`}
            >
                <Activity className="w-2.5 h-2.5 infra-pulse-fast" />
                <span>Live Production DB</span>
            </button>
        </div>
    );
};
