export interface AiAgentAlertsSummary {
    total: AiAgentAlertsSummaryData;
    last_7_days: AiAgentAlertsSummaryData;
}
export interface AiAgentAlertsSummaryData {
    alert_count: number;
    event_count: number;
    supressed_count: number;
    noise_reduction: number;
    critical: number;
    warning: number;
    information: number;
}

export interface AiAgentAlerts {
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
    acknowledged_by: string;
    acknowledged_time: string;
    acknowledged_comment: string;
    source: string;
    source_account_name: string;
    recovered_time: string;
    event_timeline: AiAgentAlertEventTimeline[];
    event_metric: string;
}
export interface AiAgentAlertEventTimeline {
    uuid: string;
    event_datetime: string;
    severity: string;
    status: string;
}

export interface AiAgentSuppressedEvents {
    id: number;
    uuid: string;
    device_name: string;
    device_type: string;
    management_ip: null;
    description: string;
    event_datetime: string;
    severity: string;
    status: string;
    is_acknowledged: boolean;
    acknowledged_by: string;
    acknowledged_time: string;
    acknowledged_comment: string;
    source: string;
    recovered_time: null;
    duration: string;
    supression_rules: string[];
}

export interface AiAgentSuppressedDisableTriggerType {
    message: string;
    success: boolean;
}

export interface AiAgentSuppressedResolveType extends AiAgentSuppressedDisableTriggerType { }