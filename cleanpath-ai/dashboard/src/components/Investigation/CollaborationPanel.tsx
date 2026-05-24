import React, { useState } from 'react';
import { Users, MessageSquare, AlertOctagon, CheckCircle2, Clock, Plus } from 'lucide-react';
import { type InvestigationStatus } from '@/data/investigationData';

interface CollaborationPanelProps {
    status: InvestigationStatus;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    ACTIVE: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    MONITORING: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    ESCALATED: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    RESOLVED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    FALSE_POSITIVE: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
};

const priorityColors: Record<string, string> = {
    P0: 'bg-red-500/20 text-red-400 border-red-500/30',
    P1: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    P2: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    P3: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ status }) => {
    const [newNote, setNewNote] = useState('');
    const colors = statusColors[status.status] || statusColors.ACTIVE;

    return (
        <div className="bg-[#080A0F] rounded-xl border border-white/5 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white/80 tracking-tight">Incident Collaboration</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded border ${priorityColors[status.priority]}`}>
                        {status.priority}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {status.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Activity Audit Trail */}
                <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5 mb-3">
                        <Clock className="w-3 h-3" /> Audit Trail
                    </span>
                    <div className="space-y-2">
                        {status.activityLog.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-3 surgical-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                                <span className="text-[9px] font-mono text-white/15 shrink-0 w-14 text-right pt-0.5">
                                    {log.timestamp}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 mt-1.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-white/50 leading-relaxed">{log.action}</p>
                                    <span className="text-[9px] text-white/15 font-mono">{log.user}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Investigation Notes */}
                <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex items-center gap-1.5 mb-3">
                        <MessageSquare className="w-3 h-3" /> Investigation Notes
                    </span>
                    <div className="space-y-2 mb-3">
                        {status.notes.map((note, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <p className="text-[11px] text-white/40 leading-relaxed">{note}</p>
                            </div>
                        ))}
                    </div>

                    {/* Add Note */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add investigation note..."
                            className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/15 focus:outline-none focus:border-white/10 transition-all"
                        />
                        <button className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Incident Metadata */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[9px] text-white/15 font-mono">
                    <span>{status.incidentId}</span>
                    <span>Assigned: {status.assignedTo}</span>
                    <span>Created: {new Date(status.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};
