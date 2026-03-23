export interface ZabbixMonitoringEvents {
    id: number;
    description: string;
    severity: string;
    // date_time: string;
    device_type: string;
    ip_address: string;
    event_datetime: string;
    status: string;
    source: string;
    device_name: string;
    is_acknowledged: boolean;
    acknowledged_comment: string;
    acknowledged_by: string;
    event_metric: string;
    recovered_time: string;
    duration: string;
    acknowledged_time: string;
    uuid: string;
}