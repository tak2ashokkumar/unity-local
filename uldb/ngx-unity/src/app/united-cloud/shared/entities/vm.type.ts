import { DeviceInterface } from "src/app/shared/SharedEntityTypes/inventory-attributes.type";
import { UnityCredentialsFast } from "src/app/shared/SharedEntityTypes/unity-credentials.type";

export interface VirtualMachine {
    id: number;
    cloud: Cloud;
    uuid: string;
    name: string;
    instance_id: string;
    management_ip: string;
    os_name: string;
    host_name: string;
    cpu_core: number;
    vcpus: number;
    disk_space: number;
    state: string;
    datacenter: string;
    guest_memory: number;
    vmpath_name: string;
    migration_date: string;
    migration_status: string;
    backup_date: string;
    backup_status: string;
    is_visible: boolean;
    ip_address: string;
    snmp_community: string;
}
interface Cloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}

export interface CustomVirtualMachine {
    url: string;
    id: number;
    name: string;
    uuid: string;
    nics: number;
    server: string;
    management_ip: string;
    os: Os;
    vm_type: string;
    last_known_state: string;
}
interface Os {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}

export interface CustomVirtualMachineDetails {
    url: string;
    id: number;
    name: string;
    uuid: string;
    nics: number;
    server: string;
    memory: string;
    management_ip: string;
    os: vmOS;
    customer: vmCustomer;
    private_cloud: vmPrivateCloud;
    vm_type: string;
    last_known_state: string;
    tags: any[];
    monitoring: vmMonitoring;
    datacenter: string;
    dns_name: string;
    environment: string;
    discovery_method: string;
    first_discovered: string;
    last_discovered: string;
    service_pack: string;
    last_rebooted: string;
    vcpu_count: string;
    storage: string;
    firmware_version: string;
    last_updated: string;
    snapshot_available: boolean;
    hypervisor: string;
    note: string;
}
export interface vmOS {
    url: string;
    id: number;
    name: string;
    version: string;
    full_name: string;
    platform_type: string;
}
export interface vmCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface vmPrivateCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}
export interface vmCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}
export interface vmMonitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}
export interface vmActionsinProgress {
    clone: boolean;
    power_off: boolean;
    guest_shutdown: boolean;
    install_vmware_tool: boolean;
    uninstall_vmware_tool: boolean;
    power_on: boolean;
    reboot: boolean;
    convert_to_template: boolean;
    'delete': boolean;
}

export interface VirtualMachineDetails {
    id: number;
    ip_address: string;
    tags: string[];
    monitoring: vmMonitoring;
    cloud: vmCloud;
    management_ip: string;
    mgmt_ip_address: string;
    failed_alerts_count: number;
    datacenter: string;
    dns_name: string;
    environment: string;
    discovery_method: string;
    first_discovered: string;
    last_discovered: string;
    service_pack: string;
    last_rebooted: string;
    vcpu_count: number;
    memory: number;
    storage: number;
    firmware_version: string;
    last_updated: string;
    snapshot_available: boolean;
    note: string;
    snmp_version: string;
    snmp_community: string;
    snmp_authlevel: string;
    snmp_authname: string;
    snmp_authpass: string;
    snmp_authalgo: string;
    snmp_cryptopass: string;
    snmp_cryptoalgo: string;
    connection_type: string;
    alerts_notification_enabled: boolean;
    notify_alerts_to: any[];
    uuid: string;
    name: string;
    instance_id: string;
    os_name: string;
    os: string;
    host_name: string;
    cpu_core: number;
    vcpus: number;
    disk_space: number;
    state: string;
    guest_memory: number;
    vmpath_name: string;
    is_template: boolean;
    migration_date: string;
    migration_status: string;
    backup_date: string;
    backup_status: string;
    is_visible: boolean;
    actions_in_progress: vmActionsinProgress;
    vmware_tools_mounted: boolean;
    vmware_tools_installed: boolean;
    hypervisor: string;
    vcenter: number;
    esxi: string;
    interfaces: DeviceInterface[];
    credentials: CredentialType;
    credentials_m2m: UnityCredentialsFast[];
    credentials_type: string;

    //needed
    serial_number: string;
    description: string;
    asset_tag: string;
    custom_attribute_data?: { [key: string]: any };

    // hyper-v VM
    vm_id: string;
    vm_name: string;
    status: string;
    cluster: number;
}

export interface VCenterDataStore {
    name: string;
    summary: VcenterDataStoreSummary;
}

export interface VcenterDataStoreSummary {
    access: string;
    provisioned: VcenterDataStoreSummaryValueUnitType;
    type: string;
    capacity: VcenterDataStoreSummaryValueUnitType;
    freespace: VcenterDataStoreSummaryValueUnitType;
    provisioned_percentage: VcenterDataStoreSummaryValueUnitType;
}

export interface VcenterDataStoreSummaryValueUnitType {
    value: number;
    unit: string;
}

export class CredentialType {
    uuid: string;
}