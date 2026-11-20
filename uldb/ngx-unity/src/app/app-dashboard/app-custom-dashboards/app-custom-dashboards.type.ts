// Shapes follow the server contract for /customer/persona/analytics-dashboards/.
// Responses on review/publish also carry a `superset` object; the UI does not use it.

export interface CustomDashboard {
  uuid: string;
  name: string;
  description: string;
  categories: string[];
  roles: number[];
  specific_users: number[];
  refresh: boolean;
  refresh_interval_in_sec: number;
  timeframe: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  definition: CustomDashboardDefinition;
}

export interface CustomDashboardDefinition {
  panels?: CustomDashboardPanel[];
  global_filters?: CustomDashboardGlobalFilter[];
}

// Body for POST (create). PATCH sends the same fields plus expected_version.
export interface CustomDashboardBasics {
  name: string;
  description: string;
  categories: string[];
  roles: number[];
  specific_users: number[];
  refresh: boolean;
  refresh_interval_in_sec?: number;
  timeframe?: string;
}

export interface CustomDashboardBasicsUpdate extends CustomDashboardBasics {
  expected_version: number;
}

// One entry of the 400 body returned by POST {uuid}/publish/ ({ errors: [...] }).
export interface CustomDashboardPublishError {
  field: string;
  panel_id?: string;
  widget_id?: string;
  message: string;
}

// ---------- Smart Panels ----------

export interface CustomDashboardPanel extends CustomDashboardPanelConfiguration {
  id: string;
}

export interface CustomDashboardPanelConfiguration {
  title: string;
  width?: number;
  view_mode?: string;
  data_scope?: CustomDashboardDataScope;
  widgets?: CustomDashboardWidget[];
  table_columns?: CustomDashboardTableColumn[];
  filter_overrides?: { [key: string]: CustomDashboardFilterOverride };
}

export interface CustomDashboardDataScope {
  sources: CustomDashboardDataSource[];
}

export interface CustomDashboardDataSource {
  kind: string;
  device_type: string;
  scope_ids: string[];
  device_ids: string[];
  status: string;
}

export interface CustomDashboardWidget {
  id: string;
  chart_type?: string;
  variant?: string;
  metrics?: CustomDashboardMetric[];
}

export interface CustomDashboardTableColumn {
  id: string;
  header: string;
  sortable: boolean;
  hidden?: boolean;
  metric: CustomDashboardMetric;
}

export interface CustomDashboardMetric {
  device_type: string;
  device_id: string;
  item_id: number;
  aggregation: string;
  monitoring: CustomDashboardMetricMonitoring;
}

export interface CustomDashboardMetricMonitoring {
  instance_id: string;
  host_id: number;
}

export interface CustomDashboardFilterOverride {
  mode: string;
  value?: string[];
}

export interface CustomDashboardPanelOperation {
  expected_version: number;
  operation: string;
  configuration: CustomDashboardPanelConfiguration | { panel_ids: string[] } | {};
  panel_id?: string;
}

// ---------- Global Filters ----------

export interface CustomDashboardGlobalFilter {
  key: string;
  enabled: boolean;
  multi: boolean;
  scope_mode: string;
  targets?: string[];
  default_values: string[];
}

export interface CustomDashboardFilterOption {
  id: string;
  name: string;
}

export interface CustomDashboardFilterOptionGroup {
  key: string;
  available: boolean;
  reason: string;
  options: CustomDashboardFilterOption[];
}

export interface CustomDashboardFilterOptionsResponse {
  results: CustomDashboardFilterOptionGroup[];
}

// ---------- Dashboard view ----------

// One filter dropdown of the dashboard view: at the top (Whole dashboard) or on a panel
// (Specific panels, overriding the top one).
export interface CustomDashboardViewFilter {
  key: string;
  label: string;
  multi: boolean;
  options: CustomDashboardFilterOption[];
  defaultValues: string[];
}

export interface CustomDashboardFilterScopeSummary {
  primaryLabel: string;
  remainingLabels: string[];
}

// ---------- Review & Publish ----------

export interface CustomDashboardReview {
  dashboard: { uuid: string, name: string, status: string, version: number };
  panels: CustomDashboardPanel[];
  global_filters: CustomDashboardGlobalFilter[];
  ready: boolean;
  // The contract shows an empty list only; assumed to match the publish error entries.
  errors: CustomDashboardPublishError[];
  publishing: { available: boolean, reason: string };
}

// ---------- Metadata: Data Scope ----------

export interface CustomDashboardScopeRef {
  kind: string;
  id: string;
  name: string;
}

export interface CustomDashboardScope extends CustomDashboardScopeRef {
  parent: CustomDashboardScopeRef;
  provider: { id: string, name: string, source: string };
  available: boolean;
  device_catalog_available: boolean;
  device_catalog_reason: string;
}

export interface CustomDashboardScopesResponse {
  count: number;
  next: string;
  previous: string;
  results: CustomDashboardScope[];
  unsupported_integrations: string[];
}

export interface CustomDashboardDeviceType {
  device_type: string;
  inventory_device_type: string;
  category: string;
  available: boolean;
  reason: string;
  status: { available: boolean, source: string, values: string[], health_checked: boolean };
  // UI only: display name of a Public Cloud resource type (not in the metadata API).
  label?: string;
}

export interface CustomDashboardDeviceTypesResponse {
  results: CustomDashboardDeviceType[];
  unsupported_integrations: string[];
  other_categories_available: boolean;
}

export interface CustomDashboardDevice {
  device_type: string;
  device_id: string;
  name: string;
  category: string;
  status: string;
  status_source: string;
  monitoring_health: string;
  inventory_state: string;
  scope: CustomDashboardScopeRef;
  selected?: boolean;
}

