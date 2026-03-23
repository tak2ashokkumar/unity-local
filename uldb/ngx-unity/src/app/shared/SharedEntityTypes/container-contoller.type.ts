import { DeviceMonitoringType } from "./devices-monitoring.type";

export enum CONTROLLER_TYPE_MAPPING {
    KUBERNETES = 'kubernetes',
    DOCKER = 'docker',
}

export interface ContainerControllerType {
    id: number;
    uuid: string;
    name: string;
    hostname: string;
    tags: any[];
    controller_type: CONTROLLER_TYPE_MAPPING;
    display_type: string;
    monitoring: DeviceMonitoringType;
    management_ip: string;
    ip_address: string;
    status: string;
}