import {
  AlertByDeviceTypeApiResponse,
  AlertSegregationApiResponse,
  AlertWidgetApiResponse,
  DashboardFilters,
  DashboardFiltersApiResponse,
  DashboardHeaderApiResponse,
  EventAlertAnalyticsApiResponse,
  EventByDeviceTypeApiResponse,
  ExecutiveSummaryApiResponse,
  IncidentTicketApiResponse,
  ItsmTicketViewApiResponse,
  NoisyEventsApiResponse,
  NoisyHostsApiResponse,
  PipelineApiResponse,
  SelectOption,
  TrendByTimelineApiResponse
} from './event-analytics-dashboard.type';

export const EVENT_ANALYTICS_TOP_HEADER_ENDPOINT = '/customer/persona/event-analytics-dashboard/dashboard-header/';
export const EVENT_ANALYTICS_DASHBOARD_FILTERS_ENDPOINT = '/customer/persona/event-analytics-dashboard/dashboard-filters/';
export const EVENT_ANALYTICS_SUMMARY_ENDPOINT = '/customer/persona/event-analytics-dashboard/executive-summary/';
export const EVENT_ANALYTICS_PIPELINE_ENDPOINT = '/customer/persona/event-analytics-dashboard/cumulative-reduction/';
export const EVENT_ANALYTICS_EVENT_BY_DEVICE_CATEGORY_ENDPOINT = '/customer/persona/event-analytics-dashboard/event-by-device-type/';
export const EVENT_ANALYTICS_ALERT_GENERATED_ENDPOINT = '/customer/persona/event-analytics-dashboard/alert-generated/';
export const EVENT_ANALYTICS_ALERT_STATUS_ENDPOINT = '/customer/persona/event-analytics-dashboard/alert-status/';
export const EVENT_ANALYTICS_TREND_BY_TIMELINE_ENDPOINT = '/customer/persona/event-analytics-dashboard/trend-by-timeline/';
export const EVENT_ANALYTICS_ALERT_BY_DEVICE_TYPE_ENDPOINT = '/customer/persona/event-analytics-dashboard/alert-by-device-type/';
export const EVENT_ANALYTICS_ALERT_SEGREGATION_ENDPOINT = '/customer/persona/event-analytics-dashboard/alert-segregation-by-type/';
export const EVENT_ANALYTICS_EVENT_ALERT_ANALYTICS_ENDPOINT = '/customer/persona/event-analytics-dashboard/event-alert-analytics/';
export const EVENT_ANALYTICS_OPEN_INCIDENTS_ENDPOINT = '/customer/persona/event-analytics-dashboard/open-incident-tickets/';
export const EVENT_ANALYTICS_RESOLVED_INCIDENTS_ENDPOINT = '/customer/persona/event-analytics-dashboard/resolved-incident-tickets/';
export const EVENT_ANALYTICS_NOISY_EVENTS_ENDPOINT = '/customer/persona/event-analytics-dashboard/noisy-events/';
export const EVENT_ANALYTICS_NOISY_HOSTS_ENDPOINT = '/customer/persona/event-analytics-dashboard/noisy-hosts/';
export const EVENT_ANALYTICS_ITSM_TICKET_VIEW_ENDPOINT = '/customer/persona/event-analytics-dashboard/itsm-ticket-view/';

export const EVENT_ANALYTICS_STATUS_COLORS: Record<string, string> = {
  critical: '#d90000',
  warning: '#ff8a00',
  information: '#2f80d1',
  info: '#2f80d1',
  open: '#2f80d1',
  correlated: '#54c69a',
  suppressed: '#88bde6',
  ticketed: '#d62828',
  closed: '#00ad73'
};

export const EVENT_ANALYTICS_DONUT_COLORS = [
  '#38c2a4',
  '#ef7aa9',
  '#5b8dee',
  '#f4bf4f',
  '#6951c8',
  '#4fbf8d',
  '#315fbd',
  '#ff8a00',
  '#58b8d8',
  '#7a61cf',
  '#74c476',
  '#3aa1c8',
  '#95a0aa'
];

export const EVENT_ANALYTICS_ITSM_PRIORITY_COLORS = ['#f28c38', '#7c61d1', '#e24c4b', '#4f8ed8', '#8dbb45'];
export const EVENT_ANALYTICS_ITSM_STATUS_COLORS = ['#77d353', '#f28c38', '#4f8ed8', '#7c61d1', '#e24c4b'];
export const EVENT_ANALYTICS_ITSM_RESPONSE_TIME_COLORS = ['#77d353', '#4f8ed8', '#f28c38', '#d0d5da'];

export const EVENT_ANALYTICS_CATEGORY_COLOR_MAP: Record<string, string> = {
  application: '#458bd4',
  baremetal: '#64cfc1',
  baremetal_servers: '#64cfc1',
  container: '#7b61d0',
  containers: '#7b61d0',
  database: '#f0c24f',
  gpu: '#64b6e8',
  network: '#4a86d8',
  private_cloud_compute: '#6951c8',
  public_cloud_compute: '#7e68d5',
  platform_services: '#39b7a5',
  sd_wan: '#f39a2f',
  sensors: '#2f80d1',
  storage: '#5cc0d0',
  others: '#95a0aa'
};

export const EVENT_ALERT_ANALYTICS_NODE_IMAGE_MAP: Record<string, string> = {
  unityonecloud: '',
  logicmonitor: '',
  opsramp: '',
  dynatrace: '',
  newrelic: ''
};

export const EVENT_ANALYTICS_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All' },
  { value: 'application', label: 'Application' },
  { value: 'baremetal', label: 'Baremetal Servers' },
  { value: 'container', label: 'Container' },
  { value: 'database', label: 'Database' },
  { value: 'gpu', label: 'GPU' },
  { value: 'network', label: 'Network' },
  { value: 'private_cloud_compute', label: 'Private Cloud Compute' },
  { value: 'public_cloud_compute', label: 'Public Cloud Compute' },
  { value: 'platform_services', label: 'Platform Services' },
  { value: 'sd_wan', label: 'SD-WAN' },
  { value: 'sensors', label: 'Sensors' },
  { value: 'storage', label: 'Storage' },
  { value: 'others', label: 'Others' }
];

export const EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'alerts', label: 'Alerts' },
  { value: 'conditions', label: 'Conditions' },
  { value: 'events', label: 'Events' }
];

export const EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE = 'custom';

