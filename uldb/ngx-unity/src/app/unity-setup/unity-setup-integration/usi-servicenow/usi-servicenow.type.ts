import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface ServicenowAccounts {
  id: number;
  name: string;
  uuid: string;
  instance_url: string;
  username: string;
  is_default: boolean;
  is_itsm: boolean;
  is_cmdb: boolean;
  is_ire: boolean;
  allow_delete: boolean;
  user: number;
  org: number;
  cmdb_resources: null;
  tenants: Tenant[];
}

export interface Tenant {
  id: number;
  name: string;
}

export interface ServiceNowAttribute {
  resource_value: string;
  attributes: string[];
}

export interface ServiceNowResourceType {
  resource: string;
  value: string;

  // client side added for feasibility
  attrs?: UnityResourceType[];
}

export interface ServiceNowAttributeType {
  resource_value: string;
  attributes: string[];
}





export interface ServicenowAccount {
  id: number;
  name: string;
  uuid: string;
  instance_url: string;
  username: string;
  is_default: boolean;
  is_itsm: boolean;
  is_cmdb: boolean;
  is_inbound: boolean;
  is_outbound: boolean;
  is_ire: boolean;
  allow_delete: boolean;
  unity_source_available: boolean;
  user: number;
  org: number;
  cmdb_resources: number;
  url_type: string;
  collector: CollectorType;
  collector_proxy: boolean;
  tenants: number[];
  resource_types: ServiceNowAccountResourceType[];
  schedule_meta: UnityScheduleType;
}
export interface ServiceNowAccountResourceType {
  unity_device: string;
  resource_type: string;
  cloud_resource_name: string;
  attribute_mapping: ServiceNowAttributeMappingType[];
}
export interface ServiceNowAttributeMappingType {
  servicenow_attr: string;
  unity_attr: string;
  inbound: boolean;
}

export interface UnityResourceType {
  label?: string;
  value?: string;

  // client side added for feasibility
  // attrs?: UnityResourceType[];
  inbound?: UnityResourceType[];
  outbound?: UnityResourceType[];
}

export interface PublicCloudServiceType {
  label: string;
  value: string;

  // client side added for feasibility
  aws_attrs?: UnityResourceType[];
  azure_attrs?: UnityResourceType[];
}

export interface ServiceNowAccountHistoryType {
  status: string;
  device_type: string;
  cmdb_account: string;
  ci_data: any;
  execution_time: string;
  completion_time: string;
}

export interface CollectorType {
  name: string;
  uuid: string;
}

export interface ServicenowAccountUnityOneDeviceType {
  label:string;
  value:string;
  inbound?: ServicenowAccountUnityOneDeviceInboundType[]
  outbound?: ServicenowAccountUnityOneDeviceOutboundType[]
}

export interface ServicenowAccountUnityOneDeviceInboundType {
  label: string;
  value: string;
}

export interface ServicenowAccountUnityOneDeviceOutboundType extends ServicenowAccountUnityOneDeviceInboundType { }