interface PrivateCLoudFast {
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
    status: string;
}

interface CloudAllocations {
    static_disk_capacity: string;
    disk_capacity: number;
    cpu_capacity: number;
    free_disk_space: number;
    memory_capacity: number;
    total_memory_allocated: number;
    total_cpus_allocated: number;
    cpu_usage: number;
    total_num_cores: number;
    static_memory_capacity: string;
    bm_servers_storage: number | null;
    memory_usage: number;
}

interface CloudAlerts {
    failed: number;
    total: number;
}