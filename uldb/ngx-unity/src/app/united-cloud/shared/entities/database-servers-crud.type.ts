export interface DatabaseCRUDBMServerFast {
    id: number;
    name: string;
}

export interface DatabaseCRUDPrivateCloudFast {
    id: number;
    uuid: string;
    name: string;
    platform_type: string;
    vms: number;
    storage: string;
    memory: number;
    colocation_cloud: string;
    display_platform: string;
    vm_url: string;
}

export interface DatabaseCRUDPrivateCloudVms {
    id: number;
    uuid: string;
    cloud: DatabaseCRUDPrivateCloudVmsCloud;
    management_ip: string | null;
    failed_alerts_count: null | number;
    created_at: string;
    updated_at: string;
    instance_id: string;
    name: string;
    vcpus: number;
    guest_os: string;
    guest_memory: number;
    power_state: string;
    is_visible: boolean;
    snmp_community: string;
    is_template?: boolean;
}

export interface DatabaseCRUDPrivateCloudVmsCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}

export interface DatabaseCRUDDBType {
    id: number;
    url: string;
    name: string;
}
