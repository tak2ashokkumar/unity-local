export interface MonitoringTemplate {
    id: number;
    url: string;
    zabbix_instance: MonitoringTemplateZabbixInstance;
    template_id: number;
    template_name: string;
    item_key: MonitoringTemplateItemKey;

    //added for ui changes
    isSelected: boolean;
}
interface MonitoringTemplateZabbixInstance {
    id: number;
    uuid: string;
    account_name: string;
}
interface MonitoringTemplateItemKey {
}