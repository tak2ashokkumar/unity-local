// Custom Dashboard endpoints.
// TEMPORARY: kept inside this feature folder on purpose (agreed for the Custom Dashboard build).
// Move these into src/app/shared/api-endpoint.const.ts once the feature is finalised.

// Basics
export const CUSTOM_DASHBOARDS = () => `/customer/persona/analytics-dashboards/`;
export const CUSTOM_DASHBOARD_BY_ID = (uuid: string) => `/customer/persona/analytics-dashboards/${uuid}/`;

// Smart Panels
export const CUSTOM_DASHBOARD_PANELS = (uuid: string) => `/customer/persona/analytics-dashboards/${uuid}/panels/`;

// Review and Publish
export const CUSTOM_DASHBOARD_REVIEW = (uuid: string) => `/customer/persona/analytics-dashboards/${uuid}/review/`;
export const CUSTOM_DASHBOARD_PUBLISH = (uuid: string) => `/customer/persona/analytics-dashboards/${uuid}/publish/`;

// Metadata (Data Scope, Table / Chart data, Global Filters)
export const CUSTOM_DASHBOARD_SCOPES = () => `/customer/persona/analytics-dashboards/metadata/scopes/`;
export const CUSTOM_DASHBOARD_DEVICE_TYPES = () => `/customer/persona/analytics-dashboards/metadata/device-types/`;
export const CUSTOM_DASHBOARD_DEVICES = () => `/customer/persona/analytics-dashboards/metadata/devices/`;
export const CUSTOM_DASHBOARD_ITEMS = () => `/customer/persona/analytics-dashboards/metadata/items/`;
export const CUSTOM_DASHBOARD_HISTORY = () => `/customer/persona/analytics-dashboards/metadata/history/`;
export const CUSTOM_DASHBOARD_TABLE_DATA = () => `/customer/persona/analytics-dashboards/metadata/table-data/`;
export const CUSTOM_DASHBOARD_CHART_DATA = () => `/customer/persona/analytics-dashboards/metadata/chart-data/`;
export const CUSTOM_DASHBOARD_FILTER_OPTIONS = () => `/customer/persona/analytics-dashboards/metadata/filter-options/`;

// Public Cloud (Data Scope). The analytics metadata API does not list public cloud yet, so
// these are the existing UnityCloud > Public Cloud APIs. provider: aws | azure | gcp | oci.
export const CUSTOM_DASHBOARD_PUBLIC_CLOUD_ACCOUNTS = (provider: string) => `/customer/managed/${provider}/accounts/`;
export const CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCE_TYPES = (provider: string) => `/customer/managed/${provider}/accounts/resource_count_by_type/`;
export const CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCES = (provider: string) => `/customer/managed/${provider}/resources/`;
export const CUSTOM_DASHBOARD_PUBLIC_CLOUD_RESOURCE_ITEMS = (provider: string, uuid: string) => `/customer/managed/${provider}/resources/${uuid}/monitoring/items/`;
