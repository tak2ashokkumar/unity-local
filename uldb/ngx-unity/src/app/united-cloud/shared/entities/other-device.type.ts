export interface OtherDevice {
    id: number;
    tags: string[];
    uuid: string;
    name: string;
    description: string;
    type: string;
    uptime_robot_id: string;
    customers: OtherDeviceCustomer[];
    cabinet: any;
    urls: OtherDeviceUrl[];
    ip_address: string;
    snmp_community: string;
    datacenter: any;
    is_monitoring: boolean;
    status: string;
    collector: OtherDeviceCollector;
    monitoring: OtherDeviceMonitoring;
    polling_interval_min: number;
    polling_interval_sec: number;
    updated_at: string;
    custom_attribute_data?: { [key: string]: any }
}
export interface OtherDeviceCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface OtherDeviceUrl {
    id: number;
    uuid: string;
    name: string;
    url: string;
    url_availabilty: boolean;
    login_availability: boolean;
    response_availability: boolean;
    string_availabilty: boolean;
    login_username: string;
    login_password: string;
    response_status: string;
    string_pattern: string;
    device: number;
}
export interface OtherDeviceCollector {
    uuid: string;
    name: string;
}
export interface OtherDeviceMonitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}


export interface OtherDeviceSummary {
    summary_data: OtherDeviceSummaryData;
}
export interface OtherDeviceSummaryData {
    total_devices: number;
    total_devices_with_status_up: number;
    total_devices_with_status_down: number;
    total_devices_with_monitoring_enabled: number;
    total_devices_with_monitoring_not_activated: number;
    total_alerts: number;
    total_warning_alerts: number;
    total_critical_alerts: number;
    total_information_alerts: number;
}


export interface OtherDeviceUpTimeRobotData {
    status: string;
    response_times: ResponseTimesItem[];
    logs: LogsItem[];
    up_since: number;
    paused_since: number;
    monitoring_id: string;
    friendly_name: string;
    down_since: number;
    average_response_time: string;
    custom_uptime_ratio: string;
}
export interface ResponseTimesItem {
    value: number;
    datetime: number;
}
export interface LogsItem {
    duration: number;
    reason: Reason;
    type: number;
    datetime: number;
}
export interface Reason {
    code: string;
    detail: string;
}


