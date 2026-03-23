export interface PermissionSetType {
    id: number;
    uuid: string;
    name: string;
    description: string;
    permissions: PermissionsType[];
    rbac_permissions: RbacPermissionsType[];
    applicable_roles: ApplicableRolesType[];
    applicable_user_groups: ApplicableUserGroupsType[];
    applicable_users: ApplicableUsersType[];
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    created_by: number;
    created_by_name: string;
    entity_groups: EntityGroupsFastType[];
}

export interface PermissionsType {
    module__name: string;
    id: number;
    module: number;
    name: string;
}

export interface RbacPermissionsType {
    permission_names: string[];
    module_name: string;
}

export interface ApplicableRolesType {
    id: number;
    name: string;
    uuid: string;
}

export interface ApplicableUserGroupsType extends ApplicableRolesType { }

export interface ApplicableUsersType {
    email: string;
    id: number;
    uuid: string;
}

export interface EntityGroupsFastType {
    id: number;
    uuid: string;
    name: string;
    is_active: boolean;
}

export interface RoleType {
    id: number;
    uuid: string;
    name: string;
    description: string;
    permissions: string[];
    active_permissions: string[];
    applicable_permissions: RoleApplicablePermissions[];
    user_groups: string[];
    users: string[];
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    created_by: number;
    created_by_name: string;
}

export interface RoleApplicablePermissions {
    id: number;
    name: string;
    uuid: string;
}


export interface UserGroupType {
    id: number;
    uuid: string;
    name: string;
    description: string;
    rbac_users: string[];
    rbac_roles: string[];
    applicable_permission_sets: UserGroupApplicablePermissionSetsType[];
    applicable_rbac_roles: UserGroupApplicableRbacRoles[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: number;
    created_by_name: string;
}

export interface UserGroupApplicablePermissionSetsType {
    id: number;
    name: string;
    uuid: string;
}

export interface UserGroupApplicableRbacRoles extends UserGroupApplicablePermissionSetsType { }