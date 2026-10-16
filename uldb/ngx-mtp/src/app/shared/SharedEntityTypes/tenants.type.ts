export interface Tenant {
    name: string;
    phone: string;
    address1: string;
    address2: null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    domain: null;
    email: string;
    unity_modules: number[];
    uuid: string;
    region: number;
    _logo: string;
}

export interface CRMTenant {
    uuid: string;
    name: string;
    tenant_uuid: null;
    parent_account: number;
    account_uuid: string;
}

export type TenantListData = TenantListDataItem[];

export interface TenantListDataItem {
    name: string;
    phone: string;
    address1: string;
    address2: null;
    city: string;
    state: string;
    postal_code: null | string;
    country: string;
    domain: string;
    email: null | string;
    unity_modules: number[];
    uuid: string;
    region: number;
    _logo: string;
    mtp_group: number;
    id: number;
    location: string;
    lat: string;
    'long': string;
    is_tenant_active: boolean;
    is_dynamics_crm_integrated: boolean;
    is_servicenow_integrated: boolean;
}
