import { DatacenterFast } from "src/app/shared/SharedEntityTypes/datacenter.type";

export interface NetworkDashboardFiltersResponse {
    datacenters: DatacenterFast[];
    time_range: string[];
}

export interface NetworkOverview {
    device_availability: Device_availability;
    discovered_devices: number;
    monitored_devices: number;
    device_types: DeviceTypesItem[];
}
interface Device_availability {
    percentage: number;
    online: number;
    total: number;
}
interface DeviceTypesItem {
    type: string;
    count: number;
    normal: number;
    critical: number;
    unknown: number;
}

