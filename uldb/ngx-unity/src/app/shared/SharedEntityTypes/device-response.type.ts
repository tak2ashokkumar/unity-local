export interface DeviceType {
    name: string;
    displayName: string;
    mapping?: string;
    apiMapping?: string;
}

export interface DeviceFast {
    id: number;
    uuid: string;
    name: string;
    monitoring: DeviceMonitoringData;
}

export interface DeviceMonitoringData {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}