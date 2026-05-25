import { LayoutDashboard, ShieldCheck, Activity, BarChart3 } from "lucide-react";
import { MetricsSummary } from "@/components/CFOView/MetricsSummary";
import { AnomalyAlerts } from "@/components/CFOView/AnomalyAlerts";
import { DecisionLog } from "@/components/TechnicalView/DecisionLog";
import { SupplyPathExplorer } from "@/components/TechnicalView/SupplyPathExplorer";
import { CTVIntegrityWidget } from "@/components/TechnicalView/CTV/CTVIntegrityWidget";
import { MLPerformanceWidget } from "@/components/TechnicalView/CTV/MLPerformanceWidget";
import { CTVDeviceExplorer } from "@/components/TechnicalView/CTV/CTVDeviceExplorer";
import { MonitorPlay } from "lucide-react";
import { EnvironmentToggle } from "@/components/ui/EnvironmentToggle";

import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();

    return (
        <main className="flex min-h-screen flex-col items-center p-12 bg-[#0B0E14] text-white">
            <div className="z-10 max-w-7xl w-full items-center justify-between font-mono text-sm flex mb-12 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                    <span className="text-lg font-black tracking-widest text-white/90">
                        CLEANPATH AI
                    </span>
                    <code className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold px-1.5 py-0.5 rounded">
                        v0.1.0
                    </code>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <EnvironmentToggle />
                    <div className="h-6 w-px bg-white/10 hidden md:block mx-1" />

                    <button
                        onClick={() => router.push('/ops')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/5 duration-300 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 infra-pulse-fast" />
                            <span>Launch Operations Room</span>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/financial')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/5 duration-300 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 infra-pulse-fast" />
                            <span>Bloomberg Treasury Suite</span>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/control')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-purple-500/5 duration-300 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 infra-pulse-fast" />
                            <span>Autonomous Control Plane</span>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/developer')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-orange-500/5 duration-300 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 infra-pulse-fast animate-pulse" />
                            <span>Developer & Ecosystem Hub</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl w-full flex flex-col gap-24">
                {/* Stage 1: Metrics */}
                <div id="executive-summary" className="scroll-mt-12 flex flex-col gap-2">
                    <h1 className="text-5xl font-extrabold tracking-tighter text-white">
                        Executive Summary
                    </h1>
                    <p className="text-white/50 text-xl">
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

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Phase 3: CTV Intelligence */}
                <div id="ctv-intelligence" className="scroll-mt-12 flex flex-col gap-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
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
            className="group rounded-2xl border border-white/5 bg-white/5 px-5 py-6 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:-translate-y-1 block cursor-pointer glass duration-300"
        >
            <div className="mb-4">{icon}</div>
            <h2 className="mb-3 text-2xl font-semibold flex items-center gap-1">
                {title}{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1.5 motion-reduce:transform-none">
                    -&gt;
                </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50 leading-relaxed">
                {description}
            </p>
        </a>
    );
}
