interface AzureLocationData {
    id: number;
    uuid: string;
    name: string;
    short_name: string;
    created_at: string;
    updated_at: string;
}

interface AzureResourceGroupAvailabilitySets {
    id: string;
    tags: AzureTagsData;
    name: string;
    location: string;
}

interface AzureTagsData {
    [key: string]: string;
}

interface AzureResourceGroupNIC {
    name: string;
    provisioning_state: string;
    location: string;
    tags: AzureTagsData;
    virtual_machine: boolean;
}

interface AzureResourceGroupStorageAccounts {
    kind: string;
    primary_location: string;
    name: string;
    provisioning_state: string;
}

interface AzureVMOS {
    id: string;
    publisher: string;
    offer: string;
    sku: string;
    version: string;
}