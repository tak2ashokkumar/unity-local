// Consolidated Docker resource types (merged from the former docker-*.type.ts files).
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

export interface DockerControllerType {
    id: number;
    name: string;
    hostname: string;
    cert: string;
    key: string;
    ca: string;
    uuid: string;
    created_at: string;
    updated_at: string;
    cloud: number;
    customer: number;
}

// Account/cloud reference carried by the Docker Node list items.
interface Docker_Private_cloud {
    id: number;
    name: string;
    uuid: string;
    platform_type: string;
}

interface DockerAccount {
    id: number;
    cloud: Docker_Private_cloud;
    name: string;
    hostname: string;
    uuid: string;
    created_at: string;
    updated_at: string;
    aws_account: number;
    gcp_account: null;
    azure_account: null;
    user: number;
}

export interface DockerNodeType {
    id: number;
    node_id: string;
    short_id: string;
    hostname: string;
    status: string;
    ip_address: string;
    cpus: string;
    memory: string;
    uuid: string;
    account: DockerAccount;
    created_at: string;
    updated_at: string;
    os: string;
    os_type: string;
    collector: CollectorType;
}
