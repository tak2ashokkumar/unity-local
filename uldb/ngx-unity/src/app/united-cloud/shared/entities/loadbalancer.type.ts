import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterInDevice } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { SNMPCrudType } from "./snmp-crud.type";
import { DeviceInterface } from 'src/app/shared/SharedEntityTypes/inventory-attributes.type';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';
import { UnityUserApplicableModulePermission } from 'src/app/shared/SharedEntityTypes/loggedin-user.type';

export interface LoadBalancer extends SNMPCrudType {
    url: string;
    id: number;
    name: string;
    uuid: string;
    model: string;
    model_id: string;
    manufacturer: string;
    manufacturer_id: string;
    management_ip: string;
    asset_tag: string;
    is_shared: boolean;
    credentials_m2m: UnityCredentialsFast[];
    credentials_type: string;
    collector: CollectorType;
    tags: string[];

    serial_number: string;
    observium_status: string;
    proxy: Proxy;
    netscaler_proxy: any[];
    f5lb_proxy: F5LbProxyItem[];
    ip_address: string;
    salesforce_id: string;
    cisco_firewall: any[];
    juniper_firewall: any[];
    failed_alerts_count: number;
    alias_name: string;
    os_type: string;
    os_name: string;
    version_number: string;
    dns_name: string;
    domain:string;
    discovery_method: string;
    first_discovered: string;
    environment: string;
    last_discovered: string;
    number_of_ports: number;
    description: string;
    note: string;
    IPsec_tunnel: boolean;
    last_rebooted: string;
    cpu: number;
    memory: number;
    fan: number;
    power_supply1: null;
    power_supply2: null;
    firmware_version: string;
    last_updated: string;
    address: string;
    power_socket1: number;
    power_socket2: number;
    status: string;
    end_of_life: string;
    end_of_support: string;
    end_of_service: string;
    uptime: string;

    monitoring: DeviceMonitoringType;
    datacenter: DatacenterInDevice;
    cabinet: CabinetFast;
    position: number;
    size: number;
    cloud: PrivateCLoudFast[];
    interfaces: DeviceInterface[];
    custom_attribute_data?: { [key: string]: any }

    // applicable_permission_sets: UnityUserApplicablePermissionSet[];
    applicable_module_permissions: UnityUserApplicableModulePermission[];
    // applicable_rbac_user_groups: any[];
}

interface F5LbProxyItem {
    uuid: string;
    name: string;
    proxy_url: string;
    proxy_fqdn: string;
}

interface CabineType {
    url: string;
    id: number;
    cabinet_type: string;
}

interface LoadBalancerCabinet {
    url: string;
    id: number;
    uuid: string;
    name: string;
    type: string;
    available_size: string;
    customers: any[];
    cabinet_type: CabineType;
    cage: any;
    model: string;
    colocloud_set: any[];
    position: number;
    size: number;
    capacity: number;
}

export interface CollectorType {
    name: string;
    uuid: string;
}