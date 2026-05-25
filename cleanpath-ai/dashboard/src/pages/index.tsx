import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldCheck, ArrowRight, Activity, Layers, Landmark, X, Download, ShieldAlert, Award } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

export default function LandingPage() {
    const router = useRouter();
    const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);

    return (
        <>
            <Head>
                <title>CleanPath AI | Financial Integrity Operating System</title>
                <meta name="description" content="The Financial Integrity Operating System for Programmatic Advertising." />
            </Head>

            <main className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#030406] dark:text-white font-sans transition-colors duration-300 selection:bg-blue-500/10">
                {/* Navigation Bar */}
                <nav className="fixed top-0 w-full z-50 border-b border-slate-200 dark:border-white/5 bg-[#f8fafc]/80 dark:bg-[#030406]/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-slate-900 dark:text-white" />
                            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">CleanPath AI</span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-white/60">
                            <a href="#platform" className="hover:text-slate-900 dark:hover:text-white transition-colors">Platform</a>
                            <a href="#solutions" className="hover:text-slate-900 dark:hover:text-white transition-colors">Solutions</a>
                            <a href="#audit" className="hover:text-slate-900 dark:hover:text-white transition-colors">System Audit</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeSwitcher />
                            <button 
                                onClick={() => router.push('/auth/login')}
                                className="text-sm font-medium text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => router.push('/auth/signup')}
                                className="text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-white/90 transition-all cursor-pointer shadow-lg shadow-black/5 dark:shadow-white/5"
                            >
                                Create Sandbox Account
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-20 px-6 overflow-hidden">
                    {/* Ambient subtle glow */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none opacity-40" />
                    
                    <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-[11px] font-medium text-slate-700 dark:text-white/80 mb-8 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Pre-Bid DSP Integrations Now Live
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] mb-8 text-slate-900 dark:text-white">
                            The Financial Integrity OS <br className="hidden md:block" />
                            <span className="text-slate-400 dark:text-white/40">for Programmatic Ads.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 dark:text-white/50 max-w-2xl leading-relaxed mb-12">
                            Quantify hidden supply chain economics, isolate multi-hop arbitrage, and enforce buy-side routing policies in real-time across global ad exchanges.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button 
                                onClick={() => router.push('/auth/signup')}
                                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-black font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-white/95 hover:-translate-y-0.5 active:translate-y-0 transition-all group cursor-pointer shadow-xl shadow-black/5 dark:shadow-white/5"
                            >
                                Access Sandbox
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={() => setIsWhitepaperOpen(true)}
                                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 font-semibold rounded-full hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                            >
                                Read the Whitepaper
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="platform" className="py-24 px-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#05070B] relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">A unified control plane for programmatic capital.</h2>
                            <p className="text-slate-600 dark:text-white/50 text-base max-w-2xl leading-relaxed">Stop relying on post-bid reporting. CleanPath sits directly on the hot path, modifying bids and routing logic in sub-20 milliseconds.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FeatureCard 
                                icon={<Activity className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
                                title="Pre-Bid Filtration"
                                description="Intercepts and blocks Made-for-Advertising (MFA) and spoofed traffic directly inside the DSP bidding engine before money changes hands."
                            />
                            <FeatureCard 
                                icon={<Layers className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />}
                                title="Supply Path Optimization"
                                description="Graph-based auditing isolates redundant reseller hops and dynamic fee stacking, mathematically prioritizing direct publisher integrations."
                            />
                            <FeatureCard 
                                icon={<Landmark className="w-6 h-6 text-purple-500 dark:text-purple-400" />}
                                title="CFO Treasury Analytics"
                                description="Translates technical ad-ops blocking metrics into boardroom-ready financial recovery and net ROI calculations."
                            />
                        </div>
                    </div>
                </section>

                {/* Whitepaper Modal (25 Report Integration) */}
                {isWhitepaperOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300">
                        <div className="bg-white border border-slate-200 dark:bg-[#080A0F] dark:border-white/10 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0B0E14]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Award className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider font-mono">CP-AUDIT-25REPORT</div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white/90">CleanPath AI System Audit Report</h3>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsWhitepaperOpen(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 font-sans text-sm text-slate-700 dark:text-white/70 leading-relaxed scrollbar-thin">
                                <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-blue-600 dark:text-blue-300/90 font-mono">
                                    <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold">SECURITY CLASSIFICATION:</span> EXECUTIVE BRIEF / RESTRICTED <br />
                                        DOCUMENT ID: CP-AUDIT-25REPORT • VERSION 1.0.0-BETA
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">1. Executive Summary & Core Identity</h4>
                                    <p className="mb-4">
                                        CleanPath AI is a category-defining, institutional-grade <strong>Financial Integrity Operating System for the Internet</strong>. It operates across global programmatic advertising networks to quantify hidden supply chain economics, isolate and suppress multi-hop reseller arbitrage (intermediary taxes), detect high-sophistication Connected TV (CTV) emulator spoofing, and autonomously enforce buy-side routing policies in real time.
                                    </p>
                                    <p>
                                        Unlike traditional marketing advertising dashboards, CleanPath is engineered as an <strong>active transaction security layer and self-healing infrastructure plane</strong> (combining features inspired by Palantir Foundry, Bloomberg Terminal, and Cloudflare Developer Platform). It allows Fortune 500 chief financial officers, risk operators, and institutional media buyers to transition from passive, retroactive auditing to active, real-time bid shading and edge filtration.
                                    </p>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-white/5" />

                                <div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">2. Systemic Programmatic Vulnerabilities Addressed</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/[0.02] dark:border-white/5">
                                            <span className="font-bold text-slate-800 dark:text-white block mb-1">A. Made-For-Advertising (MFA) Arbitrage</span>
                                            <p className="text-xs text-slate-500 dark:text-white/50 leading-relaxed">
                                                MFA sites use dynamic content scrapers and high ad density templates to redirect high-quality buy-side media budgets into low-value environments. CleanPath detects page velocity wiggles and structural layout indicators at the edge to block bids in under 15ms.
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/[0.02] dark:border-white/5">
                                            <span className="font-bold text-slate-800 dark:text-white block mb-1">B. Multi-Hop Reseller Commissions</span>
                                            <p className="text-xs text-slate-500 dark:text-white/50 leading-relaxed">
                                                By auditing the OpenRTB supply chain graph (`schain`), we identify redundant intermediary hops that stack duplicate transaction fees, automatically routing budgets to direct publisher endpoints.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-white/5" />

                                <div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">3. High-Sophistication CTV Emulator Defense</h4>
                                    <p className="mb-4">
                                        Invalid Traffic (IVT) verification companies struggle to detect modern CTV emulator farms running headless browser frameworks inside cloud containers, mimicking premium Roku and AppleTV devices.
                                    </p>
                                    <p>
                                        CleanPath's <strong>FastAPI CTV Spoof Detector</strong> evaluates high-density 22-dimensional feature vectors (evaluating screen entropy, playback pacing, and UI coordinate Tap Precision wiggles) using an ONNX-compiled XGBoost model. This outputs a probabilistic device fraud verdict in under 1.8 milliseconds, safely protecting buy-side budgets.
                                    </p>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-white/5" />

                                <div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">4. Dynamic Bid Shading via Thompson Sampling</h4>
                                    <p>
                                        Our active reinforcement learning pipeline implements a <strong>Thompson Sampling Multi-Armed Bandit</strong>. Success parameters (view rewards) and failure parameters (non-view click-waste penalties) are updated continuously in Redis for each supply path. Bids are shaded in real time by drawing sub-millisecond probabilities from a Beta distribution using the Marsaglia-Tsang Gamma sampling approximation, guaranteeing maximum value for media spend.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0B0E14] flex items-center justify-between shrink-0">
                                <span className="text-xs text-slate-400 dark:text-white/40 font-mono">CleanPath AI Core Systems Audit</span>
                                <button 
                                    onClick={() => {
                                        setIsWhitepaperOpen(false);
                                        router.push('/auth/signup');
                                    }}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
                                >
                                    <span>Deploy System Simulator</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-white/5 py-12 px-6 bg-white dark:bg-transparent">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 font-medium text-sm">
                            <ShieldCheck className="w-4 h-4" />
                            <span>© 2026 CleanPath AI Systems. All rights reserved.</span>
                        </div>
                        <div className="flex gap-6 text-sm text-slate-400 dark:text-white/40">
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">System Status</a>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all group cursor-default shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 dark:bg-white/[0.05] dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-500 dark:text-white/50 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
}
