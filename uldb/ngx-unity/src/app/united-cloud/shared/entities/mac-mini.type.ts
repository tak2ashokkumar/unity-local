import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { ServerManufacturer, ServerModel, ServerCabinet } from './hypervisor.type';
import { SNMPCrudType } from './snmp-crud.type';
import { DatacenterInDevice } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceInterface } from 'src/app/shared/SharedEntityTypes/inventory-attributes.type';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';

export interface MacMini extends SNMPCrudType {
    url: string;
    id: number;
    uuid: string;
    name: string;
    serial_number: string;
    customer: Customer;
    private_cloud: Private_cloud;
    num_cpus: number;
    num_cores: number;
    memory_mb: number;
    capacity_gb: number;
    os: MacMiniOS;
    cabinet: MacMiniCabinet;
    pdu1: MacMiniPDU;
    pdu2: MacMiniPDU;
    end_of_life: string;
    end_of_support: string;
    end_of_service: string;
    management_ip: string;
    asset_tag: string;
    status: string;
    manufacturer: ServerManufacturer;
    model: ServerModel;
    observium_status: number;
    failed_alerts_count: number;
    proxy: Proxy;
    tags: any[];
    monitoring: DeviceMonitoringType;
    interfaces: DeviceInterface[];
    datacenter: DatacenterInDevice;
    dns_name: string;
    domain:string;
    environment: string;
    discovery_method: string;
    first_discovered: string;
    last_discovered: string;
    last_rebooted: string;
    description: string;
    last_updated: string;
    note: string;
    uptime: string;
    credentials_m2m: UnityCredentialsFast[];
    credentials_type: string;
    collector: CollectorType;
}

export interface Private_cloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}

export interface MacMiniOS {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type?: string;
}

export interface Proxy {
    proxy_fqdn: string;
    same_tab: boolean;
    backend_url?: string;
}

export interface MacMiniCabinet {
    url: string;
    id: number;
    uuid: string;
    name: string;
    type: string;
    available_size: string;
    customers: any[];
    cabinet_type: ServerCabinet;
    cage: null;
    model: string;
    colocloud_set: any[];
    position: number;
    size: number;
    capacity: number;
}

export interface MacMiniPDU {
    id: string;
    ip_address: string;
    socket: number;
}

export interface CollectorType {
    name: string;
    uuid: string;
}
