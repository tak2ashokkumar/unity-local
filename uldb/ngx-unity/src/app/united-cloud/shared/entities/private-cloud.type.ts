interface PrivateCloud {
    url: string;
    id: number;
    uuid: string;
    proxy: Proxy;
    display_platform: string;
    customer: Customer;
    servers: ServersItem[];
    vms: VmsItem[];
    vms_count: number;
    switch: SwitchItem[];
    load_balancer: LoadBalancerItem[];
    customdevice: CustomdeviceItem[];
    firewall: FirewallItem[];
    upstream_providers: any[];
    vcenter_proxy: VcenterProxyItem[];
    openstack_proxy: any[];
    hypervisors: HypervisorsItem[];
    bm_server: BmServerItem[];
    storage_device: StorageItem[];
    mac_device: MacMiniItem[];
    name: string;
    created_at: string;
    updated_at: string;
    platform_type: string;
    vmware_adapter: any;
    openstack_adapter: any;
    storage: string;
    memory: string;
    colocation_cloud: any;
    collector: CollectorType;
    nutanix: Nutanix;
}
interface Proxy {
    proxy_fqdn: string;
    same_tab: boolean;
    backend_url?: string;
}
interface Customer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}

interface DeviceItem {
    id: number;
    name: string;
    uuid: string;
}

interface ServersItem extends DeviceItem {
    url: string;
    esxi: any;
}
interface VmsItem extends DeviceItem {
    url: string;
}
interface SwitchItem extends DeviceItem {
    url: string;
    object_class: string;
    is_shared: boolean;
    display_name: string;
}
interface LoadBalancerItem extends DeviceItem {
    url: string;
    object_class: string;
    is_shared: boolean;
    display_name: string;
}
interface StorageItem extends DeviceItem {
    url: string;
    object_class: string;
    display_name: string;
}
interface MacMiniItem extends DeviceItem {
    url: string;
    object_class: string;
    display_name: string;
}
interface CustomdeviceItem extends DeviceItem {
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
interface FirewallItem extends DeviceItem {
    url: string;
    object_class: string;
    is_shared: boolean;
    display_name: string;
}
interface VcenterProxyItem {
    uuid: string;
    name: string;
    proxy_url: string;
    proxy_fqdn: string;
}
interface HypervisorsItem {
    name: string;
}
interface BmServerItem {
    name: string;
}
interface StorageItem {
    name: string;
    id: number;
}
interface CollectorType {
    name: string;
    uuid: string;
}

interface Nutanix {
    cluster: summaryCounts;
    disk: summaryCounts;
    host: summaryCounts;
    storage_container: summaryCounts;
    storage_pool: summaryCounts;
    virtual_disks: summaryCounts;
    virtual_machine: summaryCounts;
}

interface summaryCounts {
    total: number;
    good: number;
    warning: number;
    error: number;
}