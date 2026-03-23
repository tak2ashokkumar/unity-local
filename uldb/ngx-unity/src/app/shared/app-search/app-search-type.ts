export interface GlobalSearchResult {
    uuid: string;
    name: string;
    device_type: string;
    tags: string[];
    dc_uuid: string;
    monitoring?: GlobalSearchDeviceMonitoringDetails;
    // account_uuid: string;
}

export interface GlobalSearchDeviceMonitoringDetails {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}