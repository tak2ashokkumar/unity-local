export interface CustomDashboardWidgetType {
    uuid?: string;
    id: number;
    name: string;
    category: string;
    tags: number[];
    devices: string[];
    datasets: WidgetDatasetWithDataTypes[];
}

export interface WidgetDatasetWithDataTypes {
    dataset_name: string;
    items: number[];
    aggregation: string;
    show_value: boolean;
    show_graph: boolean;
    data: { x_axis: string[], y_axis: number[], unit: string[] };
    values: number;
    legend: { device_name: string, name: string }[];
}