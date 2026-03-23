import { DeviceDiscoveryCredentials } from "src/app/unity-setup/discovery-credentials/discovery-credentials.type";
import { DatacenterFast } from "./datacenter.type";
import { DeviceMonitoringSNMPCrudType, DeviceMonitoringType } from "./devices-monitoring.type";
import { UnityScheduleType } from "./schedule.type";

export interface PrivateCloudType {
    url: string;
    id: number;
    proxy: PrivateCloudProxyType;
    name: string;
    uuid: string;
    platform_type: string;
    customer: PrivateCloudCustomerType;
    colocation_cloud: PrivateCloudColocationCloudType;
    servers: PrivateCloudServerType[];
    vms: PrivateCloudVMType[];
    vms_count: number;
    total_resources: number;
    'switch': PrivateCloudSwitchType[];
    load_balancer: PrivateCloudLoadBalancerType[];
    customdevice: PrivateCloudCustomDeviceType[];
    firewall: PrivateCloudFirewallType[];
    storage_device: PrivateCloudStorageDeviceType[];
    mac_device: PrivateCloudMacDeviceType[];
    upstream_providers: any[];
    hypervisors: PrivateCloudHypervisorType[];
    bm_server: PrivateCloudBMServerType[];
    display_platform: string;
    server_list: number[];
    collector: PrivateCloudCollectorType;
    nutanix: PrivateCloudNutanixType;
    nutanix_details: PrivateCloudNutanixDetailsType;
    monitoring: DeviceMonitoringType;
    status: string;

}

export interface PrivateCloudTypeResource {
    status: string;
    data: string[];
}

export interface PrivateCloudProxyType {
    proxy_fqdn: string;
    same_tab: boolean;
    backend_url?: string;
}

export interface PrivateCloudCustomerType {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}

export interface PrivateCloudColocationCloudType {
    url: string;
    id: number;
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    'long': string;
    status: PrivateCloudColocationCloudStatusType[];
    customer: string;
    cabinets: string[];
}
export interface PrivateCloudColocationCloudStatusType {
    status: string;
    category: string;
}

export interface PrivateCloudDeviceType {
    id: number;
    name: string;
    uuid: string;
}
export interface PrivateCloudServerType extends PrivateCloudDeviceType {
    url: string;
    esxi: any;
}
export interface PrivateCloudVMType extends PrivateCloudDeviceType {
    url: string;
}
export interface PrivateCloudSwitchType extends PrivateCloudDeviceType {
    url: string;
    object_class: string;
    is_shared: boolean;
    display_name: string;
}
export interface PrivateCloudLoadBalancerType extends PrivateCloudDeviceType {
    url: string;
    object_class: string;
    is_shared: boolean;
    display_name: string;
}
export interface PrivateCloudCustomDeviceType extends PrivateCloudDeviceType {
    url: string;
    created_at: string;
    updated_at: string;
    salesforce_id: any;
    status: string;
    asset_tag: any;
    serial_number: any;
    is_shared: boolean;
    management_ip: any;
    ip_address: any;
    snmp_community: string;
    position: number;
    size: number;
    description: string;
    type: string;
    uptime_robot_id: string;
    cabinet: any;
    observium_host: any;
    customers: string[];
}
export interface PrivateCloudFirewallType extends PrivateCloudDeviceType {
    url: string;
    object_class: string;
    is_shared: boolean;
    display_name: string;
}
export interface PrivateCloudStorageDeviceType extends PrivateCloudDeviceType {
    url: string;
    object_class: string;
    display_name: string;
}
export interface PrivateCloudMacDeviceType extends PrivateCloudDeviceType {
    url: string;
    object_class: string;
    display_name: string;
}
export interface PrivateCloudHypervisorType {
    name: string;
}
export interface PrivateCloudBMServerType {
    name: string;
}

export interface PrivateCloudCollectorType {
    uuid: string;
    name: string;
}

export interface PrivateCloudNutanixType {
    virtual_machine: PrivateCloudNutanixSummaryType;
    host: PrivateCloudNutanixSummaryType;
    cluster: PrivateCloudNutanixSummaryType;
    storage_container: PrivateCloudNutanixSummaryType;
    storage_pool: PrivateCloudNutanixSummaryType;
    disk: PrivateCloudNutanixSummaryType;
    virtual_disks: PrivateCloudNutanixSummaryType;
}
export interface PrivateCloudNutanixSummaryType {
    total: number;
    good: number;
    warning: number;
    error: number;
}

