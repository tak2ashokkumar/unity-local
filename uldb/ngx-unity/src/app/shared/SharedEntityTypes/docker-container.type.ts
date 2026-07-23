import { DeviceMonitoringType } from "./devices-monitoring.type";

export interface DockerContainerType {
    id: number;
    name: string;
    uuid: string;
    account: number;
    image: string;
    status: string;
    cpu_usage: string;
    memory_usage: string;
    monitoring: DeviceMonitoringType;
}