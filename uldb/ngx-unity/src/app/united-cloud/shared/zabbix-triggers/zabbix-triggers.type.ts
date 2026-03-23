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
    auto_remediation:boolean;
    script:string;
    credential:number;
}
