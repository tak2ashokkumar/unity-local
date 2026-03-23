interface GCPAccount {
    id: number;
    uuid: string;
    name: string;
    email: string;
    project_id: string;
    created_at: string;
    updated_at: string;
    user: number;
}

interface GCPBillingInfo {
    billing_enabled: boolean,
    billing_account_name: string,
    project_id: string,
    name: string
}