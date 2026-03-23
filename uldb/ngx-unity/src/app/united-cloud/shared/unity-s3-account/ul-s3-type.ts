export interface UlS3AccountType {
    id: number;
    customer: UlS3AccountCustomer;
    access_key: string;
    cloud: UlS3AccountCloud;
    endpoint_url: string;
    account_name: string;
    uuid: string;
}
export interface UlS3AccountCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface UlS3AccountCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}

export interface ULS3Type {
    uuid: string,
    region: string,
    creation_date: string,
    bucket_name: string,
    id: number,
    adapter: number,
    bucket_size: number
}

export interface ULS3BucketFiles {
    access_key: string;
    file_name: string;
    last_modified: string;
    file_size: number;
}

export interface ULS3UploadedFile {
    bucket_name: string;
    status: string;
    file_name: string;
    bucket: number;
}
