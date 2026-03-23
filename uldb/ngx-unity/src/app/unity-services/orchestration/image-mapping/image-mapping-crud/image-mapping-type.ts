export interface VMImage {
    name: string;
    description: string;
    os_type: string;
    os_name: string;
    os_version: string;
    os_edition: string;
    min_memory: number;
    min_vcpu: number;
    username: string;
    password: string;
    location: any;
    storage_type?: string;
    test_connection?: string;
    file_path?: string;
    datastore_name?: string;
}

export interface PrivateCLoudFast {
    id: number;
    uuid: string;
    name: string;
    platform_type: string;
    vms: number;
    storage: string;
    memory: string;
    colocation_cloud: string;
    display_platform: string;
    vm_url: string;
}

export interface OSInfo {
    os_version: string;
    os_type: string;
    os_name: string;
    os_edition: string;
}

export interface Summary {
    provisioned: SummaryValueUnitType;
    capacity: SummaryValueUnitType;
    freespace: SummaryValueUnitType;
    provisioned_percentage: SummaryValueUnitType;
    access: string;
    unity: boolean;
    type: string;
}

export interface StorageInfo {
    name: string;
    summary: Summary;
}

export interface SummaryValueUnitType {
    value: number;
    unit: string;
}

export interface FileInfo {
    file_name: string;
    file_path: string;
}
