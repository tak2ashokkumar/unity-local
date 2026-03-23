import { DatacenterInDevice } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { Hypervisor, ServerBm_server, ServerCabinet, ServerEsxi, ServerInstance, ServerManufacturer } from "./hypervisor.type";

export interface BMServer {
    url: string;
    server: Server;
    os: BMServerOS;
    bm_controller: Bm_controller;
    observium_status: number;
    uuid: string;
    created_at: string;
    updated_at: string;
    management_ip: string;
    bmc_type: string;
    // id: number;
    // proxy: Proxy;
    // name: string;
    // asset_tag: string;
    // manufacturer: ServerManufacturer;
    // serial_number: string;
    // instance: ServerInstance;
    // bm_server: ServerBm_server;
    // last_known_state: string;
    // last_checked: string;
    // cabinet: ServerCabinet;
    // description: string;
    // salesforce_id: string;
    // private_cloud: Private_cloud;
    // esxi: ServerEsxi[];
    // num_cores: number;
    // num_cpus: number;
    // memory_mb: number;
    // capacity_gb: number;
    // position: number;
    // size: number;
    // username: string;
    // bm_enabled: false;
    monitoring: DeviceMonitoringType;
    // datacenter: DatacenterInDevice;
    custom_attribute_data?: { [key: string]: any };
    life_cycle_stage: string;
    life_cycle_stage_status: string
}

export interface BMServerOS {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type?: string;
}

export interface Bm_controller {
    id: number;
    ip: string;
    version: number;
    username: string;
    proxy_url: string;
    bm_server: number;
}

/**
 * Extends for reusability purpose, as type is same.
 */
interface Server extends Hypervisor {
    os_build_version: string;
    redfish: boolean;
}

export interface BMServerPowerStatus {
    power_status: boolean;
}

export interface Private_cloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}

export interface CollectorType {
    name: string;
    uuid: string;
}
