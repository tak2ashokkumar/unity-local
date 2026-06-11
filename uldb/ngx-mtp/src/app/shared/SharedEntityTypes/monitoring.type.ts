export interface MonitoringTemplates {
    template_id: number;
    template_name: string;
    template_data: MonitoringTemplatesData;
}
export interface MonitoringTemplatesData {
    metrics: number;
    graphs: number;
    'default': boolean;
    type: string;
    triggers: number;
}

export interface MonitoringTemplatesDiscoveredComponents {
    discovery_rule_id: number;
    discovery_rule_name: string;
    trigger_count: number;
    graph_count: number;
    item_count: number;
}