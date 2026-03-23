import { DataCenterCabinetType } from './datacenter-cabinet.type';

/**
 * DropDowns for Hypervisor Manufacturer and Cabinets
 */
export interface HypervisorCRUDManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface HypervisorCRUDModel {
    url: string;
    id: number;
    manufacturer: HypervisorCRUDManufacturer;
    operating_system: string;
    name: string;
    num_ports: null;
    num_uplink_ports: number;
}

export interface HypervisorCRUDPrivateCloudFast {
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

export interface HypervisorCRUDOperatingSystem {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}