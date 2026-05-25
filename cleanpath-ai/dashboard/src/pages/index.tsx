import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldCheck, ArrowRight, MonitorPlay, Activity, Layers, Landmark } from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>CleanPath AI | Financial Integrity Operating System</title>
                <meta name="description" content="The Financial Integrity Operating System for Programmatic Advertising." />
            </Head>

            <main className="min-h-screen bg-[#030406] text-white font-sans selection:bg-white/20">
                {/* Navigation Bar */}
                <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030406]/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-white" />
                            <span className="text-lg font-bold tracking-tight">CleanPath AI</span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
                            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
                            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
                            <a href="#customers" className="hover:text-white transition-colors">Customers</a>
                            <a href="#developers" className="hover:text-white transition-colors">Developers</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push('/auth/login')}
                                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                            >
                                Sign in
                            </button>
                            <button 
                                onClick={() => router.push('/auth/login')}
                                className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-transform hover:scale-105 active:scale-95"
                            >
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                    {/* Ambient subtle glow */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none opacity-40" />
                    
                    <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white/80 mb-8 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Pre-Bid DSP Integrations Now Live
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-8">
                            The Financial Integrity OS <br className="hidden md:block" />
                            <span className="text-white/50">for the Internet.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed mb-10">
                            Quantify hidden supply chain economics, isolate multi-hop arbitrage, and enforce buy-side routing policies in real-time across global ad exchanges.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button 
                                onClick={() => router.push('/auth/login')}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-white/90 transition-all group"
                            >
                                Access Platform
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all">
                                Read the Whitepaper
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="platform" className="py-24 px-6 border-t border-white/5 bg-[#05070B]">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">A unified control plane for programmatic capital.</h2>
                            <p className="text-white/50 text-lg max-w-2xl">Stop relying on post-bid reporting. CleanPath sits directly on the hot path, modifying bids and routing logic in sub-20 milliseconds.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FeatureCard 
                                icon={<Activity className="w-6 h-6 text-blue-400" />}
                                title="Pre-Bid Filtration"
                                description="Intercepts and blocks Made-for-Advertising (MFA) and spoofed traffic directly inside the DSP bidding engine before money changes hands."
                            />
                            <FeatureCard 
                                icon={<Layers className="w-6 h-6 text-emerald-400" />}
                                title="Supply Path Optimization"
                                description="Graph-based auditing isolates redundant reseller hops and dynamic fee stacking, mathematically prioritizing direct publisher integrations."
                            />
                            <FeatureCard 
                                icon={<Landmark className="w-6 h-6 text-purple-400" />}
                                title="CFO Treasury Analytics"
                                description="Translates technical ad-ops blocking metrics into boardroom-ready financial recovery and net ROI calculations."
                            />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 py-12 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-white/40 font-medium text-sm">
                            <ShieldCheck className="w-4 h-4" />
                            <span>© 2026 CleanPath AI Systems. All rights reserved.</span>
                        </div>
                        <div className="flex gap-6 text-sm text-white/40">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">System Status</a>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-white/50 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
}
