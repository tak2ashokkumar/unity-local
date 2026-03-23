export interface ApplicationMonitoringGraphCRUD {
    // graph_id: number;
    app_metrics_enabled_list: string[];
    // graph_type: string;
    // item_ids: string[];
    // can_delete: boolean;
    // can_update: boolean;
}

export interface MonitoringGraphCRUDItems {
    // item_id: number;
    // name: string;
    // key: string;
    // value_type: string;
    metric_names: string[];
}