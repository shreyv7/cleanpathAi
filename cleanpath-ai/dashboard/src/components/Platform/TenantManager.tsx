import React from 'react';
import { Star, ShieldAlert, Award, Network } from 'lucide-react';

interface BusinessTenant {
    id: string;
    organization: string;
    unitType: 'GLOBAL_AGENCY' | 'LOCAL_BU' | 'ADVERTISER';
    region: string;
    inheritedPolicyCount: number;
    spendAudited: number;
}

const BUSINESS_TENANTS: BusinessTenant[] = [
    { id: 'ten_01', organization: 'Publicis Worldwide (Global)', unitType: 'GLOBAL_AGENCY', region: 'HQ (Worldwide)', inheritedPolicyCount: 12, spendAudited: 8450000 },
    { id: 'ten_02', organization: 'Horizon Group North America', unitType: 'LOCAL_BU', region: 'Americas (US/CA)', inheritedPolicyCount: 8, spendAudited: 4200000 },
    { id: 'ten_03', organization: 'OMD South America', unitType: 'LOCAL_BU', region: 'LATAM', inheritedPolicyCount: 6, spendAudited: 1250000 },
    { id: 'ten_04', organization: 'Dentsu Japan Operations', unitType: 'LOCAL_BU', region: 'APAC', inheritedPolicyCount: 10, spendAudited: 3100000 }
];

export const TenantManager: React.FC = () => {
    return (
        <div className="card-elevated gap-4">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90 flex items-center gap-2">
                    <Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Multi-Tenant Organization Directory
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Examine role segmentations, agency hierarchies, and regional control logs</p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {BUSINESS_TENANTS.map((t) => (
                    <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 dark:border-white/5 dark:bg-[#03060a]/60 dark:hover:bg-[#05080f]/80 dark:hover:border-white/10 transition-all duration-300 flex flex-col gap-2 shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-800 dark:text-white/95">{t.organization}</span>
                                <div className="text-[9px] text-slate-500 dark:text-white/30 font-medium">BU TYPE: {t.unitType}</div>
                            </div>
                            <span className="text-[8.5px] bg-purple-55 border border-purple-200 text-purple-755 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400 font-bold px-1.5 py-0.5 rounded shadow-sm">
                                {t.region}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-500 dark:text-white/30 border-t border-slate-200 dark:border-white/5 pt-2 mt-0.5 font-medium">
                            <span>Spend Audited: <span className="text-slate-800 dark:text-white/70 font-bold">${(t.spendAudited / 1000000).toFixed(1)}M</span></span>
                            <span>•</span>
                            <span>Inherited Policies: <span className="text-slate-800 dark:text-white/70 font-bold">{t.inheritedPolicyCount} Rules</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
