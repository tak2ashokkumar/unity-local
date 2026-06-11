export interface User {
    url: string;
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    org: Org;
    email: string;
    is_customer_admin: boolean;
    has_two_factor: boolean;
    user_roles: UserRole[];
    groups: any[];
    last_login: string;
    timezone: string;
    welcome_page: boolean;
    eula_version: number;
    subscribed_modules: string[];
    is_impersonated: boolean;
    phone_number: string;
    is_active: boolean;
    default_crm_instance: string;
    permissions: UserRolePermissions[];
}
interface Org {
    url: string;
    id: number;
    uuid: string;
    name: string;
    email: string;
    storage: string;
    is_management_enabled: boolean;
    vpn_status: boolean;
    onb_status: OnbStatus;
    _logo: string;
    advanced_discovery: boolean;
    rdp_urls: string[];
    auto_ticketing_enabled: boolean;
    auto_remediation_enabled: boolean;
    msp_tenant: boolean;
}
interface OnbStatus {
    manage_error: boolean;
    monitoring_start: boolean;
    monitoring_end: boolean;
    excel_start: boolean;
    manage_start: boolean;
    excel_end: boolean;
    monitoring_error: boolean;
    vpn_req: boolean;
    manage_end: boolean;
}
interface UserRole {
    url: string;
    id: number;
    name: string;
}
export interface UserRolePermissions {
    id: number;
    permission: string;
    can_read: boolean;
    can_write: boolean;
    role: number;
}
