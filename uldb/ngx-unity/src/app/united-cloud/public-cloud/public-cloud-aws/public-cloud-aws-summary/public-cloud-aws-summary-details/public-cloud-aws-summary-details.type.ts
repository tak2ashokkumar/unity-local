import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface AwsResourceDetail {
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
    service : string;
    instance_state : string;
    availability_zone : string;
    public_ip: string;
    instance_type : string;
    monitoring: DeviceMonitoringType;
}

export interface ResourceDetailsType {
    service: string;
    id: number;
    icon_path: string;
    name: string;
    resource_count: number;
}

export interface AwsAccountsType {
    id: number;
    user: number;
    user_email: string;
    name: string;
    user_name: string;
    subscription_id: string;
    uuid: string;
    monitoring: DeviceMonitoringType;
    service_count: number;
    resource_count: number;
    is_managed: boolean;
    alert_count: AwsAlertsCountDataType;
    current_month_cost: AWSAccountCurrentMonthCost;
}

export interface AwsAlertsCountDataType {
    information: number;
    critical: number;
    warning: number;
    event_count: number;
}

export interface AWSAccountCurrentMonthCost {
    amount: number;
    unit: string;
    month: string;
}

export interface AwsLocationType {
    value: string;
    key: string;
}

