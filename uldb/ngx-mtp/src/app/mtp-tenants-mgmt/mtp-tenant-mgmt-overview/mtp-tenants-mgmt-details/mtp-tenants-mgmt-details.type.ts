export interface TenantUserListDataType {
    url: string;
    id: number;
    org: TenantUserListOrgnizationDataType;
    is_active: boolean;
    is_staff: boolean;
    is_customer_admin: boolean;
    access_types: TenantUserListAccessTypesDataType[];
    ticket_user: null;
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    salesforce_id: null;
    user_roles: TenantUserListUserRolesDataType[];
    ticket_group: string[];
    timezone: string;
    full_name: string;
    user_type: string;
}

export interface TenantUserListOrgnizationDataType {
    url: string;
    id: string;
    name: string;
    storage: string;
    uuid: string;
}

export interface TenantUserListAccessTypesDataType {
    url: string;
    id: string;
    name: string;
    description: string;
}

export interface TenantUserListUserRolesDataType {
    url: string;
    id: string;
    name: string;
    description: string;
}