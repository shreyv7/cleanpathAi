import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldCheck, ArrowRight, Loader2, Lock } from 'lucide-react';

export default function Login() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay for enterprise realism
        setTimeout(() => {
            router.push('/dashboard');
        }, 1200);
    };

    return (
        <>
            <Head>
                <title>Sign In | CleanPath AI</title>
                <meta name="description" content="Secure Access to CleanPath AI" />
            </Head>

            <main className="min-h-screen flex items-center justify-center bg-[#05070B] text-white font-sans selection:bg-blue-500/30 relative overflow-hidden">
                {/* Minimalist ambient lighting */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

                <div className="z-10 w-full max-w-[420px] p-6 sm:p-8">
                    {/* Brand Header */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                            <ShieldCheck className="w-7 h-7 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
                            Sign in to CleanPath
                        </h1>
                        <p className="text-white/40 text-sm">
                            Financial Integrity Operating System
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/70 ml-1">
                                    Work Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/70 ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pb-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                                    <div className="w-2 h-2 rounded-sm bg-transparent" />
                                </div>
                                <span className="text-xs text-white/60 group-hover:text-white/90 transition-colors">Remember device</span>
                            </label>
                            
                            <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                Reset password
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-black/50" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer / SSO */}
                    <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
                        <button 
                            type="button"
                            className="w-full bg-[#0A0C10] border border-white/10 text-white/70 font-medium rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <Lock className="w-4 h-4 opacity-50" />
                            Sign in with Corporate SSO
                        </button>
                        
                        <p className="text-center text-xs text-white/40">
                            By continuing, you agree to the <a href="#" className="text-white/60 hover:text-white underline underline-offset-2 decoration-white/20">Terms of Service</a> and <a href="#" className="text-white/60 hover:text-white underline underline-offset-2 decoration-white/20">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
