export interface AIMLEventDetails {
    id: number;
    uuid: string;
    device_name: string;
    device_type: string;
    ip_address: null;
    description: string;
    event_datetime: string;
    severity: string;
    status: string;
    is_acknowledged: boolean;
    acknowledged_by: string;
    acknowledged_time: string;
    acknowledged_comment: string;
    source: string;
    source_account: string;
    recovered_time: string;
    duration: string;
    category: string;
    datacenter: string;
    private_cloud: string;
    cabinet: string;
    tags: string[];
    cloud_type: string;
    cloud_name: string;
    event_metric: string;
    custom_data: {} | null;
}