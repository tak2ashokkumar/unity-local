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

export interface IotDeviceManufacturerType {
    url: string;
    id: number;
    name: string;
}

export interface IotDeviceModelType {
    id: number;
    uuid: string;
    name: string;
    manufacturer: IotDeviceManufacturerType
}