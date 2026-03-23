export interface AdvanceAdvancedDiscoveryScanOpRes {
    count: number;
    previous: string | null;
    next: string | null;
    results: AdvancedDiscoveryScanOp[];
}

export interface AdvancedDiscoveryScanOp {
    observium_id: string;
    os: string;
    hostname: string;
    manufacturer: string;
    version: string;
    device_type: string;
    model: string;
    ip_address: string;
    unique_id: string;
    db_pk: string;
    MacAddress: string;
    Processor: string;
    DiskSize: string;
    Memory: string;
    CPU: string;
    OStype: string;
    SerialNumber: string;
    discovery_method: string;
    first_discovered: string;
    last_discovered: string;
    end_of_life: string;
    end_of_support: string;
    end_of_service: string;
    uptime: string;
    Interfaces: AdvancedDiscoveryScanOpInterface[];
    collector: AdvancedDiscoveryScanOpCollector;
    uuid: string;
    discovery: string;
    resource_type: string;
    onboarded_msg: string;
    name: string;
    operating_system: string;
    cpu: string;
    memory: string;
    serial_number: string;
    os_version: string;
    disk_size: string;
    processor: string;
    onboarded_status: boolean;
    status: string;
    sys_description: string;
    system_object_oid: string;
    snmp_credential: string;
    discovered_methods: string[];
    is_onboard: boolean;
}

export interface AdvancedDiscoveryScanOpInterface {
    status: string;
    mac_address: string;
    ip_address: string;
    type: string;
    name: string;
    description: string;
}

export interface AdvancedDiscoveryScanOpCollector {
    uuid: string;
    name: string;
    ip_address: string;
}
export interface AdvancedDiscoveryScanOpIpAddresses {
    ipv4_address: string,
    ipv6_address: string
}

// export interface AdvancedNetworkDiscoveryScanOutput {
//     status: string;
//     domain: string;
//     cpu_count: number;
//     description: string;
//     ip_address: string;
//     hostname: string;
//     version: string;
//     identification: string;
//     device_type: string;
//     memory_count_kb: number;
//     serial_number: string;
//     model: string;
//     os: string;
//     unique_id: string;
//     manufacturer: string;
// }
