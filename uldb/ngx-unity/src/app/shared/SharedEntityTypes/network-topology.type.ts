import { UnityAttributeColors } from '../device-icon.service';

export interface UnityNetworkTopology {
    uuid: string;
    network_topology: UnityDeviceNetwork;
}
export interface UnityDeviceNetwork {
    nodes: UnityDeviceNetworkNode[];
    links: UnityDeviceNetworkLink[];
}
export interface UnityDeviceNetworkNode {
    id: number;
    unique_id?: string;
    hostname?: string;
    device_type?: string;

    manufacturer?: string;
    model?: string;
    ip_address: string;
    onboarded: boolean;
    MacAddress?: string;
    snmpversion?: number;
    Processor?: string;
    CPU?: string;
    SysDescription?: string;
    version?: string;
    DiskSize?: string;
    snmp_cred_index?: number;
    Memory?: string;
    os?: string;

    //custom added from ui
    fa_icon?: string;
    displayType: string;
}
export interface UnityDeviceNetworkLink {
    source_id: number | string;
    source_hostname: string;
    source_ip: string;

    target_id: number | string;
    target_hostname: string;
    target_ip: string;
}




/*
* Below types are for Unity View
*/

export interface UnityViewNetworkTopology {
    nodes: UnityViewNetworkTopologyNode[];
    links: UnityViewNetworkTopologyLink[];
    status_summary?: StatusSummary;
}
export interface UnityViewNetworkTopologyNode {
    name: string;
    uuid: string;
    device_type: string;
    status: string;
    platform_type?: string;
    datacenter?: string;
    ip_address?: string;
    onboarded?: string;
    alert_count?: number;
    alert_data: Array<Array<string | number>>;
    configured: boolean;
    os: string;

    manufacturer?: string;
    model?: string;
    MacAddress?: string;
    snmpversion?: number;
    Processor?: string;
    CPU?: string;
    SysDescription?: string;
    version?: string;
    DiskSize?: string;
    snmp_cred_index?: number;
    Memory?: string;
    unique_id?: string;
    icon?: string;

    //custom added from ui
    fa_icon?: string;
    is_device?: boolean;
    alert_data_view: UnityViewNetworkTopologyNodeAlertTypes;
    badgeColors?: UnityAttributeColors;
    showBadge?: boolean;
    displayType: string;
    deviceMapping: string;
    redirectLink: string;
    isPassive: boolean;
}

export class UnityViewNetworkTopologyNodeAlertTypes {
    constructor() { }
    Information?: number = 0;
    Warning?: number = 0;
    Critical?: number = 0;
}

export interface UnityViewNetworkTopologyLink {
    source_uuid: string;
    target_uuid: string;
}

export interface UnityBorderDevices {
    uuid: string;
    name: string;
    is_root_device: boolean;
    type: string;
}

export interface StatusSummary {
    active: number;
    unknown: number;
    inactive: number;
  }
  