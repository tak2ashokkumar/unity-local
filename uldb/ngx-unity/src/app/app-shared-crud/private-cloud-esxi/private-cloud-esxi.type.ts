export interface EsxiServers {
    url: string;
    id: number;
    proxy: IProxy;
    ip_address: string;
    snmp_community: null | string;
    snmp_version: string;
    snmp_authlevel: null;
    snmp_authname: null;
    snmp_authpass: null;
    snmp_authalgo: null;
    snmp_cryptopass: null;
    snmp_cryptoalgo: null;
    uuid: string;
    name: string;
    asset_tag: null;
    manufacturer: IManufacturer;
    os: IOs;
    instance: IInstance;
    bm_server: null;
    last_known_state: null;
    last_checked: null;
    cabinet: null | ICabinet;
    model: IModel;
    description: null;
    status: string;
    salesforce_id: null;
    private_cloud: null;
    esxi: any[];
    esxi_hostname: null;
    esxi_username: null;
    num_cores: number;
    num_cpus: number;
    memory_mb: number;
    capacity_gb: number;
    observium_status: null;
    position: number;
    failed_alerts_count: null;
    management_ip: string;
    size: number;
    username: null;
    bm_enabled: boolean;
    tags: any[];
    monitoring: IMonitoring;
    datacenter: IDatacenter;
    end_of_life: null | string;
    end_of_service: null;
    collector: ICollector;
    credentials: null;
    credentials_type: null;
    credentials_m2m: any[];
    cpu_usage: ICpu_usage;
    memory_usage: IMemory_usage;
    storage_usage: IStorage_usage;
    vmware_cluster: null;
    custom_attribute_data: null;
    os_build_version: null;
    dns_name: null;
    domain: null;
    discovery_method: string | null;
    first_discovered: string | null;
    system_object_oid: null;
    environment: null;
    last_discovered: string | null;
    out_of_band_management_ip: null;
    last_rebooted: null;
    hypervisor: boolean;
    serial_number: string | null;
    logical_cpu: null;
    fan: null;
    pdu1: null;
    pdu2: null;
    firmware_version: null;
    last_updated: null;
    address: string;
    power_socket1: null;
    power_socket2: null;
    out_of_band_management_type: null;
    note: null;
    interfaces: IInterfacesItem[];
    uptime: string | null;
    cpu_type: null;
    cpu_speed: string;
    redfish: boolean;
    service_pack: null;
    snapshot_available: boolean;
    cpu_model: null;
    fqdn: null;
    mac_address: null;
    server_type: string;
    os_type: null;
    short_description: null;
    primary_capability: null;
    capability_list: null;
    flash_memory: null;
    frequency: null;
    input_current: null;
    input_voltage: null;
    reset_limit: null;
    ports_per_slot: null;
    supported: boolean;
    boot_rom_supported: boolean;
    dhcp_use: boolean;
    system_type: null;
    max_consumption: null;
    other_capability_description: null;
    media_supported: null;
    admin_password_status: null;
    reset_count: null;
    data_rate: null;
    number_of_slots: null;
    configuration_options: null;
    reset_capability: null;
    end_of_security_support: null;
    end_of_extended_support: null;
    disk_space: null;
}
interface IProxy {
}
interface IManufacturer {
    url: string;
    id: number;
    name: string;
}
interface IOs {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}
interface IInstance {
    url: string;
    id: number;
    uuid: string;
    name: string;
    os: IOs;
    instance_type: string;
    virtualization_type: string;
    object_class: string;
    functional_hostname: null;
    modified_user: string;
    ordered_date: string;
}
interface IModel {
    url: string;
    id: number;
    name: string;
}
interface IMonitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}
interface IDatacenter {
    url: string;
    id: number;
    uuid: string;
    name: string;
}
interface ICollector {
    uuid: string;
    name: string;
    id: number;
}
interface ICpu_usage {
    available: IAvailable;
    available_percentage: IAvailable_percentage;
    consumed_percentage: IConsumed_percentage;
    total: ITotal;
    used: IUsed;
}
interface IAvailable {
    unit: string;
    value: number;
}
interface IAvailable_percentage {
    unit: string;
    value: number;
}
interface IConsumed_percentage {
    unit: string;
    value: number;
}
interface ITotal {
    unit: string;
    value: number;
}
interface IUsed {
    unit: string;
    value: number;
}
interface IMemory_usage {
    available: IAvailable;
    available_percentage: IAvailable_percentage;
    consumed_percentage: IConsumed_percentage;
    total: ITotal;
    used: IUsed;
}
interface IStorage_usage {
    available: IAvailable;
    available_percentage: IAvailable_percentage;
    consumed_percentage: IConsumed_percentage;
    total: ITotal;
    used: IUsed;
}
interface IInterfacesItem {
    status: string;
    mac_address: string | null;
    type: string;
    name: string;
    description: string;
}
interface ICabinet {
    url: string;
    id: number;
    uuid: string;
    name: string;
}

export interface CreateEsxiServerFormData {
    name: string;
    manufacturer: {
        id: string;
    };
    model: {
        id: string;
    };
    position: string;
    size: number;
    os: {
        id: string;
    };
    cabinet: {
        id: string;
    };
    asset_tag: string;
    management_ip: string;
    tags: string[];
    life_cycle_stage: string;
    life_cycle_stage_status: string;
    hostname: string;
    username: string;
    password: string;
    custom_attribute_data: { [key: string]: any };
}


export interface EsxiServerAccount {
    uuid: string;
    name: string;
    colocation_cloud: Colocation_cloud;
    collector: Collector;
    servers: ServersItem[];
    schedule_meta: Schedule_meta;
}
interface Colocation_cloud {
    id: number;
    uuid: string;
    name: string;
}
interface Collector {
    uuid: string;
    name: string;
    id: number;
}
interface ServersItem {
    id: number;
    url: string;
    name: string;
    uuid: string;
    esxi: null;
}
interface Schedule_meta {
    run_now: boolean;
    schedule_type: string;
}

export interface EsxiScheduleHistory {
    status: string;
    started_at: string;
    completed_at: string;
    duration: string;
    executed_by: string;
}
