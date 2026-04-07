import { RuleSet } from "src/app/shared/query-builder/query-builder.interfaces";

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
    notify_before_window: boolean;
    notify_after_window: boolean;
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
    additional_emails: string[];
    ends_never: boolean;
    users_and_user_groups: string[];
    daily_type: string;
    end_next: string;
    every_day_count: string;
    schedule_meta: Schedule_meta;
    every_hr_count: string;
    monthly_type: string;
    custom_month_day: string;
    every_month_count: string;
    every_custom_month_day: string;
    end_date_status: string,
    every_custom_month_weekday: string;
    schedule_start_time_hr: number;
    schedule_start_time_min: number;
    schedule_end_time_hr: number;
    schedule_end_time_min: number;
    infrastructure: MaintenanceInfrastructureType[];
    filter_rule_meta: RuleSet;
}

export interface Schedule_meta {
    window_type: string;
    end_date: string;
    end_next: number;
    run_now: boolean;
    schedule_type: string;
    end_date_status: string;
    start_date: string;
}

export interface MaintenanceInfrastructureType {
    infrastructure_level: string;
    infra_level_types: string[];
    exclude: string[];
    device_list: string[];
    triggers: string[];
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

export interface UserType {
    uuid: string;
    user_type: string;
    org: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: number;
    user_roles: RoleType[];
    user_groups: GroupType[];
    is_active: boolean;
    send_invite: boolean;
    password_reset_link_pending: boolean;
    tenants: TenantType[];
    carrier: string;
}

export interface RoleType {
    uuid: string;
    id: number;
    name: string;
    role_type: string;
    permission: string;
}

export interface GroupType {
    uuid: string;
    id: number;
    name: string;
    description: string;
    group_type: string;
    users: UserType[];
    roles: RoleType[];
    is_active: boolean;
    tenants: TenantType[];
}

//For device_list API model
export interface DeviceDataType {
    uuid: string;
    name: string;
    triggers_list: any[];
    device_type: string;
}

//For trigger_list API model
export interface TiggerDataType {
    trigger_id: number;
    name: string;
    expression: string;
    state: string;
    severity: string;
    disabled: boolean;
    mode: number;
    can_update: boolean;
    can_delete: boolean;
    device_uuid: string;
    device_name: string;
    device_type: string;
}