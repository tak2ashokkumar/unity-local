import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface ZabbixAnomalyDetectionTriggerGraphItemsType {
    name: string;
    device_data: ZabbixAnomalyDetectionTriggerGraphItemsDevicesDataType[];
}

export interface ZabbixAnomalyDetectionTriggerGraphItemsDevicesDataType {
    uuid: string;
    item_value_type: string;
    device_type: string;
    item_id: number;
    host_id: number;
    item_key: string;
}

export interface ZabbixAnomalyDetectionTriggerType {
    trigger_id: number;
    name: string;
    device_types: string[];
    devices: devicesType[];
    expression: string;
    severity: string;
    disabled: boolean;
    mode: boolean;
    state: string;
    can_update: boolean;
    can_delete: boolean;
}

export interface ZabbixAnomalyDetectionTriggerRuleCRUDType {
    item_key: ZabbixAnomalyDetectionTriggerGraphItemsType;
    'function': string;
    operator: string;
    value: string;
    function_value: string;
    function_unit: string;
    detect_period: string;
    season: string;
    deviation: string;
    
    //for ui feasibility
    detect_period_value: string;
    detect_period_unit: string;
    season_value: string;
    season_unit: string;
}

export interface DeviceTypesOptionsType {
    label: string;
    value: string;
}

export interface devicesType {
    name: string;
    uuid: string;
    device_type: string;
    monitoring: DeviceMonitoringType
    id: number;
}