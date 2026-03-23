export interface UnityApplicationTopology {
    topology_data: ApplicationNetworkTopology;
}

export interface ApplicationNetworkTopology {
    nodes: ApplicationNetworkTopologyNode[];
    links: ApplicationNetworkTopologyLink[];
    metadata?: ApplicationNetworkTopologyMetadata;
}
export interface ApplicationNetworkTopologyNode {
    layer?: string;
    metadata?: ApplicationNetworkTopologyMetadata;
    type: string;
    name: string;
    uuid: string;
    subtype?: string;
    status?: number;
    device_type?: string;
    icon?: string;

    //custom added from ui
    fa_icon?: string;
    is_device?: boolean;
    displayType: string;
    deviceMapping: string;
    redirectLink: string;
    isPassive: boolean;
    statusText: string;
}
export interface ApplicationNetworkTopologyMetadata {
    description?: string;
    version?: null | string;
    language?: string;
    duration?: string;
    status_code?: number;
    host?: null | string;
    runtime?: null | string;
    pid?: null | number;
    table?: string;
    operation?: string;
    statement?: string;
    'class'?: string;
    method?: string;
    tables?: string[];
    system?: string;
    connection_string?: string;
    processes?: number;
    hierarchy?: string;
    application?: string;
    components?: number;
    databases?: number;
    services?: number;
}
export interface ApplicationNetworkTopologyLink {
    source_uuid?: string;
    target_uuid?: string;
    type?: string;
    edge_id?: string;
    source?: string;
    target?: string;
}

export interface ProblemConditionImpactAnalysis {
    nodes: ProblemConditionImpactAnalysisNodes[];
    links: ProblemConditionImpactAnalysisLinks[];
}

export interface ProblemConditionImpactAnalysisNodes {
    status: number;
    layer: string;
    uuid: string;
    metadata: ProblemConditionImpactAnalysisNodeMetadata;
    subtype?: string;
    icon: string;
    type: string;
    name: string;
}
export interface ProblemConditionImpactAnalysisNodeMetadata {
    Status: number;
    duration?: string;
    'P95 Response Time': string;
    status_code?: number;
    Uptime?: string;
    pid?: string;
    host?: string;
    Throughput?: string;
    'Restart Count'?: number;
    'Error Rate'?: string;
    runtime?: string;
    'Total Requests'?: number;
    version?: string;
    language?: string;
    Latency?: string;
    description?: string;
    'P95 Latency'?: string;
    'Download Speed'?: string;
    Availability?: string;
    'Memory Usage (Avg)'?: string;
}
export interface ProblemConditionImpactAnalysisLinks {
    source: string;
    target: string;
}