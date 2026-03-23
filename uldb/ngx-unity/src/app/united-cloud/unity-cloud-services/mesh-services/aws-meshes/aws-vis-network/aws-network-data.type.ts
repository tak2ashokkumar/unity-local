export interface AWSNetworkData {
    nodes: AWSNode[];
    edges: AWSEdge[];
}
export interface AWSNode {
    type: string;
    health: string;
    id: number;
    label: string;
}
export interface AWSEdge {
    to: number;
    from: number;
}
