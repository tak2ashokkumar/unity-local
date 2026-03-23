export interface User {
    url: string;
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    org: Org;
    email: string;
    has_two_factor: boolean;
    user_roles: UserRole[];
    active_rbac_roles: string[];
    is_customer_admin: boolean;
    groups: any[];
    last_login: string;
    access_types: AccessTypesItem[];
    timezone: string;
    welcome_page: boolean;
    eula_version: number;
    is_impersonated: boolean;
    is_multi_impersonated: boolean;
    subscribed_modules: string[];
    applicable_module_permissions: UnityUserApplicableModulePermission[];
    is_chatbot_enabled: boolean;
    is_insights_enabled: boolean;
    default_dashboard: string;
}

interface UserRole {
    url: string;
    id: number;
    name: string;
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
    onb_status: Onb_status;
    _logo: string;
    advanced_discovery: boolean;
    rdp_urls: string[];
    auto_ticketing_enabled: boolean;
    auto_remediation_enabled: boolean;
    msp_tenant: boolean;
    monitor_by: string;
}

interface Onb_status {
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

interface AccessTypesItem {
    name: string;
    description: string;
}



export interface UnityUserType {
    url: string;
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    org: UnityUserOrg;
    email: string;
    is_customer_admin: boolean;
    has_two_factor: boolean;
    user_roles: UnityUserRole[];
    rbac_roles: string[];
    active_rbac_roles: string[];
    applicable_permission_sets: UnityUserApplicablePermissionSet[];
    applicable_module_permissions: UnityUserApplicableModulePermission[];
    applicable_rbac_user_groups: any[];
    groups: any[];
    date_joined: string;
    last_login: string;
    access_types: UnityUserAccessType[];
    timezone: string;
    welcome_page: boolean;
    eula_version: number;
    subscribed_modules: string[];
    is_impersonated: boolean;
    is_multi_impersonated: boolean;
    default_dashboard: string;
}
export interface UnityUserRole {
    url: string;
    id: number;
    name: string;
}
export interface UnityUserApplicablePermissionSet {
    id: number;
    name: string;
    uuid: string;
}
export interface UnityUserApplicableModulePermission {
    permission_names: string[];
    module_name: string;
}
export interface UnityUserAccessType {
    name: string;
    description: string;
}
export interface UnityUserOrg {
    url: string;
    id: number;
    uuid: string;
    name: string;
    email: string;
    storage: string;
    is_management_enabled: boolean;
    vpn_status: boolean;
    onb_status: UnityUserOrgOnboardingStatus;
    _logo: string;
    advanced_discovery: boolean;
    rdp_urls: string[];
    auto_ticketing_enabled: boolean;
    auto_remediation_enabled: boolean;
    msp_tenant: boolean;
    monitor_by: string;
}
export interface UnityUserOrgOnboardingStatus {
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