export const EVENT_ANALYTICS_TIME_RANGE_OPTIONS: SelectOption[] = [
  // { value: 'last_hour', label: '1 Hour' },
  { value: 'last_24_hours', label: '24 Hour' },
  { value: 'last_week', label: '7 Days' },
  { value: 'last_month', label: '30 Days' },
  { value: 'last_60_days', label: '60 Days' },
  { value: 'last_quarter', label: '90 Days' },
  { value: EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE, label: 'Custom' }
];

export const DASHBOARD_FILTERS_DUMMY: DashboardFilters = {
  timeRange: EVENT_ANALYTICS_TIME_RANGE_OPTIONS,
  trendTimeline: EVENT_ANALYTICS_TIME_RANGE_OPTIONS,
  category: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  eventDeviceCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  alertSegregationCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  analyticsViewBy: [
    { value: 'source', label: 'Source' },
    { value: 'severity', label: 'Severity' }
  ],
  analyticsSourceType: [
    { value: 'all_source', label: 'All Source' },
    { value: 'unity', label: 'Unity' },
    { value: 'azure', label: 'Azure' },
    { value: 'nagios', label: 'Nagios' },
    { value: 'zabbix', label: 'Zabbix' },
    { value: 'aws_cloudwatch', label: 'AWS CloudWatch' },
    { value: 'logicmonitor', label: 'LogicMonitor' },
    { value: 'opsramp', label: 'OpsRamp' },
    { value: 'appdynamics', label: 'AppDynamics' }
  ],
  analyticsSeverityType: [
    { value: 'all_severity', label: 'All Severity' },
    { value: 'critical', label: 'Critical' },
    { value: 'warning', label: 'Warning' },
    { value: 'information', label: 'Information' }
  ],
  analyticsDatacenter: [
    { value: 'all_datacenter', label: 'All Datacenter' },
    { value: 'dc-east', label: 'DC East' },
    { value: 'dc-west', label: 'DC West' }
  ],
  analyticsCloud: [
    { value: 'all_cloud', label: 'All Cloud' },
    { value: 'private_cloud', label: 'Private Cloud' },
    { value: 'public_cloud', label: 'Public Cloud' }
  ],
  analyticsCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  eventAndAlertTimeline: EVENT_ANALYTICS_TIME_RANGE_OPTIONS,
  noisyEventsCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  noisyHostsCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  incidentCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS
};

export const DASHBOARD_HEADER_API_DUMMY: DashboardHeaderApiResponse = {
  lastRefreshed: 'Today 00:06 IST',
  scope: {
    sources: 'All sources (12)',
    deviceTypes: 'All device types (16)'
  },
  activeSources: ['Unity', 'Azure', 'Nagios', 'Oci', 'Zabbix', 'Gcp', 'Aws', 'Opsramp', 'LogicMonitor', 'AppDynamics', 'Custom', 'Email']
};

export const DASHBOARD_TOP_FILTERS_API_DUMMY: DashboardFiltersApiResponse = {
  source: [
    { value: 'unity', label: 'Unity' },
    { value: 'azure', label: 'Azure' },
    { value: 'nagios', label: 'Nagios' },
    { value: 'oci', label: 'Oci' },
    { value: 'zabbix', label: 'Zabbix' },
    { value: 'gcp', label: 'Gcp' },
    { value: 'aws', label: 'Aws' },
    { value: 'opsramp', label: 'Opsramp' },
    { value: 'logicmonitor', label: 'LogicMonitor' },
    { value: 'appdynamics', label: 'AppDynamics' },
    { value: 'custom', label: 'Custom' },
    { value: 'email', label: 'Email' },
    // { value: 'dynatrace', label: 'Dynatrace' },
    // { value: 'solarwinds', label: 'SolarWinds' },
    // { value: 'vmware', label: 'VMware' },
    // { value: 'splunk', label: 'Splunk' },
  ],
  timeRange: [
    // { value: 'last_hour', label: 'Last Hour' },
    { value: 'last_24_hours', label: 'Last 24 Hours' },
    { value: 'last_week', label: 'Last 7 Days' },
    { value: 'last_month', label: 'Last 30 Days' },
    { value: 'last_60_days', label: 'Last 60 Days' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'custom', label: 'Custom' }
  ],
  deviceType: [
    { value: 'Firewall', label: 'Firewall' },
    { value: 'Load Balancer', label: 'Load Balancer' },
    { value: 'Switch', label: 'Switch' },
    { value: 'Hypervisor', label: 'Hypervisor' },
    { value: 'Virtual Machine', label: 'Virtual Machine' },
    { value: 'Storage', label: 'Storage' },
    { value: 'Cloud Controller', label: 'Cloud Controller' },
    { value: 'BM Server', label: 'BM Server' },
    { value: 'Cabinet', label: 'Cabinet' },
    { value: 'PDU', label: 'PDU' },
    { value: 'Mac Device', label: 'Mac Device' }
  ]
};

export const EXECUTIVE_SUMMARY_API_DUMMY: ExecutiveSummaryApiResponse = {
  totalInferenceAlerts: 318133,
  events: 663345,
  alerts: 318133,
  conditions: 135017,
  cumulativeReduction: 52.04,
  severity: {
    information: 2109,
    critical: 42051,
    warning: 90857
  },
  noiseReduction: 52.04,
  correlationReduction: 57.56
};

export const PIPELINE_API_DUMMY: PipelineApiResponse = {
  funnel: [
    { stage: 'Events', label: 'Raw Events', count: 663345, kpi: null },
    { stage: 'Alerts', label: 'Noise Reduction', count: 318133, kpi: '52.04%' },
    { stage: 'Conditions', label: 'Correlation %', count: 135017, kpi: '57.56%' }
  ],
  kpis: {
    rawEvents: 663345,
    noiseReduction: '52.04%',
    correlationPct: '57.56%'
  }
};

