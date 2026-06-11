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