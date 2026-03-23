import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { SNMPCrudType } from './snmp-crud.type';
import { DatacenterInDevice } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceInterface } from 'src/app/shared/SharedEntityTypes/inventory-attributes.type';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';

export interface StorageDevice extends SNMPCrudType {
    url: string;
    id: number;
    uuid: string;
    name: string;
    customer: Customer;
    private_cloud: StorageDevicePrivateCloud;
    os: StorageDeviceOs;
    manufacturer: StorageManufacturer;
    model: StorageModel;
    management_ip: string;
    asset_tag: string;
    status: string;
    cabinet: StorageDeviceStorageCabineType;
    position: number;
    size: number;
    observium_status: string;
    failed_alerts_count: number;
    proxy: Proxy;
    monitoring: DeviceMonitoringType;
    tags: string[];
    datacenter: DatacenterInDevice;
    dns_name: string;
    domain: string;
    serial_number: string;
    description: string;
    discovery_method: string;
    first_discovered: string;
    environment: string;
    last_discovered: string;
    last_rebooted: string;
    hypervisor: boolean;
    logical_cpu: number;
    fan: number;
    pdu1: null;
    pdu2: null;
    end_of_life: string;
    end_of_support: string;
    end_of_service: string;
    firmware_version: string;
    last_updated: string;
    power_socket1: null;
    power_socket2: null;
    note: string;
    service_pack: string;
    cpu: number;
    storage_capacity: number;
    storage_used: number;
    memory: number;
    uptime: string;
    interfaces: DeviceInterface[];
    is_cluster: boolean;
    is_purity: boolean;
    credentials_m2m: UnityCredentialsFast[];
    credentials_type: string;
    collector: CollectorType;
    custom_attribute_data?: { [key: string]: any }
    redfish: boolean;
}

export interface StorageManufacturer {
    url: string;
    id: number;
    name: string;
}

export interface StorageModel {
    url: string;
    id: number;
    name: string;
}

export interface StorageDeviceCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}

export interface StorageDevicePrivateCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}

export interface StorageDeviceCabinet {
    url: string;
    id: number;
    uuid: string;
    name: string;
}

export interface StorageDeviceOs {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}

export interface StorageDeviceStorageData {
    [key: string]: StorageDeviceStorageDataProperties;
}

export interface StorageDeviceStorageDataProperties {
    used: string;
    capacity: string;
    free: string;
    used_perc: number;
}
export interface StorageDeviceStorageCabineType {
    url: string;
    id: number;
    cabinet_type: string;
}

export interface CollectorType {
    name: string;
    uuid: string;
}