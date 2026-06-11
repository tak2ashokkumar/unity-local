export interface MonitoringGraphItems {
    item_id: number;
    name: string;
    item_key: string;
    interval: string;
    status: string;
    triggers: number;
    value_type: string;
    'default': boolean;
}

export interface ZabbixTriggerType {
    trigger_id: number;
    name: string;
    expression: string;
    severity: string;
    disabled: boolean;
    mode: boolean;
    state: string;
    can_update: boolean;
    can_delete: boolean;
    auto_remediation: boolean;
    script: string;
    credential: number;
}

export interface ZabbixTriggerCRUDType {
    triggerid: string;
    name: string;
    severity: string;
    rules: ZabbixTriggerRuleCRUDType;
    mode: string;
    credential: string;
    script: string;
}
export interface ZabbixTriggerRuleCRUDType {
    item_key: string;
    'function': string;
    operator: string;
    value: string;
    detect_period?: string;
    season?: string;
    deviation?: string;
}