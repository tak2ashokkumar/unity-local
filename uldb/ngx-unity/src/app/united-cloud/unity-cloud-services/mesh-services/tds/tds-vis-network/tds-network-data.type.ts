export interface TDSNetworkData {
    nodes: TDSNode[];
    edges: TDSEdge[];
}
export interface TDSNode {
    type: string;
    health: string;
    id: number;
    label: string;
}
export interface TDSEdge {
    to: number;
    from: number;
}
