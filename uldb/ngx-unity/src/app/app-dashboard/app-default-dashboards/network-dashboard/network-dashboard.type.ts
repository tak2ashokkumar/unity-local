export interface NetworkDashboardDatacenterOption {
    location?: string;
    id: number;
    name: string;
    uuid?: string;
}

export interface NetworkDashboardFiltersResponse {
    datacenters: NetworkDashboardDatacenterOption[];
    time_range: string[];
}

export interface NetworkDashboardFilterCriteria {
    datacenterIds: number[];
    timeRange: string;
}

export interface NetworkOverview {
    device_availability?: Device_availability;
    discovered_devices?: number;
    monitored_devices?: number;
    device_types?: DeviceTypesItem[];
}

export interface NetworkOverviewResponse {
    result?: {
        data?: NetworkOverview;
    };
    data?: NetworkOverview;
    device_availability?: Device_availability;
    discovered_devices?: number;
    monitored_devices?: number;
    device_types?: DeviceTypesItem[];
}

interface Device_availability {
    percentage: number;
    online: number;
    total: number;
}

interface DeviceTypesItem {
    type: string;
    count: number;
    normal: number;
    critical: number;
    unknown: number;
}

export interface NetworkTopConversationMetricResponse {
    count?: number;
    time_range?: string;
    data?: NetworkTopConversationMetricApiItem[];
}

export interface NetworkTopBandwidthUsageResponse {
    count?: number;
    time_range?: string;
    data?: NetworkTopBandwidthUsageApiItem[];
}

export interface NetworkTopConversationsTableResponse {
    count?: number;
    time_range?: string;
    data?: NetworkTopConversationTableApiItem[];
}

export interface NetworkConversationMetricItem {
    conversation_name: string;
    value: number;
    display_value: string;
    category: string;
    color: string;
}

export interface NetworkBandwidthUsageItem {
    conversation_name: string;
    value: number;
    display_value: string;
    category: string;
    color: string;
}

export interface NetworkMetricLegendItem {
    label: string;
    category: string;
    color: string;
}

export interface NetworkTopConversationMetricApiItem {
    id?: string;
    name: string;
    device_type?: string;
    interface?: string;
    interface_index?: string;
    bits_received_bps?: number;
    bits_received?: NetworkValueWithUnit;
    bits_sent_bps?: number;
    bits_sent?: NetworkValueWithUnit;
}

export interface NetworkTopConversationTableApiItem {
    id?: string;
    name: string;
    device_type?: string;
    interface?: string;
    interface_index?: string;
    bits_received_bps?: number;
    bits_sent_bps?: number;
    speed_bps?: number;
    bits_received?: NetworkValueWithUnit;
    bits_sent?: NetworkValueWithUnit;
    interface_type: string;
    operational_status: string;
    speed?: NetworkValueWithUnit;
    bandwidth_usage?: number;
}

export interface NetworkTopBandwidthUsageApiItem {
    id?: string;
    name: string;
    device_type?: string;
    interface?: string;
    interface_index?: string;
    bits_received?: NetworkValueWithUnit;
    bits_sent?: NetworkValueWithUnit;
    speed?: NetworkValueWithUnit;
    bandwidth_usage?: number;
}

export interface NetworkValueWithUnit {
    value?: number;
    unit?: string;
}

export interface NetworkPerformanceInsightsTableResponse {
    count?: number;
    time_range?: string;
    data?: NetworkPerformanceInsightsTableApiItem[];
}

export interface NetworkPerformanceAxis {
    key?: string;
    label?: string;
    unit?: string;
}

export interface NetworkCpuVsMemoryPerformanceResponse {
    count?: number;
    time_range?: string;
    x_axis?: NetworkPerformanceAxis;
    y_axis?: NetworkPerformanceAxis;
    data?: NetworkCpuVsMemoryPerformanceApiItem[];
}

export interface NetworkTrafficInVsOutResponse {
    count?: number;
    time_range?: string;
    x_axis?: NetworkPerformanceAxis;
    y_axis?: NetworkPerformanceAxis;
    data?: NetworkTrafficInVsOutApiItem[];
}

export interface NetworkPerformanceInsightsTableApiItem {
    id?: string;
    device_name: string;
    device_type?: string;
    cpu_utilization?: number;
    memory_utilization?: number;
    traffic_in?: NetworkValueWithUnit;
    traffic_out?: NetworkValueWithUnit;
}

