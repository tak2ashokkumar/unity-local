import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface AzureResourceDetail {
    name: string;
    region: string;
    resource_type: string;
    tags: { [key: string]: string };
    resource_group: string;
    account_name: string;
    subscription: string;
    uuid: string;
    account: number;
    account_uuid: string;

    power_state: string;
    id: number;
    monitoring: DeviceMonitoringType;
    ip_type: string;
    management_ip: string;
    os_name: string;
    os_type: string;
}

export interface AccountCostDetail {
    total_cost: TotalCost;
    total_account_count: number;
    resource_counts: ResourceCounts[];
    total_resource_count: number;
    resource_type_counts: number;
}
interface TotalCost {
    current: Current;
    percentage_change: number;
}
interface Current {
    amount: number;
    unit: string;
    month: string;
}
interface ResourceCounts {
    id:number;
    resource_count: number;
    icon_path:string;
    display_name: string;
    name: string;
}

export interface ResourceDetailsType {
    display_name: string;
    id: number;
    icon_path: string;
    name: string;
    resource_count: number;
}