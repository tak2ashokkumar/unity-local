/** Switch CRUD Dropdowns */

export interface SwitchCRUDManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface SwitchCRUDModel {
    url: string;
    id: number;
    manufacturer: SwitchCRUDManufacturer;
    operating_system: string;
    name: string;
    num_ports: null;
    num_uplink_ports: number;
}

export interface SwitchCRUDPrivateCloudFast {
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