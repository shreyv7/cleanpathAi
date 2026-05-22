export interface SupplyChainNode {
    asi: string;
    sid: string;
    hp: number;
    rid?: string;
    name?: string;
    domain?: string;
}
export interface SupplyChainPath {
    ver: string;
    complete: number;
    nodes: SupplyChainNode[];
}
export interface ExtendedSupplyPath extends SupplyChainPath {
    id: string;
    publisherId: string;
    siteId?: string;
    timestamp: number;
    totalFees?: number;
    hopCount: number;
}
//# sourceMappingURL=SupplyPath.d.ts.map