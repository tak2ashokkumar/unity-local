import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import {
  StorageFilterOption,
  StorageResourceOption,
  StorageVendor,
  StorageVendorOption
} from './storage-dashboard.type';

export const STORAGE_DEFAULT_VENDOR: StorageVendor = 'netapp';
export const STORAGE_DEFAULT_TIME_RANGE = 'last_30_days';

export const STORAGE_VENDOR_OPTIONS: StorageVendorOption[] = [
  { value: 'netapp', label: 'NetApp' },
  { value: 'pure', label: 'Pure' }
];

export const STORAGE_DATACENTER_OPTIONS: StorageFilterOption[] = [
  { value: 'dc-east', label: 'DC-East' },
  { value: 'dc-west', label: 'DC-West' },
  { value: 'dc-central', label: 'DC-Central' }
];

export const STORAGE_NETAPP_CLUSTER_OPTIONS: StorageResourceOption[] = [
  { value: 'cluster-prod-01', label: 'cluster-prod-01', datacenter: 'dc-east' },
  { value: 'cluster-prod-02', label: 'cluster-prod-02', datacenter: 'dc-west' },
  { value: 'cluster-dr-01', label: 'cluster-dr-01', datacenter: 'dc-west' },
  { value: 'cluster-dev-01', label: 'cluster-dev-01', datacenter: 'dc-central' }
];

export const STORAGE_PURE_ARRAY_OPTIONS: StorageResourceOption[] = [
  { value: 'array-prod-01', label: 'array-prod-01', datacenter: 'dc-east' },
  { value: 'array-prod-02', label: 'array-prod-02', datacenter: 'dc-west' },
  { value: 'array-dr-01', label: 'array-dr-01', datacenter: 'dc-west' },
  { value: 'array-dev-01', label: 'array-dev-01', datacenter: 'dc-central' }
];

export const STORAGE_TIME_RANGE_OPTIONS: CustomDateRangeType[] = [
  { label: '24 Hours', value: 'last_24_hours' },
  { label: '7 Days', value: 'last_7_days' },
  { label: '30 Days', value: STORAGE_DEFAULT_TIME_RANGE },
  { label: '60 Days', value: 'last_60_days' },
  { label: '90 Days', value: 'last_90_days' }
];
