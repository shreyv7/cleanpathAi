import React, { useState } from 'react';
import { CUSTOM_APP_ECOSYSTEM, type AppInstance } from '@/lib/platformEngine';
import { Grid, Check, FolderDown } from 'lucide-react';

export const AppEcosystem: React.FC = () => {
    const [apps, setApps] = useState<AppInstance[]>(CUSTOM_APP_ECOSYSTEM);

    const toggleAppInstall = (id: string) => {
        setApps(prev =>
            prev.map(a => {
                if (a.id === id) {
                    const nextStatus = a.status === 'ACTIVE' ? 'AVAILABLE' : 'ACTIVE';
                    return { ...a, status: nextStatus };
                }
                return a;
            })
        );
    };

    return (
        <div className="card-elevated gap-4">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90 flex items-center gap-2">
                    <Grid className="w-4 h-4 text-blue-600 dark:text-blue-500 animate-pulse" />
                    CleanPath App Ecosystem Console
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Customize operational workspaces with modular integrity applications</p>
            </div>

            {/* Custom apps grid */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {apps.map((a) => {
                    const isActive = a.status === 'ACTIVE';

                    return (
                        <div
                            key={a.id}
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between ${
                                isActive 
                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 shadow-sm' 
                                    : 'bg-slate-50 border-slate-200 dark:bg-white/[0.01] dark:border-white/5 opacity-60'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 dark:text-white/90">{a.name}</span>
                                    <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border ${
                                        isActive ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : 'bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/40 border-transparent'
                                    }`}>
                                        {a.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-white/45 pl-0 leading-normal font-sans font-medium">
                                    {a.description}
                                </p>
                            </div>

                            {/* Installer trigger */}
                            <button
                                onClick={() => toggleAppInstall(a.id)}
                                className={`shrink-0 p-1.5 rounded transition-all font-bold cursor-pointer text-[9px] border ${
                                    isActive 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/20' 
                                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/20'
                                }`}
                            >
                                {isActive ? <Check className="w-3.5 h-3.5" /> : <FolderDown className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