export const EVENT_BY_DEVICE_TYPE_API_DUMMY: EventByDeviceTypeApiResponse = {
  donut: [
    { key: 'storage', label: 'Storage', count: 991 },
    { key: 'sensors', label: 'Sensors', count: 862 },
    { key: 'sd_wan', label: 'SD-WAN', count: 804 },
    { key: 'platform_services', label: 'Platform Services', count: 798 },
    { key: 'public_cloud_compute', label: 'Public Cloud Compute', count: 708 },
    { key: 'private_cloud_compute', label: 'Private Cloud Compute', count: 580 },
    { key: 'network', label: 'Network', count: 463 },
    { key: 'gpu', label: 'GPU', count: 309 },
    { key: 'database', label: 'Database', count: 297 },
    { key: 'containers', label: 'Container', count: 192 },
    { key: 'baremetal_servers', label: 'Baremetals', count: 80 },
    { key: 'application', label: 'Application', count: 2 },
    { key: 'others', label: 'Others', count: 0 }
  ],
  tiles: [
    { key: 'application', label: 'Application', count: 2 },
    { key: 'baremetal_servers', label: 'Baremetals', count: 80 },
    { key: 'containers', label: 'Container', count: 192 },
    { key: 'database', label: 'Database', count: 297 },
    { key: 'gpu', label: 'GPU', count: 309 },
    { key: 'network', label: 'Network', count: 463 },
    { key: 'private_cloud_compute', label: 'Private Cloud Compute', count: 580 },
    { key: 'public_cloud_compute', label: 'Public Cloud Compute', count: 708 },
    { key: 'platform_services', label: 'Platform Services', count: 798 },
    { key: 'sd_wan', label: 'SD-WAN', count: 804 },
    { key: 'sensors', label: 'Sensors', count: 862 },
    { key: 'storage', label: 'Storage', count: 991 },
    { key: 'others', label: 'Others', count: 0 }
  ],
  total: 6086,
  activeCategory: 'all',
  categoryOptions: [
    { value: 'all', label: 'All' },
    { value: 'application', label: 'Application' },
    { value: 'baremetal_servers', label: 'Baremetals' },
    { value: 'containers', label: 'Container' },
    { value: 'database', label: 'Database' },
    { value: 'gpu', label: 'GPU' },
    { value: 'network', label: 'Network' },
    { value: 'others', label: 'Others' },
    { value: 'private_cloud_compute', label: 'Private Cloud Compute' },
    { value: 'public_cloud_compute', label: 'Public Cloud Compute' },
    { value: 'platform_services', label: 'Platform Services' },
    { value: 'sensors', label: 'Sensors' },
    { value: 'storage', label: 'Storage' }
  ]
};

export const ALERT_GENERATED_DUMMY: AlertWidgetApiResponse = {
  kpis: [
    { key: 'open', label: 'Open', value: 33472, tone: 'primary' },
    { key: 'correlated', label: 'Correlated', value: 31751, tone: 'success' },
    { key: 'suppressed', label: 'Suppressed', value: 1721, tone: 'info' },
    { key: 'ticketed', label: 'Ticketed', value: 293, tone: 'danger' },
    { key: 'closed', label: 'Closed', value: 31585, tone: 'success' }
  ],
  donut: [
    { key: 'open', label: 'Open', value: 33472, tone: 'primary' },
    { key: 'correlated', label: 'Correlated', value: 31751, tone: 'success' },
    { key: 'suppressed', label: 'Suppressed', value: 1721, tone: 'info' },
    { key: 'ticketed', label: 'Ticketed', value: 293, tone: 'danger' },
    { key: 'closed', label: 'Closed', value: 31585, tone: 'success' }
  ]
};

export const ALERT_STATUS_DUMMY: AlertWidgetApiResponse = {
  kpis: [
    { key: 'critical', label: 'Critical', value: 602, tone: 'danger' },
    { key: 'warning', label: 'Warning', value: 31547, tone: 'warning' },
    { key: 'information', label: 'Success', value: 1323, tone: 'success' }
  ],
  donut: [
    { key: 'critical', label: 'Critical', value: 602 },
    { key: 'warning', label: 'Warning', value: 31547 },
    { key: 'information', label: 'Info', value: 1323 }
  ]
};

