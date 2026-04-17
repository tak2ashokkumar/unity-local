// Shared API contracts for report management and schedule flows.
// Feature names in these contracts are backend-facing values; do not treat them as display-only labels.
/**
 * Describes the Manage Report Schedule Count Data Type data contract used by Unity Reports.
 */
export interface ManageReportScheduleCountDataType {
  reports: ManageReportSummaryCountDataType;
  schedules: ManageReportSummaryCountDataType;
}


/**
 * Describes the Manage Report Summary Count Data Type data contract used by Unity Reports.
 */
export interface ManageReportSummaryCountDataType {
  datacenter: number;
  ITSM: number;
  DCInventory: number;
  sustainability: number;
  Performance: number;
  costAnalysis: number;
  cloudInventory: number;
  public: number;
  private: number;
  events: number;
  DevOpsAutomation: number;
  UnityOneITSM: number;
  Dynamic: number;
}

/**
 * Describes the Manage Report Data Type data contract used by Unity Reports.
 */
export interface ManageReportDataType {
  uuid: string;
  name: string;
  frequency: string;
  feature: string;
  scheduled_time: string;
  report_meta: ManageReportMetaDataType;
  attachment: boolean;
  enable: boolean;
  default: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  scheduled_day: string;
  recipient_emails: string[];
  additional_emails: string[];
  user: string;
  preview?: boolean;
}

/**
 * Describes the Manage Report Meta Data Type data contract used by Unity Reports.
 */
export interface ManageReportMetaDataType {
  cloudName?: ManageReportCloudDataType[];
  category?: string;
  cabinets?: string[];
  feature?: string;
  report_url?: string;
  reportType?: string;
  datacenters?: string[];
  active?: boolean;
  duration?: string;
  account?: string;
  report_type?: string;
  uuid?: string[];
  dc_uuids?: string[];
  from?: string;
  device_types?: string[];
  cabinet_uuids?: string[];
  to?: string;
}

/**
 * Describes the Manage Report Cloud Data Type data contract used by Unity Reports.
 */
export interface ManageReportCloudDataType {
  platform_type: string;
  name: string;
  uuid: string;
}

/**
 * Describes the Manage Report Datacenter Type data contract used by Unity Reports.
 */
export interface ManageReportDatacenterType {
  id: number;
  cabinets: ManageReportDatacenterCabinetType[];
  uuid: string;
  created_at: string;
  updated_at: string;
  name: string;
  location: string;
  lat: string;
  long: string;
  status: ManageReportDatacenterStatusType[];
  customer: number;
}

/**
 * Describes the Manage Report Datacenter Cabinet Type data contract used by Unity Reports.
 */
export interface ManageReportDatacenterCabinetType {
  url: string;
  id: number;
  name: string;
  uuid: string;
}

/**
 * Describes the Manage Report Datacenter Status Type data contract used by Unity Reports.
 */
export interface ManageReportDatacenterStatusType {
  status: string;
  category: string;
}
