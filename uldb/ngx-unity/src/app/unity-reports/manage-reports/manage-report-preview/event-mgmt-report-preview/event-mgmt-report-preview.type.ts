export interface ManageReportEventsDataType {
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
    source: string;
    recovered_time: string;
    duration: string;
}

export interface ManageReportAlertsDataType {
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
}

export interface ManageReportSuppressionDataType {
    name: string;
    description: string;
    uuid: string;
    active: boolean;
    user: string;
    updated_at: string;
    created_at: string;
    filter_rule_meta: ManageReportSuppressionConditionDataType[];
    alert_count: number;
    status: string;
}

export interface ManageReportSuppressionConditionDataType {
    attribute?: string;
    operator?: string;
    value?: string;
    exp?: string;
    expression?: string;
}

export interface ManageReportCorelationDataType {
    uuid: string;
    name: string;
    condition_count: number;
    created_datetime: string;
    updated_datetime: string;
    filter_rule_meta: ManageReportCorelationDataType[];
    correlator: string;
    description: string;
    user: string;
    is_active: boolean;
}

export interface ManageReportCorelationDataType {
    attribute?: string;
    operator?: string;
    value?: string;
    expression?: string;
}