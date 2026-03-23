export interface AIMLSourceData {
    uuid: string;
    customer: number;
    source: AIMLSource;
    categorizing_field: null;
    type_identifying_field: null;
    source_account_count:number;
}
export interface AIMLSource {
    id: number;
    name: string;
}


export interface AIMLConditions {
    [key: string]: AIMLConditionsData
}

export interface AIMLConditionsData {
    condition_count: number;
    alert_count: number;
    event_count: number;
    critical: number;
    warning: number;
    information: number;
    noise_reduction: number;
    correlation_reduction: number;
}

export interface AIMLAlertCountByDeviceType {
    device_type: string;
    alert_count: number;
}

export interface AIMLAnalyticsSummary {
    condition_count: number;
    information: number;
    critical: number;
    event_count: number;
    correlation_reduction: number;
    noise_reduction: number;
    warning: number;
    alert_count: number;
}

export interface AIMLTendsByTimeline {
    [key: string]: AIMLTendsByTimelineData[];
}
export interface AIMLTendsByTimelineData {
    count: number;
    start_time: string;
    end_time: string;
}

export interface AIMLEventCountByDeviceType {
    device_type: string;
    event_count: number;
}

export interface AIMLNoisyAlert {
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

export interface AIMLNoisyHosts {
    device_id: number;
    device: string;
    device_type: string;
    management_ip: string;
    sources: string;
    event_count: number;
    critical_count: number;
    warning_count: number;
    info_count: number;
}

export interface AIMLSuppressionRule {
    name: string;
    description: string;
    uuid: string;
    active: boolean;
    user: string;
    updated_at: string;
    created_at: string;
    filter_rule_meta: AIMLRuleFilterRuleMeta[];
    event_count: number;
    status: number;
}
export interface AIMLRuleFilterRuleMeta {
    operator: string;
    attribute: string;
    value: string;
}
export interface AIMLCorrelationRule {
    uuid: string;
    name: string;
    filter_rule_meta: AIMLRuleFilterRuleMeta[];
    correlators: string[];
    description: string;
    user: string;
    created_datetime: string;
    updated_datetime: string;
    is_active: boolean;
    condition_count: number;
    similarity_rate: null;
}

export interface AIMLEventsTrendBySeverity {
    severity_count: number;
    severity: number;
    severity_type: string;
}

export interface AIMLEventsTrendByDatacenter {
    [key: string]: number;
}

export interface AIMLEventsTrendByPrivateCloud {
    [key: string]: number;
}

export interface AIMLNoisyHostEventsByDeviceType {
    device_type: string;
    event_count: number;
}

export interface AIMLNoisyEvents {
    device_name: string;
    device_type: string;
    event_count: number;
    last_reported: string;
    severity: string;
    source: string;
    description: string;
    status: string;
    is_acknowledged: string;
}

export interface AIMLEventsByDevice {
    [key: string]: number;
}

export interface AIMLEventTimelineByDevice {
    events: AIMLEventTimelineItemByDevice[];
}
export interface AIMLEventTimelineItemByDevice {
    count: number;
    start_time: string;
    end_time: string;
}