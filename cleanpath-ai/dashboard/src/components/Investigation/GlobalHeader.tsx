import React, { useState } from 'react';
import {
    ArrowLeft, Download, UserPlus, AlertOctagon, CheckCircle2,
    Radio, Search, Command, Shield
} from 'lucide-react';
import { useRouter } from 'next/router';
import { ENTITY_PROFILES, type EntityProfile } from '@/data/investigationData';

interface GlobalHeaderProps {
    entity: EntityProfile;
    incidentId: string;
    status: string;
}

const severityColor: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    ELEVATED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    CLEAN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const statusColor: Record<string, string> = {
    ACTIVE: 'text-red-400',
    MONITORING: 'text-yellow-400',
    ESCALATED: 'text-orange-400',
    RESOLVED: 'text-emerald-400',
    FALSE_POSITIVE: 'text-zinc-400',
};

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ entity, incidentId, status }) => {
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#080A0F]/95 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 h-14">
                {/* LEFT — Investigation Identity */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-all text-white/40 hover:text-white"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="h-5 w-px bg-white/10" />

                    <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white tracking-tight">
                                    {entity.displayName}
                                </span>
                                <span className={`text-[9px] font-black tracking-[0.15em] uppercase px-2 py-0.5 rounded border ${severityColor[entity.riskClassification]}`}>
                                    {entity.riskClassification}
                                </span>
                                <span className="text-[10px] text-white/20 font-mono">
                                    {incidentId}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-5 w-px bg-white/10 hidden lg:block" />

                    <div className="hidden lg:flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-red-500 infra-pulse-fast' : 'bg-emerald-500'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColor[status]}`}>
                            {status}
                        </span>
                    </div>
                </div>

                {/* CENTER — Global Search */}
                <div className="hidden md:flex items-center">
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5 text-white/30 hover:text-white/50 hover:border-white/10 transition-all text-xs"
                    >
                        <Search className="w-3 h-3" />
                        <span>Search entities, paths, decisions...</span>
                        <div className="flex items-center gap-0.5 ml-4">
                            <kbd className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[9px] text-white/30 font-mono">⌘</kbd>
                            <kbd className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[9px] text-white/30 font-mono">K</kbd>
                        </div>
                    </button>
                </div>

                {/* RIGHT — Actions */}
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/40 hover:text-white/70 hover:border-white/10 transition-all text-xs">
                        <Download className="w-3 h-3" />
                        <span className="hidden lg:inline">Export</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/40 hover:text-white/70 hover:border-white/10 transition-all text-xs">
                        <UserPlus className="w-3 h-3" />
                        <span className="hidden lg:inline">Assign</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs">
                        <AlertOctagon className="w-3 h-3" />
                        <span className="hidden lg:inline">Escalate</span>
                    </button>

                    <div className="h-5 w-px bg-white/10 mx-1" />

                    <div className="flex items-center gap-1.5 px-2 py-1">
                        <Radio className="w-3 h-3 text-emerald-500 infra-pulse" />
                        <span className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-widest">LIVE</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
