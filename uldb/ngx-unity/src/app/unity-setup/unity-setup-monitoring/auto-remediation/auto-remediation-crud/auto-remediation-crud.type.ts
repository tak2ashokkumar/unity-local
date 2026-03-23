export interface TriggerData {
    trigger_ids: Trigger[];
}

export interface Trigger {
    name: string;
    device_triggers: number[];
}

export interface Monitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}

export interface IPAddress {
    monitoring: Monitoring;
    uuid: string;
    name: string;
    device_type: string;
    tags: string[];
    dc_uuid: string | null;
    ctype_id: number;
    os: string;
    ip_address: string;
    private_cloud: any[];
}