export interface PrivateCloudNutanixDetailsType extends DeviceMonitoringSNMPCrudType {
    protection_domain: string;
    hostname: string;
    components_to_discover: any[];
    schedule: null;
    credentials: PrivateCloudNutanixDetailsCredentialsType;
    onboard: boolean;

}
export interface PrivateCloudNutanixDetailsCredentialsType {
    id: number;
    uuid: string;
    name: string;
}




export interface PrivateClouds {
    id?: number;
    uuid: string;
    name: string;
    platform_type?: string;
    display_platform?: string;
    vms?: number;
    storage?: string;
    memory?: string;
    colocation_cloud?: any;
}

export interface DeviceCRUDPrivateCloudFast {
    id: number;
    uuid: string;
    name: string;
    platform_type: string;
    vms: number;
    storage: string;
    memory: string,
    colocation_cloud: string;
    display_platform: string;
}

export interface NutanixAccount {
    uuid: string;
    platform_type: string;
    name: string;
    colocation_cloud: DatacenterFast;
    hostname: string;
    username: string;
    password: string;
    credential: DeviceDiscoveryCredentials;
    protection_domain_name: string;
    components_to_discover: string[];
    collector: NutanixAccountCollector;
    schedule: UnityScheduleType;
    onboard_device: boolean;
    activated_monitoring: boolean;
}
export interface NutanixAccountCollector {
    uuid: string;
    id: number;
    name: string
}

export interface NutanixClusterType {
    name: string;
    uuid: string;
    aos_version: string;
    host_count: number;
    vm_count: number;
    ip_address: string;
    cpu_usage: string;
    memory_usage: string;
    total_storage: string;
    used_storage: string;
    free_storage_pct: string;
    hypervisors: string;
    upgrade_status: string;
    cluster_runway: string;
    inefficient_vms: number;
}

export interface NutanixHostType {
    name: string;
    uuid: string;
    host_ip: string;
    cvm_ip: string;
    memory_capacity: string;
    cpu_usage: string;
    memory_usage: string;
    cpu_cores: number;
    cpu_capacity: string;
    disk_io_latency: string;
    disk_iops: string;
    disk_io_bandwidth: string;
    used_storage: string;
    free_storage_pct: string;
    hypervisor: string;
    cluster_uuid: string;
    total_storage: string;
    memory_capacity_bytes: string;
    total_storage_bytes: string;
    cpu_capacity_hz: string;
}

export interface NutanixDiskType {
    disk_id: string;
    uuid: string;
    serial_number: string;
    host_name: string;
    hypervisor_ip: string;
    tier: string;
    status: boolean;
    storage_capacity: string;
    storage_usage: string;
    storage_usage_pct: string;
    disk_io_bandwidth: string;
    disk_avg_io_latency: string;
    disk_iops: string;
    free_storage_pct: string;
}

export interface NutanixStorageContainerType {
    name: string;
    uuid: string;
    replication_factor: number;
    node_uuid: null;
    compression: boolean;
    erasure_code: string;
    cache_deduplication: string;
    free_space: string;
    used_space: string;
    max_capacity: string;
    reserved_capacity: string;
    controller_iops: string;
    controller_bw: string;
    controller_latency: string;
    free_storage_pct: string;
    free_space_bytes: string;
    used_space_bytes: string;
}

export interface NutanixStoragePoolType {
    uuid: string;
    name: string;
    disks: number;
    free_space: string;
    used_storage: string;
    total_storage: string;
    controller_iops: string;
    controller_bw: string;
    controller_latency: string;
    free_storage_pct: string;
}

export interface NutanixVirtualDiskType {
    name: string;
    uuid: string;
    flash_mode: boolean;
    total_capacity: string;
    read_iops: number;
    read_latency: string;
    write_iops: number;
    write_latency: string;
    write_bw: string;
}

export interface PrivateCLoudFastType {
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

export interface PrivateCloudCountType {
    count: number;
    platform_type: string;
}