export interface ZabbixMonitoringAlerts {
    alert_id: number;
    description: string;
    severity: string;
    date_time: string;
    device_name: string;
}

export interface ZabbixDisableTriggerType {
    message: string;
    success: boolean;
}

export interface ZabbixEventResolveType extends ZabbixDisableTriggerType { }