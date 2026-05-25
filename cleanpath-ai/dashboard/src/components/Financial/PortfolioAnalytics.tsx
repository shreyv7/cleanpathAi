import React from 'react';
import { PORTFOLIO_DATA } from '@/lib/financialTwin';
import { Percent, FolderSync, ShieldAlert } from 'lucide-react';

export const PortfolioAnalytics: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <FolderSync className="w-5 h-5 text-blue-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Cross-Portfolio Performance Analytics
                        </h2>
                        <p className="text-[10px] text-white/40">Compare efficiency profiles across agencies and campaigns</p>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto investigation-scroll pr-1 flex flex-col gap-3 font-mono text-xs">
                {PORTFOLIO_DATA.map((item) => {
                    const isLeaking = item.workingMediaPct < 60;

                    return (
                        <div
                            key={item.category}
                            className={`p-3.5 rounded-xl border transition-all duration-300 relative group flex flex-col gap-2 ${
                                isLeaking 
                                    ? 'bg-red-950/15 border-red-500/20 hover:border-red-500/40' 
                                    : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                            }`}
                        >
                            {/* Header: Title and Spend */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-white/90">{item.category}</span>
                                    <div className="text-[9px] text-white/30">AGENCY: {item.agency}</div>
                                </div>

                                <div className="text-right">
                                    <span className="text-white/80 font-bold">${(item.spendUsd / 1000).toFixed(0)}K Spend</span>
                                </div>
                            </div>

                            {/* Working Media progress meter bar */}
                            <div className="space-y-1 mt-1 text-[9.5px]">
                                <div className="flex justify-between text-white/45">
                                    <span>Working Media Ratio:</span>
                                    <span className={isLeaking ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                                        {item.workingMediaPct}%
                                    </span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-full ${isLeaking ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                        style={{ width: `${item.workingMediaPct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Sub metrics */}
                            <div className="flex justify-between items-center text-[9px] text-white/30 border-t border-white/5 pt-2 mt-0.5">
                                <span>Intermediary Tax: <span className="text-white/70 font-bold">{item.intermediaryTaxPct}%</span></span>
                                <span className="text-white/20">|</span>
                                <span>Fraud Leakage: <span className={isLeaking ? 'text-red-400 font-bold' : 'text-white/70 font-bold'}>{item.fraudExposurePct}%</span></span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
