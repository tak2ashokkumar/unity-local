export interface OciZabbixCollector {
  uuid: string;
}

export interface OciZabbixMonitoringConfig {
  user_ocid: string;
  tenancy_ocid: string;
  region: string;
  fingerprint: string;
  key_content: string;
  collector: OciZabbixCollector;
}

export interface OciZabbixMonitoringFormValue {
  user_ocid: string;
  tenancy_ocid: string;
  region: string[];
  fingerprint: string;
  key_content: string;
  collector: OciZabbixCollector;
}
