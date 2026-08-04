export type StorageVendor = 'netapp' | 'pure';

export interface StorageFilterOption {
  value: string;
  label: string;
}

export interface StorageVendorOption extends StorageFilterOption {
  value: StorageVendor;
}

export interface StorageResourceOption extends StorageFilterOption {
  datacenter: string;
}

export interface StorageDateRangeValue {
  period: string;
  from: string | Date;
  to: string | Date;
}

export interface StorageDashboardFilterCriteria {
  vendor: StorageVendor;
  datacenters: string[];
  resourceIds: string[];
  period: string;
  from: string | Date;
  to: string | Date;
}

export interface StorageFilterScopeSummary {
  primaryLabel: string;
  remainingLabels: string[];
}
