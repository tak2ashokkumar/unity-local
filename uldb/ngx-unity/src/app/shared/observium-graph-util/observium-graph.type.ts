import { DeviceMapping } from '../app-utility/app-utility.service';

export interface GraphData {
    graph: string;
}

export interface GraphSetData {
    graph_by_month: string;
    graph_by_week: string;
    graph_by_day: string;
    graph_by_year: string;
}

export interface DeviceGraphType {
    deviceType: DeviceMapping;
    deviceId: string;
    label: string;
    graphType: string;

    graphId?: number;
    portId?: string;
}

export interface DeviceGraphConfig {
    GRAPH: { [key: string]: DeviceGraphType[]; }
    HEALTHGRAPHS: { [key: string]: DeviceGraphType[]; }
}

export interface DeviceGraph {
    BMS: DeviceGraphConfig;
    FIREWALL: DeviceGraphConfig;
    VMS: DeviceGraphConfig;
    SWITCHES: DeviceGraphConfig;
    LOADBALANCER: DeviceGraphConfig;
    HYPERVISOR: DeviceGraphConfig;
    PDU: DeviceGraphConfig;
    PORT: DeviceGraphType[];
    STORAGE: DeviceGraphConfig;
    MACMINI: DeviceGraphConfig;
}