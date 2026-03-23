export interface UnityOneStorageDevice {
    url: string;
    id: number;
    ip_address: string;
    snmp_community: string;
    snmp_version: string;
    snmp_authlevel: string;
    snmp_authname: string;
    snmp_authpass: string;
    snmp_authalgo: string;
    snmp_cryptopass: string;
    snmp_cryptoalgo: string;
    uuid: string;
    name: string;
    customer: UnityOneStorageDeviceCustomer;
    private_cloud: string;
    os: UnityOneStorageDeviceOS;
    manufacturer: UnityOneStorageDeviceManufacturer;
    model: string;
    management_ip: string;
    asset_tag: string;
    cabinet: string;
    position: number;
    size: number;
    tags: any[];
    datacenter: UnityOneStorageDeviceDatacenter;
    is_cluster: boolean;
    host_url: string;
    username: string;
    password: string;
    port: null;
    monitor: boolean;
    mtp_templates: any[];
    collector: UnityOneStorageDeviceCollector;
    custom_attribute_data: UnityOneStorageDeviceCustomAttributeData;
    purity_api_token: string;
    purity_api_version: string;
    is_purity: boolean;
    created_at: string;
    updated_at: string;
    observium_id: string;
    logical_cpu: string;
    note: string;
    status: string;
    serial_number: string;
    dns_name: string;
    discovery_method: string;
    first_discovered: string;
    environment: string;
    last_discovered: string;
    service_pack: string;
    last_rebooted: string;
    cpu: string;
    storage_capacity: string;
    storage_used: string;
    memory: string;
    fan: string;
    pdu1: string;
    pdu2: string;
    power_socket2: string;
    firmware_version: string;
    last_updated: string;
    power_socket1: string;
    description: string;
    interfaces: any[];
    uptime: string;
}
export interface UnityOneStorageDeviceCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface UnityOneStorageDeviceOS {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}
export interface UnityOneStorageDeviceManufacturer {
    url: string;
    id: number;
    name: string;
}
export interface UnityOneStorageDeviceDatacenter {
    url: string;
    id: number;
    uuid: string;
    display_name: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    'long': string;
    status: UnityOneStorageDeviceDatacenterStatus[];
    customer: string;
    cabinets: string[];
}
export interface UnityOneStorageDeviceDatacenterStatus {
    status: string;
    category: string;
}
export interface UnityOneStorageDeviceCollector {
    uuid: string;
    name: string;
    id: number;
}
export interface UnityOneStorageDeviceCustomAttributeData {
    [key: string]: any;
}




// Pure Storage Create/Update form type
export interface PureStorageCrudFormdata {
    uuid: string;
    name: string;
    datacenter: {
        uuid: string;
    }
    is_cluster: boolean,
    host_url: string;
    username: string;
    password: string;
    port: number;
    monitor: boolean;
    collector: PureStorageCollectorType;
    tags: string[];
}
export interface PureStorageCollectorType {
    name: string;
    uuid: string;
}