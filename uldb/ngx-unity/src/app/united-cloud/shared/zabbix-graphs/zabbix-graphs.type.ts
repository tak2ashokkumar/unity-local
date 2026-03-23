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