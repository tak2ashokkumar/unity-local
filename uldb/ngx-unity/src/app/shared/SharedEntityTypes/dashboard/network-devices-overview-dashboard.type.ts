import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

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
    monitoring:DeviceMonitoringType;
}

export interface NetworkSummaryAlertsBySeverity {
    events_data: NetworkSummaryAlertsData;
    last_week_events_data: NetworkSummaryLastWeekAlertsData;
}

export interface NetworkSummaryAlertsData {
    total_events: number;
    total_critical: number;
    total_warning: number;
    total_information: number;
}

export interface NetworkSummaryLastWeekAlertsData {
    last_week_total_events: number;
    last_week_total_critical: number;
    last_week_total_warning: number;
    last_week_total_information: number;
}

export interface NetworkSummaryUtilization {
    top_10_cpu_usage: Top10Utilization[];
    top_10_memory_usage: Top10Utilization[];
}

export interface Top10Utilization {
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
    host_monitoring: UtilizationHostMonitoring
}

export interface UtilizationHostMonitoring {
    configured: boolean;
    enable: boolean;
    zabbix: boolean;
    observium: boolean;
}

export interface NetworkSummaryInterfaceSummary {
    total_interfaces: number;
    total_up: number;
    total_down: number;
    total_unknown: number;
}

export interface NetworkSummaryAlertsDetails {
    id: number;
    uuid: string;
    event_count: number;
    first_event_datetime: string;
    last_event_datetime: string;
    alert_datetime: string;
    device_name: string;
    device_type: string;
    management_ip: string;
    description: string;
    severity: string;
    status: string;
    is_acknowledged: boolean;
    source: string;
    recovered_time: string;
    event_timeline: NetworkSummaryAlertEventTimeline[];
    alert_duration: string;
    category: string;
    datacenter: string;
    private_cloud: string;
    cabinet: string;
    tags: any[];
}
export interface NetworkSummaryAlertEventTimeline {
    uuid: string;
    event_datetime: string;
    received_datetime: string;
    severity: string;
    status: string;
    device_name: string;
    device_type: string;
    device_uuid: string;
    recovered_datetime: null;
}

export interface NetworkSummaryInterfaceDetails {
    host: NetworkSummaryHost;
    interface_name: string;
    interface_itemid: string;
    interface_status: string;
    receive: InterfaceDetail;
    transmit: InterfaceDetail;
    bandwidth: InterfaceDetail;
    speed: InterfaceDetail;
    inbound_discarded: InterfaceDetailProperty;
    inbound_with_error: InterfaceDetailProperty;
    outbound_discarded: InterfaceDetailProperty;
    outbound_with_error: InterfaceDetailProperty;
}

export interface NetworkSummaryHost {
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