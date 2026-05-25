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
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

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

            <main className="flex min-h-screen flex-col bg-background text-foreground dark:bg-[#05070B] dark:text-white overflow-x-hidden font-sans transition-colors duration-300">
                {/* Global Platform Header */}
                <header className="sticky top-0 z-50 w-full border-b border-border dark:border-white/5 bg-background/95 dark:bg-[#080A0F]/95 backdrop-blur-xl shrink-0">
                    <div className="flex items-center justify-between px-6 h-16">
                        {/* Left Side Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-foreground/60 hover:text-foreground hover:border-foreground/10 hover:bg-muted dark:bg-white/[0.03] dark:border-white/5 dark:text-white/40 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/5 transition-all text-xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Return to Executive Summary</span>
                            </button>

                            <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />

                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-emerald-650 dark:text-emerald-500 infra-pulse" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black tracking-widest uppercase text-slate-900 dark:text-white/90">
                                            CleanPath Platform OS
                                        </span>
                                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded">
                                            ENTERPRISE PLATFORM L4
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center: Tenant portfolio Selector */}
                        <div className="hidden md:flex items-center gap-2 font-mono text-xs select-none">
                            <span className="text-slate-500 dark:text-white/30 font-medium">Active Tenant Scope:</span>
                            <select
                                value={selectedTenant}
                                onChange={(e) => setSelectedTenant(e.target.value)}
                                className="bg-slate-100 border border-slate-200 dark:bg-[#03060a] dark:border-white/10 rounded px-2.5 py-1 text-slate-800 dark:text-white/80 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all font-mono"
                            >
                                <option value="ten_all">Global Agency Core (Publicis)</option>
                                <option value="ten_na">Horizon Group NA (BU-Americas)</option>
                                <option value="ten_latam">OMD South (BU-LATAM)</option>
                                <option value="ten_apac">Dentsu Japan (BU-APAC)</option>
                            </select>
                        </div>

                        {/* Right Side: Compliance online */}
                        <div className="flex items-center gap-4 text-xs font-mono select-none">
                            <div className="hidden lg:flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5 text-emerald-650 dark:text-emerald-500 infra-pulse" />
                                <span className="text-emerald-650 dark:text-emerald-500 font-bold uppercase tracking-wider text-[10px]">PLATFORM SYNC ACTIVE</span>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

                            <ThemeSwitcher />
                        </div>
                    </div>
                </header>

                {/* Sub-Header Simulation context banner */}
                <div className="w-full border-b border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-[#080B10]/70 backdrop-blur-lg py-2.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-white/60">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-white/30 font-bold">OPERATIONAL CONTEXT</span>
                        <div className="h-3 w-px bg-slate-250 dark:bg-white/10 hidden sm:block" />
                        <span className="text-slate-700 dark:text-slate-350 font-mono text-[10.5px]">Plane: Prebid Integrations & Governance Auditors</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 uppercase tracking-wider font-bold">SIMULATION plane SELECTOR:</span>
                        <EnvironmentToggle />
                    </div>
                </div>


                {/* Platform Frame Wrapper */}
                <div className="flex-1 max-w-[1600px] w-full mx-auto p-8 lg:p-10 flex flex-col gap-8 lg:gap-10">
                    {/* Header Controls & Role Switcher */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200 dark:border-white/5">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white/90">
                                Enterprise Ecosystem & Platform Hub
                            </h1>
                            <p className="text-slate-500 dark:text-white/40 text-sm font-medium">
                                Snowflake registries, Datadog sync metrics, SOC2 compliance audits, and role-based Workspace planes.
                            </p>
                        </div>

                        {/* Role Based Environments switcher */}
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 font-mono select-none">
                            <button
                                onClick={() => setActiveRole('RISK_OPS')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    activeRole === 'RISK_OPS'
                                        ? 'bg-blue-50 border border-blue-200 text-blue-755 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
                                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/70'
                                }`}
                            >
                                <span>Risk Ops View</span>
                            </button>
                            <button
                                onClick={() => setActiveRole('CFO')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    activeRole === 'CFO'
                                        ? 'bg-emerald-50 border border-emerald-250 text-emerald-755 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/70'
                                }`}
                            >
                                <span>CFO Treasury</span>
                            </button>
                            <button
                                onClick={() => setActiveRole('MEDIA_TRADER')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    activeRole === 'MEDIA_TRADER'
                                        ? 'bg-purple-50 border border-purple-200 text-purple-755 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400'
                                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/70'
                                }`}
                            >
                                <span>Media Trader</span>
                            </button>
                            <button
                                onClick={() => setActiveRole('WAR_ROOM')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    activeRole === 'WAR_ROOM'
                                        ? 'bg-red-50 border border-red-200 text-red-755 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 animate-pulse'
                                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/70'
                                }`}
                            >
                                <span>War Room</span>
                            </button>
                        </div>
                    </div>

                    {/* Active environment role notification overlay */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono leading-relaxed text-slate-700 flex gap-2.5 items-center select-none shadow-sm dark:border-white/5 dark:bg-[#080B10]/40 dark:text-white/70 dark:shadow-black/30">
                        <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 animate-bounce" style={{ animationDuration: '3s' }} />
                        <div>
                            <span className="text-blue-755 dark:text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                                ACTIVE ENV: {activeRole.replace('_', ' ')} MODE
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5 font-medium">
                                {activeRole === 'CFO' && 'CFO Mode focused: Visualizing gross spend, working media indices, and boardroom exports.'}
                                {activeRole === 'RISK_OPS' && 'Risk Ops Mode focused: Stream live SSP quarantines, threat mitigations, and emulator audits.'}
                                {activeRole === 'MEDIA_TRADER' && 'Media Trader Mode focused: Track clearing efficiencies, PMP bypass routes, and inventory quality.'}
                                {activeRole === 'WAR_ROOM' && 'Executive War Room Mode focused: High-pressure crisis response console tracking active spoof mitigations.'}
                            </p>
                        </div>
                    </div>

                    {/* Standard Grid layout */}
                    <div className="mt-4">
                        <h3 className="section-header">Developer Integration Console</h3>
                    </div>
                    <div className="flex flex-col gap-8 lg:gap-10">
                        {/* PreBid DSP Integrator - Full Width Hero */}
                        <div className="w-full">
                            <PreBidDSPIntegrator />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                            {/* Left Column (Span 2) */}
                            <div className="lg:col-span-2 flex flex-col gap-8 lg:gap-10">
                                <DSPPluginBilling />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                                    <TenantManager />
                                    <AppEcosystem />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-8 lg:gap-10">
                                <GovernanceAuditor />
                                <DataExchangeFabric />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
