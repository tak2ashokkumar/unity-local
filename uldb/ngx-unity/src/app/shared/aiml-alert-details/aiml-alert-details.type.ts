export interface AIMLAlertDetails {
    id: number;
    uuid: string;
    event_count: number;
    first_event_datetime: string;
    last_event_datetime: string;
    alert_datetime: string;
    device_name: string;
    device_type: string;
    management_ip: null;
    description: string;
    severity: string;
    status: string;
    is_acknowledged: boolean;
    acknowledged_by: string;
    acknowledged_time: string;
    acknowledged_comment: string;
    source: string;
    source_account_name: string;
    recovered_time: string;
    event_timeline: AIMLAlertEventTimeline[];
    category: string;
    datacenter: string;
    private_cloud: string;
    cabinet: string;
    tags: string[];
    event_metric: string;
    cloud_name: string;
    cloud_type: string;
    mtta: string;
    mttr: string;
    custom_data: {} | null;
}

export interface AIMLAlertEventTimeline {
    uuid: string;
    event_datetime: string;
    severity: string;
    status: string;
}