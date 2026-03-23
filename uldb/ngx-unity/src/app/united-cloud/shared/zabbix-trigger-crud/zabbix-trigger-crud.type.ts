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
