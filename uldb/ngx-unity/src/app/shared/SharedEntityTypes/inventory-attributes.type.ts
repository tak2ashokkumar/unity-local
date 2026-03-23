import { RemoteDevicesType } from "./device-interface.type";

export interface DeviceInterface {
    status: string;
    mac_address: string;
    type: string;
    name: string;
    description: string;
    interface_id: string;
    remote_devices: RemoteDevicesType;
}