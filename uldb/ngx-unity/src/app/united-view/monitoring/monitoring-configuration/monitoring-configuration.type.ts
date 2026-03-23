import { UnityUserApplicableModulePermission } from "src/app/shared/SharedEntityTypes/loggedin-user.type";

export interface MonitoringConfigurationDeviceSummary {
    not_configured: number;
    disabled: number;
    configured: number;
    total: number;
    enabled: number;
}

export interface MonitoringConfigurationDevice {
    monitoring: MonitoringConfigurationDeviceMonitoring;
    ip_address: string;
    snmp_community: string;
    snmp_version: string;
    snmp_authlevel: null;
    snmp_authname: null;
    snmp_authpass: null;
    snmp_authalgo: null;
    snmp_cryptopass: null;
    snmp_cryptoalgo: null;
    uuid: string;
    name: string;
    management_ip: string;
    device_type: string;
    applicable_module_permissions?: UnityUserApplicableModulePermission[];
}
export interface MonitoringConfigurationDeviceMonitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}