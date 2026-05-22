export interface TopologyLink {
    source_uuid: string;
    target_uuid: string;
    type?: string | null;
    edge_id?: string | null;
}

export interface TopologyNodeMetadata {
    [key: string]: string | number | null;
}

export interface TopologyNode {
    status: string | number;
    layer: string;
    name: string;
    uuid: string;
    type: string;
    metadata: TopologyNodeMetadata;
}

export interface TopologyGroup {
    nodes: TopologyNode[];
    parent_service_id: string;
    links: TopologyLink[];
}

export type TopologyLayerType =
    | 'service'
    | 'component'
    | 'process'
    | 'database'
    | 'host'
    | 'physical_layer';

export interface TopologyResponse {
    app_name: string | null;
    layers?: Record<TopologyLayerType, TopologyGroup[]>;
}