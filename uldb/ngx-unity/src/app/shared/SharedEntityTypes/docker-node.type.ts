export interface DockerNodeType {
    id: number;
    node_id: string;
    short_id: string;
    hostname: string;
    status: string;
    ip_address: string;
    cpus: string;
    memory: string;
    uuid: string;
    account: DockerAccount;
    created_at: string;
    updated_at: string;
    os: string;
    os_type: string;
}

interface DockerAccount {
    id: number;
    cloud: Docker_Private_cloud;
    name: string;
    hostname: string;
    uuid: string;
    created_at: string;
    updated_at: string;
    aws_account: number;
    gcp_account: null;
    azure_account: null;
    user: number;
}

interface Docker_Private_cloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}