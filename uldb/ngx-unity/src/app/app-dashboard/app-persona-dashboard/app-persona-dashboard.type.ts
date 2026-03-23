import { UnityChartDetails } from "src/app/shared/unity-chart-config.service";
import { MetricesMappingViewData } from "../app-dashboard-crud/app-dashboard-crud.service";

export interface AppDashboardListType {
    uuid: string;
    name: string;
    description: string;
    type: string;
    status: string;
    refresh_interval_in_sec: null;
    created_at: string;
    updated_at: string;
    created_by: string;
    refresh: boolean;
    timeframe: string;

    // custom attribute for UI purposes
    is_default: boolean;
}

export interface AppDashboardWidgetType {
    id: number;
    created_by: string;
    last_execution: string;
    unit: string;
    data: AppDashboardWidgetDataType[];
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
    device_items: null;
    group_by_filter: string[];
    view_graph_type: string;
    dashboard: number;
    user: string;
    customer: number;

    // custom attribute for UI purposes
    chartData: UnityChartDetails;
    metricesMappingData: MetricesMappingViewData[];
    totalCount: number;
    widgetSizeClass: string;
    customLegends: boolean;
}
export interface AppDashboardWidgetDataType {
    count: number;
    name: string;
}

// interface AppDashboardWidgetDataType {
//     count?: number;
//     name?: string | string[];
//     Down?: number;
//     Unknown?: number;
//     Up?: number;
//     accounts?: number;
//     servie?: string;
//     status?: string;
//     items?: AppDashboardWidgetDataItemsType[];
//     device_name?: string;
//     type?: string;
//     data?: AppDashboardWidgetDataType[];
//     itemid?: string;
//     ns?: string;
//     value?: string;
//     clock?: string;
//     unit?: string;
//     host_name?: string;
// }
// interface AppDashboardWidgetDataItemsType {
//     itemid?: number;
//     latest_value: number | null;
//     name?: string;
//     unit: string;
//     item_id?: number;
//     item_name?: string;
// }
// interface AppDashboardWidgetDeviceDataItemsType {
//     status: string;
//     items: AppDashboardWidgetDataItemsType[];
//     name: string;
//     device_type: string;
//     uuid: string;
// }