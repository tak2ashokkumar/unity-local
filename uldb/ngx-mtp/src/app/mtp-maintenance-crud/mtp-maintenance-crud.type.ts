export interface MaintenanceType {
    tenant: number;
    name: string;
    description: string;
    infrastructure_type: string;
    has_alerts: boolean;
    has_notification: boolean;
    has_auto_ticketing: boolean;
    correlate_all_alerts: boolean;
    send_notification: boolean;
    send_before_window: boolean;
    send_after_window: boolean;
    start_date: string;
    end_date: string;
    timezone: string;
    schedule_type: string;
    recurrence_start_time_hr: number;
    recurrence_start_time_min: number;
    recurrence_end_time_hr: number;
    recurrence_end_time_min: number;
    recurrence_pattern: string;
    weekday: string[];
    additional_email: string[];
    ends_never: boolean;
    user_and_user_group: string[];
    daily_type: string;
    every_day_count: string;
    every_hr_count: string;
    monthly_type: string;
    custom_month_day: string;
    every_month_count: string;
    every_custom_month_day: string;
    every_custom_month_weekday: string;
    schedule_start_time_hr: number;
    schedule_start_time_min: number;
    schedule_end_time_hr: number;
    schedule_end_time_min: number;
    infrastructure: MaintenanceInfrastructureType[];
}

export interface MaintenanceInfrastructureType {
    infrastructure_level: string;
    infra_level_types: string[];
    exclude: string[];
}

export interface TenantType {
    name: string;
    id: number;
    uuid: string;
}

export interface TenantUserGroupType {
    name: string;
    uuid: string;
    user_uuid: number;
}

export interface DatacenterFast {
    id: number;
    cabinets: DatacenterCabinetsFast[];
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    'long': string;
    status: DatacenterStatusFast[];
    customer: number;
}

export interface DatacenterCabinetsFast {
    url: string;
    id: number;
    uuid: string;
    name: string;
}

export interface DatacenterStatusFast {
    status: string;
    category: string;
}

export interface PrivateCloudFast {
    id: number;
    uuid: string;
    name: string;
}