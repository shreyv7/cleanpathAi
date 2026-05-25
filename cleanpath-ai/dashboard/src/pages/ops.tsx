import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTelemetry } from '@/hooks/useTelemetry';
import { GlobalThreatMap } from '@/components/Ops/GlobalThreatMap';
import { LiveCFOIntelligence } from '@/components/Ops/LiveCFOIntelligence';
import { CorrelationEngine } from '@/components/Ops/CorrelationEngine';
import { SystemHealthPanel } from '@/components/Ops/SystemHealthPanel';
import { IncidentTimeline } from '@/components/Ops/IncidentTimeline';
import { ThreatPressureGauge } from '@/components/Ops/ThreatPressureGauge';

// Priority 3: Intelligence Correlation Core Components
import { AIInvestigatorAssistant } from '@/components/Ops/AIInvestigatorAssistant';
import { ThreatFamiliesList } from '@/components/Ops/ThreatFamiliesList';
import { PredictiveRiskForecast } from '@/components/Ops/PredictiveRiskForecast';
import { EntityMemoryViewer } from '@/components/Ops/EntityMemoryViewer';
import { StrategicCFOInsights } from '@/components/Ops/StrategicCFOInsights';
import { AttackPlaybackSimulator } from '@/components/Ops/AttackPlaybackSimulator';
import { EnvironmentToggle } from '@/components/ui/EnvironmentToggle';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

import { ArrowLeft, Shield, Radio, Brain, LayoutGrid, Terminal } from 'lucide-react';

export default function OpsRoom() {
    const router = useRouter();
    const state = useTelemetry();
    const [activeTab, setActiveTab] = useState<'NOC' | 'INTELLIGENCE'>('NOC');

    return (
        <>
            <Head>
                <title>CleanPath AI | NOC Command Center</title>
                <meta name="description" content="Global real-time programmatic ad fraud operations control center" />
            </Head>

            <main className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900 dark:bg-[#05070B] dark:text-white overflow-x-hidden font-sans transition-colors duration-300">
                {/* NOC Global Operations Header */}
                <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/5 bg-white/95 dark:bg-[#080A0F]/95 backdrop-blur-xl shrink-0 shadow-sm">
                    <div className="flex items-center justify-between px-6 h-16">
                        {/* Left Side */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-350 hover:bg-slate-50 dark:bg-white/[0.03] dark:border-white/5 dark:text-white/40 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/5 transition-all text-xs cursor-pointer shadow-sm"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Return to Main Workspace</span>
                            </button>

                            <div className="h-6 w-px bg-slate-250 dark:bg-white/10" />

                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-blue-500 infra-pulse" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black tracking-widest uppercase text-slate-900 dark:text-white/90">
                                            CleanPath NOC Command Center
                                        </span>
                                        <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-bold px-1.5 py-0.5 rounded">
                                            GLOBAL OPERATIONS L4
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Real-time metrics summary */}
                        <div className="flex items-center gap-6 text-xs font-mono">
                            {/* Live status */}
                            <div className="flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 infra-pulse" />
                                <span className="text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider text-[10px]">OPERATIONAL FEED LIVE</span>
                            </div>


                            <div className="hidden lg:flex items-center gap-4 border-l border-slate-200 dark:border-l-white/10 pl-6">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-500 dark:text-white/30 uppercase font-sans font-medium">Bid Throughput</span>
                                    <span className="text-slate-800 dark:text-white/80 font-bold" suppressHydrationWarning={true}>{state.bidThroughput.toLocaleString()} QPS</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-500 dark:text-white/30 uppercase font-sans font-medium">Edge Latency</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{state.systemHealth.edgeLatencyMs} ms</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-500 dark:text-white/30 uppercase font-sans font-medium">Working Media</span>
                                    <span className="text-purple-600 dark:text-purple-400 font-bold">{state.overallWorkingMediaPercent}%</span>
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-250 dark:bg-white/10 hidden sm:block" />

                            <ThemeSwitcher />
                        </div>
                    </div>
                </header>

                {/* Sub-Header Simulation context banner */}
                <div className="w-full border-b border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-[#080B10]/70 backdrop-blur-lg py-2.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-white/60">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-white/30 font-bold">OPERATIONAL CONTEXT</span>
                        <div className="h-3 w-px bg-slate-250 dark:bg-white/10 hidden sm:block" />
                        <span className="text-slate-700 dark:text-slate-350 font-mono text-[10.5px]">Plane: Autonomous Programmatic Media Routing</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 uppercase tracking-wider font-bold">SIMULATION plane SELECTOR:</span>
                        <EnvironmentToggle />
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6 md:gap-8">
                    {/* Header Controls & Tab Selector */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200 dark:border-white/5">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white/90">
                                Global Supply Chain Integrity Room
                            </h1>
                            <p className="text-slate-500 dark:text-white/40 text-sm font-medium">
                                Autonomous programmatic media routing, bot mitigation, and live financial waste exclusion control center.
                            </p>
                        </div>

                        {/* Interactive Tab Selectors */}
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 dark:bg-white/[0.03] dark:border-white/5 font-mono select-none shadow-sm">
                            <button
                                onClick={() => setActiveTab('NOC')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'NOC'
                                        ? 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
                                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/70'
                                }`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>NOC TELEMETRY</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('INTELLIGENCE')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'INTELLIGENCE'
                                        ? 'bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400'
                                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/70'
                                }`}
                            >
                                <Brain className="w-3.5 h-3.5" />
                                <span>INTELLIGENCE CORE</span>
                            </button>
                        </div>
                    </div>

                    {/* Active view rendering based on tab state */}
                    {activeTab === 'NOC' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 surgical-fade-in">
                            {/* Left Column: World Map & NOC Timeline (Span 2) */}
                            <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                                <GlobalThreatMap />
                                <IncidentTimeline />
                            </div>

                            {/* Right Column: Dynamic KPIs, CFO economics, AI Engine, Health */}
                            <div className="flex flex-col gap-6 md:gap-8">
                                <ThreatPressureGauge />
                                <LiveCFOIntelligence />
                                <CorrelationEngine />
                                <SystemHealthPanel />
                            </div>
                        </div>
                    )}

                    {activeTab === 'INTELLIGENCE' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 surgical-fade-in">
                            {/* Left Column: Active threat groups and NLP prompt terminals (Span 2) */}
                            <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <AIInvestigatorAssistant />
                                    <AttackPlaybackSimulator />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <EntityMemoryViewer />
                                    <StrategicCFOInsights />
                                </div>
                            </div>

                            {/* Right Column: Forecast metrics curves, Threat families list */}
                            <div className="flex flex-col gap-6 md:gap-8">
                                <PredictiveRiskForecast />
                                <ThreatFamiliesList />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
