import React from 'react';
import { GlobalHeader } from './GlobalHeader';
import { EntityIntelligence } from './EntityIntelligence';
import { ForensicsGraph } from './ForensicsGraph';
import { ReasoningEngine } from './ReasoningEngine';
import { ForensicTimeline } from './ForensicTimeline';
import { LiveStreamPanel } from './LiveStreamPanel';
import { FinancialForensics } from './FinancialForensics';
import { CollaborationPanel } from './CollaborationPanel';
import {
    type EntityProfile,
    type GraphNode,
    getInvestigationGraph,
    getDecisionExplanation,
    getForensicTimeline,
    getFinancialForensics,
    getInvestigationStatus,
} from '@/data/investigationData';

interface InvestigationWorkspaceProps {
    entity: EntityProfile;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({ entity }) => {
    const graphData = getInvestigationGraph(entity.domain);
    const explanation = getDecisionExplanation(entity.domain);
    const timeline = getForensicTimeline(entity.domain);
    const financials = getFinancialForensics(entity.domain);
    const incidentStatus = getInvestigationStatus(entity.domain);

    const handleNodeClick = (node: GraphNode) => {
        console.log('Node selected:', node);
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#060810] text-white flex flex-col">
            {/* Scanline effect */}
            <div className="scanline" />

            {/* Sticky Global Header */}
            <GlobalHeader
                entity={entity}
                incidentId={incidentStatus.incidentId}
                status={incidentStatus.status}
            />

            {/* Main 3-Column Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT — Entity Intelligence */}
                <EntityIntelligence entity={entity} />

                {/* CENTER — Primary Workspace */}
                <main className="flex-1 flex flex-col overflow-y-auto investigation-scroll">
                    {/* Graph */}
                    <div className="h-[480px] shrink-0 p-4">
                        <ForensicsGraph
                            nodes={graphData.nodes}
                            edges={graphData.edges}
                            onNodeClick={handleNodeClick}
                        />
                    </div>

                    {/* Below-Graph Sections */}
                    <div className="flex-1 p-4 space-y-4">
                        {/* Forensic Timeline */}
                        <ForensicTimeline events={timeline} />

                        {/* Financial Forensics */}
                        <FinancialForensics data={financials} />

                        {/* Collaboration */}
                        <CollaborationPanel status={incidentStatus} />
                    </div>
                </main>

                {/* RIGHT — AI Reasoning Engine */}
                <ReasoningEngine explanation={explanation} />
            </div>

            {/* Floating Live Stream */}
            <LiveStreamPanel />
        </div>
    );
};
