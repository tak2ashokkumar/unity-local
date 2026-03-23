import { UnityAttributeColors } from "../device-icon.service";
import { DeviceMonitoringType } from "./devices-monitoring.type";
import { UnityScheduleType } from "./schedule.type";

export interface AzureManageAccountsType {
    id: number;
    name: string;
    uuid: string;
    monitoring: DeviceMonitoringType;
    service_count: number;
    resource_count: number;
    is_managed: boolean;
    alert_count: AzureManageAccountsAlertsCountDataType;
    current_month_cost: AzureManageAccountsCurrentMonthCostType;
    azure_ad_integ: boolean;
}

export interface AzureManageAccountsAlertsCountDataType {
    information: number;
    critical: number;
    warning: number;
    event_count: number;
}

export interface AzureManageAccountsCurrentMonthCostType {
    amount: number;
    unit: string;
    month: string;
}

export interface AzureResourceDetailsType {
    display_name: string;
    id: number;
    icon_path: string;
    name: string;
    provider_name: string;
    resource_count: number;
}

export interface AzureAccount {
    id: number;
    user: number;
    user_email: string;
    name: string;
    // user_name: string;
    client_id: string;
    tenant_id: string;
    client_secret: string;
    subscription_id: string;
    uuid: string;

    azure_ad_integ: boolean;
    resource_type: string;
    // azure_ad_attributes_map: Array<{ [key: string]: string }>;
    attributes_map: AzureAccountADAttributes[];

    // monitoring?: DeviceMonitoringType;
    services_to_discover: string[];
    onboard_device: boolean;
    dependency_map: boolean;
    is_managed: boolean;
    discover_dependency: boolean;
    schedule_meta: UnityScheduleType;
    ingest_event: string;
    discover_resources: boolean;
    cost_analysis: boolean;
}

export interface AzureAccountADAttributes {
    [key: string]: string;
}

export interface AzureAccountResource {
    name: string;
    location: string;
    resource_type: string;
    tags: { [key: string]: string };
    resource_group: string;
    account_name: string;
    subscription: string;
    uuid: string;
    account: number;
    region: string;
    icon_path: string;
}

export interface AzureTopologyType {
    nodes: UnityAzureTopologyNode[];
    links: UnityAzureTopologyLink[];
}

export interface UnityAzureTopologyNode extends AzureAccountResource {
    icon: string;
    status?: string;

    //custom added from ui for topology purpose
    displayType: string;
    redirectLink: string;
    badgeColors: UnityAttributeColors;
}

export interface UnityAzureTopologyLink {
    source_uuid: string;
    target_uuid: string;
}

export interface AzureAccountCredentialsType {
    client_id: string;
    tenant_id: string;
    client_secret: string;
}

export interface AzureAccountScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}