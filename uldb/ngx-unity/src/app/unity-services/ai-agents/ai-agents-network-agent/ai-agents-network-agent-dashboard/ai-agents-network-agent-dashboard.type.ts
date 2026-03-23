export interface SummaryType {
    agent_count: number;
    waiting_for_approval_count: number;
    rejected_count: number;
    executed_count: number;
    agents: string[];
    approved_count: number;
    total_alerts: number;
    total_tasks_recommended: number;
}

export interface AlertsControlPanelType {
    alert_uuid: string;
    alert_id: number;
    remediation_script_status:string;
    alert_name: string;
    summary: string;
    execution_status: string;
    alert_data: AlertDataType;
    contextual_summary: any;
    approval_status: string;
}

export interface AlertDataType {
    alert_duration: string;
    acknowledged_time: string;
    device_uuid: string;
    source_account_name: string;
    device_type: string;
    is_acknowledged: boolean;
    id: number;
    category: string;
    recovered_time: string;
    cloud_type: string;
    uuid: string;
    event_metric: string;
    source: string;
    status: string;
    description: string;
    tags: any[];
    alert_datetime: string;
    cabinet: string;
    cloud_name: string;
    acknowledged_comment: string;
    first_event_datetime: string;
    ip_address: string;
    severity: string;
    customer: number;
    datacenter: string;
    mtta: string;
    event_count: number;
    last_event_datetime: string;
    device_name: string;
    mttr: string;
    management_ip: string;
    custom_data: string;
    acknowledged_by: string;
}

export interface AlertsControlPanelContextualSummaryType {
    recommended_scripts: RecomendationScriptsType[];
    summary: string;
    notes: string;
    result_accuracy_percentage: number;
}

export interface RecomendationScriptsType {
    script: string;
}

export interface AgentAnalysisRecommendedScriptExecutionType {
    alert_uuid: string;
    approve: boolean;
}