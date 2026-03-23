import { DeviceMonitoringType } from "./devices-monitoring.type";
export interface AllVM {
    cloud_name: string;
    cloud_type: string;
    os: string;
    name: string;
    last_known_state: string;
    uuid?: string;
    monitoring?: DeviceMonitoringType;
}