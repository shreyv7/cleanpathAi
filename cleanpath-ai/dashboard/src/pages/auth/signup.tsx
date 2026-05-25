import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldCheck, ArrowRight, Loader2, Landmark, Check } from 'lucide-react';

export default function Signup() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [dsp, setDsp] = useState('ttd');
    const [tier, setTier] = useState('growth');

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Persist signup state in browser sessionStorage for live dynamic dashboard rendering
        const signupData = {
            email,
            company: company || 'Acme Corporation',
            dsp,
            tier
        };
        sessionStorage.setItem('cleanpath_signup_data', JSON.stringify(signupData));
        
        // Simulate quick corporate tenant provisioning
        setTimeout(() => {
            router.push('/dashboard?signup=true');
        }, 1500);
    };

    return (
        <>
            <Head>
                <title>Create Enterprise Sandbox Account | CleanPath AI</title>
                <meta name="description" content="Provision a secure programmatic audit sandbox" />
            </Head>

               <main className="min-h-screen flex items-center justify-center bg-background text-foreground dark:bg-[#05070B] dark:text-white font-sans selection:bg-blue-500/30 relative overflow-y-auto py-12 px-6 transition-colors duration-300">
                {/* Ambient lighting */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

                <div className="z-10 w-full max-w-[460px] bg-card border border-border dark:bg-[#080A0F]/50 dark:border-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-12 h-12 bg-card border border-border dark:bg-white/[0.02] dark:border-white/10 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-white mb-1.5">
                            Create Sandbox Account
                        </h1>
                        <p className="text-foreground/40 dark:text-white/40 text-xs max-w-[280px]">
                            Instantly deploy the CleanPath Edge pre-bid plugin in simulation mode
                        </p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] uppercase tracking-wider font-semibold text-foreground/50 dark:text-white/50 ml-1">
                                    Corporate Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-card border border-border dark:bg-[#0A0C10] dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground dark:text-white placeholder:text-foreground/20 dark:placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-sans shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] uppercase tracking-wider font-semibold text-foreground/50 dark:text-white/50 ml-1">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Horizon Media Inc."
                                    className="w-full bg-card border border-border dark:bg-[#0A0C10] dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground dark:text-white placeholder:text-foreground/20 dark:placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-sans shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-wider font-semibold text-foreground/50 dark:text-white/50 ml-1">
                                        Primary DSP
                                    </label>
                                    <select
                                        value={dsp}
                                        onChange={(e) => setDsp(e.target.value)}
                                        className="w-full bg-card border border-border dark:bg-[#0A0C10] dark:border-white/10 rounded-xl px-3 py-3 text-xs text-foreground dark:text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-sm cursor-pointer"
                                    >
                                        <option value="ttd" className="bg-card text-foreground dark:bg-[#0A0C10] dark:text-white">The Trade Desk</option>
                                        <option value="dv360" className="bg-card text-foreground dark:bg-[#0A0C10] dark:text-white">Google DV360</option>
                                        <option value="amazon" className="bg-card text-foreground dark:bg-[#0A0C10] dark:text-white">Amazon DSP</option>
                                        <option value="stackadapt" className="bg-card text-foreground dark:bg-[#0A0C10] dark:text-white">StackAdapt</option>
                                        <option value="custom" className="bg-card text-foreground dark:bg-[#0A0C10] dark:text-white">Custom OpenRTB</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-wider font-semibold text-foreground/50 dark:text-white/50 ml-1">
                                        Pricing Tier
                                    </label>
                                    <select
                                        value={tier}
                                        onChange={(e) => setTier(e.target.value)}
                                        className="w-full bg-card border border-border dark:bg-[#0A0C10] dark:border-white/10 rounded-xl px-3 py-3 text-xs text-foreground dark:text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-sm cursor-pointer"
                                    >
                                        <option value="starter" className="bg-card text-foreground dark:bg-[#0A0C10] dark:text-white">Starter Audit ($1,999/mo)</option>
                                        <option value="growth" className="bg-card text-foreground dark:bg-[#0A0C10] dark:text-white">Growth Bypass ($4,999/mo)</option>
                                        <option value="enterprise" className="bg-card text-foreground dark:bg-[#0A0C10] dark:text-white">Enterprise Plan (Custom)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white dark:bg-white dark:text-black font-semibold rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2 shadow-md cursor-pointer"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white/50 dark:text-black/50" />
                            ) : (
                                <>
                                    Provision Sandbox Workspace
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Alternate Options */}
                    <div className="mt-6 pt-6 border-t border-border dark:border-white/5 text-center flex flex-col gap-3">
                        <p className="text-xs text-foreground/40 dark:text-white/40">
                            Already have a CleanPath corporate tenant?{' '}
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="text-blue-500 dark:text-blue-400 hover:underline font-semibold transition-colors cursor-pointer"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
