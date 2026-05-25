import React from 'react';
import { BASE_INTERMEDIARY_TAX } from '@/lib/financialTwin';
import { Landmark, ArrowDown, HelpCircle } from 'lucide-react';

export const IntermediaryTaxLadder: React.FC = () => {
    let publisherReceived = 1.00;
    const taxItems = BASE_INTERMEDIARY_TAX.map(item => {
        publisherReceived -= item.costUsd;
        return {
            ...item,
            runningTotal: publisherReceived
        };
    });

    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-5 h-[420px] transition-all">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                    Intermediary Tax Cost Extraction Ladder
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Visual decomposition of programmatic supply chain fees</p>
            </div>

            {/* Cost Ladder list */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {/* Starting Spend */}
                <div className="flex justify-between items-center text-slate-700 border-b border-slate-200 dark:text-white/80 dark:border-white/5 pb-2 font-bold">
                    <span>Advertiser Gross Investment</span>
                    <span>$1.00 Gross</span>
                </div>

                {/* Hops */}
                {taxItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 p-2 rounded bg-slate-50/50 border border-slate-200 dark:bg-white/[0.01] dark:border-white/5 relative group hover:border-slate-300 dark:hover:border-white/10 transition-all">
                        <div className="flex justify-between items-center text-slate-900 dark:text-white/90">
                            <span className="font-bold flex items-center gap-1.5">
                                <ArrowDown className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                {item.label}
                            </span>
                            <span className="text-red-500 dark:text-red-400 font-bold">-{item.pct}%</span>
                        </div>
                        <p className="text-[9.5px] text-slate-500 dark:text-white/45 pl-5 leading-normal">
                            {item.description}
                        </p>
                        <div className="flex justify-between text-[8px] text-slate-400 dark:text-white/20 pl-5 border-t border-slate-100 dark:border-white/[0.02] pt-1">
                            <span>REMAINING DOLLAR POWER:</span>
                            <span className="font-bold">${item.runningTotal.toFixed(2)}</span>
                        </div>
                    </div>
                ))}

                {/* Publisher Net Received */}
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 border-t border-slate-100 dark:border-white/5 pt-3 mt-1 font-bold text-sm bg-emerald-500/5 p-3 rounded border border-emerald-500/10">
                    <span>Publisher Net Delivery Yield</span>
                    <span>${publisherReceived.toFixed(2)} Net</span>
                </div>
            </div>
        </div>
    );
};
