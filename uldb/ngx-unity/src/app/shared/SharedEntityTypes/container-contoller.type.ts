import { DeviceMonitoringType } from "./devices-monitoring.type";

export enum CONTROLLER_TYPE_MAPPING {
    KUBERNETES = 'kubernetes',
    DOCKER = 'docker',
}

// Unified container account response served by GET_CONTAINERS (customer/containers/).
// Kubernetes and Docker accounts arrive in the same list, discriminated by 'type'.
export interface ContainerAccountCloudType {
    platform_type: string;
    uuid: string;
    id: number;
    name: string;
}

export interface ContainerAccountType {
    uuid: string;
    name: string;
    hostname: string;
    type: CONTROLLER_TYPE_MAPPING;
    cloud: ContainerAccountCloudType;
    status: string;
    zabbix: DeviceMonitoringType;
    tags: any[];
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