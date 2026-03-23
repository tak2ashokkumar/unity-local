export interface CustomDashboardWidget {
    uuid: string;
    widget_type: string;
    name: string;
    group_by: string;
    cloud: string;
    status: boolean;
    platform_type: string[];
    graph_type: string;
    period: string;
    period_hour: number;
    period_min: number;
    metrics_network_data: string;
    group_by_filter: string[];
    device_type: string;
    filter_by: string;
    top_count: string;
    devices: string[];
    network_group_by: string;
    view_by: string;
    device_items: any[];
}

export interface WidgetCloudList {
    private_cloud_data: string[];
    public_cloud_data: string[];
}

export interface WidgetTab {
    icon: string;
    name: string;
    value: string;
}

export enum PreviewWidgetTypeMapping {
    CHART = 'chart',
    HOST_AVAILABILITY = 'hostAvailabilityChart',
    TABLE = 'table',
}

export interface CustomDashboardDevices {
    name?: string;
    uuid?: string;
    server?: BaremetalDevices
    isSelected?: boolean;
}

export interface BaremetalDevices {
    name: string;
    uuid: string;
}