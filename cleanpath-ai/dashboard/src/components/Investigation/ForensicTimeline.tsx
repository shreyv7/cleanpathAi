import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { type TimelineEvent } from '@/data/investigationData';

interface ForensicTimelineProps {
    events: TimelineEvent[];
}

const categoryColors: Record<string, { dot: string; text: string; bg: string }> = {
    ingress: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    detection: { dot: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10' },
    analysis: { dot: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    decision: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' },
    action: { dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const severityIcons: Record<string, string> = {
    info: '○',
    warning: '◎',
    critical: '●',
};

export const ForensicTimeline: React.FC<ForensicTimelineProps> = ({ events }) => {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    return (
        <div className="bg-[#080A0F] rounded-xl border border-white/5 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white/80 tracking-tight">Forensic Event Replay</h3>
                </div>
                <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">Millisecond precision</span>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical connector */}
                <div className="absolute left-[72px] top-0 bottom-0 w-px timeline-connector" />

                <div className="space-y-0">
                    {events.map((event, idx) => {
                        const colors = categoryColors[event.category] || categoryColors.ingress;
                        const isExpanded = expandedIdx === idx;

                        return (
                            <div
                                key={idx}
                                className="surgical-fade-in group"
                                style={{ animationDelay: `${idx * 60}ms` }}
                            >
                                <button
                                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                                    className="w-full flex items-start gap-4 py-2.5 px-2 rounded-lg hover:bg-white/[0.02] transition-all text-left"
                                >
                                    {/* Timestamp */}
                                    <span className="text-[10px] font-mono text-white/25 w-[60px] shrink-0 pt-0.5 text-right">
                                        {event.timestamp}
                                    </span>

                                    {/* Dot */}
                                    <div className="relative flex items-center justify-center shrink-0 pt-0.5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} ${event.severity === 'critical' ? 'infra-pulse-fast' : ''}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-white/80">{event.event}</span>
                                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                                {event.category}
                                            </span>
                                            {event.severity === 'critical' && (
                                                <span className="text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                                                    CRITICAL
                                                </span>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                                <p className="text-[11px] text-white/40 leading-relaxed">{event.detail}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[9px] text-white/15 font-mono">
                                                    <span>offset: +{event.offsetMs}ms</span>
                                                    <span>•</span>
                                                    <span>severity: {event.severity}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expand indicator */}
                                    <div className="shrink-0 pt-0.5 text-white/15 group-hover:text-white/30 transition-colors">
                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] text-white/15 font-mono">Total processing: {events[events.length - 1]?.offsetMs || 0}ms</span>
                <span className="text-[9px] text-white/15 font-mono">{events.length} events captured</span>
            </div>
        </div>
    );
};
