import { DataCenterCabinetType } from './datacenter-cabinet.type';

/**
 * DropDowns for Bare Metal Server Manufacturer,Private Cloud,Cabinet and Operating System
 */
export interface BMServerCRUDManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface BMServerCRUDModel {
    url: string;
    id: number;
    manufacturer: BMServerCRUDManufacturer;
    operating_system: string;
    name: string;
    num_ports: null;
    num_uplink_ports: number;
}

export interface BMServerCRUDPrivateCloudFast {
    id: number;
    uuid: string;
    name: string;
    platform_type: string;
    vms: number; 
    storage: string;
    memory: string,
    colocation_cloud: string;
    display_platform: string;
}

export interface BMServerCRUDOperatingSystem {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}

export interface IPMI {
    ip: string;
    username: string;
    password: string;
    proxy_url: string;
}

export interface DRAC {
    version: number;
    ip: string;
    username: string;
    password: string;
    proxy_url: string;
}
