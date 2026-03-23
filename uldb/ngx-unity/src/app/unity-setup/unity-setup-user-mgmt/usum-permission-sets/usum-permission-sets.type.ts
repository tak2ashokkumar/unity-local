export interface ModulesAndPermissionsType {
  module_name: string;
  permission_names: string[];
}

export interface PermissionSetFormDataType {
  name: string;
  description: string;
  rbac_permissions: RbacPermissionsFormDataType[];
}

export interface RbacPermissionsFormDataType {
  module_name: string;
  permission_names: boolean[] | string[] | Array<string | boolean>;
}