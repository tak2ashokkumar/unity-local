import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';


// widget related part
export interface MonitoringPerformanceWidget {
    id: number;
    device: MonitoringPerformanceWidgetDevice;
    widget_data: MonitoringPerformanceWidgetData;
    user: number;
}
export interface MonitoringPerformanceWidgetData {
    graphs: MonitoringPerformanceWidgetDataGraphs[];
    device_type: string;
    device_uuid: string;
}
export interface MonitoringPerformanceWidgetDataGraphs {
    graphid: number;
    name: string;
}
  //Both widget and devices api
export interface MonitoringPerformanceWidgetDevice {
    id: number;
    uuid: string;
    name: string;
    monitoring: MonitoringPerformanceWidgetDeviceMonitoring;
}
export interface MonitoringPerformanceWidgetDeviceMonitoring {
    configured: boolean;
    observium: boolean;
    enabled: boolean;
    zabbix: boolean;
}


//device graphs api part
export interface ZabbixMonitoringGraph {
    graph_id: number;
    name: string;
    graph_type: string;
    item_ids: string[];
    can_delete: boolean;
    can_update: boolean;
}