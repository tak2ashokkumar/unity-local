export interface AIMLAlertsSummary {
    total: AIMLAlertsSummaryData;
    last_7_days: AIMLAlertsSummaryData;
}
export interface AIMLAlertsSummaryData {
    alert_count: number;
    event_count: number;
    supressed_count: number;
    noise_reduction: number;
    critical: number;
    warning: number;
    information: number;
}

export interface AIMLAlerts {
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
    event_timeline: AIMLAlertEventTimeline[];
    event_metric: string;
}
export interface AIMLAlertEventTimeline {
    uuid: string;
    event_datetime: string;
    severity: string;
    status: string;
}

export interface AIMLSuppressedEvents {
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

export interface AIMLSuppressedDisableTriggerType {
    message: string;
    success: boolean;
}

export interface AIMLSuppressedResolveType extends AIMLSuppressedDisableTriggerType { }