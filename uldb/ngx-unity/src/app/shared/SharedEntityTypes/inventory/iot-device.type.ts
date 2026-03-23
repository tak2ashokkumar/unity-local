import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface IotDeviceType {
    uuid: string;
    name: string;
    device_type: string;
    ip_address: string;
    manufacturer: string;
    model: string;
    monitoring: DeviceMonitoringType;
    status: number;
    tags: string[];
}