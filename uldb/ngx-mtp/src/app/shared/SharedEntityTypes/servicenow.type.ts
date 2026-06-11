export interface ServicenowAccount {
    id: number;
    name: string;
    uuid: string;
    instance_url: string;
    username: string;
    // is_default: boolean;
    is_cmdb: boolean;
    is_itsm: boolean;
    user: number;
    tenants: ServicenowTenant[];
}

export interface ServicenowTenant {
    id: number;
    name: string;
}