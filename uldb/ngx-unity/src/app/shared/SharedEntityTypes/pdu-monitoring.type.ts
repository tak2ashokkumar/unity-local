export interface MonitoringDatacenterPDU {
  id: number;
  device_id: number;
  last_fetched: string;
  status: string;
  url: string;
  pdu: PDU;
  observium_instance: ObserviumInstance;
}

export interface PDU {
  id: number;
  asset_tag: string;
  hostname: string;
  url: string;
  uuid: string;
  cabinet: string;
  colo_cloud_uuid: string
}

export interface ObserviumInstance {
  account_name: string;
  id: number;
  uuid: string
}