export interface NetworkCpuVsMemoryPerformanceApiItem {
    id?: string;
    device_name: string;
    device_type?: string;
    cpu_utilization?: number;
    memory_utilization?: number;
}

export interface NetworkTrafficInVsOutApiItem {
    id?: string;
    device_name: string;
    device_type?: string;
    traffic_in?: number;
    traffic_out?: number;
}

export interface NetworkPerformanceWorkloadInsightItem {
    device_name: string;
    cpu_utilization_percent: number;
    memory_utilization_percent: number;
    interface_traffic_in_mbps: number;
    interface_traffic_out_mbps: number;
}

export interface NetworkInterfaceHealthMetricItem {
  interface_name: string;
  device_name: string;
  errors_in_per_sec: number;
  errors_out_per_sec: number;
  discards_in_per_sec: number;
  discards_out_per_sec: number;
  metric_value?: number;
}

export interface NetworkInterfaceHealthMetricsTableResponse {
    count?: number;
    time_range?: string;
    data?: NetworkInterfaceHealthMetricsTableApiItem[];
}

export interface NetworkInterfaceHealthMetricChartResponse {
    count?: number;
    time_range?: string;
    unit?: string;
    data?: NetworkInterfaceHealthMetricChartApiItem[];
}

export interface NetworkInterfaceHealthMetricsTableApiItem {
    device_id?: string;
    device: string;
    device_type?: string;
    interface: string;
    interface_index?: string;
    errors_inbound?: number;
    errors_outbound?: number;
    discards_inbound?: number;
    discards_outbound?: number;
}

export interface NetworkInterfaceHealthMetricChartApiItem {
    device_id?: string;
    device: string;
    device_type?: string;
    interface: string;
    interface_index?: string;
    value?: number;
}

export interface NetworkDeviceAvailabilityItem {
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  location: string;
  uptime_days: number;
  availability_percent: number;
  status: 'healthy' | 'warning' | 'critical';
  health_state: 'up' | 'down' | 'unknown';
  last_discovered: string;
  device_count_weight: number;
}

export interface NetworkDeviceAvailabilityStatus {
    code?: 'healthy' | 'warning' | 'critical';
    label?: string;
}

export interface NetworkDeviceAvailabilityUptime {
    value?: number;
    unit?: string;
    display?: string;
    seconds?: number;
}

export interface NetworkDeviceAvailabilityTableResponse {
    count?: number;
    time_range?: string;
    data?: NetworkDeviceAvailabilityTableApiItem[];
}

export interface NetworkDeviceAvailabilityTableApiItem {
    id?: string;
    name: string;
    type?: string;
    manufacturer?: string;
    model?: string;
    location?: string;
    datacenter_id?: string;
    datacenter?: string;
    uptime?: NetworkDeviceAvailabilityUptime;
    availability?: number;
    status?: NetworkDeviceAvailabilityStatus;
    last_discovered?: string;
    monitored?: boolean;
}

export interface NetworkDeviceHealthDistributionResponse {
    time_range?: string;
    total?: number;
    data?: NetworkDeviceHealthDistributionApiItem[];
}

export interface NetworkDeviceHealthDistributionApiItem {
    status?: string;
    count?: number;
}

export interface NetworkDeviceTypeDistributionResponse {
    time_range?: string;
    total?: number;
    data?: NetworkDeviceTypeDistributionApiItem[];
}

export interface NetworkDeviceTypeDistributionApiItem {
    type?: string;
    count?: number;
    percentage?: number;
}

export interface NetworkManufacturerModelBreakdownResponse {
    time_range?: string;
    data?: NetworkManufacturerModelBreakdownApiItem[];
}

export interface NetworkManufacturerModelBreakdownApiItem {
    manufacturer?: string;
    count?: number;
    models?: NetworkManufacturerModelBreakdownModelApiItem[];
}

export interface NetworkManufacturerModelBreakdownModelApiItem {
    model?: string;
    count?: number;
}

export interface NetworkDevicesByLocationResponse {
    time_range?: string;
    total?: number;
    data?: NetworkDevicesByLocationApiItem[];
}

export interface NetworkDevicesByLocationApiItem {
    datacenter_id?: string;
    datacenter?: string;
    location?: string;
    count?: number;
}

export interface NetworkAverageUptimeByDeviceTypeResponse {
    time_range?: string;
    unit?: string;
    data?: NetworkAverageUptimeByDeviceTypeApiItem[];
}