export interface CustomDashboardItem {
  device_type: string;
  device_id: string;
  item_id: number;
  name: string;
  key: string;
  unit: string;
  value_type: number;
  enabled: boolean;
  supported: boolean;
  selectable: boolean;
  aggregations: string[];
  data_available: boolean;
  monitoring: CustomDashboardMetricMonitoring;
}

// Selected metric plus the labels the builder shows for it (labels are not saved).
// groupKey links the metric to the Data Scope metric it was expanded from.
export interface CustomDashboardMetricOption {
  key: string;
  metric: CustomDashboardMetric;
  deviceName: string;
  itemName: string;
  unit: string;
  aggregations: string[];
  groupKey?: string;
}

export interface CustomDashboardListResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

// ---------- Existing Public Cloud APIs (/customer/managed/<provider>/...) ----------

// accounts/?page_size=0 (fields used by the Data Scope only).
export interface CustomDashboardPublicCloudAccount {
  uuid: string;
  name: string;
}

// accounts/resource_count_by_type/ (Oracle sends display_name, the others displayname).
export interface CustomDashboardPublicCloudResourceType {
  id: number;
  name: string;
  service?: string;
  displayname?: string;
  display_name?: string;
  resource_count: number;
}

// resources/?resource_type=<id>&account_uuid=<uuid> (fields used by the Data Scope only).
export interface CustomDashboardPublicCloudResource {
  uuid: string;
  name: string;
  region?: string;
  resource_type: string;
  account_uuid: string;
  account_name?: string;
  monitoring?: { configured: boolean, enabled: boolean };
}

// resources/<uuid>/monitoring/items/ (Zabbix items of the resource).
export interface CustomDashboardPublicCloudItem {
  item_id: number | string;
  name: string;
  key: string;
  value_type: number | string;
}

// Every page of a paginated metadata list, read up to a page limit.
export interface CustomDashboardPagedResults<T> {
  results: T[];
  count: number;
  truncated: boolean;
}

// ---------- Data Scope builder view models (never sent to the server) ----------

// One provider group of the Data Source tree (Private Cloud: VMware, Nutanix, ...;
// Public Cloud: AWS, Azure, GCP, Oracle Cloud). Data Center scopes sit in a single group
// without a label.
export interface CustomDashboardScopeGroup {
  label: string;
  scopes: CustomDashboardScope[];
}

// One top-level node of the Data Source tree (Data Center / Private Cloud / Public Cloud).
export interface CustomDashboardSourceNode {
  kind: string;
  label: string;
  expanded: boolean;
  loading: boolean;
  groups: CustomDashboardScopeGroup[];
}

// A device type offered by at least one selected scope of a source kind.
export interface CustomDashboardDeviceTypeOption {
  key: string;
  kind: string;
  device_type: string;
  label: string;
  category: string;
  available: boolean;
  reason: string;
}

export interface CustomDashboardSelectedDeviceType {
  kind: string;
  device_type: string;
}

export interface CustomDashboardSelectedDevice {
  kind: string;
  device_type: string;
  device_id: string;
}

// The same monitoring item (device type + item key) across the selected devices.
// Moving it to Selected adds it for every selected device that reports it.
export interface CustomDashboardMetricGroup {
  key: string;
  device_type: string;
  itemKey: string;
  name: string;
  unit: string;
  value_type: number;
  aggregations: string[];
  selectable: boolean;
  dataAvailable: boolean;
  items: CustomDashboardItem[];
}

export interface CustomDashboardSelectedMetricGroup {
  key: string;
  device_type: string;
  name: string;
  unit: string;
  aggregation: string;
  aggregations: string[];
}

export interface CustomDashboardMetricCategory {
  device_type: string;
  label: string;
  count: number;
}

// Emitted by the Data Scope tab whenever its sources or resolved metrics change.
export interface CustomDashboardDataScopeChange {
  sources: CustomDashboardDataSource[];
  metrics: CustomDashboardMetricOption[];
  selectedCount: number;
  userChange: boolean;
}

// ---------- Metadata: Table / Chart data ----------

export interface CustomDashboardAppliedFilters {
  applied: { [key: string]: string[] };
  removed: number;
  timeframe: string;
}

export interface CustomDashboardChartPoint {
  clock: number;
  value: number;
}

export interface CustomDashboardChartSeries {
  item_id: number;
  name: string;
  key: string;
  unit: string;
  aggregation: string;
  device_type: string;
  device_id: string;
  data: CustomDashboardChartPoint[];
}

export interface CustomDashboardChartValue {
  item_id: number;
  name: string;
  unit: string;
  aggregation: string;
  device_type: string;
  device_id: string;
  value: number;
}

// line / area / bar return `series`; pie / treemap / single return `data`.
export interface CustomDashboardChartData {
  chart_type: string;
  variant: string;
  timeframe: string;
  points: number;
  bucket_seconds: number;
  series?: CustomDashboardChartSeries[];
  data?: CustomDashboardChartValue[];
  filters: CustomDashboardAppliedFilters;
}

export interface CustomDashboardTableDataColumn {
  id: string;
  header: string;
  sortable: boolean;
  hidden: boolean;
  item_name: string;
  item_key: string;
  unit: string;
  aggregation: string;
  device_type: string;
  device_id: string;
  numeric: boolean;
}

// Each row is [clock, value of column 1, value of column 2, ...].
export interface CustomDashboardTableData {
  timeframe: string;
  points: number;
  bucket_seconds: number;
  columns: CustomDashboardTableDataColumn[];
  rows: number[][];
  filters: CustomDashboardAppliedFilters;
}
