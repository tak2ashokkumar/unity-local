export interface AwsZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface AwsZabbixMonitoringGraphItems {
    item_id: string;
    name: string;
}

export interface AwsZabbixMonitoringAlerts {
    alert_id: number;
    alert: string;
    severity: string;
    date_time: string;
    device_name: string;
}

export interface AwsZabbixMonitoringConfig {
    access_key: string;
    secret_key: string;
    collector: CollectorType;
}

export interface CollectorType {
    name: string;
    uuid: string;
}