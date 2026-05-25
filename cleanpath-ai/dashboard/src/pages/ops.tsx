import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTelemetry } from '@/hooks/useTelemetry';
import { GlobalThreatMap } from '@/components/Ops/GlobalThreatMap';
import { LiveCFOIntelligence } from '@/components/Ops/LiveCFOIntelligence';
import { CorrelationEngine } from '@/components/Ops/CorrelationEngine';
import { SystemHealthPanel } from '@/components/Ops/SystemHealthPanel';
import { IncidentTimeline } from '@/components/Ops/IncidentTimeline';
import { ThreatPressureGauge } from '@/components/Ops/ThreatPressureGauge';
import { ArrowLeft, Shield, Radio, Layers, Landmark, Activity, LayoutGrid } from 'lucide-react';

export default function OpsRoom() {
    const router = useRouter();
    const state = useTelemetry();

    return (
        <>
            <Head>
                <title>CleanPath AI | NOC Command Center</title>
                <meta name="description" content="Global real-time programmatic ad fraud operations control center" />
            </Head>

            <main className="flex min-h-screen flex-col bg-[#05070B] text-white overflow-x-hidden font-sans">
                {/* NOC Global Operations Header */}
                <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#080A0F]/95 backdrop-blur-xl shrink-0">
                    <div className="flex items-center justify-between px-6 h-16">
                        {/* Left Side */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:border-white/10 hover:bg-white/5 transition-all text-xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Return to Main Workspace</span>
                            </button>

                            <div className="h-6 w-px bg-white/10" />

                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-blue-500 infra-pulse" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black tracking-widest uppercase text-white/90">
                                            CleanPath NOC Command Center
                                        </span>
                                        <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold px-1.5 py-0.5 rounded">
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
                                <Radio className="w-3.5 h-3.5 text-emerald-500 infra-pulse" />
                                <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">OPERATIONAL FEED LIVE</span>
                            </div>

                            <div className="hidden lg:flex items-center gap-4 border-l border-white/10 pl-6">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-white/30 uppercase font-sans">Bid Throughput</span>
                                    <span className="text-white/80 font-bold">{state.bidThroughput.toLocaleString()} QPS</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-white/30 uppercase font-sans">Edge Latency</span>
                                    <span className="text-emerald-400 font-bold">{state.systemHealth.edgeLatencyMs} ms</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-white/30 uppercase font-sans">Working Media</span>
                                    <span className="text-purple-400 font-bold">{state.overallWorkingMediaPercent}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Layout */}
                <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6 md:gap-8">
                    {/* Page Subtitle section */}
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white/90">
                            Global Supply Chain Integrity Room
                        </h1>
                        <p className="text-white/40 text-sm">
                            Autonomous programmatic media routing, bot mitigation, and live financial waste exclusion control center.
                        </p>
                    </div>

                    {/* Dashboard grid layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Left Column: World Map & Alerts (Span 2 for rich landscape maps) */}
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
                </div>
            </main>
        </>
    );
}
