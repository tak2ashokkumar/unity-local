import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface PureStorage {
  name: string;
  host_url: string;
  port: number;
  ip_address: string;
  uuid: string;
  os: StorageDeviceOs;
  created_at: string;
  updated_at: string;
  storage_capacity: number;
  storage_used: number;
  monitoring: DeviceMonitoringType;
  is_cluster: boolean;
  is_purity: boolean;
}

export interface StorageDeviceOs {
  url: string;
  id: number;
  name: string;
  version: string;
  full_name: string;
  platform_type: string;
}

export interface PureStorageCrudFormdata {
  uuid: string;
  name: string;
  datacenter: {
    uuid: string;
  }
  is_cluster: boolean,
  host_url: string;
  username: string;
  password: string;
  port: number;
  monitor: boolean;
  // mtp_templates?: number[];
  collector: CollectorType;
  tags: string[];
}

export interface CollectorType {
  name: string;
  uuid: string;
}

export interface StorageDeviceStorageData {
  [key: string]: StorageDeviceStorageDataProperties;
}

export interface StorageDeviceStorageDataProperties {
  used: string;
  capacity: string;
  free: string;
  used_perc: number;
}