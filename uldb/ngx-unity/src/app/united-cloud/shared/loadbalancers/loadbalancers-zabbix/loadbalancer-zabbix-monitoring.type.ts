export interface LoadbalancerZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface LoadbalancerZabbixMonitoringGraphItems {
    item_id: string;
    name: string;
}


export interface LoadbalancerZabbixMonitoringAlerts {
    alert_id: number;
    alert: string;
    severity: string;
    date_time: string;
    device_name: string;
}