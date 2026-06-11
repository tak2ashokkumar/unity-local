export interface MtpAdministrationProfileType {
    // url: string;
    // id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    // org: orgType;
    email: string;
    is_active: boolean;
    // is_customer_admin: boolean;
    // has_two_factor: boolean;
    // user_roles: userRolesItem[];
    groups: groupTypes[];
    // last_login: string;
    // access_types: accessTypesItem[];
    // timezone: string;
    // welcome_page: boolean;
    // eula_version: number;
    // subscribed_modules: string[];
    // is_impersonated: boolean;
    phone_number: number;
}

interface groupTypes {
    url: string;
    id: number;
    name: string;
}
interface orgType {
    url: string;
    id: number;
    uuid: string;
    name: string;
    email: string;
    storage: string;
    is_management_enabled: boolean;
    vpn_status: boolean;
    onb_status: onbStatus;
    _logo: string;
    advanced_discovery: boolean;
    rdp_urls: string[];
    auto_ticketing_enabled: boolean;
    auto_remediation_enabled: boolean;
}
interface onbStatus {
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
interface userRolesItem {
    url: string;
    id: number;
    name: string;
}
interface accessTypesItem {
    name: string;
    description: string;
}

//Activity log

export interface UserProfileActivityLog {
    id: number;
    actor: Actor;
    hijacker: null;
    action: string;
    content_type: Content_type;
    object_pk: string;
    object_id: number;
    object_repr: string;
    changes: string;
    remote_addr: string;
    timestamp: string;
    additional_data: null;
    organizations: number[];
}
interface Actor {
    url: string;
    id: number;
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    access_types: string[];
    user_roles: string[];
    last_login: string;
}
interface Content_type {
    app_label: string;
    model: string;
    readable_model_name: string;
    id: number;
}


