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
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-500" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Embedded AI Investigator Assistant
                        </h2>
                        <p className="text-[10px] text-white/40">Cognitive query engine & supply chain verification console</p>
                    </div>
                </div>
            </div>

            {/* Terminal Window Output */}
            <div className="flex-1 bg-[#03060a]/90 border border-white/5 rounded-xl p-4 font-mono text-xs text-blue-300 relative overflow-hidden flex flex-col justify-between min-h-0">
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
                        className="flex-1 bg-transparent text-white/90 focus:outline-none placeholder-white/20 text-xs font-mono"
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
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[9.5px] font-mono font-bold text-white/60 hover:text-white hover:border-white/10 hover:bg-white/[0.04] transition-all text-left truncate cursor-pointer"
                >
                    Mitigate HYDRA-7 Family
                </button>
                <button
                    onClick={() => handleQuickAction('analyze vortex')}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[9.5px] font-mono font-bold text-white/60 hover:text-white hover:border-white/10 hover:bg-white/[0.04] transition-all text-left truncate cursor-pointer"
                >
                    Expose VORTEX-9 Cluster
                </button>
                <button
                    onClick={() => handleQuickAction('inspect magnite')}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[9.5px] font-mono font-bold text-white/60 hover:text-white hover:border-white/10 hover:bg-white/[0.04] transition-all text-left truncate cursor-pointer"
                >
                    Audit Magnite SSP Node
                </button>
                <button
                    onClick={() => handleQuickAction('forecast risk')}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[9.5px] font-mono font-bold text-white/60 hover:text-white hover:border-white/10 hover:bg-white/[0.04] transition-all text-left truncate cursor-pointer"
                >
                    Forecast 48H Risk Horizon
                </button>
            </div>
        </div>
    );
};
