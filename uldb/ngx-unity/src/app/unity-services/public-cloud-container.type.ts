interface AzureAccount {
    id: number;
    user: number;
    user_email: string;
    account_name: string;
    user_name: string;
    subscription_id: string;
    uuid: string;
}

interface AzureStorageAccount {
    kind: string;
    primary_location: string;
    name: string;
    provisioning_state: string;
}

interface AzureResourceGroup {
    location: string;
    account_id: string;
    tags: Tags;
    name: string;
}
interface Tags {
    Environment: string;
}

interface AzureContainer {
    name: string;
}

interface AWSS3Buckets {
    Owner: AWSS3BucketsOwner;
    Buckets: AWSS3BucketsBucketsItem[];
}
interface AWSS3BucketsOwner {
    DisplayName: string;
    ID: string;
}
interface AWSS3BucketsBucketsItem {
    CreationDate: string;
    Name: string;
}
