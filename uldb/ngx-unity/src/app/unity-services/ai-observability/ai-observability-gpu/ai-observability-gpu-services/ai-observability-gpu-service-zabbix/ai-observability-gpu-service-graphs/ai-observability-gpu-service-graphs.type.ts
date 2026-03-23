export class AiObservabilityGpuServiceGraphs {
}

export interface ZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface ZabbixMonitoringGraphItems {
    item_id: number;
    name: string;
    key: string;
    value_type: string;
}

export interface DeviceZabbixMonitoringGraph {
    graph_id: number;
    graph_name: string;
    template_id: string;
}

export interface ApplicationMonitoringGraphCRUD {
    // graph_id: number;
    app_metrics_enabled_list: string[];
    // graph_type: string;
    // item_ids: string[];
    // can_delete: boolean;
    // can_update: boolean;
}

export interface MetricDataPoint {
    timestamp: string;
    value: number;
}

export interface GraphResult {
    data: MetricDataPoint[];
    metric_name: string;
    grouping_type: string;
}

export interface MetricsResponse {
    results: GraphResult[];
}