export interface NetworkAverageUptimeByDeviceTypeApiItem {
    type?: string;
    average_uptime_days?: number;
    monitored_devices?: number;
}

export interface NetworkLowestAvailabilityResponse {
    count?: number;
    time_range?: string;
    data?: NetworkLowestAvailabilityApiItem[];
}

export interface NetworkLowestAvailabilityApiItem {
    id?: string;
    device?: string;
    device_type?: string;
    availability?: number;
    status?: NetworkDeviceAvailabilityStatus;
    location?: string;
    datacenter?: string;
}

export interface NetworkEnvironmentalHealthSummaryItem {
  device_name: string;
  device_type: string;
  power_supply_a_status: 'normal' | 'warning' | 'failed';
  power_supply_b_status: 'normal' | 'warning' | 'failed';
  fan_status_label: string;
  fan_status_tone: 'healthy' | 'warning' | 'critical';
  fan_healthy_count: number;
  fan_total_count: number;
  inlet_temp_c: number;
  outlet_temp_c: number;
  hotspot_temp_c: number;
}

export interface NetworkStatusCodeLabel {
    code?: 'healthy' | 'warning' | 'critical' | 'normal' | 'failed' | 'unknown';
    label?: string;
}

export interface NetworkTemperatureValue {
    value?: number;
    unit?: string;
    status?: NetworkStatusCodeLabel;
}

export interface NetworkEnvironmentalFanStatus {
    total?: number;
    healthy?: number;
    warning?: number;
    failed?: number;
    unknown?: number;
    status?: NetworkStatusCodeLabel;
    warning_fans?: any[];
    failed_fans?: any[];
}

export interface NetworkEnvironmentalHealthSummaryTableResponse {
    count?: number;
    time_range?: string;
    data?: NetworkEnvironmentalHealthSummaryTableApiItem[];
}

export interface NetworkEnvironmentalHealthSummaryTableApiItem {
    device_id?: string;
    device_name: string;
    device_type?: string;
    power_supply_a?: NetworkStatusCodeLabel;
    power_supply_b?: NetworkStatusCodeLabel;
    fan_status?: NetworkEnvironmentalFanStatus;
    inlet_temperature?: NetworkTemperatureValue;
    outlet_temperature?: NetworkTemperatureValue;
    hotspot_temperature?: NetworkTemperatureValue;
}

export interface NetworkEnvironmentalThresholds {
    warning?: number;
    critical?: number;
    unit?: string;
}

export interface NetworkTopDevicesByHotspotTemperatureResponse {
    count?: number;
    time_range?: string;
    thresholds?: NetworkEnvironmentalThresholds;
    data?: NetworkTopDevicesByHotspotTemperatureApiItem[];
}

export interface NetworkTopDevicesByHotspotTemperatureApiItem {
    device_id?: string;
    device_name: string;
    device_type?: string;
    temperature?: number;
    unit?: string;
    status?: NetworkStatusCodeLabel;
}

export interface NetworkAverageTemperatureBySensorTypeResponse {
    time_range?: string;
    data?: NetworkAverageTemperatureBySensorTypeApiItem[];
}

export interface NetworkAverageTemperatureBySensorTypeApiItem {
    sensor_type?: string;
    label?: string;
    average_temperature?: number;
    unit?: string;
    device_count?: number;
    warning_threshold?: number;
    critical_threshold?: number;
}

export interface NetworkPowerSupplyStatusDistributionResponse {
    time_range?: string;
    data?: NetworkPowerSupplyStatusDistributionApiItem[];
}

export interface NetworkPowerSupplyStatusDistributionApiItem {
    power_supply?: string;
    normal?: number;
    warning?: number;
    failed?: number;
    unknown?: number;
}

export interface NetworkFanHealthByDeviceResponse {
    count?: number;
    time_range?: string;
    data?: NetworkFanHealthByDeviceApiItem[];
}

export interface NetworkFanHealthByDeviceApiItem {
    device_id?: string;
    device_name: string;
    device_type?: string;
    healthy_fans?: number;
    warning_fans?: number;
    failed_fans?: number;
    unknown_fans?: number;
    total_fans?: number;
    display?: string;
    status?: NetworkStatusCodeLabel;
}

export interface NetworkAlertEventsSummaryResponse {
    time_range?: string;
    critical_alerts?: number;
    warning_alerts?: number;
    open_itsm_tickets?: number;
}

