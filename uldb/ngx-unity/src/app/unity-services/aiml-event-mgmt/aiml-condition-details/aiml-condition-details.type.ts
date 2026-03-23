export interface AIMLConditionDetails {
    id: number;
    uuid: string;
    rule_name: string;
    alert_count: number;
    event_count: number;
    condition_datetime: string;
    first_alert_datetime: string;
    last_alert_datetime: string;
    condition_source: string[];
    condition_duration: string;
    condition_status: string;
    condition_severity: string;
    correlator: string;
    correlation_window: string;
    hosts: string[];
    recovered_datetime: string;
    is_acknowledged: boolean;
    alerts: AIMLConditionDetailAlerts[];
}
export interface AIMLConditionDetailAlerts {
    id: number;
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
    recovered_time: string;
    event_timeline: AIMLConditionDetailAlertEventTimeline[];
}
export interface AIMLConditionDetailAlertEventTimeline {
    uuid: string;
    event_datetime: string;
    severity: string;
    status: string;
}