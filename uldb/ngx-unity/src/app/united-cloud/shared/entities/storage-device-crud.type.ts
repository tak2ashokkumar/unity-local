/**
 * DropDowns for Storage Device Cabinets
 */
export interface StorageCRUDManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface StorageCRUDModel {
    url: string;
    id: number;
    manufacturer: StorageCRUDManufacturer;
    operating_system: string;
    name: string;
    num_ports: null;
    num_uplink_ports: number;
}

export interface StorageDeviceCRUDOperatingSystem {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}