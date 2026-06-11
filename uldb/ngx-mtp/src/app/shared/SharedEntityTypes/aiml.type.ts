export interface MTPAIMLSummary {
    total: MTPAIMLSummaryData;
    last_7_days?: MTPAIMLSummaryData;
    last_14_days?: MTPAIMLSummaryData;
}
export interface MTPAIMLSummaryData {
    condition_count: number;
    information: number;
    critical: number;
    event_count: number;
    correlation_reduction: number;
    noise_reduction: number;
    warning: number;
    alert_count: number;
}

//events
export interface MTPAlertCountByDeviceType {
    device_type: string;
    alert_count: number;
}

export interface MTPEventCountByDeviceType {
    device_type: string;
    event_count: number;
}

export interface MTPEventCountByTarget {
    device_type: string;
    event_count: number;
}

export interface MTPEvents {
    id: number;
    uuid: string;
    device_name: string;
    device_type: string;
    management_ip: string;
    description: string;
    event_datetime: string;
    severity: string;
    status: string;
    is_acknowledged: boolean;
    source: string;
    recovered_time: string;
    duration: string;
    deduped_count: number;
    tenant: string;
}

export interface AIMLEventDetails {
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
    category: string;
    datacenter: string;
    private_cloud: string;
    cabinet: string;
    tags: string[];
}

export interface MTPEventsSummary {
    total: MTPEventsSummaryData;
    last_7_days: MTPEventsSummaryData;
}

export interface MTPEventsSummaryData {
    event_count: number;
    critical: number;
    warning: number;
    information: number;
}

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
    tenant: string;
    management_ip: string;
    description: string;
    severity: string;
    status: string;
    is_acknowledged: boolean;
    source: string;
    recovered_time: string;
    event_timeline: AIMLAlertEventTimeline[];
}

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
    source: string;
    recovered_time: string;
    event_timeline: AIMLAlertEventTimeline[];
    category: string;
    datacenter: string;
    private_cloud: string;
    cabinet: string;
    tags: string[];
}

export interface AIMLAlertEventTimeline {
    uuid: string;
    event_datetime: string;
    severity: string;
    status: string;
}

export interface AIMLSuppressedAlerts {
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
    recovered_time: null;
    duration: string;
    supression_rules: string[];
}

//conditions

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

export interface AIMLConditions {
    id: number;
    uuid: string;
    rule_name: string;
    description: string;
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
    tenant: string;
}

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
    recovered_datetime: null;
    is_acknowledged: boolean;
    alerts: AIMLConditionAlerts[];
    timeline: AIMLConditionDeviceEventTimeline;
    ticket_id: string;
    ticket_uuid: string;
    account_id: string;
}
export interface AIMLConditionAlerts {
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
    event_timeline: AIMLConditionAlertEventTimeline[];
}
export interface AIMLConditionAlertEventTimeline {
    uuid: string;
    event_datetime: string;
    severity: string;
    status: string;
}

export interface AIMLConditionDeviceEventTimeline {
    [key: string]: AIMLConditionDeviceEventTimelineObject;
}
export interface AIMLConditionDeviceEventTimelineObject {
    device: AIMLConditionDeviceEventTimelineObjectDeviceData;
    events: AIMLConditionDeviceEventTimelineObjectEventData[];
}
export interface AIMLConditionDeviceEventTimelineObjectDeviceData {
    type: string;
    name: string;
}
export interface AIMLConditionDeviceEventTimelineObjectEventData {
    uuid: string;
    event_datetime: string;
    severity: string;
    recovered_datetime: string;
    status: string;
}

export interface AIMLConditionAlertDetail {
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
    source: string;
    recovered_time: string;
    event_timeline: AIMLConditionAlertEventTimeline[];
    category: string;
    datacenter: string;
    private_cloud: string;
    cabinet: string;
    tags: string[];
}

export interface AIMLConditionAlertEventDetail {
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
    category: string;
    datacenter: string;
    private_cloud: string;
    cabinet: string;
    tags: string[];
}


