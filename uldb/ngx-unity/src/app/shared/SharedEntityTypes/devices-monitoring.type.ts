import { AuthLevelMapping, SNMPVersionMapping } from "../app-utility/app-utility.service";

export interface DeviceMonitoringSNMPCrudType {
    ip_address: string;
    snmp_version: SNMPVersionMapping;
    snmp_community?: string;
    snmp_authlevel?: AuthLevelMapping | '';
    snmp_authname?: string;
    snmp_authpass?: string;
    snmp_authalgo?: string;
    snmp_cryptoalgo?: string;
    snmp_cryptopass?: string;
    connection_type: string;
    is_snmptrap_enabled?: boolean;
    mtp_templates?: number[];
}
export class DeviceMonitoringSNMPCrudTypeClass implements DeviceMonitoringSNMPCrudType {
    ip_address: string;
    snmp_version: SNMPVersionMapping;
    snmp_community?: string;
    snmp_authlevel?: AuthLevelMapping | '';
    snmp_authname?: string;
    snmp_authpass?: string;
    snmp_authalgo?: string;
    snmp_cryptoalgo?: string;
    snmp_cryptopass?: string;
    connection_type: string;
    is_snmptrap_enabled?: boolean;
    mtp_templates?: number[];
}


export interface DeviceMonitoringType {
    zabbix: boolean;
    observium: boolean;
    configured: boolean;
    enabled: boolean;
}

export interface DeviceZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}

export interface DeviceZabbixMonitoringGraphItems {
    item_id: number;
    name: string;
    key: string;
    value_type: string;
}

export interface DeviceZabbixMonitoringAlerts {
    alert_id: number;
    alert: string;
    severity: string;
    date_time: string;
    device_name: string;
}