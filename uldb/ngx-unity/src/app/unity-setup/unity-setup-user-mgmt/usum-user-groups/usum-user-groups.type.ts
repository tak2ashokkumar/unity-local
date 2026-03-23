export interface UserGroupFormDataType {
    name: string;
    description: string;
    is_active: boolean;
    rbac_roles: string[];
    rbac_users: string[];
}