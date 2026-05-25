import React, { useState } from 'react';
import { generateBoardroomReport } from '@/lib/financialTwin';
import { useTelemetry } from '@/hooks/useTelemetry';
import { FileText, Download, Award, ShieldCheck } from 'lucide-react';

export const BoardroomReporter: React.FC = () => {
    const state = useTelemetry();
    const [downloading, setDownloading] = useState<boolean>(false);

    const netSavings = state.totalBlockedSpend + state.totalSavingsFromShading;
    const reportText = generateBoardroomReport(netSavings, state.overallWorkingMediaPercent);

    const handleDownload = () => {
        setDownloading(true);
        setTimeout(() => {
            setDownloading(false);
            // Alert user that mock PDF was compiled and downloaded
            alert('Boardroom PDF Compiled successfully!\nFormat: McKinsey-grade corporate standard audit\nTarget: cleanpath_financial_audit_q2_2026.pdf');
        }, 1500);
    };

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[350px]">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Boardroom Programmatic Audit Reporter
                        </h2>
                        <p className="text-[10px] text-white/40">Auto-generated McKinsey-grade corporate summaries</p>
                    </div>
                </div>

                {/* PDF Downloader trigger */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-[10px] font-bold font-mono tracking-wide uppercase transition-all cursor-pointer select-none"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading ? 'Compiling PDF...' : 'Export PDF'}</span>
                </button>
            </div>

            {/* Document body text */}
            <div className="flex-1 bg-[#03060a]/90 border border-white/5 rounded-xl p-4 font-mono text-xs text-white/70 relative overflow-hidden flex flex-col min-h-0">
                {/* Scanline subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

                <div className="overflow-y-auto pr-1 flex-1 z-10 whitespace-pre-wrap leading-relaxed select-all">
                    {reportText}
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider border-t border-white/5 pt-2.5 mt-3 shrink-0 z-10">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Boardroom Verification Standard: Approved</span>
                </div>
            </div>
        </div>
    );
};
