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
        <div className="card-elevated gap-4">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Global Supply Path Economic Pressure Map
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Macroeconomic regional markup and tax concentration audits</p>
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
                                    ? 'bg-red-50 dark:bg-red-950/15 border-red-200 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-500/40'
                                    : isElevated 
                                        ? 'bg-amber-50/50 dark:bg-yellow-950/10 border-amber-200 dark:border-yellow-500/20 hover:border-amber-400 dark:hover:border-yellow-500/40'
                                        : 'bg-slate-50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 opacity-90'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 dark:text-white/90">{leak.region}</span>
                                    <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                        isCritical ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                        isElevated ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' : 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                                    }`}>
                                        {leak.riskStatus}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-white/45 pl-0 leading-normal">
                                    Inventory: <span className="text-slate-700 dark:text-white/70 font-semibold">{leak.inventoryClass}</span>
                                </p>
                                <div className="text-[9px] text-slate-400 dark:text-white/30 font-medium">
                                    Primary Leak: {leak.associatedSsp}
                                </div>
                            </div>

                            {/* Percentage markup bubble */}
                            <div className="text-right shrink-0">
                                <span className={`text-sm font-black flex items-center gap-0.5 justify-end ${
                                    isCritical ? 'text-red-600' : isElevated ? 'text-amber-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    +{leak.inflationPct}%
                                </span>
                                <span className="text-[8.5px] text-slate-400 dark:text-white/20 font-bold uppercase">Structural Tax</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
