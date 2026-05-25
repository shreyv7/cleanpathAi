import { useEffect, useState } from "react";
import { LayoutDashboard, ShieldCheck, Activity, BarChart3, Database } from "lucide-react";
import { MetricsSummary } from "@/components/CFOView/MetricsSummary";
import { AnomalyAlerts } from "@/components/CFOView/AnomalyAlerts";
import { DecisionLog } from "@/components/TechnicalView/DecisionLog";
import { SupplyPathExplorer } from "@/components/TechnicalView/SupplyPathExplorer";
import { CTVIntegrityWidget } from "@/components/TechnicalView/CTV/CTVIntegrityWidget";
import { MLPerformanceWidget } from "@/components/TechnicalView/CTV/MLPerformanceWidget";
import { CTVDeviceExplorer } from "@/components/TechnicalView/CTV/CTVDeviceExplorer";
import { MonitorPlay } from "lucide-react";
import { EnvironmentToggle } from "@/components/ui/EnvironmentToggle";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

import { useRouter } from "next/router";

interface SignupData {
    email: string;
    company: string;
    dsp: string;
    tier: string;
}

export default function Home() {
    const router = useRouter();
    const [signupData, setSignupData] = useState<SignupData | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('cleanpath_signup_data');
        if (stored) {
            try {
                setSignupData(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center p-12 bg-[#f8fafc] text-slate-900 dark:bg-[#05070B] dark:text-white transition-colors duration-300">
            {signupData && (
                <div className="w-full max-w-7xl mb-6 bg-blue-50 border border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 flex items-center justify-center">
                            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold">Active Programmatic Sandbox</div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-white/90">
                                Tenant: <span className="text-slate-900 dark:text-white">{signupData.company}</span> • Connected DSP: <span className="text-slate-900 dark:text-white uppercase font-mono">{signupData.dsp}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-blue-100 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                            {signupData.tier} Tier Plan
                        </span>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('cleanpath_signup_data');
                                setSignupData(null);
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/80 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}

            <div className="z-10 max-w-7xl w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 border-b border-slate-200 dark:border-white/10 pb-6">
                {/* Brand Logo & Telemetry Switcher */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-slate-700 dark:text-white/80" />
                        <span className="text-sm font-bold tracking-wider text-slate-900 dark:text-white">
                            CLEANPATH
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-white/40 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono px-1.5 py-0.5 rounded">
                            L4-SECURE
                        </span>
                    </div>

                    <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

                    <ThemeSwitcher />
                </div>

                {/* Unified Monochromatic Workspace Navigation */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                        onClick={() => router.push('/ops')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#0A0C10] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.01] transition-all cursor-pointer font-medium"
                    >
                        <Activity className="w-3.5 h-3.5 opacity-60" />
                        <span>Operations Room</span>
                    </button>

                    <button
                        onClick={() => router.push('/financial')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#0A0C10] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.01] transition-all cursor-pointer font-medium"
                    >
                        <BarChart3 className="w-3.5 h-3.5 opacity-60" />
                        <span>Bloomberg Treasury</span>
                    </button>

                    <button
                        onClick={() => router.push('/control')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#0A0C10] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.01] transition-all cursor-pointer font-medium"
                    >
                        <ShieldCheck className="w-3.5 h-3.5 opacity-60" />
                        <span>Control Plane</span>
                    </button>

                    <button
                        onClick={() => router.push('/developer')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#0A0C10] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.01] transition-all cursor-pointer font-medium"
                    >
                        <LayoutDashboard className="w-3.5 h-3.5 opacity-60" />
                        <span>Developer Hub</span>
                    </button>
                </div>
            </div>

            {/* Sub-Header Simulation context banner */}
            <div className="z-10 max-w-7xl w-full border border-slate-200 dark:border-white/5 bg-white/70 dark:bg-[#080B10]/70 backdrop-blur-lg py-2.5 px-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0 mb-8 transition-all">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-white/60">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-white/30 font-bold">OPERATIONAL CONTEXT</span>
                    <div className="h-3 w-px bg-slate-250 dark:bg-white/10 hidden sm:block" />
                    <span className="text-slate-700 dark:text-slate-350 font-mono text-[10.5px]">Plane: Executive Dashboard Executive View</span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 uppercase tracking-wider font-bold">SIMULATION plane SELECTOR:</span>
                    <EnvironmentToggle />
                </div>
            </div>

            <div className="max-w-7xl w-full flex flex-col gap-24">
                {/* Stage 1: Metrics */}
                <div id="executive-summary" className="scroll-mt-12 flex flex-col gap-2">
                    <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900 dark:text-white">
                        Executive Summary
                    </h1>
                    <p className="text-slate-500 dark:text-white/50 text-xl">
                        High-level performance metrics for MFA exclusion operations.
                    </p>
                </div>

                <div className="flex flex-col gap-10">
                    <MetricsSummary />
                    <AnomalyAlerts />
                </div>

                {/* Stage 2: Graph Intelligence (Phase 2 Task 6.2) */}
                <div id="supply-path-explorer" className="scroll-mt-12">
                    <SupplyPathExplorer />
                </div>

                <div className="h-px w-full bg-slate-200 dark:bg-white/10" />

                {/* Phase 3: CTV Intelligence */}
                <div id="ctv-intelligence" className="scroll-mt-12 flex flex-col gap-8">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <MonitorPlay className="w-8 h-8 text-blue-500" />
                        CTV Intelligence
                    </h2>
                    <CTVIntegrityWidget />
                    <MLPerformanceWidget />
                    <CTVDeviceExplorer />
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Stage 3: Decision Log */}
                <div id="decision-log" className="scroll-mt-12">
                    <DecisionLog />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    <Card
                        icon={<ShieldCheck className="w-8 h-8 text-blue-400" />}
                        title="MFA Detection"
                        description="Thermal imaging heuristics at the edge."
                        href="#ctv-intelligence"
                    />
                    <Card
                        icon={<Activity className="w-8 h-8 text-emerald-400" />}
                        title="Real-time Decisions"
                        description="Sub-20ms latency bid modification."
                        href="#decision-log"
                    />
                    <Card
                        icon={<BarChart3 className="w-8 h-8 text-purple-400" />}
                        title="CFO Metrics"
                        description="Track waste prevention in real-time."
                        href="#executive-summary"
                    />
                    <Card
                        icon={<LayoutDashboard className="w-8 h-8 text-orange-400" />}
                        title="Analytics"
                        description="Deep dive into publisher performance."
                        href="#supply-path-explorer"
                    />
                </div>
            </div>
        </main>
    );
}

function Card({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
    return (
        <a 
            href={href} 
            className="group rounded-2xl border border-slate-200 bg-white dark:border-white/5 dark:bg-[#090B0F]/50 px-6 py-6 transition-all hover:border-blue-500/50 hover:bg-slate-50 dark:hover:border-white/20 dark:hover:bg-white/[0.08] hover:-translate-y-1 block cursor-pointer shadow-sm hover:shadow-md duration-300"
        >
            <div className="mb-4">{icon}</div>
            <h2 className="mb-2 text-xl font-bold flex items-center gap-1 text-slate-900 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {title}{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1.5 motion-reduce:transform-none">
                    -&gt;
                </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-xs text-slate-500 dark:text-white/50 leading-relaxed font-medium">
                {description}
            </p>
        </a>
    );
}
