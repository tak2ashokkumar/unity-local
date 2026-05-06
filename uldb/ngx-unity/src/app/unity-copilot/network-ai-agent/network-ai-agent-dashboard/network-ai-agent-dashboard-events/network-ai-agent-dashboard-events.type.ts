export interface AIMLEvents {
    id: number;
    uuid: string;
    device_name: string;
    device_type: string;
    ip_address: string;
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
    deduped_count: number;
    event_metric: string;
}

export interface AIMLEventsSummary {
    total: AIMLEventsSummaryData;
    last_7_days: AIMLEventsSummaryData;
}

export interface AIMLEventsSummaryData {
    event_count: number;
    critical: number;
    warning: number;
    information: number;
}

export interface AIMLEventDisableTriggerType {
    message: string;
    success: boolean;
}

export interface AIMLEventResolveType extends AIMLEventDisableTriggerType { }