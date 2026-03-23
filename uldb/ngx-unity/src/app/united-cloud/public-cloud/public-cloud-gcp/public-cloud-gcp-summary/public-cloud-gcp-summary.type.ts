import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface GcpAccountType {
    id: number;
    uuid: string;
    name: string;
    is_managed: boolean;
    service_count: number;
    resource_count: number;
    category_count: number;
    alert_count: GcpAlertCount;
    current_month_cost: CurrentMonthCost;
    cost_growth_percentage: number;
    monitoring: DeviceMonitoringType;
    // access_key: string;
    project_id: string;
    billing_enabled: boolean;
    dataset: string;
    billing_account: string;
    co2emission_enabled: boolean;
    cost_analysis: boolean;
}
interface GcpAlertCount {
    information: number;
    critical: number;
    warning: number;
    event_count: number;
}
interface CurrentMonthCost {
    amount: number;
    estimate: number;
    unit: string;
    month: string;
}

export interface GcpResourceDetailsType {
    id: number;
    name: string;
    icon_path: string;
    category: string;
    resource_count: number;
    displayname?: string;
    subcategories?: SubcategoriesItem[];
}

export interface SubcategoriesItem {
    service: string;
    resource_count: number;
    icon_path: string;
    id: number;
}


export interface GcpScheduleHistoryType {
    status: string;
    started_at: string;
    completed_at: string;
    duration: string;
    executed_by: string;
}