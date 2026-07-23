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
