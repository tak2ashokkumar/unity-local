export type StorageType = 'netapp' | 'pure';

export interface StorageFilterOption {
  value: string;
  label: string;
}

export interface StorageClusterOption extends StorageFilterOption {
  uuid?: string;
  name?: string;
}

export interface StorageArrayOption extends StorageFilterOption {
  uuid?: string;
}

export interface StorageDateRangeValue {
  period: string;
  from: string | Date;
  to: string | Date;
}

export interface StorageDashboardFilterCriteria {
  storageType: StorageType;
  datacenters: string[];
  clusters: string[];
  arrays: string[];
  period: string;
  timeRangeApiValue?: string;
  from: string | Date;
  to: string | Date;
}

export interface StorageFilterScopeSummary {
  primaryLabel: string;
  remainingLabels: string[];
}

export interface StorageTimeRangeOptionApi {
  label: string;
  value: string;
}

export interface StorageTimeRangeOption extends StorageTimeRangeOptionApi {
  apiValue?: string;
}

export interface StorageNetappClusterApi {
  name: string;
  uuid: string;
}

export interface StorageNetappDatacenterApi {
  label: string;
  value: string;
}

export interface StorageNetappDashboardFiltersResponse {
  datacenters?: StorageNetappDatacenterApi[];
  clusters?: StorageNetappClusterApi[];
  timeRangeOptions?: StorageTimeRangeOptionApi[];
}

export type StorageNetappClusterFiltersResponse = StorageNetappClusterApi[];

export interface StoragePureFilterOptionApi {
  name: string;
  uuid: string;
}

export interface StoragePureDashboardFiltersResponse {
  arrays: StoragePureFilterOptionApi[];
  datacenters: StoragePureFilterOptionApi[];
  time_range: StorageTimeRangeOptionApi[];
}

export interface StorageDashboardFilterOptionsViewData {
  datacenters: StorageFilterOption[];
  clusters: StorageClusterOption[];
  arrays: StorageArrayOption[];
  timeRangeOptions: StorageTimeRangeOption[];
}
