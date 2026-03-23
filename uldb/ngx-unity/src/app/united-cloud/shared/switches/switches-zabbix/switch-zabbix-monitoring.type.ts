export interface SwitchZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface SwitchZabbixMonitoringGraphItems {
    item_id: number;
    name: string;
    key: string;
    value_type: string;
}


export interface SwitchZabbixMonitoringAlerts {
    alert_id: number;
    description: string;
    severity: string;
    date_time: string;
    device_name: string;
}