/**
 * VergeIO per-VM Zabbix monitoring types.
 */
export interface VergeIOVmMonitoringConfig {
    configured: boolean;
    enabled: boolean;
    connection_type: string;
    ip_address: string;
    mtp_templates: number[];
    host_id: number;
    os_name: string;
}

export interface VergeIOVmMonitoringStatus {
    configured: boolean;
    enabled: boolean;
    connection_type: string;
    ip_address: string;
    host_id: number;
    status: string;
}

export interface VergeIOVmMonitoringMetric {
    name: string;
    lastvalue: string;
    units: string;
}

export interface VergeIOVmMonitoringMetrics {
    cpu: VergeIOVmMonitoringMetric[];
    memory: VergeIOVmMonitoringMetric[];
}

export interface VergeIOVmMonitoringPayload {
    connection_type: string;
    ip_address: string;
    mtp_templates: number[];
}

// Supported Zabbix connection types for a VergeIO VM.
export const VERGEIO_MONITORING_CONNECTION_TYPES: string[] = ['Agent', 'SNMP', 'SSH', 'WinRM'];
