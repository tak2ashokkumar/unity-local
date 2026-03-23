export interface DashboardOCICloud {
    id: number;
    uuid: string;
    name: string;
    user_ocid: string;
    // project_id: string;
    created_at: string;
    updated_at: string;
    user: number;
}

export interface OCIWidget {
    buckets_count: number;
    database_count: number;
    http_monitor_count: number;
    instances_count: number;
    instances_up_count: number;
    instances_down_count: number;
}