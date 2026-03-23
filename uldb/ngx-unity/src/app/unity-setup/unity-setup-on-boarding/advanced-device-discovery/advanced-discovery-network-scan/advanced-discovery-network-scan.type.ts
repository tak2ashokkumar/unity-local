import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";
import { DeviceDiscoveryCredentials } from "src/app/unity-setup/discovery-credentials/discovery-credentials.type";

export interface AdvancedDeviceDiscoveryNetwork {
    uuid: string;
    name: string;
    type: string;
    subnet: string;
    collector: Collector;
    credentials: DeviceDiscoveryCredentials[];
    run_now: boolean;
    schedule_scan: boolean;
    schedule: string;
    schedule_time: string;
    scheduled_day: string;
    scheduled_date: number;
    customer: AdvancedDeviceDiscoveryNetworkCustomer;
    last_run: string;
    duration: string;
    last_run_by: string;
    device_count: number;
    last_execution_status: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    network_type: string;
    discovery_methods: string[];
    scheduled_status: boolean;
    discover_ips : string[];
    schedule_meta: UnityScheduleType;
}

export interface AdvancedDeviceDiscoveryNetworkCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}

export interface AdvancedNetworkDiscoveredDevices {
    attributes: AdvancedNetworkDiscoveredDeviceData;
    type: string;
    id: number;
    links: AdvancedNetworkDiscoveredDeviceLinks;
}

interface AdvancedNetworkDiscoveredDeviceData {
    'system.status': string;
    'system.id': number;
    'system.icon': string;
    'system.identification': string;
    'system.description': string;
    'system.manufacturer': string;
    'system.ip_padded': string;
    'system.os_family': string;
    'system.name': string;
    'system.ip': string;
    'orgs.name': string;
    'system.type': string;
    'system.domain': string;
}

interface AdvancedNetworkDiscoveredDeviceLinks {
    self: string;
}

export interface AdvancedDiscoveryScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}

export interface Collector {
    uuid: string;
    name: string;
    id: string;
}