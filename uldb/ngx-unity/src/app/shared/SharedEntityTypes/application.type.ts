export interface ApplicationType {
    name: string;
    id: number;
    customer: number;
    throughput: string;
    latency: string;

    status_code: string;
    type: string;
}

export interface ApplicationServiceType {
    id: number;
    uuid: string;
    name: string;
    hostname: string;
    type_of_app: string;
    latency: string;
    throughput: string;
    device_id: string;
    content_type: string;
}


export interface ApplicationFailureAnalysisType {
    intervals: ApplicationFailureAnalysisIntervalType[];
    app_name: string;
}
export interface ApplicationFailureAnalysisIntervalType {
    error_rate: number;
    end_time: string;
    throughput: string;
    error_count: number;
    total_logs: number;
    start_time: string;
    warning_count: number;
    label: string;
}

export interface ApplicationFailureEventsType {
    count: number;
    endpoint: string;
    monitored_app: number;
    description: string;
    service: string;
    timestamp?: string;
}

export interface ApplicationFailureLogsType {
    id: number;
    timestamp: string;
    service_name: string;
    tenant_id: string;
    message: string;
    severity: string;
    trace_id: string;
    span_id: string;
    file_path: string;
    function_name: string;
    line_number: number;
    attributes: ApplicationFailureLogAttributes;
    resources: ApplicationFailureLogResources;
    flags: number;
    created_at: string;
    updated_at: string;
    app: number;
}
export interface ApplicationFailureLogAttributes {
    'code.function': string;
    'code.lineno': number;
    'code.filepath': string;
}
export interface ApplicationFailureLogResources {
    'service.name': string;
    trace_end_url: string;
    'device.ip': string;
    metrics_end_url: string;
    tenant_id: string;
    'telemetry.sdk.language': string;
    'telemetry.sdk.name': string;
    log_end_url: string;
    auth: string;
    'application.name': string;
    'device.name': string;
    'device.type': string;
    'telemetry.sdk.version': string;
}

export interface ApplicationProblemSummaryType {
    condition_count: number;
    information: number;
    critical: number;
    event_count: number;
    correlation_reduction: number;
    noise_reduction: number;
    warning: number;
    alert_count: number;
}

export interface ApplicationProblemConditionType {
    id: number;
    uuid: string;
    rule_name: string;
    description: string;
    alert_count: number;
    event_count: number;
    condition_datetime: string;
    first_alert_datetime: string;
    last_alert_datetime: string;
    condition_source: string;
    condition_source_account: string;
    condition_duration: string;
    condition_status: string;
    condition_severity: string;
    correlators: null;
    correlation_window: null;
    hosts: string[];
    recovered_datetime: null;
    is_acknowledged: boolean;
    acknowledged_by: string;
    acknowledged_time: null;
    acknowledged_comment: null;
    root_cause_alert: null;
}