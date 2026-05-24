import React from 'react';
import { Brain, ShieldAlert, DollarSign, Cpu, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { type DecisionExplanation } from '@/data/investigationData';

interface ReasoningEngineProps {
    explanation: DecisionExplanation;
}

const decisionColors: Record<string, { bg: string; text: string; border: string }> = {
    BLOCK: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    REROUTE: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    SHADE: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    ALLOW: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
};

const severityColors: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400',
};

const DecisionIcon = ({ decision }: { decision: string }) => {
    switch (decision) {
        case 'BLOCK': return <XCircle className="w-5 h-5 text-red-400" />;
        case 'REROUTE': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
        case 'SHADE': return <Zap className="w-5 h-5 text-yellow-400" />;
        default: return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
};

export const ReasoningEngine: React.FC<ReasoningEngineProps> = ({ explanation }) => {
    const colors = decisionColors[explanation.decision] || decisionColors.BLOCK;
    const maxContribution = Math.max(...explanation.signals.map(s => s.contribution));

    return (
        <aside className="w-80 xl:w-[340px] border-l border-white/5 bg-[#080A0F] flex flex-col overflow-y-auto investigation-scroll">
            {/* Header */}
            <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Decision Explainability</span>
                </div>
                <p className="text-[10px] text-white/20 mt-1">AI-powered forensic reasoning chain</p>
            </div>

            {/* Decision Summary */}
            <div className="p-5 border-b border-white/5">
                <div className={`flex items-center justify-between p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
                    <div className="flex items-center gap-3">
                        <DecisionIcon decision={explanation.decision} />
                        <div>
                            <span className={`text-lg font-black tracking-tight ${colors.text}`}>{explanation.decision}</span>
                            <div className="text-[10px] text-white/30 mt-0.5">Final Verdict</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-white">{explanation.totalRiskScore}</div>
                        <div className="text-[9px] text-white/25 font-mono">/100</div>
                    </div>
                </div>

                {/* Confidence */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Confidence</span>
                        <span className="text-sm font-mono font-bold text-white">{explanation.confidence}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 meter-fill"
                            style={{ width: `${explanation.confidence}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Risk Signal Breakdown */}
            <div className="p-5 border-b border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5 mb-4">
                    <ShieldAlert className="w-3 h-3" /> Integrity Risk Analysis
                </span>

                <div className="space-y-3">
                    {explanation.signals.map((signal, idx) => (
                        <div key={idx} className="surgical-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-white/70">{signal.signal}</span>
                                <span className={`text-xs font-mono font-bold ${severityColors[signal.severity]}`}>
                                    +{signal.contribution}
                                </span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-1">
                                <div
                                    className={`h-full rounded-full meter-fill ${
                                        signal.severity === 'critical' ? 'bg-red-500' :
                                        signal.severity === 'high' ? 'bg-orange-500' :
                                        signal.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${(signal.contribution / maxContribution) * 100}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-white/20 leading-relaxed">{signal.description}</p>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-white/40 font-bold">TOTAL RISK SCORE</span>
                    <span className={`text-xl font-mono font-black ${
                        explanation.totalRiskScore > 70 ? 'text-red-400' :
                        explanation.totalRiskScore > 40 ? 'text-orange-400' : 'text-emerald-400'
                    }`}>{explanation.totalRiskScore}</span>
                </div>
            </div>

            {/* Financial Impact */}
            <div className="p-5 border-b border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5 mb-3">
                    <DollarSign className="w-3 h-3" /> Financial Impact
                </span>
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <p className="text-xs text-blue-300/80 leading-relaxed">{explanation.financialImpact}</p>
                </div>
            </div>

            {/* Policy Triggers */}
            <div className="p-5 border-b border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 mb-3 block">Policy Triggers</span>
                <div className="flex flex-wrap gap-1.5">
                    {explanation.policyTriggers.map((trigger, i) => (
                        <span key={i} className="text-[9px] px-2 py-1 rounded bg-red-500/10 border border-red-500/15 text-red-400/80 font-mono">
                            {trigger}
                        </span>
                    ))}
                </div>
            </div>

            {/* Model Info */}
            <div className="p-5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5 mb-3">
                    <Cpu className="w-3 h-3" /> Model Metadata
                </span>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-white/30">Model</span>
                        <span className="text-white/50 font-mono">{explanation.modelVersion}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/30">Processing</span>
                        <span className="text-emerald-400 font-mono">{explanation.processingMs}ms</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
