export interface ZabbixMonitoringGraphCRUD {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface ZabbixMonitoringGraphCRUDItems {
    item_id: number;
    name: string;
    key: string;
    value_type: string;
}