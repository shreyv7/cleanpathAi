import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTelemetry } from '@/hooks/useTelemetry';
import { getStrategicOperationalInsight } from '@/lib/controlEngine';

// Priority 5: Autonomous Control Components
import { PolicyOrchestration } from '@/components/Control/PolicyOrchestration';
import { AutonomousActionQueue } from '@/components/Control/AutonomousActionQueue';
import { ControlPlaneVisualizer } from '@/components/Control/ControlPlaneVisualizer';
import { GovernanceStatus } from '@/components/Control/GovernanceStatus';
import { IncidentResponseTimeline } from '@/components/Control/IncidentResponseTimeline';

import { ArrowLeft, Shield, Radio, Flame, ShieldAlert, Layers, Landmark, Activity } from 'lucide-react';

export default function ControlTower() {
    const router = useRouter();
    const state = useTelemetry();
    const [warRoomMode, setWarRoomMode] = useState<boolean>(false);

    const strategicInsight = getStrategicOperationalInsight();

    return (
        <>
            <Head>
                <title>CleanPath AI | Autonomous Control Tower</title>
                <meta name="description" content="Ecosystem regulation and programmatic ad-tech routing control plane" />
            </Head>

            <main className={`flex min-h-screen flex-col text-foreground dark:text-white overflow-x-hidden font-sans transition-all duration-700 bg-background ${
                warRoomMode ? 'dark:bg-[#0A0404] p-4 sm:p-6' : 'dark:bg-[#05070B]'
            }`}>
                {/* Global Control Plane Header */}
                <header className="sticky top-0 z-50 w-full border-b border-border dark:border-white/5 bg-background/95 dark:bg-[#080A0F]/95 backdrop-blur-xl shrink-0">
                    <div className="flex items-center justify-between px-6 h-16">
                        {/* Left Side */}
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
                                <Shield className="w-5 h-5 text-blue-500 infra-pulse" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black tracking-widest uppercase text-white/90">
                                            CleanPath Control Tower
                                        </span>
                                        <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold px-1.5 py-0.5 rounded">
                                            CONTROL PLANE L4
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Controls */}
                        <div className="flex items-center gap-4 text-xs font-mono select-none">
                            {/* War Room toggle */}
                            <button
                                onClick={() => setWarRoomMode(!warRoomMode)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                    warRoomMode
                                        ? 'bg-red-500/15 border-red-500/35 text-red-400 animate-pulse'
                                        : 'bg-white/[0.03] border-white/5 text-white/45 hover:text-white hover:border-white/10'
                                }`}
                            >
                                <Flame className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '2s' }} />
                                <span>{warRoomMode ? 'Emergency War Room Active' : 'Trigger War Room Mode'}</span>
                            </button>

                            <div className="h-6 w-px bg-white/10 hidden md:block" />

                            <div className="hidden md:flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5 text-emerald-500 infra-pulse" />
                                <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">GOVERNANCE ONLINE</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Command Tower Frame wrapper */}
                <div className={`flex-1 max-w-7xl w-full mx-auto flex flex-col gap-6 md:gap-8 transition-all duration-700 ${
                    warRoomMode 
                        ? 'p-4 border border-red-500/15 rounded-3xl bg-[#0F0505]/40 backdrop-blur-md shadow-2xl shadow-red-500/[0.02] mt-6' 
                        : 'p-6 md:p-8'
                }`}>
                    {/* Title */}
                    <div className="flex flex-col gap-1.5 pb-2 border-b border-white/5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white/90">
                            Ecosystem Governance & Autonomous Control Tower
                        </h1>
                        <p className="text-white/40 text-sm font-mono">
                            Live buy-side policy enforcement, self-healing routing paths, and autonomous ad-fraud quarantines.
                        </p>
                    </div>

                    {/* AI Agent Operations Report bar */}
                    <div className={`p-4 rounded-xl border font-mono text-[10.5px] leading-relaxed transition-all duration-500 ${
                        warRoomMode 
                            ? 'bg-red-500/5 border-red-500/20 text-red-300' 
                            : 'bg-blue-500/5 border-blue-500/15 text-blue-300'
                    }`}>
                        {strategicInsight}
                    </div>

                    {/* Emergency Alert Display in War Room Mode */}
                    {warRoomMode && (
                        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-xs font-mono text-red-400 flex items-start gap-2.5 leading-relaxed shadow-[0_0_12px_#ef444405] animate-pulse">
                            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p>
                                <span className="font-black">[CRITICAL THREAT INCIDENT PROPAGATION ACTIVE]</span> <br />
                                Real-time LATAM Roku emulator clusters are attempting high-volume linear bypass attacks on primary bid lines. Policy Zero-Tolerance MFA Routing has automatically isolated and quarantined the Magnite Reseller node. Rerouting all streaming volume to GoogleAdManager verified direct marketplace paths. Clean media safety confirmed at 99.4%.
                            </p>
                        </div>
                    )}

                    {/* Standard Grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Control Plane Visualizer & Policy (Span 2) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <ControlPlaneVisualizer />
                                <PolicyOrchestration />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <AutonomousActionQueue />
                                <GovernanceStatus />
                            </div>
                        </div>

                        {/* Incident sequence cascade and active controls */}
                        <div className="flex flex-col gap-6 md:gap-8">
                            <IncidentResponseTimeline />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
