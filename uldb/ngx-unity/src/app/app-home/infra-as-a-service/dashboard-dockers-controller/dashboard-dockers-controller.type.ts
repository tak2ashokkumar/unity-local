export interface DashboardDockersControllers {
    id: number;
    uuid: string;
    name: string;
    cloud: DashboardDockersControllerCloud;
    is_native: boolean;
}
export interface DashboardDockersControllerCloud {
    id: string;
    uuid: string;
    name: string;
    platform_type: string;
}

export interface DashboardDockerWidget {
    containers_count: number;
    status_running: number;
    status_exited: number;
    nodes_count: number;
    nodes_up: number;
    nodes_down: number;
    nodes_unknown: number;
    nodes_disconnected: number;
}

