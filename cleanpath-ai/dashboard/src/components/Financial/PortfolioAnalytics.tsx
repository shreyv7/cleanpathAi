import React from 'react';
import { PORTFOLIO_DATA } from '@/lib/financialTwin';
import { Percent, FolderSync, ShieldAlert } from 'lucide-react';

export const PortfolioAnalytics: React.FC = () => {
    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4 h-[400px] transition-all">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <FolderSync className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            Cross-Portfolio Performance Analytics
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Compare efficiency profiles across agencies and campaigns</p>
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
                                    ? 'bg-red-50 dark:bg-red-950/15 border-red-200 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-500/40' 
                                    : 'bg-slate-50 border border-slate-200 hover:border-slate-300 dark:bg-white/[0.01] dark:border-white/5 dark:hover:border-white/10'
                            }`}
                        >
                            {/* Header: Title and Spend */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-slate-800 dark:text-white/90">{item.category}</span>
                                    <div className="text-[9px] text-slate-400 dark:text-white/30 font-semibold">AGENCY: {item.agency}</div>
                                </div>

                                <div className="text-right">
                                    <span className="text-slate-800 dark:text-white/80 font-bold">${(item.spendUsd / 1000).toFixed(0)}K Spend</span>
                                </div>
                            </div>

                            {/* Working Media progress meter bar */}
                            <div className="space-y-1 mt-1 text-[9.5px]">
                                <div className="flex justify-between text-slate-500 dark:text-white/45">
                                    <span>Working Media Ratio:</span>
                                    <span className={isLeaking ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                                        {item.workingMediaPct}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-full ${isLeaking ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                        style={{ width: `${item.workingMediaPct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Sub metrics */}
                            <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-white/30 border-t border-slate-100 dark:border-white/5 pt-2 mt-0.5">
                                <span>Intermediary Tax: <span className="text-slate-700 dark:text-white/70 font-bold">{item.intermediaryTaxPct}%</span></span>
                                <span className="text-slate-200 dark:text-white/20">|</span>
                                <span>Fraud Leakage: <span className={isLeaking ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-700 dark:text-white/70 font-bold'}>{item.fraudExposurePct}%</span></span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
