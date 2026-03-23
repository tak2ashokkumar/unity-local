export interface ResourceDetailsType {
    display_name: string;
    id: number;
    icon_path: string;
    name: string;
    resource_count: number;
    // total_resource_type_count: number;
    // resource_counts: ResourceCountAndNames[];
}
export interface ResourceCountAndNames {
    count: number;
    name: string;
}

export interface AzureCustomerSummary {
    total_account_count: number;
    current_cost: Current_cost;
    total_resource_count: number;
    alters: Alters;
}
export interface Current_cost {
    amount: number;
    unit: string;
    month: string;
}
export interface Alters {
    information: number;
    critical: number;
    warning: number;
    event_count: number;
}

export interface AccountsDetailList {
    total_resource_count: number;
    total_services_count: number;
    account_name: string;
    current_month_cost: Current;
    total_alert_count: Total_alert_count;
    id: number;
}
export interface Current {
    amount: number;
    unit: string;
    month: string;
}
export interface Total_alert_count {
    information: number;
    critical: number;
    warning: number;
    event_count: number;
}

export interface AzureAccountScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}
