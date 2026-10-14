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

export interface ConnectedNodesResponse {
    nodes: ConnectedNode[];
    links: ConnectedLink[];
}

export interface ConnectedNode {
    name: string;
    uuid: string;
    layer: string;
    type: string;
    status: number | string;
    metadata?: Record<string, any>;
    icon?: string;
    device_type?: string;
    monitored_id?: string;
    app_id?: string | number;
    isRoot?: boolean;
}

export interface ConnectedLink {
    source_uuid?: string;
    target_uuid?: string;
    source?: string;
    target?: string;
    type?: string;
    edge_id?: string;
    pathD?: string;
}

export interface SmartscapeLane {
    id: string;
    label: string;
    icon: string;
    count: number;
    nodes: ConnectedNode[];
}