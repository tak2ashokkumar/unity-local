import { SafeUrl } from "@angular/platform-browser";

export interface TenatGroupType {
    name: string;
    uuid: string;
    id: number;
}

export interface TenantByGroupType {
    name: string;
    uuid: string;
    _logo: string;
    absolute_url: string;
    user_uuid: string;
    is_tenant_active: boolean;

    // for UI purpose
    logo: SafeUrl | null;
}

export class AddGroupDataType {
    name: string;
    uuid: string;
    id: number;
}

export class MtpTenantsByGroupViewData {
    name: string;
    uuid: string;
}

export class MtpTenantsViewData {
    name: string;
    uuid: string;
}

export interface MtpTenantGroupDataType {
    name: string;
    uuid: string;
}

export interface MtpTenantDataType {
    name: string;
    uuid: string;
}
