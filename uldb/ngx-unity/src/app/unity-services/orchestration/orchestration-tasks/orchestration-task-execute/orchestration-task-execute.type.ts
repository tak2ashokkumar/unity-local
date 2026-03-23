export interface cloudType {
    username: string;
    password: string;
    credentials: string[];
    cloud: CloudNameType;
}

export interface CloudNameType {
    id: number;
    vms: number;
    cloud_type: string;
    uuid: string;
    account_name: string;
}
