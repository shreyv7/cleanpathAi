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
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-5 h-[420px]">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-orange-400" />
                    Intermediary Tax Cost Extraction Ladder
                </h2>
                <p className="text-[10px] text-white/40">Visual decomposition of programmatic supply chain fees</p>
            </div>

            {/* Cost Ladder list */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {/* Starting Spend */}
                <div className="flex justify-between items-center text-white/80 border-b border-white/5 pb-2 font-bold">
                    <span>Advertiser Gross Investment</span>
                    <span>$1.00 Gross</span>
                </div>

                {/* Tax hops */}
                {taxItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 p-2 rounded bg-white/[0.01] border border-white/5 relative group hover:border-white/10 transition-all">
                        <div className="flex justify-between items-center text-white/90">
                            <span className="font-bold flex items-center gap-1.5">
                                <ArrowDown className="w-3.5 h-3.5 text-red-400" />
                                {item.label}
                            </span>
                            <span className="text-red-400 font-bold">-{item.pct}%</span>
                        </div>
                        <p className="text-[9.5px] text-white/45 pl-5 leading-normal">
                            {item.description}
                        </p>
                        <div className="flex justify-between text-[8px] text-white/20 pl-5 border-t border-white/[0.02] pt-1">
                            <span>REMAINING DOLLAR POWER:</span>
                            <span className="font-bold">${item.runningTotal.toFixed(2)}</span>
                        </div>
                    </div>
                ))}

                {/* Publisher Net Received */}
                <div className="flex justify-between items-center text-emerald-400 border-t border-white/5 pt-3 mt-1 font-bold text-sm bg-emerald-500/5 p-3 rounded border border-emerald-500/10">
                    <span>Publisher Net Delivery Yield</span>
                    <span>${publisherReceived.toFixed(2)} Net</span>
                </div>
            </div>
        </div>
    );
};
