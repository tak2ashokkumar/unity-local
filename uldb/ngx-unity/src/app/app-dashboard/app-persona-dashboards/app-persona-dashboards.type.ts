export interface PersonaDashboard {
    uuid: string;
    name: string;
    description: string;
    type: string;
    status: string;
    refresh_interval_in_sec: number | null;
    created_at: string;
    updated_at: string;
    created_by: string;
    refresh: boolean;
    timeframe: string;
}

export interface PersonaDashboardWidget {
    id: number;
    created_by: string;
    last_execution: string;
    unit: string;
    data: PersonaDashboardWidgetData[];
    uuid: string;
    name: string;
    widget_type: string;
    cloud: string;
    platform_type: string;
    group_by: string;
    status: string;
    created_at: string;
    position: number;
    filter_by: string;
    graph_type: string;
    period: string;
    period_hour: null;
    period_min: null;
    view_by: string;
    metrics_network_data: null;
    device_type: string;
    network_group_by: string;
    devices: string[];
    top_count: null;
    device_items: PersonaDashboardDeviceMetricMapping[] | null;
    group_by_filter: string[];
    view_graph_type: string;
    dashboard: number;
    user: string;
    customer: number;
}

export interface PersonaDashboardWidgetData {
    count: number;
    name: string;
    Up?: number;
    Down?: number;
    Unknown?: number;
    device_name?: string;
    status?: string;
    items?: PersonaDashboardWidgetMetricItem[];
    series?: PersonaDashboardWidgetSeriesItem[];
}

export interface PersonaDashboardWidgetMetricItem {
    item_name?: string;
    item_id?: number;
    name?: string;
    latest_value: number | null;
    unit: string;
}

export interface PersonaDashboardWidgetSeriesItem {
    timestamp: number;
    avg?: number;
    min?: number;
    max?: number;
}

export interface PersonaDashboardDeviceMetricMapping {
    name: string;
    device_type: string;
    uuid: string;
    status: string;
    items: PersonaDashboardWidgetMetricItem[];
}

export interface DashboardDevice {
    name?: string;
    uuid?: string;
    server?: BaremetalDevices;
    status?: string;
}

export interface BaremetalDevices {
    name: string;
    uuid: string;
}
