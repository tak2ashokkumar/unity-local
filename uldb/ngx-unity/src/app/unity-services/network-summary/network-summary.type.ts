export interface NetworkSummary {
    total_devices: NetworkSummaryDetails;
    switch: NetworkSummaryDetails;
    firewall: NetworkSummaryDetails;
    load_balancer: NetworkSummaryDetails;
}

export interface NetworkSummaryDetails {
    total: number;
    up: number;
    down: number;
    unknown: number;
}

export interface NetworkSummaryStatusByGroup {
    [manufacturerName: string]: NetworkSummaryModels;
}

export interface NetworkSummaryModels {
    models: {
        [modelName: string]: NetworkSummaryDevices[];
    };
    manufacturer_name: string;
}

export interface NetworkSummaryDevices {
    status: string;
    uuid: string;
    device_type: string;
    name: string;
}

export interface NetworkSummaryAlertsBySeverity {
    alerts_data: NetworkSummaryAlertsData;
    last_week_alerts_data: NetworkSummaryLastWeekAlertsData;
}

export interface NetworkSummaryAlertsData {
    total_alerts: number;
    total_critical: number;
    total_warning: number;
    total_information: number;
}

export interface NetworkSummaryLastWeekAlertsData {
    last_week_total_alerts: number;
    last_week_total_critical: number;
    last_week_total_warning: number;
    last_week_total_information: number;
}

export interface NetworkSummaryUtilization {
    top_10_cpu_usage: TopUtilization[];
    top_10_memory_usage: TopUtilization[];
}

export interface TopUtilization {
    itemid: string; 
    lastvalue: number;
    hostid: string;
    key_: string;
    name: string;
    host: UtilizationHost
}

export interface UtilizationHost {
    host_name: string;
    host_type: string;
    host_uuid: string;
}

export interface NetworkSummaryMemoryUtilization {

}

export interface NetworkSummaryInterfaceSummary {
    total_interfaces: number;
    total_up: number;
    total_down: number;
    total_disabled: number;
}

export interface NetworkSummaryAlertsDetails {
    id: number;
    device_name: string;
    severity: string;
    description: string;
    alert_duration: string;
}

export interface NetworkSummaryInterfaceDetails {
    host: NetwrokSummaryHost;
    interface_name: string;
    interface_itemid: string;
    receive: InterfaceDetailProperty;
    transmit: InterfaceDetailProperty;
    bandwidth: InterfaceDetail;
    speed: InterfaceDetail;
    inbound_discarded: InterfaceDetailProperty;
    inbound_with_error: InterfaceDetailProperty;
    outbound_discarded: InterfaceDetailProperty;
    outbound_with_error: InterfaceDetailProperty;
}

export interface NetwrokSummaryHost {
    name: string;
    host_id: number;
    device_uuid: string;
    device_type: string;
}

export interface InterfaceDetailProperty {
    name: string;
    value: string;
    item_id: string;
}

export interface InterfaceDetail extends InterfaceDetailProperty {
    converted_value: string;
}
