interface GCPVirtualMachine {
    id: number;
    uuid: string;
    instance_id: string;
    name: string;
    status: string;
    zone: string;
    operating_system: string;
    cpu_platform: string;
    machine_type: string;
    internal_ip: string[];
    external_ip: any;
    management_ip: any;
    account: GCPAccount;
    tags: GCPVMTagsType;
}

interface GCPVMTagsType {
    [key: string]: string;
}

interface GCPAccount {
    id: number;
    uuid: string;
    name: string;
    email: string;
    project_id: string;
    service_mesh: boolean;
    created_at: string;
    updated_at: string;
    user: number;
    billing_enabled: boolean;
    dataset: string;
    billing_account: string;
    co2emission_enabled:boolean;
}