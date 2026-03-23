import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { UnityScheduleType } from "./schedule.type";

export interface AWSAccountType {
    id: number;
    region: string[];
    user: AWSAccountUser;
    aws_user: string;
    access_key: string;
    account_name: string;
    uuid: string;
    monitoring: DeviceMonitoringType;
    discover_services: string;
    services: string[];
    onboard_device: boolean;
    name: string;
    alert_count: AwsAlertsCountDataType;
    current_month_cost: AWSAccountCurrentMonthCost;
    is_managed: boolean;
    service_count: number;
    resource_count: number;
    cost_analysis: boolean;
}

export interface AWSAccountCurrentMonthCost {
    amount: number;
    unit: string;
    month: string;
}

export interface AwsAlertsCountDataType {
    information: number;
    critical: number;
    warning: number;
    event_count: number;
}

export interface AWSIntegrationAccountType {
    region: string[];
    access_key: string;
    secret_key: string;
    uuid: string;
    monitoring: DeviceMonitoringType;
    discover_services: string;
    services: string[];
    onboard_device: boolean;
    dependency_map: boolean;
    name: string;
    cloud_provider: number;
    is_managed: boolean;
    discover_dependency: boolean;
    schedule_meta: UnityScheduleType;
    ingest_event: string;
    discover_resources: boolean;
    cost_analysis: boolean;
}

export interface AWSAccountUser {
    url: string;
    id: number;
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    access_types: AWSAccountUserAccessType[];
    last_login: string;
}

export interface AWSAccountUserAccessType {
    url: string;
    id: number;
    name: string;
    description: string;
}

export interface AwsResourceType {
    uuid: string;
    name: string;
    icon_path: string;
    account: AwsResourceAccountType;
    region: string;
    resource_type: string;
    service: string;
}

export interface AwsResourceAccountType {
    id: number;
    aws_user: string;
    access_key: string;
    account_name: string;
    uuid: string;
    monitoring: DeviceMonitoringType;
    discover_services: string;
    services: string[];
    onboard_device: boolean;
    dependency_map: boolean;
}

export interface AwsResourceDetailsType {
    display_name: string;
    id: number;
    icon_path: string;
    name: string;
    resource_count: number;
    service: string;
}

export interface AwsAccountScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}