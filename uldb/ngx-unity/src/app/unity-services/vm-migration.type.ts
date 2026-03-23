export interface VMwareMigrationType {
    name: string;
    id: number;
    os_name: string;
    host_name: string;
    disk_space: string;
    state: string;
    datacenter: string;
    guest_memory: string;
    migration_date: string;
    migration_status: string;
    backup_date: string;
    uuid: string;
    instance_id: string;
    backup_status: string;
}

export interface OpenStackMigrationType {
    id: number;
    customer: string;
    cloud: OpenStackMigrationCloudType;
    failed_alerts_count: number;
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    vcpu: number;
    memory: number;
    disk: number;
    operating_system: string;
    ip_address: string;
    last_known_state: string;
    instance_id: string;
    management_ip: string;
    migration_date: string;
    migration_status: string;
    backup_date: string;
    backup_status: string;
    is_visible: boolean;
    controller: string;
}
interface OpenStackMigrationCloudType {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}
