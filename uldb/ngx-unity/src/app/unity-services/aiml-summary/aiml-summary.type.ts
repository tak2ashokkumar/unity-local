export interface AIMLConditionsSummary {
    total: AIMLConditionsSummaryData;
    last_7_days: AIMLConditionsSummaryData;
    last_14_days: AIMLConditionsSummaryData;
}

export interface AIMLConditionsSummaryData {
    condition_count: number;
    alert_count: number;
    event_count: number;
    critical: number;
    warning: number;
    information: number;
    noise_reduction: number;
    correlation_reduction: number;
}


export interface AIMLSummaryAlertCountByDeviceType {
    device_type: string;
    alert_count: number;
}

export interface AIMLSummaryNoisyAlert {
    event_count: number;
    first_event_datetime: string;
    last_event_datetime: string;
    created_datetime: string;
    device_name: string;
    device_type: string;
    management_ip: null;
    description: string;
    severity: string;
    status: string;
    is_acknowledged: boolean;
    source: string;
    recovered_time: string;
}

export interface AIMLSummaryNoisyEvent {
    device_name: string;
    device_type: string;
    event_count: number;
    last_reported: string;
    severity: string;
    source: string;
    description: string;
}

export interface AIMLSummaryNoisyEventHost {
    device: string;
    event_count: number;
    device_type: string;
}

export interface AIMLSummaryEventCount {
    device_type: string;
    event_count: number;
}