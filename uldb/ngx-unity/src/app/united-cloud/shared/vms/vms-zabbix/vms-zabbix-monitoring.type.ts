export interface VmsZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface VmsZabbixMonitoringGraphItems {
    item_id: number;
    name: string;
    key: string;
    value_type: string;
}


export interface VmsZabbixMonitoringAlerts {
    alert_id: number;
    alert: string;
    severity: string;
    date_time: string;
    device_name: string;
}