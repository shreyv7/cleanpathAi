import { useRouter } from 'next/router';
import Head from 'next/head';
import { InvestigationWorkspace } from '@/components/Investigation/InvestigationWorkspace';
import { ENTITY_PROFILES } from '@/data/investigationData';

export default function InvestigatePage() {
    const router = useRouter();
    const { entityId } = router.query;

    if (!entityId || typeof entityId !== 'string') {
        return (
            <div className="min-h-screen bg-[#060810] flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="text-white/10 text-6xl font-mono mb-4">⟁</div>
                    <p className="text-white/30 text-sm">Loading investigation workspace...</p>
                </div>
            </div>
        );
    }

    // Resolve entity — use profile if exists, otherwise generate a default
    const entity = ENTITY_PROFILES[entityId] || {
        id: `ent_${Date.now()}`,
        domain: entityId,
        displayName: entityId,
        type: 'publisher' as const,
        riskClassification: 'ELEVATED' as const,
        threatSeverity: 55,
        integrityScore: 45,
        pathToxicityScore: 50,
        fraudLikelihood: 35.0,
        region: 'Unknown',
        firstSeen: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        spendExposure: 100000,
        historicalReputation: 'UNDER_REVIEW' as const,
        deviceDistribution: [
            { type: 'Connected TV', percent: 60 },
            { type: 'Desktop', percent: 25 },
            { type: 'Mobile', percent: 15 },
        ],
        sspRelationships: ['Unknown SSP'],
        exchangeRelationships: ['Unknown Exchange'],
        incidentCount: 1,
        totalBidsProcessed: 50000,
        blockRate: 15.0,
        avgCpm: 8.00,
        bidDuplicationRate: 10.0,
    };

    return (
        <>
            <Head>
                <title>Investigation: {entity.domain} | CleanPath AI</title>
                <meta name="description" content={`Forensic investigation workspace for ${entity.domain}`} />
            </Head>
            <InvestigationWorkspace entity={entity} />
        </>
    );
}
