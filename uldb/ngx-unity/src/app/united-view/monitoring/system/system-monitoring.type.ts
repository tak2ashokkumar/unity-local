import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';


// widget related part
export interface SystemMonitoringWidget {
    id: number;
    device: SystemMonitoringWidgetDevice;
    widget_data: SystemMonitoringWidgetData;
    user: number;
}
export interface SystemMonitoringWidgetData {
    graphs: SystemMonitoringWidgetDataGraphs[];
    device_type: string;
    device_uuid: string;
}
export interface SystemMonitoringWidgetDataGraphs {
    graphid: number;
    name: string;
}
//Both widget and devices api
export interface SystemMonitoringWidgetDevice {
    id: number;
    uuid: string;
    name: string;
    monitoring: SystemMonitoringWidgetDeviceMonitoring;
}
export interface SystemMonitoringWidgetDeviceMonitoring {
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