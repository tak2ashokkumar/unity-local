import { GroupType } from "../../mtp-administration-group/mtp-administration-group.type";
import { RoleType } from "../../mtp-administration-roles/mtp-administration-roles.type";

export interface UserType {
    uuid: string;
    user_type: string;
    org: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: number;
    user_roles: RoleType[];
    user_groups: GroupType[];
    is_active: boolean;
    send_invite: boolean;
    password_reset_link_pending: boolean;
    tenants: TenantType[];
    carrier: string;
}

export interface TenantType {
    name: string;
    id: number;
}

export interface CarrierType {
    carrier_name: string;
    id: number;
}