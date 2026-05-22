/**
 * OpenRTB SupplyChain (schain) Object Implementation
 * Based on IAB SupplyChain Object specification
 */

export interface SupplyChainNode {
    /**
     * Advertising system identifier (domain of the SSP/exchange)
     */
    asi: string;

    /**
     * Seller ID associated with the seller within the advertising system
     */
    sid: string;

    /**
     * Hop Payment: 1 if the advertising system is the direct recipient of payment, 0 otherwise
     */
    hp: number;

    /**
     * Request ID: Unique identifier for the request as passed by the advertising system
     */
    rid?: string;

    /**
     * Name of the seller (optional)
     */
    name?: string;

    /**
     * Domain of the seller (optional)
     */
    domain?: string;
}

export interface SupplyChainPath {
    /**
     * Version of the supply chain (e.g., "1.0")
     */
    ver: string;

    /**
     * Complete: 1 if the supply chain is complete, 0 otherwise
     */
    complete: number;

    /**
     * Nodes: Array of supply chain nodes representing the hops
     */
    nodes: SupplyChainNode[];
}

/**
 * CleanPath Extended Supply Path Interface
 * Used for internal graph processing and enrichment
 */
export interface ExtendedSupplyPath extends SupplyChainPath {
    id: string;
    publisherId: string;
    siteId?: string;
    timestamp: number;
    totalFees?: number; // Calculated field for fee stacking analysis
    hopCount: number;
}
