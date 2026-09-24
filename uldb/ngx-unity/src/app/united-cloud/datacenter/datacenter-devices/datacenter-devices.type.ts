export interface DatacenterDeviceListingConfig {
  title: string;
  endpoint: string;
  deviceMapping: any;
  activityLogType: string;
  columns: DatacenterDeviceListingColumn[];
  actions: DatacenterDeviceAction[];
}

export interface DatacenterDeviceListingResponse {
  count?: number;
  results?: any[];
}

export interface DatacenterDeviceListingColumn {
  label: string;
  keys: string[];
  sortColumn?: string;
  type?: 'status' | 'tags' | 'text';
}

export type DatacenterDeviceActionType = 'consoleSameTab' | 'webAccessNewTab' | 'consoleNewTab' | 'stats' | 'ticket' | 'notify' | 'edit' | 'delete' | 'resetPassword';

export interface DatacenterDeviceAction {
  type: DatacenterDeviceActionType;
  icon: string;
  tooltip: string;
  moduleName?: string;
  accessType?: string;
}