export const TREND_BY_TIMELINE_API_DUMMY: TrendByTimelineApiResponse = {
  series: {
    alerts: [
      { start_time: '06/21/2026, 09:15:25', end_time: '06/22/2026, 09:15:25', count: 609 },
      { start_time: '06/22/2026, 09:15:25', end_time: '06/23/2026, 09:15:25', count: 1320 },
      { start_time: '06/23/2026, 09:15:25', end_time: '06/24/2026, 09:15:25', count: 1571 },
      { start_time: '06/24/2026, 09:15:25', end_time: '06/25/2026, 09:15:25', count: 1607 },
      { start_time: '06/25/2026, 09:15:25', end_time: '06/26/2026, 09:15:25', count: 1540 },
      { start_time: '06/26/2026, 09:15:25', end_time: '06/27/2026, 09:15:25', count: 1144 },
      { start_time: '06/27/2026, 09:15:25', end_time: '06/28/2026, 09:15:25', count: 1324 },
      { start_time: '06/28/2026, 09:15:25', end_time: '06/29/2026, 09:15:25', count: 1515 },
      { start_time: '06/29/2026, 09:15:25', end_time: '06/30/2026, 09:15:25', count: 2252 },
      { start_time: '06/30/2026, 09:15:25', end_time: '07/01/2026, 09:15:25', count: 1428 },
      { start_time: '07/01/2026, 09:15:25', end_time: '07/02/2026, 09:15:25', count: 1389 },
      { start_time: '07/02/2026, 09:15:25', end_time: '07/03/2026, 09:15:25', count: 1304 },
      { start_time: '07/03/2026, 09:15:25', end_time: '07/04/2026, 09:15:25', count: 969 },
      { start_time: '07/04/2026, 09:15:25', end_time: '07/05/2026, 09:15:25', count: 806 },
      { start_time: '07/05/2026, 09:15:25', end_time: '07/06/2026, 09:15:25', count: 1075 },
      { start_time: '07/06/2026, 09:15:25', end_time: '07/07/2026, 09:15:25', count: 1263 },
      { start_time: '07/07/2026, 09:15:25', end_time: '07/08/2026, 09:15:25', count: 1248 },
      { start_time: '07/08/2026, 09:15:25', end_time: '07/09/2026, 09:15:25', count: 1226 },
      { start_time: '07/09/2026, 09:15:25', end_time: '07/10/2026, 09:15:25', count: 1153 },
      { start_time: '07/10/2026, 09:15:25', end_time: '07/11/2026, 09:15:25', count: 828 },
      { start_time: '07/11/2026, 09:15:25', end_time: '07/12/2026, 09:15:25', count: 701 },
      { start_time: '07/12/2026, 09:15:25', end_time: '07/13/2026, 09:15:25', count: 647 },
      { start_time: '07/13/2026, 09:15:25', end_time: '07/14/2026, 09:15:25', count: 1152 },
      { start_time: '07/14/2026, 09:15:25', end_time: '07/15/2026, 09:15:25', count: 963 },
      { start_time: '07/15/2026, 09:15:25', end_time: '07/16/2026, 09:15:25', count: 1472 },
      { start_time: '07/16/2026, 09:15:25', end_time: '07/17/2026, 09:15:25', count: 485 },
      { start_time: '07/17/2026, 09:15:25', end_time: '07/18/2026, 09:15:25', count: 0 },
      { start_time: '07/18/2026, 09:15:25', end_time: '07/19/2026, 09:15:25', count: 0 },
      { start_time: '07/19/2026, 09:15:25', end_time: '07/20/2026, 09:15:25', count: 761 },
      { start_time: '07/20/2026, 09:15:25', end_time: '07/21/2026, 09:15:25', count: 1077 }
    ],
    conditions: [
      { start_time: '06/21/2026, 09:15:26', end_time: '06/22/2026, 09:15:26', count: 587 },
      { start_time: '06/22/2026, 09:15:26', end_time: '06/23/2026, 09:15:26', count: 1274 },
      { start_time: '06/23/2026, 09:15:26', end_time: '06/24/2026, 09:15:26', count: 1512 },
      { start_time: '06/24/2026, 09:15:26', end_time: '06/25/2026, 09:15:26', count: 1548 },
      { start_time: '06/25/2026, 09:15:26', end_time: '06/26/2026, 09:15:26', count: 1485 },
      { start_time: '06/26/2026, 09:15:26', end_time: '06/27/2026, 09:15:26', count: 1106 },
      { start_time: '06/27/2026, 09:15:26', end_time: '06/28/2026, 09:15:26', count: 1272 },
      { start_time: '06/28/2026, 09:15:26', end_time: '06/29/2026, 09:15:26', count: 1394 },
      { start_time: '06/29/2026, 09:15:26', end_time: '06/30/2026, 09:15:26', count: 2214 },
      { start_time: '06/30/2026, 09:15:26', end_time: '07/01/2026, 09:15:26', count: 1370 },
      { start_time: '07/01/2026, 09:15:26', end_time: '07/02/2026, 09:15:26', count: 1355 },
      { start_time: '07/02/2026, 09:15:26', end_time: '07/03/2026, 09:15:26', count: 1244 },
      { start_time: '07/03/2026, 09:15:26', end_time: '07/04/2026, 09:15:26', count: 909 },
      { start_time: '07/04/2026, 09:15:26', end_time: '07/05/2026, 09:15:26', count: 760 },
      { start_time: '07/05/2026, 09:15:26', end_time: '07/06/2026, 09:15:26', count: 1001 },
      { start_time: '07/06/2026, 09:15:26', end_time: '07/07/2026, 09:15:26', count: 1179 },
      { start_time: '07/07/2026, 09:15:26', end_time: '07/08/2026, 09:15:26', count: 1107 },
      { start_time: '07/08/2026, 09:15:26', end_time: '07/09/2026, 09:15:26', count: 1124 },
      { start_time: '07/09/2026, 09:15:26', end_time: '07/10/2026, 09:15:26', count: 1102 },
      { start_time: '07/10/2026, 09:15:26', end_time: '07/11/2026, 09:15:26', count: 784 },
      { start_time: '07/11/2026, 09:15:26', end_time: '07/12/2026, 09:15:26', count: 650 },
      { start_time: '07/12/2026, 09:15:26', end_time: '07/13/2026, 09:15:26', count: 607 },
      { start_time: '07/13/2026, 09:15:26', end_time: '07/14/2026, 09:15:26', count: 1083 },
      { start_time: '07/14/2026, 09:15:26', end_time: '07/15/2026, 09:15:26', count: 909 },
      { start_time: '07/15/2026, 09:15:26', end_time: '07/16/2026, 09:15:26', count: 1399 },
      { start_time: '07/16/2026, 09:15:26', end_time: '07/17/2026, 09:15:26', count: 464 },
      { start_time: '07/17/2026, 09:15:26', end_time: '07/18/2026, 09:15:26', count: 0 },
      { start_time: '07/18/2026, 09:15:26', end_time: '07/19/2026, 09:15:26', count: 0 },
      { start_time: '07/19/2026, 09:15:26', end_time: '07/20/2026, 09:15:26', count: 703 },
      { start_time: '07/20/2026, 09:15:26', end_time: '07/21/2026, 09:15:26', count: 1001 }
    ],
    events: [
      { start_time: '06/21/2026, 09:15:24', end_time: '06/22/2026, 09:15:24', count: 707 },
      { start_time: '06/22/2026, 09:15:24', end_time: '06/23/2026, 09:15:24', count: 1437 },
      { start_time: '06/23/2026, 09:15:24', end_time: '06/24/2026, 09:15:24', count: 1713 },
      { start_time: '06/24/2026, 09:15:24', end_time: '06/25/2026, 09:15:24', count: 1734 },
      { start_time: '06/25/2026, 09:15:24', end_time: '06/26/2026, 09:15:24', count: 1682 },
      { start_time: '06/26/2026, 09:15:24', end_time: '06/27/2026, 09:15:24', count: 1219 },
      { start_time: '06/27/2026, 09:15:24', end_time: '06/28/2026, 09:15:24', count: 1392 },
      { start_time: '06/28/2026, 09:15:24', end_time: '06/29/2026, 09:15:24', count: 1058 },
      { start_time: '06/29/2026, 09:15:24', end_time: '06/30/2026, 09:15:24', count: 1953 },
      { start_time: '06/30/2026, 09:15:24', end_time: '07/01/2026, 09:15:24', count: 1914 },
      { start_time: '07/01/2026, 09:15:24', end_time: '07/02/2026, 09:15:24', count: 1706 },
      { start_time: '07/02/2026, 09:15:24', end_time: '07/03/2026, 09:15:24', count: 1427 },
      { start_time: '07/03/2026, 09:15:24', end_time: '07/04/2026, 09:15:24', count: 1028 },
      { start_time: '07/04/2026, 09:15:24', end_time: '07/05/2026, 09:15:24', count: 846 },
      { start_time: '07/05/2026, 09:15:24', end_time: '07/06/2026, 09:15:24', count: 1092 },
      { start_time: '07/06/2026, 09:15:24', end_time: '07/07/2026, 09:15:24', count: 1301 },
      { start_time: '07/07/2026, 09:15:24', end_time: '07/08/2026, 09:15:24', count: 1283 },
      { start_time: '07/08/2026, 09:15:24', end_time: '07/09/2026, 09:15:24', count: 1259 },
      { start_time: '07/09/2026, 09:15:24', end_time: '07/10/2026, 09:15:24', count: 1191 },
      { start_time: '07/10/2026, 09:15:24', end_time: '07/11/2026, 09:15:24', count: 850 },
      { start_time: '07/11/2026, 09:15:24', end_time: '07/12/2026, 09:15:24', count: 727 },
      { start_time: '07/12/2026, 09:15:24', end_time: '07/13/2026, 09:15:24', count: 666 },
      { start_time: '07/13/2026, 09:15:24', end_time: '07/14/2026, 09:15:24', count: 1198 },
      { start_time: '07/14/2026, 09:15:24', end_time: '07/15/2026, 09:15:24', count: 1000 },
      { start_time: '07/15/2026, 09:15:24', end_time: '07/16/2026, 09:15:24', count: 1539 },
      { start_time: '07/16/2026, 09:15:24', end_time: '07/17/2026, 09:15:24', count: 1021 },
      { start_time: '07/17/2026, 09:15:24', end_time: '07/18/2026, 09:15:24', count: 767 },
      { start_time: '07/18/2026, 09:15:24', end_time: '07/19/2026, 09:15:24', count: 785 },
      { start_time: '07/19/2026, 09:15:24', end_time: '07/20/2026, 09:15:24', count: 861 },
      { start_time: '07/20/2026, 09:15:24', end_time: '07/21/2026, 09:15:24', count: 1121 }
    ]
  },
  entityTypeOptions: [
    { value: 'all', label: 'All' },
    { value: 'event', label: 'Events' },
    { value: 'alert', label: 'Alerts' },
    { value: 'condition', label: 'Conditions' }
  ],
  activeEntityType: 'all',
  granularity: 'daily',
  activeTimeRange: 'last_month',
  timeRangeOptions: [
    { value: 'last_24_hours', label: 'Last 24 Hours' },
    { value: 'last_week', label: 'Last 7 Days' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_60_days', label: 'Last 60 Days' },
    { value: 'last_quarter', label: 'Last Quarter' }
  ],
};

export const ALERT_SEGREGATION_API_DUMMY: AlertSegregationApiResponse = {
  totalCritical: 544,
  totalWarning: 31547,
  totalInfo: 1323,
  bars: [
    { key: 'application', label: 'Application', critical: 0, warning: 0, information: 0 },
    { key: 'baremetal_servers', label: 'Baremetals', critical: 44, warning: 2527, information: 3 },
    { key: 'containers', label: 'Container', critical: 0, warning: 0, information: 0 },
    { key: 'database', label: 'Database', critical: 76, warning: 9316, information: 98 },
    { key: 'gpu', label: 'GPU', critical: 0, warning: 0, information: 0 },
    { key: 'network', label: 'Network', critical: 0, warning: 0, information: 0 },
    { key: 'others', label: 'Others', critical: 0, warning: 0, information: 0 },
    { key: 'private_cloud_compute', label: 'Private Cloud Compute', critical: 424, warning: 19704, information: 1222 },
    { key: 'public_cloud_compute', label: 'Public Cloud Compute', critical: 0, warning: 0, information: 0 },
    { key: 'platform_services', label: 'Platform Services', critical: 0, warning: 0, information: 0 },
    { key: 'sd_wan', label: 'SD-WAN', critical: 0, warning: 0, information: 0 },
    { key: 'sensors', label: 'Sensors', critical: 0, warning: 0, information: 0 },
    { key: 'storage', label: 'Storage', critical: 0, warning: 0, information: 0 }
  ],
  activeCategory: 'all',
  categoryOptions: [
    { value: 'all', label: 'All' },
    { value: 'application', label: 'Application' },
    { value: 'baremetal_servers', label: 'Baremetals' },
    { value: 'containers', label: 'Container' },
    { value: 'database', label: 'Database' },
    { value: 'gpu', label: 'GPU' },
    { value: 'network', label: 'Network' },
    { value: 'others', label: 'Others' },
    { value: 'private_cloud_compute', label: 'Private Cloud Compute' },
    { value: 'public_cloud_compute', label: 'Public Cloud Compute' },
    { value: 'platform_services', label: 'Platform Services' },
    { value: 'sd_wan', label: 'SD-WAN' },
    { value: 'sensors', label: 'Sensors' },
    { value: 'storage', label: 'Storage' }
  ]
};

export const EVENT_ALERT_ANALYTICS_API_DUMMY: EventAlertAnalyticsApiResponse = {
  viewBy: 'source',
  total: 33472,
  rows: [
    { information: 1323, label: 'Unity', critical: 602, key: 'unity', total: 33472, warning: 31547 }
  ],  
  viewOptions: [
    { value: 'source', label: 'View By Source' },
    { value: 'severity', label: 'View By Severity' }
  ],
  sourceOptions: DASHBOARD_FILTERS_DUMMY.analyticsSourceType,
  severityOptions: DASHBOARD_FILTERS_DUMMY.analyticsSeverityType,
  datacenterOptions: DASHBOARD_FILTERS_DUMMY.analyticsDatacenter,
  cloudOptions: DASHBOARD_FILTERS_DUMMY.analyticsCloud,
  kpis: {
    mttr: '81 min 7 Sec',
    mtta: '0 min 0 Sec',
    noiseReduction: '9.9%',
    correlation: '5.1%',
    cumulativeReduction: '14.5%'
  },
  flow: {
    sources: [
      { name: 'Unity', eventCount: 37148 }
    ],
    resolved: 31585,
    autoRemediated: 0,
    ticketGenerated: 293,
    dedupeEvents: 149,
    open: 166,
    suppressedEvents: 3527,
    autoHealed: 31299,
    alerts: 33472,
    acknowledged: 0,
    noTicketGenerated: 31458,
    conditions: 31751,
    events: 37148
  }, 
  categoryOptions: [
    { value: 'all', label: 'All' },
    { value: 'application', label: 'Application' },
    { value: 'baremetal_servers', label: 'Baremetals' },
    { value: 'containers', label: 'Container' },
    { value: 'database', label: 'Database' },
    { value: 'gpu', label: 'GPU' },
    { value: 'network', label: 'Network' },
    { value: 'others', label: 'Others' },
    { value: 'private_cloud_compute', label: 'Private Cloud Compute' },
    { value: 'public_cloud_compute', label: 'Public Cloud Compute' },
    { value: 'platform_services', label: 'Platform Services' },
    { value: 'sd_wan', label: 'SD-WAN' },
    { value: 'sensors', label: 'Sensors' },
    { value: 'storage', label: 'Storage' }
  ],
  activeCategory: 'all',
  sourceGraph: {
    nodes: [
      { id: 1, value: 37148, name: 'Unity' },
      { id: 2, value: 37148, name: 'Events' },
      { id: 3, value: 33472, name: 'Alerts' },
      { id: 4, value: 149, name: 'Dedupe Events' },
      { id: 5, value: 3527, name: 'Suppressed Events' },
      { id: 6, value: 31751, name: 'Conditions' },
      { id: 7, value: 293, name: 'Ticket Generated' },
      { id: 8, value: 31458, name: 'No Ticket Generated' }
    ],
    links: [
      { sourceId: 1, targetId: 2, value: 37148 },
      { sourceId: 2, targetId: 3, value: 33472 },
      { sourceId: 2, targetId: 4, value: 149 },
      { sourceId: 2, targetId: 5, value: 3527 },
      { sourceId: 3, targetId: 6, value: 31751 },
      { sourceId: 6, targetId: 7, value: 293 },
      { sourceId: 6, targetId: 8, value: 31458 }
    ]
  },
  severityGraph: {
    nodes: [
      { id: 1, value: 1455, name: 'Information' },
      { id: 2, value: 33997, name: 'Warning' },
      { id: 3, value: 1696, name: 'Critical' },
      { id: 4, value: 37148, name: 'Events' },
      { id: 5, value: 33472, name: 'Alerts' },
      { id: 6, value: 149, name: 'Dedupe Events' },
      { id: 7, value: 3527, name: 'Suppressed Events' },
      { id: 8, value: 31751, name: 'Conditions' },
      { id: 9, value: 293, name: 'Root Cause Identified' },
      { id: 10, value: 31458, name: 'Root Cause Unknown' }
    ],
    links: [
      { sourceId: 1, targetId: 4, value: 1455 },
      { sourceId: 2, targetId: 4, value: 33997 },
      { sourceId: 3, targetId: 4, value: 1696 },
      { sourceId: 4, targetId: 5, value: 33472 },
      { sourceId: 4, targetId: 6, value: 149 },
      { sourceId: 4, targetId: 7, value: 3527 },
      { sourceId: 5, targetId: 8, value: 31751 },
      { sourceId: 8, targetId: 9, value: 293 },
      { sourceId: 8, targetId: 10, value: 31458 }
    ]
  },
  rightGraph: {
    nodes: [
      { id: 1, value: 31751, name: 'Condition' },
      { id: 2, value: 166, name: 'Open' },
      { id: 3, value: 31585, name: 'Resolved' },
      { id: 4, value: 0, name: 'Acknowledged' },
      { id: 5, value: 31299, name: 'Auto Healed' },
      { id: 6, value: 0, name: 'Auto Remediation' },
      { id: 7, value: 14826, name: '5 Min' },
      { id: 8, value: 8759, name: '30 Min' },
      { id: 9, value: 7714, name: '>30 Min' }
    ],
    links: [
      { sourceId: 1, targetId: 2, value: 166 },
      { sourceId: 1, targetId: 3, value: 31585 },
      { sourceId: 3, targetId: 5, value: 31299 },
      { sourceId: 5, targetId: 8, value: 8759 },
      { sourceId: 5, targetId: 9, value: 7714 },
      { sourceId: 5, targetId: 7, value: 14826 }
    ]
  },
};

export const ALERT_BY_DEVICE_TYPE_API_DUMMY: AlertByDeviceTypeApiResponse = {
  rows: [
    {
      deviceName: 'VMDB01',
      deviceType: 'vm',
      critical: 1,
      information: 1,
      available: 1,
      warning: 2910,
      unknown: 0,
      total: 2912,
      ticketCount: 2
    },
    {
      deviceName: 'STGPRINP1017',
      deviceType: 'vm',
      critical: 0,
      information: 0,
      available: 0,
      warning: 1928,
      unknown: 0,
      total: 1928,
      ticketCount: 0
    }
  ],
  categoryOptions: [
    { value: 'all', label: 'All' },
    { value: 'vm_host', label: 'VM Host' },
    { value: 'k8s_pod', label: 'K8s Pod' },
    { value: 'vmware_vcenter', label: 'VMware Vcenter' },
    { value: 'storage', label: 'Storage' },
    { value: 'network', label: 'Network' },
    { value: 'database', label: 'Database' },
    { value: 'application', label: 'Applications' }
  ],
  activeCategory: 'all'
};

export const OPEN_INCIDENT_TICKETS_API_DUMMY: IncidentTicketApiResponse = {
  rows: [
    {
      uuid: '3cd5cb67-c570-4051-9f30-557a63867e36',
      ticketId: 'INC0384809',
      ticketUuid: '80659aef3b0e031036f2a71864e45a3c',
      deviceName: 'VMDB01',
      affectedService: 'VMDB01',
      availabilityState: 'Warning \u0014 Degraded',
      ticketCount: 1,
      tone: 'warning',
      severity: 'Warning',
      firstAlertDatetime: '2026-07-16T14:12:39.416029+00:00'
    }
  ],
  total: 7,
  categoryOptions: [
    { value: 'all', label: 'All' },
    { value: 'vm_host', label: 'VM Host' },
    { value: 'k8s_pod', label: 'K8s Pod' },
    { value: 'vmware_vcenter', label: 'VMware Vcenter' },
    { value: 'storage', label: 'Storage' },
    { value: 'network', label: 'Network' },
    { value: 'database', label: 'Database' },
    { value: 'application', label: 'Applications' }
  ],
  activeCategory: 'all'
};

export const RESOLVED_INCIDENT_TICKETS_API_DUMMY: IncidentTicketApiResponse = {
  rows: [
    {
      uuid: 'f5f0265d-c583-48dd-8e58-d1560cde5fd3',
      ticketId: 'INC0385996',
      ticketUuid: '9306421c3b168b1036f2a71864e45aee',
      deviceName: 'STGCOGNOS005',
      availabilityState: 'Critical \u0014 Unavailable',
      affectedService: 'STGCOGNOS005',
      ticketCount: 1,
      tone: 'danger',
      severity: 'Critical',
      resolvedDatetime: '2026-07-21T13:57:55+00:00'
    }
  ],
  total: 286,
  categoryOptions: [
    { value: 'all', label: 'All' },
    { value: 'vm_host', label: 'VM Host' },
    { value: 'k8s_pod', label: 'K8s Pod' },
    { value: 'vmware_vcenter', label: 'VMware Vcenter' },
    { value: 'storage', label: 'Storage' },
    { value: 'network', label: 'Network' },
    { value: 'database', label: 'Database' },
    { value: 'application', label: 'Applications' }
  ],
  activeCategory: 'all'
};

export const NOISY_EVENTS_API_DUMMY: NoisyEventsApiResponse = {
  rows: [
    { uuid: 'ffd71b8c-ad10-463e-bf84-aad4afe1e698', device: 'STGPRINP1017', deviceType: 'vm', count: 1872, description: 'CPU queue length is too high (over 3 for 5m)', source: 'Unity', lastReported: '2026-07-21T15:49:45+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: '8d9d004a-465d-4ff9-b2ae-42ad518e1c12', device: 'VMDB01', deviceType: 'database', count: 1254, description: 'MSSQL: Too many physical reads occurring', source: 'Unity', lastReported: '2026-07-21T15:15:22+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: '07c9ff22-5b3d-4192-aeb8-8710df488033', device: 'W2K8FTP1', deviceType: 'vm', count: 1178, description: 'The Memory Pages/sec is too high (over 1000 for 5m)', source: 'Unity', lastReported: '2026-07-15T10:15:52+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: '7251d99a-0cda-4491-980f-a025ae0f640a', device: 'a04697.d2kmeta.dansketraelast.com', deviceType: 'database', count: 884, description: 'MSSQL: Too many physical reads occurring', source: 'Unity', lastReported: '2026-07-21T15:37:59+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: 'ce400bea-049b-4df1-a093-ba9283c78ea9', device: 'E01043', deviceType: 'vm', count: 787, description: 'CPU queue length is too high (over 3 for 5m)', source: 'Unity', lastReported: '2026-07-21T15:11:59+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: '5bfd1913-3fe9-437e-bcdc-0cb4c8f55fcd', device: 'STGNASTFRPRD02', deviceType: 'vm', count: 589, description: 'The Memory Pages/sec is too high (over 1000 for 5m)', source: 'Unity', lastReported: '2026-07-21T13:39:48+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: 'dce7e43c-1125-4030-8886-33f6fddc916d', device: 'a04697.d2kmeta.dansketraelast.com', deviceType: 'database', count: 471, description: 'MSSQL: Total number of locks per second is high (over 1000 for 5m)', source: 'Unity', lastReported: '2026-07-21T13:32:59+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: '6bd0eccc-7d14-48a4-88c7-0ab4b4d791ae', device: 'VMDB01', deviceType: 'database', count: 462, description: 'MSSQL: Total number of locks per second is high (over 1000 for 5m)', source: 'Unity', lastReported: '2026-07-21T13:15:22+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: 'f25e1ea4-8115-4efd-9dbb-9043a9874d3a', device: 'VMDB01', deviceType: 'vm', count: 400, description: 'The Memory Pages/sec is too high (over 1000 for 5m)', source: 'Unity', lastReported: '2026-07-21T13:06:12+00:00', severity: 'Warning', tone: 'warning' },
    { uuid: 'b8fd8532-8ac4-4b41-95f7-86decc73ab67', device: 'STGAUTOP1063', deviceType: 'database', count: 368, description: 'MSSQL DB \'eManager_P\': Total wait time to flush the log is high (over 1ms for 5m)', source: 'Unity', lastReported: '2026-07-21T16:08:42+00:00', severity: 'Warning', tone: 'warning' }
  ],
  categoryOptions: [
    { value: 'all', label: 'All' },
    { value: 'application', label: 'Application' },
    { value: 'baremetal_servers', label: 'Baremetals' },
    { value: 'containers', label: 'Container' },
    { value: 'database', label: 'Database' },
    { value: 'gpu', label: 'GPU' },
    { value: 'network', label: 'Network' },
    { value: 'others', label: 'Others' },
    { value: 'private_cloud_compute', label: 'Private Cloud Compute' },
    { value: 'public_cloud_compute', label: 'Public Cloud Compute' },
    { value: 'platform_services', label: 'Platform Services' },
    { value: 'sd_wan', label: 'SD-WAN' },
    { value: 'sensors', label: 'Sensors' },
    { value: 'storage', label: 'Storage' }
  ],
  activeCategory: 'all'
};

export const NOISY_HOSTS_API_DUMMY: NoisyHostsApiResponse = {
  rows: [
    {
      count: 118442,
      source: 'Unity',
      deviceType: 'NA',
      description: 'Azure: Virtual machine is unavailable',
      severity: 'Critical',
      managementIp: '{HOST.IP}',
      hostName: 'N/A',
      lastReported: '2024-06-07T08:36:43Z'
    },
    {
      count: 70006,
      source: 'Unity',
      deviceType: 'storage_device',
      description: 'Read IOps is more than 10',
      severity: 'Critical',
      managementIp: '192.168.232.17',
      hostName: 'Nimble Storage - SF',
      lastReported: '2025-10-19T10:59:43Z'
    },
    {
      count: 66603,
      source: 'Unity',
      deviceType: 'vm',
      description: 'Test Otel',
      severity: 'Critical',
      managementIp: '10.128.7.175',
      hostName: 'ul-test-log-metrics02',
      lastReported: '2025-10-08T07:24:28Z'
    },
    {
      count: 55343,
      source: 'Unity',
      deviceType: 'NA',
      description: 'SD-WAN: There are errors in the \'Get routes data\' metric',
      severity: 'Warning',
      managementIp: '10.10.1.15',
      hostName: 'site2-cedge01',
      lastReported: '2025-10-16T10:50:45Z'
    },
    {
      count: 44982,
      source: 'Unity',
      deviceType: 'NA',
      description: 'SD-WAN: There are errors in the \'Get routes data\' metric',
      severity: 'Warning',
      managementIp: '10.10.1.13',
      hostName: 'site1-cedge01',
      lastReported: '2025-10-16T10:49:45Z'
    },
    {
      count: 42129,
      source: 'Unity',
      deviceType: 'load_balancer',
      description: 'Load balancer memory usage is high',
      severity: 'Critical',
      managementIp: '10.192.17.9',
      hostName: 'UnityDemo-mtinfralb02.unitedlayer.com',
      lastReported: '2025-10-14T15:33:21Z'
    },
    {
      count: 26255,
      source: 'Unity',
      deviceType: 'NA',
      description: 'SD-WAN: There are errors in the \'Get routes data\' metric',
      severity: 'Warning',
      managementIp: '10.10.1.1',
      hostName: 'vmanage',
      lastReported: '2025-10-16T10:45:45Z'
    },
    {
      count: 25894,
      source: 'Unity',
      deviceType: 'NA',
      description: 'SD-WAN: There are errors in the \'Get routes data\' metric',
      severity: 'Warning',
      managementIp: '10.10.1.5',
      hostName: 'vsmart',
      lastReported: '2025-10-16T10:46:45Z'
    },
    {
      count: 25856,
      source: 'Unity',
      deviceType: 'NA',
      description: 'SD-WAN: There are errors in the \'Get routes data\' metric',
      severity: 'Warning',
      managementIp: '10.10.1.3',
      hostName: 'vbond',
      lastReported: '2025-10-16T10:47:46Z'
    },
    {
      count: 24031,
      source: 'Unity',
      deviceType: 'switch',
      description: 'Interface Ethernet1/4: Link down',
      severity: 'Critical',
      managementIp: '10.1.0.1',
      hostName: 'sw2-mgmt.sf10.unitedlayer.com',
      lastReported: '2025-10-15T21:11:41Z'
    }
  ],
  chart: [
    {
      information: 1,
      hostName: 'N/A',
      warning: 112334,
      critical: 6107
    },
    {
      information: 2,
      hostName: 'Nimble Storage - SF',
      warning: 587,
      critical: 69417
    },
    {
      information: 574,
      hostName: 'ul-test-log-metrics02',
      warning: 1,
      critical: 66028
    },
    {
      information: 1,
      hostName: 'site2-cedge01',
      warning: 55342,
      critical: 0
    },
    {
      information: 2,
      hostName: 'site1-cedge01',
      warning: 44980,
      critical: 0
    },
    {
      information: 20,
      hostName: 'UnityDemo-mtinfralb02.unitedlayer.com',
      warning: 42084,
      critical: 25
    },
    {
      information: 0,
      hostName: 'vmanage',
      warning: 26255,
      critical: 0
    },
    {
      information: 0,
      hostName: 'vsmart',
      warning: 25894,
      critical: 0
    },
    {
      information: 0,
      hostName: 'vbond',
      warning: 25856,
      critical: 0
    },
    {
      information: 20711,
      hostName: 'sw2-mgmt.sf10.unitedlayer.com',
      warning: 3204,
      critical: 116
    }
  ],
  activeTimeRange: 'last_month',
  timeRangeOptions: [
    { value: 'last_24_hours', label: 'Last 24 Hours' },
    { value: 'last_week', label: 'Last 7 Days' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_60_days', label: 'Last 60 Days' },
    { value: 'last_quarter', label: 'Last Quarter' }
  ],
  categoryOptions: [
    { value: 'all', label: 'All' },
    { value: 'baremetal_servers', label: 'Baremetals' },
    { value: 'database', label: 'Database' },
    { value: 'network', label: 'Network' },
    { value: 'others', label: 'Others' },
    { value: 'private_cloud_compute', label: 'Private Cloud Compute' },
    { value: 'public_cloud_compute', label: 'Public Cloud Compute' },
    { value: 'storage', label: 'Storage' }
  ],
  activeCategory: 'all'
};

export const ITSM_TICKET_VIEW_API_DUMMY: ItsmTicketViewApiResponse = {
  tab: 'all',
  tabOptions: [
    { value: 'all', label: 'All tickets' },
    { value: 'change_request', label: 'Change Request' },
    { value: 'incident', label: 'Incident' },
    { value: 'problem', label: 'Problem' }
  ],
  ticketsByPriority: [
    { key: '3 - Moderate', label: '3 - Moderate', count: 180, value: 180 },
    { key: '2 - High', label: '2 - High', count: 45, value: 45 },
    { key: '1 - Critical', label: '1 - Critical', count: 18, value: 18 },
    { key: '4 - Low', label: '4 - Low', count: 5, value: 5 },
    { key: '5 - Planning', label: '5 - Planning', count: 2, value: 2 }
  ],
  ticketsByStatus: [
    { key: 'New', label: 'New', count: 210, value: 210 },
    { key: 'In Progress', label: 'In Progress', count: 22, value: 22 },
    { key: 'On Hold', label: 'On Hold', count: 8, value: 8 },
    { key: 'Resolved', label: 'Resolved', count: 6, value: 6 },
    { key: 'Closed', label: 'Closed', count: 4, value: 4 }
  ],
  solvedByResponseTime: {
    buckets: [
      { key: 'one_day', label: '1 Day', count: 6, value: 6 },
      { key: 'one_week', label: '1 Week', count: 3, value: 3 },
      { key: 'one_month', label: '1 Month', count: 1, value: 1 },
      { key: 'greaterthan_month', label: '> Month', count: 0, value: 0 }
    ]
  },
  filters: {
    search: '',
    state: '',
    priority: '',
    type: '',
    startDate: '2026-06-19',
    endDate: '2026-07-03'
  },
  filterOptions: {
    state: [
      { value: '', label: 'All' },
      { value: '1', label: 'New' },
      { value: '2', label: 'In Progress' },
      { value: '3', label: 'On Hold' },
      { value: '6', label: 'Resolved' },
      { value: '7', label: 'Closed' },
      { value: '8', label: 'Canceled' }
    ],
    priority: [
      { value: '', label: 'All' },
      { value: '1', label: '1 - Critical' },
      { value: '2', label: '2 - High' },
      { value: '3', label: '3 - Moderate' },
      { value: '4', label: '4 - Low' },
      { value: '5', label: '5 - Planning' }
    ],
    type: [
      { value: 'all', label: 'All' },
      { value: 'incident', label: 'Incident' },
      { value: 'change_request', label: 'Change Request' },
      { value: 'problem', label: 'Problem' }
    ]
  },
  tickets: [
    {
      ticketId: 'INC0012381',
      shortDescription: 'Linux: agent is not available',
      state: 'New',
      priority: '3 - Moderate',
      createdOn: '2026-06-03 11:57:30',
      updatedOn: '2026-06-03 11:57:30',
      resolution: 'New'
    },
    {
      ticketId: 'INC0012382',
      shortDescription: 'trigger-1 for Switch-UN',
      state: 'New',
      priority: '3 - Moderate',
      createdOn: '2026-06-03 13:21:33',
      updatedOn: '2026-06-03 13:21:33',
      resolution: 'New'
    }
  ],
  total: 250,
  page: 1,
  perPage: 10
};
