import { UnityAttributeColors } from "../device-icon.service";
import { UnityScheduleType } from "./schedule.type";

export interface GcpResourceType {
    name: string;
    region: string;
    uuid: string;
    resource_type: string;
    account: number;
    account_name: string;
    account_uuid: string;
    icon_path: string;
    service: string;
    instance_state: string;
    availability_zone: null;
    public_ip: null;
    instance_type: null;
    monitoring: Monitoring;
    status: string;
}
export interface Monitoring {
    configured: boolean;
    enabled: boolean;
}

export interface GCPAccountType {
    id: number;
    email: string;
    project_id: string;
    service_mesh: boolean;
    discover_services: string;
    services: any[];
    onboard_device: boolean;
    dependency_map: boolean;
    uuid: string;
    name: string;
    customer: number;
    cloud_provider: number;
    is_managed: boolean;
    discover_dependency: boolean;
    schedule_meta: UnityScheduleType;
}

export interface UnityGCPTopologyNode extends GCPAccountResource {
    icon: string;
    status?: string;
  
    //custom added from ui for topology purpose
    displayType: string;
    redirectLink: string;
    badgeColors: UnityAttributeColors;
  }
  
  export interface GCPAccountResource {
    name: string;
    location: string;
    resource_type: string;
    tags: { [key: string]: string };
    resource_group: string;
    account_name: string;
    subscription: string;
    uuid: string;
    account: number;
    region: string;
    icon_path: string;
  }
  
  export interface UnityGCPTopologyLink {
    source_uuid: string;
    target_uuid: string;
  }
  
  export interface GCPTopologyType {
    nodes: UnityGCPTopologyNode[];
    links: UnityGCPTopologyLink[];
  }