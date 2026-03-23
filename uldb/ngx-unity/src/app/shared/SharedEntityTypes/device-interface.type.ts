import { DeviceMonitoringType } from "./devices-monitoring.type";

export interface DeviceInterfaceSummaryType {
    down: number;
    dormant: number;
    lowerLayerDown: number;
    unknown: number;
    notPresent: number;
    testing: number;
    total_interfaces: number;
    up: number;
}

export interface DeviceDataType {
    id: number;
    uuid: string;
    name: string;
    monitoring: DeviceMonitoringType;
}

export interface InterfaceDetailsType {
    status: string;
    description: string;
    remote_devices: RemoteDevicesType;
    mac_address: string;
    type: string;
    name: string;
}

export interface RemoteDevicesType {
    target_device_uuid: string;
    unity_map: boolean;
    target_device_monitoring: DeviceMonitoringType;
    interfaces: InterfacesType;
    target_device_type: string;
    target_device: string;
    target_device_ip: string;
    target_account_uuid: string;
    target_organization_uuid: string;
    target_organization_name: string;
    target_account_name: string;
}

export interface InterfacesType {
    status: string;
    description: string;
    type: string;
    name: string;
    mac_address: string;
}

export interface DeviceTypesOptionsType {
    label: string;
    value: string;
}

export interface TargetDeviceFormDataType {
    source_interface: string;
    source_des: string;
    device_type: string;
    remote_device: DeviceDataType;
    remote_interface: InterfaceDetailsType;
}