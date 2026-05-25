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
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                    <Grid className="w-4 h-4 text-blue-500 animate-pulse" />
                    CleanPath App Ecosystem Console
                </h2>
                <p className="text-[10px] text-white/40">Customize operational workspaces with modular integrity applications</p>
            </div>

            {/* Custom apps grid */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {apps.map((a) => {
                    const isActive = a.status === 'ACTIVE';
                    const isInstalled = a.status === 'INSTALLED';

                    return (
                        <div
                            key={a.id}
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex gap-3 items-start justify-between ${
                                isActive 
                                    ? 'bg-blue-950/10 border-blue-500/20 hover:border-blue-500/40' 
                                    : 'bg-white/[0.01] border-white/5 opacity-60'
                            }`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white/90">{a.name}</span>
                                    <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border ${
                                        isActive ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/5 text-white/40'
                                    }`}>
                                        {a.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/45 pl-0 leading-normal font-sans">
                                    {a.description}
                                </p>
                            </div>

                            {/* Installer trigger */}
                            <button
                                onClick={() => toggleAppInstall(a.id)}
                                className={`shrink-0 p-1.5 rounded transition-all font-bold cursor-pointer text-[9px] ${
                                    isActive 
                                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
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
