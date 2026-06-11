
export interface UnitySetupUser {
  url: string;
  id: number;
  uuid: string;
  org: number;
  first_name: string;
  last_name: string;
  email: string;
  has_two_factor: boolean;
  user_roles: UserRoleType[];
  groups: string[];
  last_login: string;
  is_staff: boolean;
  is_active: boolean;
  is_customer_admin: boolean;
  salesforce_id: string;
  password_reset_link_pending: boolean;
  phone_number: number;
}

export interface UserRoleType {
  id: number;
  name: string;
  url: string;
}


export interface UserProfileType {
  url: string;
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  org: UserProfileOrgType;
  email: string;
  is_customer_admin: boolean;
  has_two_factor: boolean;
  user_roles: UserProfileUserRolesType[];
  groups: any[];
  last_login: string;
  access_types: UserProfileAccessTypes[];
  timezone: string;
  welcome_page: boolean;
  eula_version: number;
  subscribed_modules: string[];
  is_impersonated: boolean;
  phone_number: string;
  is_active: boolean;
}
export interface UserProfileOrgType {
  url: string;
  id: number;
  uuid: string;
  name: string;
  email: string;
  storage: string;
  is_management_enabled: boolean;
  vpn_status: boolean;
  onb_status: UserProfileOnbStatusType;
  _logo: string;
  advanced_discovery: boolean;
  rdp_urls: string[];
  auto_ticketing_enabled: boolean;
  auto_remediation_enabled: boolean;
}
export interface UserProfileOnbStatusType {
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
export interface UserProfileUserRolesType {
  url: string;
  id: number;
  name: string;
}
export interface UserProfileAccessTypes {
  name: string;
  description: string;
}


export interface MTPUserGroupType {
  uuid: string;
  id: number;
  name: string;
  description: string;
  group_type: string;
  users: MTPUserType[];
  roles: MTPUserRoleType[];
  is_active: boolean;
  tenants: MTPUserTenantType[];
}

export interface MTPUserRoleType {
  uuid: string;
  id: number;
  name: string;
  role_type: string;
  permission: string;
}

export interface MTPUserType {
  uuid: string;
  user_type: string;
  org: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
  user_roles: MTPUserRoleType[];
  user_groups: MTPUserGroupType[];
  is_active: boolean;
  send_invite: boolean;
  password_reset_link_pending: boolean;
  tenants: MTPUserTenantType[];
  carrier: string;
}

export interface MTPUserTenantType {
  name: string;
  id: number;
}