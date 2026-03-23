import { DeviceDiscoveryCredentials } from "src/app/unity-setup/discovery-credentials/discovery-credentials.type";
import { DatacenterFast } from "./datacenter.type";
import { UnityScheduleType } from "./schedule.type";
import { DeviceMonitoringType } from "./devices-monitoring.type";

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

export interface NutanixClusterDetailsType {
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
    health_summary: NutanixClusterDetailsHealthSummary;
    vm_summary: NutanixClusterDetailsVMSummary;
    total_vms: number;
    memory_capacity: string;
    hypervisor_summary: string;
    cpu_capacity: string;
    alerts_list: NutanixClusterDetailsAlerts[];
    alert_summary: NutanixClusterDetailsAlertSummary;
}

export interface NutanixClusterDetailsHealthSummary {
    virtual_machine: NutanixClusterDetailsHealthCount;
    storage_container: NutanixClusterDetailsHealthCount;
    cluster: NutanixClusterDetailsHealthCount;
    host: NutanixClusterDetailsHealthCount;
    storage_pool: NutanixClusterDetailsHealthCount;
    disk: NutanixClusterDetailsHealthCount;
    virtual_disks: NutanixClusterDetailsHealthSummaryVirtualDisks;
}

export interface NutanixClusterDetailsHealthCount {
    total: number;
    good: number;
    warning: number;
    error: number;
}

export interface NutanixClusterDetailsHealthSummaryVirtualDisks {
    total: number;
}

export interface NutanixClusterDetailsVMSummary {
    on: number;
}

export interface NutanixClusterDetailsAlerts {
    name: string;
    uuid: string;
    severity: string;
    durations: string;
    resolved: boolean;
    acknowledged: boolean;
    resolved_time: string;
    alert_id: string;
}

export interface NutanixClusterDetailsAlertSummary {
    Critical: number;
    Warning: number;
    Information: number;
}

export interface NutanixClusterControllerStatsType {
    controller_num_iops: number[];
    controller_io_bandwidth_kBps: number[];
    controller_avg_io_latency_usecs: number[];
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

export interface NutanixHostDetailsType {
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
    memory_capacity_bytes: null;
    total_storage_bytes: null;
    cpu_capacity_hz: null;
    host_type: string;
    ipmi_ip: string;
    node_serial: string;
    block_serial: string;
    block_model: string;
    disks: string;
    cpu_model: string;
    sockets: number;
    vms: number;
    oplog_disk_pct: string;
    oplog_disk_size: string;
    monitored: boolean;
    hypervisor_full_name: string;
    secure_boot_enabled: boolean;
}

//Need to Check the list and details API resp( Now both uses same model ) -  if both same no need for details API.
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
    model_name: string;
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

export interface NutanixStorageContainerDetailsType {
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
    data_reduction_ratio: string;
    overall_efficiency: string;
    data_reduction_savings: string;
    effective_free: string;
    filesystem_whitelists: string;
}

//Need to reverify the API resp with model
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

//Need to reverify the details API resp with model
export interface NutanixStoragePoolDetailsType {
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

//Need to reverify the API resp with model
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

//Need to reverify the Details API resp with model
export interface NutanixVirtualDiskDetailsType {
    name: string;
    uuid: string;
    flash_mode: boolean;
    total_capacity: string;
    read_iops: number;
    read_latency: string;
    write_iops: number;
    write_latency: string;
    write_bw: string;
    read_source_ssd: string;
    random_io: string;
    total_iops: number;
    read_source_cache: string;
    read_source_hdd: string;
    read_working_set_size: string;
    write_working_set_size: string;
    union_working_set_size: string;
    vm_uuid: string;
}

export interface NutanixVMType {
    name: string;
    id: string;
    uuid: string;
    cluster: string;
    power_state: string;
    host_name: string;
    host_uuid: string;
    ip_address: string[];
    cores: number;
    memory_capacity: string;
    total_storage: string;
    used_storage: string;
    cpu_usage: string;
    memory_usage: string;
    controller_read_iops: string;
    controller_write_iops: string;
    controller_bandwidth: string;
    controller_avg_latency: string;
    flash_mode: boolean;
    free_storage_pct: string;
    status?: string;
    monitoring?: DeviceMonitoringType;
}

export interface NutanixVMDetailsType {
    name: string;
    uuid: string;
    cluster: null;
    power_state: string;
    host_name: string;
    host_uuid: string;
    ip_address: any[];
    cores: number;
    memory_capacity: string;
    total_storage: string;
    used_storage: string;
    cpu_usage: string;
    memory_usage: string;
    controller_read_iops: null;
    controller_write_iops: string;
    controller_bandwidth: string;
    controller_avg_latency: string;
    flash_mode: boolean;
    description: string;
    storage_container_uuid: string[];
    virtual_disks: number;
    ngt_enabled: string;
    ngt_mounted: string;
    vm_id: string;
    protection_status: string;
    network_adapters: number;
    cluster_uuid: string;
}