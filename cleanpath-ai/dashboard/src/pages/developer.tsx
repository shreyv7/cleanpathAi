import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Priority 6: Enterprise Platform Components
import { PreBidDSPIntegrator } from '@/components/Platform/PreBidDSPIntegrator';
import { DSPPluginBilling } from '@/components/Platform/DSPPluginBilling';
import { TenantManager } from '@/components/Platform/TenantManager';
import { AppEcosystem } from '@/components/Platform/AppEcosystem';
import { GovernanceAuditor } from '@/components/Platform/GovernanceAuditor';
import { DataExchangeFabric } from '@/components/Platform/DataExchangeFabric';
import { EnvironmentToggle } from '@/components/ui/EnvironmentToggle';

import { ArrowLeft, Layers, Terminal, Network, ShieldCheck, Radio, UserCheck } from 'lucide-react';

export default function PlatformSuite() {
    const router = useRouter();
    const [selectedTenant, setSelectedTenant] = useState<string>('ten_all');
    const [activeRole, setActiveRole] = useState<'CFO' | 'RISK_OPS' | 'MEDIA_TRADER' | 'WAR_ROOM'>('RISK_OPS');

    return (
        <>
            <Head>
                <title>CleanPath AI | Enterprise Platform Console</title>
                <meta name="description" content="Stripe-grade API hub, Snowflake integrations, and multi-tenant compliance" />
            </Head>

            <main className="flex min-h-screen flex-col bg-[#05070B] text-white overflow-x-hidden font-sans">
                {/* Global Platform Header */}
                <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#080A0F]/95 backdrop-blur-xl shrink-0">
                    <div className="flex items-center justify-between px-6 h-16">
                        {/* Left Side Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:border-white/10 hover:bg-white/5 transition-all text-xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Return to Executive Summary</span>
                            </button>

                            <div className="h-6 w-px bg-white/10" />

                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-emerald-500 infra-pulse" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black tracking-widest uppercase text-white/90">
                                            CleanPath Platform OS
                                        </span>
                                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded">
                                            ENTERPRISE PLATFORM L4
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center: Tenant portfolio Selector */}
                        <div className="hidden md:flex items-center gap-2 font-mono text-xs select-none">
                            <span className="text-white/30">Active Tenant Scope:</span>
                            <select
                                value={selectedTenant}
                                onChange={(e) => setSelectedTenant(e.target.value)}
                                className="bg-[#03060a] border border-white/10 rounded px-2.5 py-1 text-white/80 focus:outline-none cursor-pointer hover:border-white/20 transition-all font-mono"
                            >
                                <option value="ten_all">Global Agency Core (Publicis)</option>
                                <option value="ten_na">Horizon Group NA (BU-Americas)</option>
                                <option value="ten_latam">OMD South (BU-LATAM)</option>
                                <option value="ten_apac">Dentsu Japan (BU-APAC)</option>
                            </select>
                        </div>

                        {/* Right Side: Compliance online */}
                        <div className="flex items-center gap-4 text-xs font-mono select-none">
                            <EnvironmentToggle />
                            <div className="h-6 w-px bg-white/10 hidden md:block" />

                            <div className="hidden lg:flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5 text-emerald-500 infra-pulse" />
                                <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">PLATFORM SYNC ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </header>


                {/* Platform Frame Wrapper */}
                <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6 md:gap-8">
                    {/* Header Controls & Role Switcher */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-white/5">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-white/90">
                                Enterprise Ecosystem & Platform Hub
                            </h1>
                            <p className="text-white/40 text-sm">
                                Snowflake registries, Datadog sync metrics, SOC2 compliance audits, and role-based Workspace planes.
                            </p>
                        </div>

                        {/* Role Based Environments switcher */}
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5 font-mono select-none">
                            <button
                                onClick={() => setActiveRole('RISK_OPS')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    activeRole === 'RISK_OPS'
                                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                                        : 'bg-transparent border-transparent text-white/40 hover:text-white/70'
                                }`}
                            >
                                <span>Risk Ops View</span>
                            </button>
                            <button
                                onClick={() => setActiveRole('CFO')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    activeRole === 'CFO'
                                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                        : 'bg-transparent border-transparent text-white/40 hover:text-white/70'
                                }`}
                            >
                                <span>CFO Treasury</span>
                            </button>
                            <button
                                onClick={() => setActiveRole('MEDIA_TRADER')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    activeRole === 'MEDIA_TRADER'
                                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                                        : 'bg-transparent border-transparent text-white/40 hover:text-white/70'
                                }`}
                            >
                                <span>Media Trader</span>
                            </button>
                            <button
                                onClick={() => setActiveRole('WAR_ROOM')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    activeRole === 'WAR_ROOM'
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse'
                                        : 'bg-transparent border-transparent text-white/40 hover:text-white/70'
                                }`}
                            >
                                <span>War Room</span>
                            </button>
                        </div>
                    </div>

                    {/* Active environment role notification overlay */}
                    <div className="p-4 rounded-xl border border-white/5 bg-[#080B10]/40 text-xs font-mono leading-relaxed text-white/70 flex gap-2.5 items-center select-none shadow-md shadow-black/30">
                        <UserCheck className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                            <span className="text-white font-bold uppercase tracking-wider text-[10px] text-blue-400">
                                ACTIVE ENV: {activeRole.replace('_', ' ')} MODE
                            </span>
                            <p className="text-[10px] text-white/40 mt-0.5">
                                {activeRole === 'CFO' && 'CFO Mode focused: Visualizing gross spend, working media indices, and boardroom exports.'}
                                {activeRole === 'RISK_OPS' && 'Risk Ops Mode focused: Stream live SSP quarantines, threat mitigations, and emulator audits.'}
                                {activeRole === 'MEDIA_TRADER' && 'Media Trader Mode focused: Track clearing efficiencies, PMP bypass routes, and inventory quality.'}
                                {activeRole === 'WAR_ROOM' && 'Executive War Room Mode focused: High-pressure crisis response console tracking active spoof mitigations.'}
                            </p>
                        </div>
                    </div>

                    {/* Standard Grid layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Developer Stripe console & sync grid (Span 2) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                            <PreBidDSPIntegrator />
                            <DSPPluginBilling />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <TenantManager />
                                <AppEcosystem />
                            </div>
                        </div>

                        {/* SOC2 Auditor and live exchange logs */}
                        <div className="flex flex-col gap-6 md:gap-8">
                            <GovernanceAuditor />
                            <DataExchangeFabric />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
