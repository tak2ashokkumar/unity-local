export interface CloudInventoryType {
    cloud_type: 'Public' | 'Private';
    name: string;
    cloud_uuid: string;
    cloud: 'vmware' | 'openstack' | 'vcloud' | 'proxmox' | 'g3_kvm' | 'AWS' | 'GCP' | 'AZURE';
    vm: PrivateCloudInventoryVMType[] | PublicCloudInventoryVMType[];
    cloud_data: PrivateCloud;
}

export interface CloudInventoryVMType {
    name: string;
    last_known_state: string;
    type: string;
    cpu_count: number;
    storage: string;
    cloud_name: string;
    memory: string;
    ip_address: string;
}

export interface PrivateCloudInventoryVMType extends CloudInventoryVMType {
    is_template?: boolean;
    vm_id?: string;
}

export interface PublicCloudInventoryVMType extends CloudInventoryVMType {
    region: string;
}

export class CloudNamesType {
    constructor() { }
    name: string;
    uuid: string;
    platform_type: string;
}