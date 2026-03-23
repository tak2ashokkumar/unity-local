export interface SdwanZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface SdwanZabbixMonitoringGraphItems {
    item_id: string;
    name: string;
}


export interface SdwanZabbixMonitoringAlerts {
    alert_id: number;
    alert: string;
    severity: string;
    date_time: string;
    device_name: string;
}

export interface SdwanMonitoringConfig {
    client_id: string;
    tenant_id: string;
    client_secret: string;
}