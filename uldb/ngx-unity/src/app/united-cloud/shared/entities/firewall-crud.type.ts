import { DataCenterCabinetType } from './datacenter-cabinet.type';

/**
 * DropDowns for Firewall Manufacturer, Model and Cabinets
 */
export interface FirewallCRUDManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface FirewallCRUDModel {
    url: string;
    id: number;
    manufacturer: FirewallCRUDManufacturer;
    operating_system: string;
    name: string;
    num_ports: null;
    num_uplink_ports: number;
}

export interface FirewallCRUDPrivateCloudFast {
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