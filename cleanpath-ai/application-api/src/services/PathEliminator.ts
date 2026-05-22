/**
 * Path Eliminator Service
 * Identifies high-fee supply paths and provides alternative lower-fee routes.
 * Powers the REROUTE decision type.
 *
 * Governance Reset v1 — Phase 2: Financial Core
 */

import { Neo4jPool } from '@cleanpath/database';

export interface AlternativePath {
    pathId: string;
    nodes: Array<{ id: string; label: string; domain: string }>;
    totalFee: number;
    hopCount: number;
    savingsVsOriginal: number;
}

export class PathEliminator {
    private neo4j: Neo4jPool;
    private feeThreshold: number;

    constructor(feeThreshold: number = 0.12) {
        this.neo4j = Neo4jPool.getInstance();
        this.feeThreshold = feeThreshold;
    }

    /**
     * Determine if a supply path should be rerouted based on fee analysis.
     */
    shouldReroute(currentPathFee: number, threshold?: number): boolean {
        return currentPathFee > (threshold || this.feeThreshold);
    }

    /**
     * Find an alternative supply path with lower total fees.
     * Returns null if no better path exists.
     */
    async findAlternativePath(
        publisherDomain: string,
        currentPathFee: number
    ): Promise<AlternativePath | null> {
        const query = `
            MATCH path = (s:Site {domain: $domain})-[:SELLS_VIA|AUCTION_PATH*1..5]->(lastNode)
            WHERE NOT (lastNode)-[:AUCTION_PATH]->()
            
            WITH s, path, relationships(path) AS rels
            UNWIND rels AS r
            WITH s, path, sum(coalesce(r.fee, 0.01)) AS totalFees, count(r) AS hops
            WHERE totalFees < $currentFee
            
            RETURN 
                [node in nodes(path) | {
                    id: node.id,
                    label: labels(node)[0],
                    domain: node.domain
                }] AS pathNodes,
                totalFees,
                hops
            ORDER BY totalFees ASC
            LIMIT 1
        `;

        try {
            const results = await this.neo4j.read<any>(query, {
                domain: publisherDomain,
                currentFee: currentPathFee,
            });

            if (results.length === 0) return null;

            const row = results[0];
            const totalFee = parseFloat(row.totalFees.toFixed(4));
            const hopCount = row.hops.low || row.hops;

            return {
                pathId: `alt-${publisherDomain}-${Date.now()}`,
                nodes: row.pathNodes,
                totalFee,
                hopCount,
                savingsVsOriginal: parseFloat((currentPathFee - totalFee).toFixed(4)),
            };
        } catch (error) {
            console.error('PathEliminator error:', error);
            return null; // Graceful degradation — don't fail the bid
        }
    }

    /**
     * Evaluate a bid request for potential rerouting.
     * Returns the reroute target SSP domain if rerouting is recommended.
     */
    async evaluateForReroute(
        publisherDomain: string,
        currentPathFee: number
    ): Promise<{ shouldReroute: boolean; alternative: AlternativePath | null; rerouteTarget: string | null }> {
        if (!this.shouldReroute(currentPathFee)) {
            return { shouldReroute: false, alternative: null, rerouteTarget: null };
        }

        const alternative = await this.findAlternativePath(publisherDomain, currentPathFee);

        if (!alternative || alternative.savingsVsOriginal < 0.01) {
            // No meaningful alternative exists — block or allow as-is
            return { shouldReroute: false, alternative: null, rerouteTarget: null };
        }

        // The reroute target is the last SSP in the alternative path
        const lastNode = alternative.nodes[alternative.nodes.length - 1];
        const rerouteTarget = lastNode?.domain || lastNode?.id || null;

        return {
            shouldReroute: true,
            alternative,
            rerouteTarget,
        };
    }
}
