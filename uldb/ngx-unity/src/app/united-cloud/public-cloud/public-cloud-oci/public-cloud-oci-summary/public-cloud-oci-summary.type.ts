import { AwsAlertsCountDataType } from "src/app/shared/SharedEntityTypes/aws.type";
import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface ResourceDetailsType {
    id: number;
    icon_path: string;
    name: string;
    resource_count: number;
}

export interface OciAccountType {
    id: number;
    uuid: string;
    service_count: number;
    resource_count: number;
    alert_count: OCIAlertsCountDataType;
    current_month_cost: OCIAccountCurrentMonthCost;
    cost_growth_percentage: number;
    monitoring: DeviceMonitoringType;
    name: string;
    is_managed: boolean;
    discover_dependency: boolean;
    created_at: string;
    updated_at: string;
    user_ocid: string;
    tenancy_ocid: string;
    region: string;
    discover_services: string;
    services: any[];
    onboard_device: boolean;
    dependency_map: boolean;
    customer: number;
    cloud_provider: number;
    created_by: null;
    updated_by: null;
}

export interface OCIAccountCurrentMonthCost {
    amount: number;
    unit: string;
    month: string;
}

export interface OCIAlertsCountDataType {
    information: number;
    critical: number;
    warning: number;
    event_count: number;
}

export interface OciAccountScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}