export interface DeviceMonitoringType {
    zabbix: boolean;
    observium: boolean;
    configured: boolean;
    enabled: boolean;
}

export interface DeviceProxy {
    proxy_fqdn: string;
    backend_url: string;
    same_tab: boolean;
}