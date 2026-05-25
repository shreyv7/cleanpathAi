import React from 'react';
import { Globe, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface RegionalLeakage {
    region: string;
    inflationPct: number;
    inventoryClass: string;
    riskStatus: 'CRITICAL' | 'ELEVATED' | 'STABILIZED';
    associatedSsp: string;
}

const REGIONAL_LEAKS: RegionalLeakage[] = [
    {
        region: 'LATAM (Latin America)',
        inflationPct: 28,
        inventoryClass: 'Connected TV (CTV) Streaming',
        riskStatus: 'CRITICAL',
        associatedSsp: 'Magnite Resellers'
    },
    {
        region: 'APAC (Asia Pacific)',
        inflationPct: 16,
        inventoryClass: 'Mobile Web Video',
        riskStatus: 'ELEVATED',
        associatedSsp: 'OpenX Exchange'
    },
    {
        region: 'EMEA (Europe & Africa)',
        inflationPct: 12,
        inventoryClass: 'Desktop Outstream Video',
        riskStatus: 'ELEVATED',
        associatedSsp: 'PubMatic Resale'
    },
    {
        region: 'NA (North America)',
        inflationPct: 7,
        inventoryClass: 'Premium Linear Video',
        riskStatus: 'STABILIZED',
        associatedSsp: 'GoogleAdManager Direct'
    }
];

export const EconomicPressureMap: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[420px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Global Supply Path Economic Pressure Map
                        </h2>
                        <p className="text-[10px] text-white/40">Macroeconomic regional markup and tax concentration audits</p>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {REGIONAL_LEAKS.map((leak) => {
                    const isCritical = leak.riskStatus === 'CRITICAL';
                    const isElevated = leak.riskStatus === 'ELEVATED';

                    return (
                        <div
                            key={leak.region}
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between ${
                                isCritical 
                                    ? 'bg-red-950/15 border-red-500/20 hover:border-red-500/40'
                                    : isElevated 
                                        ? 'bg-yellow-950/10 border-yellow-500/20 hover:border-yellow-500/40'
                                        : 'bg-white/[0.01] border-white/5 opacity-80'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white/90">{leak.region}</span>
                                    <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                        isCritical ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                        isElevated ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    }`}>
                                        {leak.riskStatus}
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/45 pl-0 leading-normal">
                                    Inventory: <span className="text-white/70">{leak.inventoryClass}</span>
                                </p>
                                <div className="text-[9px] text-white/30">
                                    Primary Leak: {leak.associatedSsp}
                                </div>
                            </div>

                            {/* Percentage markup bubble */}
                            <div className="text-right shrink-0">
                                <span className={`text-sm font-black flex items-center gap-0.5 justify-end ${
                                    isCritical ? 'text-red-400' : isElevated ? 'text-yellow-400' : 'text-emerald-400'
                                }`}>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    +{leak.inflationPct}%
                                </span>
                                <span className="text-[8.5px] text-white/20 uppercase">Structural Tax</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
