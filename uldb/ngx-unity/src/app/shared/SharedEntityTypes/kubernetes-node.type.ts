export interface KubernetesNodeType {
    id: number;
    name: string;
    status: string;
    memory_requests: string;
    memory_limits: string;
    cpu_requests: string;
    cpu_limit: string;
    uuid: string;
    account: KubernetesAccount;
    internal_ip: string;
    external_ip: string;
    created_at: string;
    updated_at: string;
    os: string;
    os_type: string;
}

interface KubernetesAccount {
    id: number;
    cloud: Kubernetes_Private_cloud;
    name: string;
    hostname: string;
    username: string;
    service_mesh: boolean;
    uuid: string;
    created_at: string;
    updated_at: string;
    aws_account: number;
    gcp_account: null;
    azure_account: null;
    user: number;
}

interface Kubernetes_Private_cloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}