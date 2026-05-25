import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTelemetry } from '@/hooks/useTelemetry';

// Priority 4: Executive Bloomberg Suite Components
import { BloombergKPIs } from '@/components/Financial/BloombergKPIs';
import { IntermediaryTaxLadder } from '@/components/Financial/IntermediaryTaxLadder';
import { DigitalTwinSimulator } from '@/components/Financial/DigitalTwinSimulator';
import { EconomicPressureMap } from '@/components/Financial/EconomicPressureMap';
import { FutureLeakageForecaster } from '@/components/Financial/FutureLeakageForecaster';
import { PortfolioAnalytics } from '@/components/Financial/PortfolioAnalytics';
import { EconomicTrustMatrix } from '@/components/Financial/EconomicTrustMatrix';
import { BoardroomReporter } from '@/components/Financial/BoardroomReporter';
import { EnvironmentToggle } from '@/components/ui/EnvironmentToggle';

import { ArrowLeft, Shield, Radio, Landmark, Presentation, Layers, Download, CheckCircle2 } from 'lucide-react';

export default function FinancialSuite() {
    const router = useRouter();
    const state = useTelemetry();
    const [presentationMode, setPresentationMode] = useState<boolean>(false);

    return (
        <>
            <Head>
                <title>CleanPath AI | Executive Financial Commander</title>
                <meta name="description" content="Bloomberg Terminal for programmatic ad spend efficiency and recovery" />
            </Head>

            <main className={`flex min-h-screen flex-col text-foreground dark:text-white overflow-x-hidden transition-all duration-700 bg-background ${
                presentationMode ? 'dark:bg-[#030406] p-4 sm:p-6' : 'dark:bg-[#05070B]'
            }`}>
                {/* Global Executive Header */}
                <header className="sticky top-0 z-50 w-full border-b border-border dark:border-white/5 bg-background/95 dark:bg-[#080A0F]/95 backdrop-blur-xl shrink-0">
                    <div className="flex items-center justify-between px-6 h-16">
                        {/* Left Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-foreground/60 hover:text-foreground hover:border-foreground/10 hover:bg-muted dark:bg-white/[0.03] dark:border-white/5 dark:text-white/40 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/5 transition-all text-xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Return to Executive Summary</span>
                            </button>

                            <div className="h-6 w-px bg-white/10" />

                            <div className="flex items-center gap-3">
                                <Landmark className="w-5 h-5 text-emerald-500 infra-pulse" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black tracking-widest uppercase text-white/90">
                                            CleanPath Bloomberg Suite
                                        </span>
                                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded">
                                            TREASURY LEVEL L4
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-4 text-xs font-mono select-none">
                            <EnvironmentToggle />
                            <div className="h-6 w-px bg-white/10 hidden md:block" />

                            {/* Presentation Toggle */}
                            <button
                                onClick={() => setPresentationMode(!presentationMode)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                    presentationMode
                                        ? 'bg-purple-500/15 border-purple-500/35 text-purple-400'
                                        : 'bg-white/[0.03] border-white/5 text-white/45 hover:text-white hover:border-white/10'
                                }`}
                            >
                                <Presentation className="w-3.5 h-3.5" />
                                <span>CFO Presentation Mode</span>
                            </button>


                            <div className="h-6 w-px bg-white/10 hidden md:block" />

                            <div className="hidden md:flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5 text-emerald-500 infra-pulse" />
                                <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">VERIFICATION LIVE</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Workspace Frame */}
                <div className={`flex-1 max-w-7xl w-full mx-auto flex flex-col gap-6 md:gap-8 transition-all duration-700 ${
                    presentationMode ? 'p-4 border border-purple-500/15 rounded-3xl bg-[#080B10]/40 backdrop-blur-md shadow-2xl shadow-purple-500/[0.02] mt-6' : 'p-6 md:p-8'
                }`}>
                    {/* Header Section */}
                    <div className="flex flex-col gap-1.5 pb-2 border-b border-white/5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white/90">
                            Executive Working Media Command Center
                        </h1>
                        <p className="text-white/40 text-sm font-mono">
                            Palantir-grade economic treasury. Auditing intermediary extraction rates and routing recovery margins.
                        </p>
                    </div>

                    {/* High-Density Ticker Rows */}
                    <BloombergKPIs />

                    {/* Presentation Mode Strategic overlay */}
                    {presentationMode && (
                        <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-[11px] font-mono text-purple-300 leading-relaxed shadow-lg shadow-purple-500/[0.02] animate-pulse">
                            <span className="font-bold flex items-center gap-1.5 text-purple-400 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                                STRATEGIC INVESTOR SUMMARIES ACTIVE
                            </span>
                            Dynamic buy-side bid shading and reseller consolidate filters have stabilized Q2 recovery trends at 94.7% execution confidence. Intermediary fee extraction rates have degraded from 25% to {((100 - state.overallWorkingMediaPercent) * 0.4).toFixed(1)}% within active routing clusters. Recommend immediate regional consolidation direct actions.
                        </div>
                    )}

                    {/* Standard Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Cost Ladder & Simulator (Span 2) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <IntermediaryTaxLadder />
                                <DigitalTwinSimulator />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <EconomicPressureMap />
                                <PortfolioAnalytics />
                            </div>
                        </div>

                        {/* Forecasts, matrix, boardroom logs */}
                        <div className="flex flex-col gap-6 md:gap-8">
                            <FutureLeakageForecaster />
                            <EconomicTrustMatrix />
                            <BoardroomReporter />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
