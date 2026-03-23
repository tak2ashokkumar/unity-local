import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

export interface DeviceGraphType {
    label: string;
    graphType: string;
    deviceType: DeviceMapping;
    deviceId: string;
}

export interface GraphSetType {
    graph_by_month: string;
    graph_by_week: string;
    graph_by_day: string;
    graph_by_year: string;
}