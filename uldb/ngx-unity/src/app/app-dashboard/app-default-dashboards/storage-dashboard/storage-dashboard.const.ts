import {
  StorageArrayOption,
  StorageFilterOption,
  StorageType,
  StorageTimeRangeOption
} from './storage-dashboard.type';

export const STORAGE_DEFAULT_STORAGE: StorageType = 'netapp';
export const STORAGE_ALL_VALUE = 'all';
export const STORAGE_DEFAULT_TIME_RANGE = 'last_30_days';
export const STORAGE_NETAPP_FILTERS_ENDPOINT = '/customer/persona/storage-dashboard/netapp/dashboard-filters/';
export const STORAGE_NETAPP_CLUSTER_FILTERS_ENDPOINT = '/customer/persona/storage-dashboard/netapp/dashboard-filters/';
export const STORAGE_PURE_FILTERS_ENDPOINT = '/customer/storage/pure-storage-dashboard/filters/';

export const STORAGE_TIME_RANGE_OPTIONS: StorageTimeRangeOption[] = [
  { value: 'last_24_hours', label: 'Last 24 Hours' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: STORAGE_DEFAULT_TIME_RANGE, label: 'Last 30 Days' },
  { value: 'last_60_days', label: 'Last 60 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' }
];

export const STORAGE_TIME_RANGE_UI_VALUE_MAP: { [value: string]: string } = {
  '24h': 'last_24_hours',
  '7d': 'last_7_days',
  '30d': STORAGE_DEFAULT_TIME_RANGE,
  '60d': 'last_60_days',
  '90d': 'last_90_days',
  last_week: 'last_7_days',
  last_month: STORAGE_DEFAULT_TIME_RANGE,
  last_quarter: 'last_90_days'
};

export const STORAGE_ALL_DATACENTER_OPTION: StorageFilterOption = {
  value: STORAGE_ALL_VALUE,
  label: 'All Datacenters'
};

export const STORAGE_ALL_ARRAY_OPTION: StorageArrayOption = {
  value: STORAGE_ALL_VALUE,
  label: 'All Arrays',
  uuid: STORAGE_ALL_VALUE
};
