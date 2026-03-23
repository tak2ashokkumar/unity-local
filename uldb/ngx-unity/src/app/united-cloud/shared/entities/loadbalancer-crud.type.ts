import { DataCenterCabinetType } from './datacenter-cabinet.type';

/**
 * DropDowns for Load Balancer Manufacturer, Model and Cabinets
 */
export interface LoadBalancerCRUDManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface LoadBalancerCRUDModel {
    url: string;
    id: number;
    manufacturer: LoadBalancerCRUDManufacturer;
    operating_system: string;
    name: string;
    num_ports: any;
    num_uplink_ports: number;
}

export interface LoadBalancerCRUDPrivateCloudFast {
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