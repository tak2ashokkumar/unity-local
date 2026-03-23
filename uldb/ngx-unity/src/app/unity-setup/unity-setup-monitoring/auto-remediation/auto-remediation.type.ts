export interface AutoRemediationType {
    uuid: string;
    name: string;
    device_types: string[];
    devices: string[];
    host_mapping: HostMappingItem[];
    parameter_mapping: ParameterMappingItem[];
    remediation_task: string;
    trigger_ids: TriggerIdsItem[];
    task_type: string;
    cred_type: string;
    enabled: boolean;
    credentials: string;
    created_at: string,
    updated_at: string,
    edited_by: string,
    created_by_name: string,
    last_remediation: string;
    remediation_status: string,
    script: string;
}
export interface Monitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}
export interface HostMappingItem {
    mapping_type: string;
    event_attribute: string;
    expression: string;
}
export interface ParameterMappingItem {
    param_name: string;
    mapping_type: string;
    event_attribute: string;
    expression: string;
}
export interface TriggerIdsItem {
    name: string;
    device_triggers: number[];
}

export interface SummaryType {
    failed: number;
    execution: number;
    total: number;
    success: number;
}

export interface AutoRemediationHistoryType {
    event_id: string;
    status: string;
    uuid: string;
    event_uuid:string;
    event_source:string;
    start_time: string;
    device_name: string;
    end_time: string;
    resolve_time: string;
    event_time: string;
    trigger_name: string;
    event_status: string;
}


export interface DisableTriggerType {
    message: string;
    success: boolean;
}

export interface EventResolveType extends DisableTriggerType { }