export interface DashboardPublicCloudWidget {
  resource_count: number;
  alert_count: DashboardPublicCloudWidgetAlertCount;
  vm_details: DashboardPublicCloudWidgetVmDetails;
  cost: number;
  service_count: number;
  account_count: number;
}

export interface DashboardPublicCloudWidgetAlertCount {
  information: number;
  critical: number;
  warning: number;
  event_count: number;
}
export interface DashboardPublicCloudWidgetVmDetails {
  vm_up: number;
  vm_down: number;
  vm_count: number;
}

