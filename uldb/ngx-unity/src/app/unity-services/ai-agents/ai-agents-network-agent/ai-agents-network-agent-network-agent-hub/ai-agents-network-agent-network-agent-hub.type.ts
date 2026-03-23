export interface NetworkAgentSummaryType {
    approved_count: number;
    total_alerts: number;
    total_tasks_recommended: number;
    agent_count: number;
    rejected_count: number;
    executed_count: number;
    conditions_by_execution_status: ConditionsByExecutionStatus;
    waiting_for_approval_count: number;
    resolved_conditions: number;
    agents: string[];
    active_conditions: number;
    total_conditions: number;
}

export interface ConditionsByExecutionStatus {
    Failed: number;
    Completed: number;
    Pending: number;
}

export interface AlertType {
    id: number;
    alert_id: number;
    alert_obj_id: number;
    alert_name: string;
    alert_status: string;
    remediation_script_status: string;
    alert_severity: string;
    alert_uuid: string;
    action_needed: string;
    approval_status: string;
    alert_data: AlertDataType;
    summary: string;
    contextual_summary: string;
    execution_status: string;
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

export interface ConditionType {
    id: number;
    condition_id: number;
    alert_id: number;
    alert_name: string;
    condition_uuid: string;
    node_name: string;
    status: string;
    condition_rca: string;
    created_at: string;
    updated_at: string;
    condition: number;
    customer: number;
    condition_analysis: ConditionAnalysis
}

export interface ConditionAnalysis {
    condition_severity: string;
    condition_datetime: string;
}