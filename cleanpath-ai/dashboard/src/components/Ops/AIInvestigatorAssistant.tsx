import React, { useState } from 'react';
import { parseInvestigatorPrompt } from '@/lib/intelligenceEngine';
import { Terminal, ArrowRight, ShieldCheck } from 'lucide-react';

export const AIInvestigatorAssistant: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [output, setOutput] = useState<string>(
        `[CLEANPATH COGNITIVE CO-PILOT] SYSTEM INITIALIZED.\nReady to inspect global financial pipelines.\nUse buttons below to quickly dispatch deep investigations or type custom command.`
    );

    const handlePromptSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        
        const response = parseInvestigatorPrompt(prompt);
        setOutput(response);
        setPrompt('');
    };

    const handleQuickAction = (actionPrompt: string) => {
        const response = parseInvestigatorPrompt(actionPrompt);
        setOutput(response);
    };

    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 h-[400px] transition-all">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-500" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Embedded AI Investigator Assistant
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Cognitive query engine & supply chain verification console</p>
                    </div>
                </div>
            </div>

            {/* Terminal Window Output */}
            <div className="flex-1 bg-slate-900 border border-slate-950 dark:bg-[#03060a]/90 dark:border-white/5 rounded-xl p-4 font-mono text-xs text-blue-300 relative overflow-hidden flex flex-col justify-between min-h-0 shadow-inner">
                {/* Visual scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

                <div className="overflow-y-auto pr-1 flex-1 z-10 select-all whitespace-pre-wrap leading-relaxed">
                    {output}
                </div>

                {/* Submit Form */}
                <form onSubmit={handlePromptSubmit} className="mt-3 border-t border-white/5 pt-3 z-10 flex gap-2 shrink-0">
                    <span className="text-blue-500 font-bold shrink-0 self-center">&gt;</span>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type command... (e.g. 'analyze hydra')"
                        className="flex-1 bg-transparent text-white/90 focus:outline-none placeholder-white/40 text-xs font-mono"
                    />
                    <button type="submit" className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer">
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>

            {/* Quick Actions Buttons */}
            <div className="grid grid-cols-2 gap-2 shrink-0 select-none">
                <button
                    onClick={() => handleQuickAction('analyze hydra')}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[9.5px] font-mono font-bold text-slate-650 hover:text-slate-900 hover:border-slate-350 hover:bg-slate-100 dark:bg-white/[0.02] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all text-left truncate cursor-pointer shadow-sm"
                >
                    Mitigate HYDRA-7 Family
                </button>
                <button
                    onClick={() => handleQuickAction('analyze vortex')}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[9.5px] font-mono font-bold text-slate-650 hover:text-slate-900 hover:border-slate-350 hover:bg-slate-100 dark:bg-white/[0.02] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all text-left truncate cursor-pointer shadow-sm"
                >
                    Expose VORTEX-9 Cluster
                </button>
                <button
                    onClick={() => handleQuickAction('inspect magnite')}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[9.5px] font-mono font-bold text-slate-650 hover:text-slate-900 hover:border-slate-350 hover:bg-slate-100 dark:bg-white/[0.02] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all text-left truncate cursor-pointer shadow-sm"
                >
                    Audit Magnite SSP Node
                </button>
                <button
                    onClick={() => handleQuickAction('forecast risk')}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[9.5px] font-mono font-bold text-slate-650 hover:text-slate-900 hover:border-slate-350 hover:bg-slate-100 dark:bg-white/[0.02] dark:border-white/5 dark:text-white/60 dark:hover:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition-all text-left truncate cursor-pointer shadow-sm"
                >
                    Forecast 48H Risk Horizon
                </button>
            </div>
        </div>
    );
};
