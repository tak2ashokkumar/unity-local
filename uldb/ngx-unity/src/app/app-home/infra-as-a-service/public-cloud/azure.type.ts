interface AzureCloud {
    id: number;
    user: number;
    account_name: string;
    uuid: string;
    user_email: string;
    user_name: string;
    subscription_id: string;
}

interface AzureWidget {
    load_balancer: number;
    vm_instance: number;
    nic: number;
    vm_active_instance: number;
    public_ips: number;
    vm_inactive_instance: number;
    storage_account: number;
}