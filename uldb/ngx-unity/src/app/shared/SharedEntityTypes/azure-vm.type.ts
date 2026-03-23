interface AzureVm {
    account_id: number;
    resource_group: string;
    provisioning_state: string;
    plan: null;
    account_name: string;
    availability_set: null | string;
    name: string;
    network_profile: NetworkProfileItem[];
    location: string;
    power_state: string;
    license_type: null;
    type: string;
}
interface NetworkProfileItem {
    id: string;
    primary: null;
}