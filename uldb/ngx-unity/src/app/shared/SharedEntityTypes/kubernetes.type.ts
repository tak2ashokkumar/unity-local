// Consolidated Kubernetes resource types (merged from the former kubernetes-*.type.ts files).

// Shared cluster/cloud reference carried by the newer Kubernetes resource list items.
export interface KubernetesResourceCloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}

export interface KubernetesResourceAccount {
    id: number;
    name: string;
    uuid: string;
    cloud: KubernetesResourceCloud;
}

// Account/cloud reference carried by the Node and Pod list items.
interface Kubernetes_Private_cloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
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

export interface KubernetesContainerType {
    updated_at: string;
    id: number;
    created_at: string;
    name: string;
    uuid: string;
    account: number;
    image: string;
    status: string;
    cpu_request: string;
    memory_request: string;
    pod: number;
}

export interface KubernetesNamespaceType {
    id: number;
    uuid: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesCronjobType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    schedule: string;
    suspend: boolean;
    active: number;
    last_schedule_time: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesResourcequotaType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesStorageclassType {
    id: number;
    uuid: string;
    name: string;
    provisioner: string;
    reclaim_policy: string;
    volume_binding_mode: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesServiceType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    service_type: string;
    cluster_ip: string;
    external_ips: string[];
    ports: any[];
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesPersistentVolumeType {
    id: number;
    uuid: string;
    name: string;
    capacity: string;
    access_modes: string;
    reclaim_policy: string;
    status: string;
    claim_namespace: string;
    claim_name: string;
    storage_class: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesPersistentVolumeClaimType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    status: string;
    volume_name: string;
    capacity: string;
    storage_class: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesDeploymentType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    desired_replicas: number;
    ready_replicas: number;
    available_replicas: number;
    updated_replicas: number;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesEventType {
    id: number;
    uuid: string;
    name: string;
    event_type: string;
    reason: string;
    message: string;
    involved_object_name: string;
    involved_object_kind: string;
    namespace: string;
    count: number;
    first_time: string;
    last_time: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesReplicasetType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    desired_replicas: number;
    ready_replicas: number;
    available_replicas: number;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesDaemonsetType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    desired: number;
    current: number;
    ready: number;
    available: number;
    misscheduled: number;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesStatefulsetType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    desired_replicas: number;
    current_replicas: number;
    ready_replicas: number;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesControlplaneComponentType {
    id: number;
    uuid: string;
    component: string;
    pod_name: string;
    node_name: string;
    namespace: string;
    phase: string;
    restart_count: number;
    ready: boolean;
    healthy: boolean;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesJobType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    active: number;
    succeeded: number;
    failed: number;
    completions: number;
    parallelism: number;
    backoff_limit: number;
    start_time: string;
    completion_time: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}

export interface KubernetesHpaType {
    id: number;
    uuid: string;
    name: string;
    namespace: string;
    min_replicas: number;
    max_replicas: number;
    current_replicas: number;
    desired_replicas: number;
    target_cpu_utilization: number;
    current_cpu_utilization: number;
    scale_target_name: string;
    scale_target_kind: string;
    last_scale_time: string;
    created_at: string;
    updated_at: string;
    account: KubernetesResourceAccount;
}
