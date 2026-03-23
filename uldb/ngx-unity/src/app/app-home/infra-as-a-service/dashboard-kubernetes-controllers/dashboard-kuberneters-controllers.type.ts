export interface DashboardKubernetesControllers {
    id: number;
    uuid: string;
    name: string;
    cloud: DashboardKubernetesControllerCloud;
}
export interface DashboardKubernetesControllerCloud {
    id: string;
    uuid: string;
    name: string;
    platform_type: string;
}

export interface DashboardKubernetesControllerWidget {
    nodes_down: number;
    nodes_up: number;
    container_count: number;
    pods_count: number;
    nodes_count: number;
    nodes_unknown: number;
    status_failed: number;
    status_succeeded: number;
    status_pending: number;
    status_unknown: number;
    status_running: number;
}

