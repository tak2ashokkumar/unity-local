export interface VcenterClusterResourceSummary {
    total: number;
    datastores: number;
    hosts: number;
    processors: number;
    networks: number;
    vms: number;
    vm_templates: number;
}

export interface VirtualDcItem {
    id: number;
    uuid: string;
    name: string;
    cloud: string;
    datacenter: string;
    vcenter: string;
}


export interface VcenterClusterSummary {
    highest_count: VcenterClusterByMaxCount;
    usage: VcenterClusterByMaxUsage;
}

export interface VcenterClusterByMaxCount {
    highest_datastore: string[];
    highest_host: string[];
    highest_network: string[];
    highest_processor: string[];
    highest_vm: string[];
    highest_vm_template: string[];
}

export interface VcenterClusterByMaxUsage {
    maximum_cpu_usage: string[];
    maximum_memory_usage: string[];
    maximum_storage_usage: string[];
}

export interface VcenterClusterType {
    id: number;
    uuid: string;
    name: string;
    cluster_id: string;
    host_count: number;
    processor_count: number;
    vm_count: number;
    vm_template_count: number;
    datastore_count: number;
    network_count: number;
    cpu_usage: VcenterClusterUsageType;
    memory_usage: VcenterClusterUsageType;
    storage_usage: VcenterClusterUsageType;
    cluster_status: string;
    drs_state: string;
    high_availabilty_state: string;
    cloud: string;
    datacenter: string;
    vcenter: string;
    created_at: string;
    updated_at: string;
}

export interface VcenterClusterUsageType {
    total: VcenterClusterUsageValueUnitType;
    available: VcenterClusterUsageValueUnitType;
    consumed_percentage: VcenterClusterUsageValueUnitType;
    used: VcenterClusterUsageValueUnitType;
    available_percentage: VcenterClusterUsageValueUnitType;
}

export interface VcenterClusterUsageValueUnitType {
    value: number;
    unit: string;
}