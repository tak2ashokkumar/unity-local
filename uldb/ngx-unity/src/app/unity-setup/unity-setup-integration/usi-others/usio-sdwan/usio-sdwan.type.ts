import { DeviceProxy } from "src/app/shared/SharedEntityTypes/device-common-utils.type";
import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface SdWanAccountDetails {
  uuid: string;
  name: string;
  account_url: string;
  port: string;
  collector: string;
  username: string;
  password: string;
  schedule_meta: UnityScheduleType;
  status: string;
  proxy: DeviceProxy;
  tags: string[];
  monitoring: DeviceMonitoringType;
}

export interface ResourceUtilization {
  available: number;
  consumed: number;
  unit: string;
}

export interface SdwanDeviceDetails {
  uuid: string;
  name: string;
  chassis_number: string;
  reachability: string;
  latitude: string;
  longitude: string;
  vsmart_control: string;
  health: string;
  site_id: string;
  system_ip: string;
  device_type: string;
  local_system_ip: string;
  device_model: string;
  software_version: string;
  cpu_load: ResourceUtilization;
  memory_utilization: ResourceUtilization;
  board_serial_number: string;
  device_id: string;
  state: string;
  state_description: string;
  status: string;
  total_cpu_count: number;
  uptime: string;
  validity: string;
  certificate_expiration_date: string;
  certificate_expiration_status: string;
  certificate_validity: string;
  domain_id: string;
  last_updated: string;
  has_geo_data: boolean;
  location: string;
  account: string;
  bfd: string;
  monitoring: DeviceMonitoringType;
}

