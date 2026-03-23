import { DatacenterInDevice } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { SNMPCrudType } from "./snmp-crud.type";
import { DeviceInterface } from 'src/app/shared/SharedEntityTypes/inventory-attributes.type';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';
export interface Hypervisor extends SNMPCrudType {
    url: string;
    id: number;
    proxy: Proxy;
    uuid: string;
    name: string;
    asset_tag: string;
    manufacturer: ServerManufacturer;
    os: ServerOs;
    serial_number: string;
    instance: ServerInstance;
    bm_server: ServerBm_server;
    last_known_state: string;
    last_checked: string;
    cabinet: ServerCabinet;
    model: ServerModel;
    description: string;
    salesforce_id: string;
    private_cloud: ServerPrivateCloud;
    esxi: ServerEsxi[];
    esxi_hostname: string;
    esxi_username: string;
    num_cores: number;
    num_cpus: number;
    memory_mb: number;
    capacity_gb: number;
    observium_status: number;
    position: number;
    failed_alerts_count: number;
    management_ip: string;
    size: number;
    bm_enabled: boolean;
    tags: string[];
    monitoring: DeviceMonitoringType;
    username?: string;
    datacenter: DatacenterInDevice;
    dns_name: string;
    domain:string;
    discovery_method: string;
    first_discovered: string;
    environment: string;
    last_discovered: string;
    out_of_band_management_ip: string;
    last_rebooted: string;
    hypervisor: boolean;
    logical_cpu: number;
    fan: number;
    pdu1: null;
    pdu2: null;
    status: string;
    end_of_life: string;
    end_of_support: string;
    end_of_service: string;
    firmware_version: string;
    last_updated: string;
    address: string;
    power_socket1: null;
    power_socket2: null;
    out_of_band_management_type: string;
    note: string;
    uptime: string;
    interfaces: DeviceInterface[];
    collector: CollectorType;
    credentials_m2m: UnityCredentialsFast[];
    credentials_type: string;
    cpu_usage?: HypervisorUsageType;
    memory_usage?: HypervisorUsageType;
    storage_usage?: HypervisorUsageType;
    custom_attribute_data?: { [key: string]: any };
    life_cycle_stage: string;
    life_cycle_stage_status: string;
}
export interface ServerProxy {
    proxy_fqdn?: string;
    backend_url?: string;
    same_tab?: boolean;
}
export interface ServerManufacturer {
    url: string;
    id: number;
    name: string;
}
export interface ServerOs {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type?: string;
}
export interface ServerInstance {
    url: string;
    id: number;
    uuid: string;
    name: string;
    os: ServerOs;
    instance_type: string;
    virtualization_type: string;
    object_class: string;
    functional_hostname: string;
    modified_user: string;
    ordered_date: string;
}
export interface ServerBm_server {
    url: string;
    id: number;
    os: ServerOs;
    uuid: string;
    created_at: string;
    updated_at: string;
    management_ip: string;
    bmc_type: string;
    server: string;
}
export interface ServerCabinet {
    url: string;
    id: number;
    uuid: string;
    name: string;
    type: string;
    available_size: string;
    customers: ServerCustomers[];
    cabinet_type: ServerCabinetType;
    cage: null;
    model: string;
    colocloud_set: ServerColocloudSet[];
    size: number;
    contract_start_date: string;
    contract_end_date: string;
    cost: number;
    renewal: string;
    annual_escalation: number;
    capacity: number;
}
export interface ServerCustomers {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface ServerCabinetType {
    url: string;
    id: number;
    cabinet_type: string;
}
export interface ServerColocloudSet {
    url: string;
    id: number;
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    'long': string;
    status: ServerColocloudStatus[];
    customer: string;
    cabinets: string[];
}
export interface ServerColocloudStatus {
    status: string;
    category: string;
}
export interface ServerModel {
    url: string;
    id: number;
    name: string;
}
export interface ServerEsxi {
    uuid: string;
    name: string;
    proxy_url: string;
    proxy_fqdn: string;
    server: number;
}
export interface ServerPrivateCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}
export interface CollectorType {
    name: string;
    uuid: string;
}
export interface CredentialType {
    uuid: string;
}

export interface HypervisorUsageType {
    total: HypervisorUsageValueUnitType;
    available: HypervisorUsageValueUnitType;
    available_percentage: HypervisorUsageValueUnitType;
    consumed_percentage: HypervisorUsageValueUnitType;
    used: HypervisorUsageValueUnitType;
}

export interface HypervisorUsageValueUnitType {
    value: number;
    unit: string;
}