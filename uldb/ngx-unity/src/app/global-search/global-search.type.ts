export interface GlobalAdvancedSearchResult {
    uuid: string;
    name: string;
    device_type: string;
    os: string;
    ip_address: string;
    private_cloud: string[];
    monitoring: GlobalAdvancedSearchResultMonitoring;
    tags: string[];
    dc_uuid: string;
    account_uuid: string;
}
export interface GlobalAdvancedSearchResultMonitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}