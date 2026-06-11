import { RoleType } from "../mtp-administration-roles/mtp-administration-roles.type";
import { TenantType, UserType } from "../mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type";

export interface GroupType {
    uuid: string;
    id: number;
    name: string;
    description: string;
    group_type: string;
    users: UserType[];
    roles: RoleType[];
    is_active: boolean;
    tenants: TenantType[];
}