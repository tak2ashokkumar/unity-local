export interface IstioNetworkData {
    nodes: IstioNode[];
    edges: IstioEdge[];
}
export interface IstioNode {
    type: string;
    health: string;
    id: number;
    label: string;
}
export interface IstioEdge {
    to: number;
    from: number;
}
