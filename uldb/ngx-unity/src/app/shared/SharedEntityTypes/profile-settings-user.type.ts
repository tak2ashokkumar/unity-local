interface ProfileSettingsUser {
    url: string;
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    org: ProfileSettingsOrg;
    email: string;
    is_customer_admin: boolean;
    has_two_factor: boolean;
    // user_roles: UserRole[];
    active_rbac_roles: string[];
    groups: ProfileSettingsGroup[];
    last_login: string;
    access_types: ProfileSettingsAccessTypesItem[];
    timezone: string;
    welcome_page: boolean;
    eula_version: number;
    subscribed_modules: string[];
}

interface UserRole {
    url: string;
    id: number;
    name: string;
}

interface ProfileSettingsOrg {
    url: string;
    id: number;
    name: string;
    email: string;
    storage: string;
    vpn_status: boolean;
    onb_status: ProfileSettingsOnb_status;
}

interface ProfileSettingsOnb_status {
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

interface ProfileSettingsAccessTypesItem {
    name: string;
    description: string;
}

interface ProfileSettingsGroup {
    name: string;
}