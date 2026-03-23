import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface MerakiDeviceType {
    uuid: string;
    name: string;
    device_model: string;
    device_serial: string;
    device_status: string;
    device_ip: string;
    device_product_type: string;
    asset_tag: null;
    tags: string[];
    firmware: string;
    mac_address: string;
    latitude: string;
    longitude: string;
    address: string;
    configuration_updated_at: string;
    interfaces: MerakiDeviceInterfacesType[];
    account: string;
    location: string;
    meraki_organization: string;
    meraki_organization_name: string;
    meraki_network: string;
    meraki_network_name: string;
    status: string;
    monitoring: DeviceMonitoringType;
}

export interface MerakiDeviceInterfacesType {
    status: string;
    index: string;
    name: string;
    type: string;
    interface_id: string;
    mac_address: null;
    ip_address: null;
    description: string;
}