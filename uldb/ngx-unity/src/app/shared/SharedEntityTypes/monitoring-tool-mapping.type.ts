export interface MappedMonitoringTool {
    [key: string]: {
        observium: boolean;
        zabbix: boolean;
    }
}