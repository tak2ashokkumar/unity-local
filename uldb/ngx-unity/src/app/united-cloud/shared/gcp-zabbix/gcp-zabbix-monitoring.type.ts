export interface GcpZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface GcpZabbixMonitoringGraphItems {
    item_id: string;
    name: string;
}


export interface GcpZabbixMonitoringAlerts {
    alert_id: number;
    alert: string;
    severity: string;
    date_time: string;
    device_name: string;
}

export interface GcpMonitoringConfig {
    project_id: string;
    service_account_info: string;
    client_secret: string;
    collector: CollectorType;
}

export interface CollectorType {
    name: string;
    uuid: string;
}