export interface MtpAdministrationSlaGroupCrudType {
    uuid: string;
    name: string;
    description: string;
    tenants: string[];
    tenant_names: string[];
}

export interface MtpAdministrationSlaGroupType {
    id: number;
    uuid: string;
    sla_id: string;
    name: string;
    tenant_names: string[];
    tenants: string[];
    description: string;
    created_by_in_crm: string;
    updated_by_in_crm: string;
    created_date_in_crm: string;
    last_updated_time_in_crm: string;
}

export interface MtpAdministrationSlaCRMInstance {
    id: number;
    name: string;
    uuid: string;
    is_default: boolean;
}

export interface MtpAdministrationSlaCRMTenants {
    uuid: string;
    name: string;
    parent_account: number;
    account_uuid: string;
}
