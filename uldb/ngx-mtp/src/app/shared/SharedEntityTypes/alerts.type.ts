export interface RecentAlerts {
    uuid: string;
    event_count: number;
    first_event_datetime: string;
    last_event_datetime: string;
    alert_datetime: string;
    device_name: string;
    device_type: string;
    management_ip: string;
    description: string;
    severity: string;
    status: string;
    is_acknowledged: boolean;
    source: string;
    recovered_time: null;
    event_timeline: RecentAlertsEventTimeline[];
    tenant: string;
}
interface RecentAlertsEventTimeline {
    uuid: string;
    event_datetime: string;
    received_datetime: string;
    severity: string;
    status: string;
    device_name: string;
    device_type: string;
    device_uuid: string;
    recovered_datetime: null;
}