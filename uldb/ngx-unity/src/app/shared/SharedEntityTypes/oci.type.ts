import { UnityAttributeColors } from "../device-icon.service";
import { UnityScheduleType } from "./schedule.type";

export interface OCIAccount {
  id: number,
  uuid: string,
  name: string,
  user_ocid: string,
  tenancy_ocid: string,
  discover_services: string,
  services: string[],
  onboard_device: boolean,
  dependency_map: boolean,
  discover_dependency: boolean,
  customer: number,
  cloud_provider: number,
  is_managed: boolean,
  region: string,
  schedule_meta: UnityScheduleType
}




export interface UnityOciTopologyNode extends OciAccountResource {
  icon: string;
  status?: string;

  //custom added from ui for topology purpose
  displayType: string;
  redirectLink: string;
  badgeColors: UnityAttributeColors;
}

export interface OciAccountResource {
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

export interface UnityOciTopologyLink {
  source_uuid: string;
  target_uuid: string;
}

export interface OciTopologyType {
  nodes: UnityOciTopologyNode[];
  links: UnityOciTopologyLink[];
}