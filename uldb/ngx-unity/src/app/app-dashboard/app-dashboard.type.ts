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
