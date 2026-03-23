export interface SdwanZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface SdwanZabbixMonitoringGraphItems {
    item_id: number;
    name: string;
    key: string;
    value_type: string;
}


export interface SdwanZabbixMonitoringAlerts {
    alert_id: number;
    description: string;
    severity: string;
    date_time: string;
    device_name: string;
}