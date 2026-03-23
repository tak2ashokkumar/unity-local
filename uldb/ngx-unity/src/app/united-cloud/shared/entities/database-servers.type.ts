import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';

export interface DatabaseServer {
    url: string;
    id: number;
    uuid: string;
    server_type: string;
    db_instance_name: string;
    db_type: DatabaseServerDBType;
    port: number;
    username: string;
    password: string;
    customer: DatabaseServerCustomer;
    connection_type: string;
    data_source_name: string;
    driver: string;
    database_name: string;
    private_cloud: DatabaseServerPrivateCloud;
    device_object: DatabaseServerDeviceObject;
    monitoring: DeviceMonitoringType;
    tags: string[];
    custom_attribute_data: { [key: string]: any };
    domain: string;
    databases: DatabaseType[];
    life_cycle_stage: string;
    life_cycle_stage_status: string;
}

export interface DatabaseServerDBType {
    url: string;
    id: number;
    name: string;
}
export interface DatabaseServerCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface DatabaseServerPrivateCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}
export interface DatabaseServerDeviceObject {
    management_ip: string;
    cloud_type: string;
    name: string;
    device_uuid: string;
    power_status: boolean;
    os_type: string;
    os: string;
    device_id: number;
}

export interface DatabaseType {
    id: number;
    created_at: string;
    updated_at: string;
    custom_attribute_data: null;
    uuid: string;
    name: string;
    short_description: string;
    description: string;
    manufacturer: string;
    model: string;
    discovery_method: string;
    version: string;
    database_server: number;
}