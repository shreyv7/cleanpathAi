
/**
 * Supply Path Analysis Queries
 * Implementation of graph algorithms for detecting inefficiencies
 */

export const PathAnalysisQueries = {
    /**
     * Detects if a Publisher/Site combination has multiple active auction paths.
     * Identifying these "Duplicate Paths" helps in optimizing supply procurement.
     */
    GET_DUPLICATE_PATHS: `
        MATCH (p:Publisher)-[:OWNS]->(s:Site)
        MATCH path = (s)-[:SELLS_VIA|AUCTION_PATH*1..5]->(lastNode)
        WHERE NOT (lastNode)-[:AUCTION_PATH]->()
        WITH s, collect(path) AS paths, count(path) AS pathCount
        WHERE pathCount > 1
        RETURN 
            s.id AS siteId,
            s.domain AS siteDomain,
            pathCount,
            [p in paths | [node in nodes(p) | {
                label: labels(node)[0],
                id: node.id,
                domain: node.domain
            }]] AS redundantPaths
    `,

    /**
     * Identifies nodes that are common across multiple supply paths for the same site.
     * Useful for pinpointing specific intermediaries that may be centralizing "Fee Stacking".
     */
    GET_PATH_CHOKEPOINTS: `
        MATCH (s:Site)-[:SELLS_VIA|AUCTION_PATH*1..5]->(ssp:SSP)
        WITH s, ssp, count(*) AS pathUsage
        WHERE pathUsage > 1
        RETURN 
            s.id AS siteId,
            ssp.id AS sspId,
            ssp.domain AS sspDomain,
            pathUsage
        ORDER BY pathUsage DESC
    `
};
