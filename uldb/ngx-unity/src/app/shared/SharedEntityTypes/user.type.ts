import { UserPhoneCarrier } from "src/app/unity-setup/unity-setup-user-mgmt/unity-setup-user-mgmt.service";

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
  group_inclusion: string;
  user_groups: string[];
  rbac_roles: string[];
  groups: string[];
  last_login: string;
  is_staff: boolean;
  is_active: boolean;
  is_customer_admin: boolean;
  salesforce_id: string;
  password_reset_link_pending: boolean;
  carrier: UserPhoneCarrier;
  phone_number: number;
  date_joined: string;
}

export interface UserRoleType {
  id: number;
  name: string;
  url: string;
}