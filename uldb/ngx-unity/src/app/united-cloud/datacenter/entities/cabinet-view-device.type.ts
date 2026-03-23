export interface CabinetDetailsResponse {
    id: number;
    uuid: string;
    name: string;
    type: string;
    model: string;
    capacity: number;
    available_size: number;
    firewalls: CabinetFirewalls[];
    switches: CabinetSwitches[];
    load_balancers: CabinetLoadBalancers[];
    servers: CabinetServersEntity[];
    storage_devices: CabinetStorageDevices[];
    pdus: CabinetPdus[];
    custom_devices: CabinetCustomDevices[];
    panel_devices: CabinetPanelDeviceEntity[];
    mac_devices: CabinetMACDevices[];
}

export interface CabinetFirewalls {
    id: number;
    uuid: string;
    name: string;
    model: string;
    manufacturer: string;
    management_ip: string;
    position: number;
    size: number;
    monitoring: CabinetDeviceMonitoring;
    is_shared: boolean;
    status: string;
}

export interface CabinetSwitches {
    id: number;
    uuid: string;
    name: string;
    model: string;
    manufacturer: string;
    management_ip: string;
    position: number;
    size: number;
    monitoring: CabinetDeviceMonitoring;
    is_shared: boolean;
    status: string;
}

export interface CabinetLoadBalancers {
    id: number;
    uuid: string;
    name: string;
    model: string;
    manufacturer: string;
    management_ip: string;
    position: number;
    size: number;
    monitoring: CabinetDeviceMonitoring;
    is_shared: boolean;
    status: string;
}

export interface CabinetServersEntity {
    id: number;
    uuid: string;
    name: string;
    manufacturer: string;
    management_ip: string;
    position: number;
    size: number;
    instance?: CabinetServerInstance;
    bm_server?: CabinetBMServerEntity;
    username?: string;
    bm_enabled?: boolean;
    monitoring: CabinetDeviceMonitoring;
    model: string;
    status: string;
}

export interface CabinetServerInstance {
    uuid: string;
    virtualization_type: string;
    os: Os;
}

export interface CabinetBMServerEntity {
    uuid: string;
    os: Os;
}

export interface Os {
    name: string;
}

export interface CabinetStorageDevices {
    id: number;
    uuid: string;
    name: string;
    position: number;
    size: number;
    management_ip: string;
    model: string;
    manufacturer: string;
    monitoring: CabinetDeviceMonitoring;
    status: string;
}

export interface CabinetPdus {
    id: number;
    uuid: string;
    name: string;
    pdu_type: string;
    manufacturer: string;
    model: string;
    management_ip: string;
    position: string;
    size: number;
    sockets: number;
    monitoring: CabinetDeviceMonitoring;
    status: string;
}

export interface CabinetMACDevices {
    name: string;
    uuid: string;
    management_ip: string;
    position: number;
    model: string;
    manufacturer: string;
    id: number;
    size: number;
    status: string;
}

export interface CabinetCustomDevices {
    id: number;
    uuid: string;
    name: string;
    management_ip: string;
    position: number;
    size: number;
    status: string;
}

export interface CabinetPanelDeviceEntity {
    id: number;
    uuid: string;
    name: string;
    panel_type: number;
    position: number;
    size: number;
}

export interface CabinetDeviceMonitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}