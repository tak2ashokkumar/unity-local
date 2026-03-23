export interface RoleFormDataType {
    name: string;
    // is_active: boolean;
    description: string;
    user_groups: string[];
    users: string[];
    permissions: string[];
}