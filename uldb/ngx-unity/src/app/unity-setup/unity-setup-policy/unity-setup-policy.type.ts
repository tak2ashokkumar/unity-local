export interface PolicyDataItem {
    uuid: string;
    name: string;
    policy_type: string;
    scope: string;
    scope_name: string;
    notification_enabled: boolean;
    is_enabled: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
}

export interface UnitySetupPolicyItem {
    name: string;
    description: string;
    scope: string;
    cloud_type: string;
    scope_id?: string;
    policy_type: string;
    config: Config;
    notification_enabled: boolean;
    notify_users: string[];
    notify_groups: string[];
    is_enabled: boolean;
    uuid?: string;
    scope_object?: null;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}
export interface Config {
    max_vms?: number;
    max_cpus?: number;
    max_memory?: number;
    max_storage?: number;
    itsm_type?: string;
    itsm_instance?: string;
    approval_workflow?: string;
    parameter_mapping?: ParameterMappingItem[];
}
export interface ParameterMappingItem {
    workflow_attribute: string;
    unityone_attribute: string;
}

export interface ApprovalWorkflows {
    result: ResultItem[];
}
interface ResultItem {
    sys_id: string;
    name: string;
}

export interface CloudTypeUnified {
    id: number;
    name: string;
    type: string;
}

export interface PolicyEvaluationsItem {
    policy_name: string;
    policy_type: string;
    source: string;
    scope: string
    scope_identifier: string[]
    message: string;
    executed_at: string;
    result: string;
    details: DetailsItem[];
    inputs: {};
}

interface DetailsItem {
    scope: string;
    data: DataItem[];
}
interface DataItem {
    violation_reason?: string;
    resource_name?: string;
    attribute?: string;
    value?: string;
}


