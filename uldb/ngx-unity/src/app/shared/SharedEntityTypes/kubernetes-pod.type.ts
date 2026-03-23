export interface KubernetesPodType {
    updated_at: string;
    id: number;
    created_at: string;
    name: string;
    namespace: string;
    node_name: string;
    host_ip: string;
    pod_ip: string;
    phase: string;
    start_time: string;
    uuid: string;
    account: KubernetesAccount;
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