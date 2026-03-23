export interface DashboardMeshServicesData {
    service_type: string;
    uuid: string;
    id: number;
    name: string;
    display_type: string;
}

export interface DashboardTrafficDirectorWidgetData {
    no_backends: number;
    unhealthy: number;
    forwarding_rules_count: number;
    healthy: number;
    services_count: number;
    partially_healthy: number;
}

export interface DashboardAppMeshWidgetData {
    status_active: number;
    status_inactive: number;
    status_deleted: number;
    mesh_count: number;
    routes_count: number;
}

export interface DashboardIstioWidgetData {
    status_succeeded: number;
    status_running: number;
    status_pending: number;
    status_failed: number;
    pods_count: number;
    destination_rules_count: number;
}