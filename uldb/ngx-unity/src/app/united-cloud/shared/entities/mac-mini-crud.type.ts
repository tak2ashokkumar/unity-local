/**
 * DropDowns for MAC Devide Manufacturer,Private Cloud and Operating System
 */
export interface MacMiniCRUDManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface MacMiniCRUDModel {
    url: string;
    id: number;
    manufacturer: MacMiniCRUDManufacturer;
    operating_system: string;
    name: string;
    num_ports: null;
    num_uplink_ports: number;
}

export interface MacMiniCRUDPrivateCloudFast {
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

export interface MacMiniCRUDOperatingSystem {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}