export interface NetworkAlertsBySeverityResponse {
    time_range?: string;
    total?: number;
    data?: NetworkAlertsBySeverityApiItem[];
}

export interface NetworkAlertsBySeverityApiItem {
    severity?: string;
    count?: number;
    percentage?: number;
}

export interface NetworkAlertsByDeviceTypeResponse {
    time_range?: string;
    data?: NetworkAlertsByDeviceTypeApiItem[];
}

export interface NetworkAlertsByDeviceTypeApiItem {
    device_type?: string;
    critical?: number;
    warning?: number;
    information?: number;
    total?: number;
}

export interface NetworkOpenItsmTicketsByDeviceTypeResponse {
    time_range?: string;
    total?: number;
    data?: NetworkOpenItsmTicketsByDeviceTypeApiItem[];
}

export interface NetworkOpenItsmTicketsByDeviceTypeApiItem {
    device_type?: string;
    count?: number;
}

export interface NetworkAlertStatsResponse {
    time_range?: string;
    event_processing?: NetworkAlertStatsSection;
    ticket_automation?: NetworkAlertStatsSection;
}

export interface NetworkAlertStatsSection {
    noise_reduction?: NetworkAlertStatsValueWithUnit;
    first_response?: NetworkAlertStatsValueWithUnit;
    dedupe_events?: number;
    suppressed_events?: number;
    correlated?: number;
    auto_cloned?: number;
    ticket_created?: number;
    auto_closed?: number;
}

export interface NetworkAlertStatsValueWithUnit {
    value?: number;
    unit?: string;
}

export interface NetworkTopCriticalAlertsResponse {
    count?: number;
    time_range?: string;
    data?: NetworkTopCriticalAlertApiItem[];
}

export interface NetworkTopCriticalAlertApiItem {
    id?: number;
    uuid?: string;
    device_name?: string;
    device_type?: string;
    severity?: NetworkStatusCodeLabel;
    description?: string;
    source?: string;
    acknowledged?: boolean;
    duration?: NetworkTopCriticalAlertDuration;
    first_event_datetime?: string;
}

export interface NetworkTopCriticalAlertDuration {
    seconds?: number;
    display?: string;
}

export interface NetworkAlertEventsView {
  summary_metrics: NetworkAlertSummaryMetricItem[];
  alerts_by_severity: NetworkAlertSeverityDistributionItem[];
  alerts_by_device_type: NetworkAlertByDeviceTypeItem[];
  open_itsm_tickets_by_device_type: NetworkAlertOpenItsmTicketItem[];
  alert_stats: NetworkAlertStatsCardItem[];
  top_critical_alerts: NetworkTopCriticalAlertItem[];
}

export interface NetworkAlertSummaryMetricItem {
  label: string;
  value: number;
  tone: 'critical' | 'warning' | 'info';
}

export interface NetworkAlertSeverityDistributionItem {
  severity: 'critical' | 'warning' | 'normal';
  count: number;
}

export interface NetworkAlertByDeviceTypeItem {
  device_type: string;
  critical: number;
  warning: number;
  info: number;
}

export interface NetworkAlertOpenItsmTicketItem {
  device_type: string;
  tickets: number;
}

export interface NetworkAlertStatsCardItem {
  title: string;
  highlight_value: string;
  metrics: NetworkAlertStatsMetricItem[];
}

export interface NetworkAlertStatsMetricItem {
  label: string;
  value: string;
}

export interface NetworkTopCriticalAlertItem {
  id: string;
  id_value: number;
  device_name: string;
  severity: 'critical' | 'warning';
  description: string;
  source: string;
  acknowledged: boolean;
  duration_display: string;
  duration_seconds: number;
}

export interface NetworkAutoRemediationSummary {
  time_range?: string;
  summary?: NetworkAutoRemediationSummaryMetrics;
  top_auto_remediations?: NetworkAutoRemediationActionItem[];
}

export interface NetworkAutoRemediationSummaryMetrics {
  total_runs?: number;
  success_percent?: number;
  failed_percent?: number;
  running_percent?: number;
  avg_duration?: string;
  auto_remediations?: number;
}

export interface NetworkAutoRemediationActionItem {
  action_name?: string;
  name?: string;
  label?: string;
  runs?: number;
  count?: number;
  value?: number;
  color?: string;
}
