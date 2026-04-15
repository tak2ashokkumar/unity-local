export interface NetworkAgentsChatResponseType {
    // answer: string;
    // data: any;
    // recommended_actions: string[];
    answer: AnswerType;
    meta: MetaType;
    conversation_id: string;
    title: string;
    role: string;
}

export interface ChartResponseType {
    answer: AnswerType;
    meta: MetaType;
    conversation_id: string;
    title: string;
    role: string;
}

export interface AnswerType {
    stage: string;
    phase: string;
    stage_title: string;
    answer: string;
    // status?: string;
    status?: 'success' | 'error';
    data: ConditionData | MonitoringDataType | CheckDeviceHealthDataType | ResourceUtilizationDataType | CentralizedLogsDataType | RcaDataType | RemediationScriptDataType | ValidateFixDataType | DocumentAndCloseDataType;
    recommended_actions: string[];
}

export interface ConditionData {
    condition_summary: ConditionSummary;
    events_timeline: EventTimelineItem[];
    alerts_timeline: AlertTimelineItem[];
    preliminary_rca: PreliminaryRCA[];
    plan_of_action: string[];
    suggested_commands: SuggestedCommand[];
}

/* -------------------- Condition Summary -------------------- */

export interface ConditionSummary {
    condition_id: string;
    condition_name: string;
    severity: 'Critical' | 'Warning' | 'Information' | string;
    status: 'Resolved' | 'Active' | string;
    alert_count: number;
    event_count: number;
    condition_datetime: string;
    condition_duration: string;
    affected_devices: string[];
    business_impact: string;
    condition_analysis: string;
    condition_source: string;
    correlators: string;
    first_alert_datetime: string;
    last_alert_datetime: string;
}

/* -------------------- Timeline -------------------- */

export interface EventTimelineItem {
    timestamp: string;
    type: string;
    description: string;
    severity: 'Critical' | 'Warning' | 'Information' | string;
}

export interface AlertTimelineItem {
    timestamp: string;
    type: string;
    description: string;
    severity: 'Critical' | 'Warning' | 'Information' | string;
}

/* -------------------- RCA -------------------- */

export interface PreliminaryRCA {
    possible_cause: string;
    confidence: 'High' | 'Medium' | 'Low' | string;
    indicators: string[];
}

/* -------------------- Suggested Commands -------------------- */

export interface SuggestedCommand {
    command: string;
    use_case: string;
}


export interface MonitoringDataType {
    // metrics: MetricsType[];
    resource_summary: ResourceSummaryType;
    device: DeviceType;
}

export interface DeviceType {
    device_id: number;
    device_ct: number;
    customer_id: number;
}

export interface CheckDeviceHealthDataType {
    resource_utilization: ResourceUtilizationSummaryType;
    resource_summary: ResourceSummaryType;
    // metrics: MetricsType[];
    device: DeviceType;
}

export interface ResourceUtilizationDataType {
    resource_summary: ResourceSummaryType;
    // metrics: MetricsType[];
    device: DeviceType;
}

// Check Device Health & ResourceUtlization & Monitoring related common types 
export interface ResourceUtilizationSummaryType {
    cpu: string;
    memory: string;
    uptime: string;
    latency: string;
    bandwidth: string;
    interface_error: string;
}
export interface ResourceSummaryType {
    total_cpu_usage: string;
    total_memory_usage: string;
}
export interface MetricsType {
    metric_type: string;
    metrics_data: MetricsDataType[];
    metric_url: string;
}
export interface MetricsDataType {
    item_name: string;
    units: string;
    lastvalue: string;
    item_key: string;
    history: HistoryType[];
}
export interface HistoryType {
    clock: string;
    value: number;
}

// Centralized Logs related types
export interface CentralizedLogsDataType {
    alerts: AlertsType[];
    events: EventsType[];
    logs: any[];
}
export interface AlertsType {
    timestamp: string;
    type: string;
    description: string;
    severity: string;
    id: number;
    device_type: string;
    device_name: string;
    status: string;
    host: string;
}
export interface EventsType {
    timestamp: string;
    type: string;
    description: string;
    severity: string;
    id: number;
    device_type: string;
    device_name: string;
    status: string;
    host: string;
}

// RCA releated type
export interface RcaDataType {
    rca_result: RcaResultType;
    result_accuracy_percentage: string;
}
export interface RcaResultType {
    how_it_happened: string[];
    timeline_of_events: TimelineOfEventsType[];
    logs: any[];
    why_it_happened: string[];
    contributing_factors: string[];
    root_cause_analysis: RootCauseAnalysisType;
    incident_summary: IncidentSummaryType;
    traces: any[];
    remediation_recommendations: string[];
    conclusion: string;
}
export interface TimelineOfEventsType {
    event: string;
    time: string;
}
export interface RootCauseAnalysisType {
    root_cause: string;
    evidence: string[];
}
export interface IncidentSummaryType {
    status: string;
    ticket_id: string;
    severity: string;
    first_alert: string;
    title: string;
    last_alert: string;
    event_count: number;
    alert_count: number;
    device: string[];
    is_acknowledged: boolean;
    source: string;
    source_account: string;
    duration: string;
    'interface': any[];
    condition_id: string;
    description: string;
}

// Remediation Script related Type
export interface RemediationScriptDataType {
    target_device: string;
    script_id?: string;
    script_name?: string;
    actions?: string[];
    risks?: string[];
    pre_conditions?: string[];
    post_conditions?: string[];
    recommended_actions?: string;
}

// Validate Fix releated type
export interface ValidateFixDataType {
    execution: ExecutionType;
    post_validation: PostValidationItemType[];
}
export interface ExecutionType {
    target_device: string;
    execution_status: string;
    logs: string[];
}
export interface PostValidationItemType {
    metric: string;
    status: string;
    details: string;
}

// Document and Close releated type
export interface DocumentAndCloseDataType {
    description: string;
    filename: string;
}



export interface MetaType {
    used_tools: any[];
    filters_used: FiltersUsedType;
}
export interface FiltersUsedType {
    org_id: number;
    user_id: string;
    application: string;
    count: number;
    conversation_id: string;
    role: string;
    streaming: boolean;
    title: string;
    query: string;
}