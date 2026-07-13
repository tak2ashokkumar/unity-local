import {
  AlertGeneratedResponse,
  AlertSegregationResponse,
  AlertStatusResponse,
  DashboardFilters,
  DashboardHeader,
  EventAlertAnalyticsResponse,
  EventAnalyticsTicketTab,
  EventByDeviceCategoryResponse,
  ExecutiveSummaryResponse,
  IncidentManagementResponse,
  NoisyEventsResponse,
  NoisyHostsResponse,
  PipelineResponse,
  SelectOption,
  TrendByTimelineResponse
} from './event-analytics-dashboard.type';
import {
  MS_DYNAMICS_TICKET_TYPE,
  SERVICE_NOW_TICKET_TYPE,
  TICKET_TYPE
} from 'src/app/shared/app-utility/app-utility.service';

export const EVENT_ANALYTICS_TOP_HEADER_ENDPOINT = '/customer/persona/event-analytics-dashboard/dashboard-header/';
export const EVENT_ANALYTICS_DASHBOARD_FILTERS_ENDPOINT = '/customer/persona/event-analytics-dashboard/dashboard-filters/';
export const EVENT_ANALYTICS_SUMMARY_ENDPOINT = '/customer/persona/event-analytics-dashboard/executive-summary/';
export const EVENT_ANALYTICS_PIPELINE_ENDPOINT = '/customer/persona/event-analytics-dashboard/cumulative-reduction/';
export const EVENT_ANALYTICS_EVENT_BY_DEVICE_CATEGORY_ENDPOINT = '/customer/persona/event-analytics-dashboard/event-by-device-type/';
export const EVENT_ANALYTICS_ALERT_GENERATED_ENDPOINT = '/customer/persona/event-analytics-dashboard/alert-generated/';
export const EVENT_ANALYTICS_ALERT_STATUS_ENDPOINT = '/customer/persona/event-analytics-dashboard/alert-status/';
export const EVENT_ANALYTICS_TREND_BY_TIMELINE_ENDPOINT = '/customer/persona/event-analytics-dashboard/trend-by-timeline/';
export const EVENT_ANALYTICS_ALERT_BY_DEVICE_TYPE_ENDPOINT = '/customer/persona/event-analytics-dashboard/alert-by-device-type/';
export const EVENT_ANALYTICS_EVENT_ALERT_ANALYTICS_ENDPOINT = '/customer/persona/event-analytics-dashboard/event-alert-analytics/';
export const EVENT_ANALYTICS_OPEN_INCIDENTS_ENDPOINT = '/customer/persona/event-analytics-dashboard/open-incident-tickets/';
export const EVENT_ANALYTICS_RESOLVED_INCIDENTS_ENDPOINT = '/customer/persona/event-analytics-dashboard/resolved-incident-tickets/';
export const EVENT_ANALYTICS_NOISY_EVENTS_ENDPOINT = '/customer/persona/event-analytics-dashboard/noisy-events/';
export const EVENT_ANALYTICS_NOISY_HOSTS_ENDPOINT = '/customer/persona/event-analytics-dashboard/noisy-hosts/';
export const EVENT_ANALYTICS_JIRA_PROJECTS_ENDPOINT = (uuid: string) => `/customer/jira/instances/${uuid}/projects_list/`;

export const EVENT_ANALYTICS_ZENDESK_TICKET_TABS = (uuid: string): EventAnalyticsTicketTab[] => [
  { key: 'alltickets', name: 'All Tickets', ticketType: TICKET_TYPE.ALL, drillDownLink: `/support/ticketmgmt/${uuid}/alltickets` },
  { key: 'changetickets', name: 'Change Management', ticketType: TICKET_TYPE.TASK, drillDownLink: `/support/ticketmgmt/${uuid}/changetickets` },
  { key: 'existingtickets', name: 'Incident Management', ticketType: TICKET_TYPE.INCIDENT, drillDownLink: `/support/ticketmgmt/${uuid}/existingtickets` },
  { key: 'servicerequests', name: 'Service Request', ticketType: TICKET_TYPE.PROBLEM, drillDownLink: `/support/ticketmgmt/${uuid}/servicerequests` }
];

export const EVENT_ANALYTICS_SERVICE_NOW_TICKET_TABS = (uuid: string): EventAnalyticsTicketTab[] => [
  { key: 'nowtickets', name: 'All tickets', ticketType: null, drillDownLink: `/support/ticketmgmt/${uuid}/nowtickets` },
  { key: 'nowchange', name: 'Change Request', ticketType: SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST, drillDownLink: `/support/ticketmgmt/${uuid}/nowchange` },
  { key: 'nowincident', name: 'Incident', ticketType: SERVICE_NOW_TICKET_TYPE.INCIDENT, drillDownLink: `/support/ticketmgmt/${uuid}/nowincident` },
  { key: 'nowproblem', name: 'Problem', ticketType: SERVICE_NOW_TICKET_TYPE.PROBLEM, drillDownLink: `/support/ticketmgmt/${uuid}/nowproblem` }
];

export const EVENT_ANALYTICS_MS_DYNAMICS_TICKET_TABS = (uuid: string): EventAnalyticsTicketTab[] => [
  { key: 'dynamics-crm-tickets', name: 'All tickets', ticketType: null, drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-tickets` },
  { key: 'dynamics-crm-changes', name: 'Change', ticketType: MS_DYNAMICS_TICKET_TYPE.CHANGE, drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-changes` },
  { key: 'dynamics-crm-incidents', name: 'Incident', ticketType: MS_DYNAMICS_TICKET_TYPE.INCIDENT, drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-incidents` },
  { key: 'dynamics-crm-problems', name: 'Problem', ticketType: MS_DYNAMICS_TICKET_TYPE.PROBLEM, drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-problems` }
];

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

export const EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY: SelectOption[] = [
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

export const DASHBOARD_HEADER_DUMMY: DashboardHeader = {
  lastRefreshed: 'Today 10:00 IST',
  scopeText: 'All providers - All regions - All accounts'
};

export const EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE = 'custom';

export const EVENT_ANALYTICS_TIME_RANGE_OPTIONS: SelectOption[] = [
  { value: 'last_1_hour', label: '1 Hour' },
  { value: 'last_24_hours', label: '24 Hour' },
  { value: 'last_7_days', label: '7 Days' },
  { value: 'last_month', label: '30 Days' },
  { value: 'last_60_days', label: '60 Days' },
  { value: 'last_90_days', label: '90 Days' },
  { value: EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE, label: 'Custom' }
];

export const DASHBOARD_FILTERS_DUMMY: DashboardFilters = {
  timeRange: EVENT_ANALYTICS_TIME_RANGE_OPTIONS,
  trendTimeline: EVENT_ANALYTICS_TIME_RANGE_OPTIONS,
  category: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY,
  eventDeviceCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY,
  alertSegregationCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY,
  analyticsViewBy: [
    { value: 'source', label: 'Source' },
    { value: 'device_type', label: 'Device Type' },
    { value: 'severity', label: 'Severity' }
  ],
  analyticsSourceType: [
    { value: 'all_source', label: 'All Source' },
    { value: 'unity', label: 'Unity' },
    { value: 'logicmonitor', label: 'LogicMonitor' },
    { value: 'opsramp', label: 'OpsRamp' }
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
  analyticsCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY,
  analyticsDuration: [
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_month', label: 'Last Month' }
  ],
  noisyEventsCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY,
  noisyHostsCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY,
  incidentCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY
};

export const EXECUTIVE_SUMMARY_DUMMY: ExecutiveSummaryResponse = {
  total_inference_alerts: 3458,
  events: 9127,
  alerts: 3458,
  conditions: 956,
  cumulative_reduction: 98
};

export const PIPELINE_DUMMY: PipelineResponse = {
  raw_events: 28020,
  noise_reduction: 87.83,
  alerts: 103,
  correlation_pct: 83.26,
  conditions: 56
};

export const EVENT_BY_DEVICE_CATEGORY_DUMMY: EventByDeviceCategoryResponse = {
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
    { key: 'container', label: 'Containers', count: 192 },
    { key: 'baremetal', label: 'Baremetal Servers', count: 80 },
    { key: 'application', label: 'Application', count: 2 },
    { key: 'others', label: 'Others', count: 0 }
  ],
  tiles: [
    { key: 'application', label: 'Application', count: 2 },
    { key: 'baremetal', label: 'Baremetal Servers', count: 80 },
    { key: 'container', label: 'Containers', count: 192 },
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
  active_category: 'application',
  category_options: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY
};

export const ALERT_GENERATED_DUMMY: AlertGeneratedResponse = {
  kpis: [
    { key: 'open', label: 'Open', value: 1000, tone: 'primary' },
    { key: 'correlated', label: 'Correlated', value: 934, tone: 'success' },
    { key: 'suppressed', label: 'Suppressed', value: 38, tone: 'info' },
    { key: 'ticketed', label: 'Ticketed', value: 293, tone: 'danger' },
    { key: 'closed', label: 'Closed', value: 0, tone: 'success' }
  ],
  donut: [
    { key: 'open', label: 'Open', value: 4587 },
    { key: 'correlated', label: 'Correlated', value: 945 },
    { key: 'suppressed', label: 'Suppressed', value: 658 },
    { key: 'ticketed', label: 'Ticketed', value: 293 },
    { key: 'closed', label: 'Closed', value: 567 }
  ]
};

export const ALERT_STATUS_DUMMY: AlertStatusResponse = {
  kpis: [
    { key: 'critical', label: 'Critical', value: 38, tone: 'danger' },
    { key: 'warning', label: 'Warning', value: 934, tone: 'warning' },
    { key: 'information', label: 'Information', value: 1585, tone: 'info' }
  ],
  donut: [
    { key: 'information', label: 'Info', value: 986 },
    { key: 'critical', label: 'Critical', value: 89 },
    { key: 'warning', label: 'Warning', value: 458 }
  ]
};

export const TREND_BY_TIMELINE_DUMMY: TrendByTimelineResponse = {
  series: {
    conditions: [
      { label: 'May 01', count: 3 },
      { label: 'May 02', count: 26 },
      { label: 'May 03', count: 7 },
      { label: 'May 04', count: 4 },
      { label: 'May 05', count: 4 },
      { label: 'May 06', count: 82 },
      { label: 'May 07', count: 63 },
      { label: 'May 08', count: 4 },
      { label: 'May 09', count: 3 },
      { label: 'May 10', count: 3 },
      { label: 'May 11', count: 4 },
      { label: 'May 12', count: 2 },
      { label: 'May 13', count: 5 },
      { label: 'May 14', count: 5 },
      { label: 'May 15', count: 7 },
      { label: 'May 16', count: 8 },
      { label: 'May 17', count: 5 },
      { label: 'May 18', count: 6 },
      { label: 'May 19', count: 8 },
      { label: 'May 20', count: 24 },
      { label: 'May 21', count: 41 }
    ],
    events: [
      { label: 'May 01', count: 20 },
      { label: 'May 02', count: 935 },
      { label: 'May 03', count: 35 },
      { label: 'May 04', count: 24 },
      { label: 'May 05', count: 18 },
      { label: 'May 06', count: 888 },
      { label: 'May 07', count: 798 },
      { label: 'May 08', count: 29 },
      { label: 'May 09', count: 26 },
      { label: 'May 10', count: 25 },
      { label: 'May 11', count: 23 },
      { label: 'May 12', count: 19 },
      { label: 'May 13', count: 22 },
      { label: 'May 14', count: 28 },
      { label: 'May 15', count: 31 },
      { label: 'May 16', count: 35 },
      { label: 'May 17', count: 26 },
      { label: 'May 18', count: 24 },
      { label: 'May 19', count: 32 },
      { label: 'May 20', count: 260 },
      { label: 'May 21', count: 430 }
    ],
    alerts: [
      { label: 'May 01', count: 8 },
      { label: 'May 02', count: 86 },
      { label: 'May 03', count: 18 },
      { label: 'May 04', count: 10 },
      { label: 'May 05', count: 12 },
      { label: 'May 06', count: 212 },
      { label: 'May 07', count: 188 },
      { label: 'May 08', count: 14 },
      { label: 'May 09', count: 12 },
      { label: 'May 10', count: 12 },
      { label: 'May 11', count: 11 },
      { label: 'May 12', count: 10 },
      { label: 'May 13', count: 13 },
      { label: 'May 14', count: 15 },
      { label: 'May 15', count: 17 },
      { label: 'May 16', count: 19 },
      { label: 'May 17', count: 15 },
      { label: 'May 18', count: 16 },
      { label: 'May 19', count: 21 },
      { label: 'May 20', count: 82 },
      { label: 'May 21', count: 146 }
    ]
  },
  active_category: 'application'
};

export const ALERT_SEGREGATION_DUMMY: AlertSegregationResponse = {
  summary: {
    critical: 2285,
    warning: 1485,
    information: 327
  },
  rows: [
    { key: 'application', label: 'Application', critical: 32, warning: 48, information: 54 },
    { key: 'baremetal', label: 'Baremetals', critical: 28, warning: 50, information: 72 },
    { key: 'container', label: 'Container', critical: 31, warning: 42, information: 97 },
    { key: 'database', label: 'Database', critical: 29, warning: 49, information: 56 },
    { key: 'gpu', label: 'GPU', critical: 27, warning: 50, information: 35 },
    { key: 'network', label: 'Network', critical: 31, warning: 42, information: 100 },
    { key: 'private_cloud_compute', label: 'Private Cloud Compute', critical: 29, warning: 47, information: 72 },
    { key: 'public_cloud_compute', label: 'Public Cloud Compute', critical: 30, warning: 42, information: 101 },
    { key: 'platform_services', label: 'Platform Services', critical: 31, warning: 50, information: 55 },
    { key: 'sd_wan', label: 'SD-WAN', critical: 24, warning: 42, information: 42 },
    { key: 'sensors', label: 'Sensors', critical: 24, warning: 42, information: 40 },
    { key: 'storage', label: 'Storage', critical: 25, warning: 45, information: 40 },
    { key: 'others', label: 'Others', critical: 25, warning: 50, information: 72 }
  ],
  active_category: 'application',
  category_options: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY
};

export const EVENT_ALERT_ANALYTICS_DUMMY: EventAlertAnalyticsResponse = {
  metrics: [
    { key: 'cumulative_reduction', label: 'Cumulative Reduction', value: '97%', tone: 'primary' },
    { key: 'noise_reduction', label: 'Noise Reduction', value: '94%', tone: 'primary' },
    { key: 'correlation', label: 'Correlation', value: '89%', tone: 'primary' },
    { key: 'mtta', label: 'MTTA', value: '6 min 51 Sec', tone: 'primary' },
    { key: 'mttr', label: 'MTTR', value: '15 min 26 Sec', tone: 'primary' }
  ],
  reductionFlow: {
    nodes: [
      { name: 'UNITYONECLOUD (42)', itemStyle: { color: '#00ad73' } },
      { name: 'LogicMonitor (42)', itemStyle: { color: '#31426f' } },
      { name: 'OpsRamp (32)', itemStyle: { color: '#6f89a5' } },
      { name: 'dynatrace (56)', itemStyle: { color: '#72bf44' } },
      { name: 'new relic (45)', itemStyle: { color: '#19a974' } },
      { name: 'Events 950', itemStyle: { color: '#39c8c7' } },
      { name: 'Alerts 142', itemStyle: { color: '#7c62c8' } },
      { name: 'Dedupe Events 305', itemStyle: { color: '#cbc7f5' } },
      { name: 'Suppressed Events 503', itemStyle: { color: '#cbc7f5' } },
      { name: 'Conditions 21', itemStyle: { color: '#95d9c6' } },
      { name: 'Ticket Generated 18', itemStyle: { color: '#e3c0c6' } },
      { name: 'No Ticket Generated 3', itemStyle: { color: '#d96267' } }
    ],
    links: [
      { source: 'UNITYONECLOUD (42)', target: 'Events 950', value: 42, lineStyle: { color: '#c9f1ef', opacity: 0.55 } },
      { source: 'LogicMonitor (42)', target: 'Events 950', value: 42, lineStyle: { color: '#f5c7cf', opacity: 0.55 } },
      { source: 'OpsRamp (32)', target: 'Events 950', value: 32, lineStyle: { color: '#e9e0fa', opacity: 0.55 } },
      { source: 'dynatrace (56)', target: 'Events 950', value: 56, lineStyle: { color: '#fee1bf', opacity: 0.55 } },
      { source: 'new relic (45)', target: 'Events 950', value: 45, lineStyle: { color: '#b9e6e9', opacity: 0.55 } },
      { source: 'Events 950', target: 'Alerts 142', value: 142, lineStyle: { color: '#c9f1ef', opacity: 0.55 } },
      { source: 'Events 950', target: 'Dedupe Events 305', value: 305, lineStyle: { color: '#e9e0fa', opacity: 0.55 } },
      { source: 'Events 950', target: 'Suppressed Events 503', value: 503, lineStyle: { color: '#f5c7cf', opacity: 0.55 } },
      { source: 'Alerts 142', target: 'Conditions 21', value: 21, lineStyle: { color: '#c9f1ef', opacity: 0.55 } },
      { source: 'Conditions 21', target: 'Ticket Generated 18', value: 18, lineStyle: { color: '#e9e0fa', opacity: 0.55 } },
      { source: 'Conditions 21', target: 'No Ticket Generated 3', value: 3, lineStyle: { color: '#f5c7cf', opacity: 0.55 } }
    ]
  },
  resolutionFlow: {
    nodes: [
      { name: 'Condition 164', itemStyle: { color: '#39c8c7' } },
      { name: 'Open 21', itemStyle: { color: '#7c62c8' } },
      { name: 'Resolved 143', itemStyle: { color: '#7c62c8' } },
      { name: 'Acknowledged 143', itemStyle: { color: '#f3b7be' } },
      { name: 'Auto Healed 143', itemStyle: { color: '#f3b7be' } },
      { name: 'Auto Remediation 143', itemStyle: { color: '#f3b7be' } },
      { name: '5 Min : 56', itemStyle: { color: '#24a864' } },
      { name: '30 Min : 51', itemStyle: { color: '#ff8a00' } },
      { name: '> 30 Min : 36', itemStyle: { color: '#d90000' } },
      { name: '5 Min : 56 ', itemStyle: { color: '#24a864' } },
      { name: '30 Min : 51 ', itemStyle: { color: '#ff8a00' } },
      { name: '> 30 Min : 36 ', itemStyle: { color: '#d90000' } }
    ],
    links: [
      { source: 'Condition 164', target: 'Open 21', value: 21, lineStyle: { color: '#e9e0fa', opacity: 0.55 } },
      { source: 'Condition 164', target: 'Resolved 143', value: 143, lineStyle: { color: '#b9e6e9', opacity: 0.55 } },
      { source: 'Resolved 143', target: 'Acknowledged 143', value: 48, lineStyle: { color: '#f5c7cf', opacity: 0.55 } },
      { source: 'Resolved 143', target: 'Auto Healed 143', value: 48, lineStyle: { color: '#e9e0fa', opacity: 0.55 } },
      { source: 'Resolved 143', target: 'Auto Remediation 143', value: 47, lineStyle: { color: '#f5c7cf', opacity: 0.55 } },
      { source: 'Acknowledged 143', target: '5 Min : 56', value: 56, lineStyle: { color: '#c9f1ef', opacity: 0.55 } },
      { source: 'Acknowledged 143', target: '30 Min : 51', value: 51, lineStyle: { color: '#fee1bf', opacity: 0.55 } },
      { source: 'Acknowledged 143', target: '> 30 Min : 36', value: 36, lineStyle: { color: '#f5c7cf', opacity: 0.55 } },
      { source: 'Auto Healed 143', target: '5 Min : 56 ', value: 56, lineStyle: { color: '#c9f1ef', opacity: 0.55 } },
      { source: 'Auto Healed 143', target: '30 Min : 51 ', value: 51, lineStyle: { color: '#fee1bf', opacity: 0.55 } },
      { source: 'Auto Remediation 143', target: '> 30 Min : 36 ', value: 36, lineStyle: { color: '#f5c7cf', opacity: 0.55 } }
    ]
  }
};

export const NOISY_EVENTS_DUMMY: NoisyEventsResponse = {
  rows: [
    { uuid: 'event-01', device: 'ul-easy-trade-app0', device_type: 'Vmware', count: 4650, description: 'Getting flag data for id ergo_a', source: 'Unity', last_reported: '2026-05-20T09:30:44', severity: 'Information' },
    { uuid: 'event-02', device: 'ul-easy-trade-app0', device_type: 'Vmware', count: 3564, description: 'An unhandled exception has occurred', source: 'Unity', last_reported: '2026-05-20T09:30:22', severity: 'Critical' },
    { uuid: 'event-03', device: 'alpha-collector-MT', device_type: 'Vmware', count: 3539, description: 'Product Found', source: 'Unity', last_reported: '2026-05-18T16:40:38', severity: 'Information' },
    { uuid: 'event-04', device: 'ul-easy-trade-app0', device_type: 'Vmware', count: 2380, description: 'Exception not handled: System', source: 'Unity', last_reported: '2026-05-20T09:30:21', severity: 'Critical' },
    { uuid: 'event-05', device: 'ul-easy-trade-app0', device_type: 'Vmware', count: 1743, description: 'Getting default accounts', source: 'Unity', last_reported: '2026-05-20T08:30:15', severity: 'Information' },
    { uuid: 'event-06', device: 'alpha-collector-MT', device_type: 'Vm', count: 957, description: 'Linux: High swap space usage', source: 'Unity', last_reported: '2026-03-19T18:17:04', severity: 'Warning' },
    { uuid: 'event-07', device: 'ul-BankOfAnthos-a', device_type: 'Vmware', count: 888, description: 'Session Metrics 0 nanoseconds', source: 'Unity', last_reported: '2026-05-20T06:31:28', severity: 'Information' },
    { uuid: 'event-08', device: 'alpha-collector-MT', device_type: 'Vm', count: 538, description: 'Exception not handled: System', source: 'Unity', last_reported: '2026-03-19T18:17:04', severity: 'Information' },
    { uuid: 'event-09', device: 'alpha-collector-MT', device_type: 'Vmware', count: 528, description: 'Failed to export logs to 10.192', source: 'Unity', last_reported: '2026-05-04T20:05:02', severity: 'Critical' },
    { uuid: 'event-10', device: 'alpha-collector-MT', device_type: 'Vmware', count: 527, description: 'Convert conversion successful', source: 'Unity', last_reported: '2026-05-19T21:06:39', severity: 'Information' }
  ],
  active_category: 'application',
  category_options: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY
};

export const NOISY_HOSTS_DUMMY: NoisyHostsResponse = {
  rows: [
    { uuid: 'host-event-01', device: 'ul-easy-trade-app0', device_type: 'Vmware', count: 5006, description: 'Getting flag data for id ergo_a', source: 'Unity', last_reported: '2026-05-27T11:11:13', severity: 'Information' },
    { uuid: 'host-event-02', device: 'alpha-collector-MT', device_type: 'Vmware', count: 3836, description: 'Product Found', source: 'Unity', last_reported: '2026-06-17T17:31:16', severity: 'Information' },
    { uuid: 'host-event-03', device: 'ul-easy-trade-app0', device_type: 'Vmware', count: 3684, description: 'An unhandled exception has occurred', source: 'Unity', last_reported: '2026-05-27T11:10:46', severity: 'Critical' },
    { uuid: 'host-event-04', device: 'ul-easy-trade-app0', device_type: 'Vmware', count: 2483, description: 'Exception not handled: System', source: 'Unity', last_reported: '2026-05-27T11:10:45', severity: 'Critical' },
    { uuid: 'host-event-05', device: 'ul-easy-trade-app0', device_type: 'Vmware', count: 1779, description: 'Getting default accounts', source: 'Unity', last_reported: '2026-05-27T10:30:05', severity: 'Information' },
    { uuid: 'host-event-06', device: 'alpha-collector-MT', device_type: 'Vm', count: 957, description: 'Linux: High swap space usage', source: 'Unity', last_reported: '2026-03-19T18:17:04', severity: 'Warning' },
    { uuid: 'host-event-07', device: 'ul-BankOfAnthos-a', device_type: 'Vmware', count: 888, description: 'Session Metrics 0 nanoseconds', source: 'Unity', last_reported: '2026-05-20T06:31:28', severity: 'Information' },
    { uuid: 'host-event-08', device: 'alpha-collector-MT', device_type: 'Vmware', count: 562, description: 'Convert conversion successful', source: 'Unity', last_reported: '2026-06-17T08:30:19', severity: 'Information' },
    { uuid: 'host-event-09', device: 'alpha-collector-MT', device_type: 'Vm', count: 538, description: 'Exception not handled: System', source: 'Unity', last_reported: '2026-03-19T18:17:04', severity: 'Information' },
    { uuid: 'host-event-10', device: 'alpha-collector-MT', device_type: 'Vmware', count: 528, description: 'Failed to export logs to 10.192', source: 'Unity', last_reported: '2026-05-04T20:05:02', severity: 'Critical' }
  ],
  chart: [
    { host_name: 'ul-easy-trade-app0', critical: 4100, warning: 0, information: 5000 },
    { host_name: 'alpha-collector-MT', critical: 860, warning: 0, information: 4720 },
    { host_name: 'ul-BankOfAnthos-app', critical: 260, warning: 120, information: 970 },
    { host_name: 'Azure LAB', critical: 0, warning: 240, information: 0 },
    { host_name: 'unity', critical: 290, warning: 0, information: 0 },
    { host_name: 'SCOMDMH01', critical: 0, warning: 340, information: 0 }
  ],
  active_category: 'application',
  category_options: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY
};

export const INCIDENT_MANAGEMENT_DUMMY: IncidentManagementResponse = {
  alert_generated_by_device_type: [
    { key: 'ul_switch_01', device_name: 'UL-switch-01', critical: 5, warning: 15, information: 19, ticket_count: 15 },
    { key: 'router_x2', device_name: 'Router-X2', critical: 7, warning: 16, information: 20, ticket_count: 20 },
    { key: 'firewall_pro_3000', device_name: 'Firewall-Pro 3000', critical: 8, warning: 17, information: 21, ticket_count: 16 },
    { key: 'loadbalancer_alpha', device_name: 'LoadBalancer-Alpha', critical: 9, warning: 18, information: 22, ticket_count: 21 },
    { key: 'storage_node_45', device_name: 'StorageNode-45', critical: 10, warning: 19, information: 23, ticket_count: 17 },
    { key: 'database_server_77', device_name: 'DatabaseServer-77', critical: 11, warning: 20, information: 24, ticket_count: 22 },
    { key: 'app_gateway_03', device_name: 'AppGateway-03', critical: 6, warning: 14, information: 18, ticket_count: 13 },
    { key: 'gpu_worker_02', device_name: 'GPU-Worker-02', critical: 4, warning: 11, information: 16, ticket_count: 10 },
    { key: 'container_node_09', device_name: 'ContainerNode-09', critical: 5, warning: 12, information: 17, ticket_count: 12 },
    { key: 'db_cache_01', device_name: 'DB-Cache-01', critical: 3, warning: 10, information: 14, ticket_count: 9 }
  ],
  open_incident_tickets: [
    { uuid: 'open-01', ticket_id: 'INC1804025', device_name: 'UL-Switch-1', alert_type: 'Information', tone: 'info', ticket_count: 1 },
    { uuid: 'open-02', ticket_id: 'INC1804026', device_name: 'UL-Switch-2', alert_type: 'Critical', tone: 'danger', ticket_count: 1 },
    { uuid: 'open-03', ticket_id: 'INC1804027', device_name: 'UL-Switch-3', alert_type: 'Warning', tone: 'warning', ticket_count: 2 },
    { uuid: 'open-04', ticket_id: 'INC1804028', device_name: 'UL-Switch-4', alert_type: 'Information', tone: 'info', ticket_count: 1 },
    { uuid: 'open-05', ticket_id: 'INC1804029', device_name: 'UL-Switch-5', alert_type: 'Warning', tone: 'warning', ticket_count: 1 },
    { uuid: 'open-06', ticket_id: 'INC1804030', device_name: 'UL-Switch-6', alert_type: 'Critical', tone: 'danger', ticket_count: 3 },
    { uuid: 'open-07', ticket_id: 'INC1804031', device_name: 'UL-Switch-7', alert_type: 'Information', tone: 'info', ticket_count: 1 },
    { uuid: 'open-08', ticket_id: 'INC1804032', device_name: 'UL-Switch-8', alert_type: 'Warning', tone: 'warning', ticket_count: 2 },
    { uuid: 'open-09', ticket_id: 'INC1804033', device_name: 'UL-Switch-9', alert_type: 'Critical', tone: 'danger', ticket_count: 1 },
    { uuid: 'open-10', ticket_id: 'INC1804034', device_name: 'UL-Switch-10', alert_type: 'Information', tone: 'info', ticket_count: 1 }
  ],
  resolved_incident_tickets: [
    { uuid: 'resolved-01', ticket_id: 'INC1804025', device_name: 'UL-Switch-1', alert_type: 'Information', tone: 'info', ticket_count: 1 },
    { uuid: 'resolved-02', ticket_id: 'INC1804026', device_name: 'UL-Switch-2', alert_type: 'Critical', tone: 'danger', ticket_count: 1 },
    { uuid: 'resolved-03', ticket_id: 'INC1804027', device_name: 'UL-Switch-3', alert_type: 'Warning', tone: 'warning', ticket_count: 2 },
    { uuid: 'resolved-04', ticket_id: 'INC1804028', device_name: 'UL-Switch-4', alert_type: 'Information', tone: 'info', ticket_count: 1 },
    { uuid: 'resolved-05', ticket_id: 'INC1804029', device_name: 'UL-Switch-5', alert_type: 'Warning', tone: 'warning', ticket_count: 1 },
    { uuid: 'resolved-06', ticket_id: 'INC1804030', device_name: 'UL-Switch-6', alert_type: 'Critical', tone: 'danger', ticket_count: 3 },
    { uuid: 'resolved-07', ticket_id: 'INC1804031', device_name: 'UL-Switch-7', alert_type: 'Information', tone: 'info', ticket_count: 1 },
    { uuid: 'resolved-08', ticket_id: 'INC1804032', device_name: 'UL-Switch-8', alert_type: 'Warning', tone: 'warning', ticket_count: 2 },
    { uuid: 'resolved-09', ticket_id: 'INC1804033', device_name: 'UL-Switch-9', alert_type: 'Critical', tone: 'danger', ticket_count: 1 },
    { uuid: 'resolved-10', ticket_id: 'INC1804034', device_name: 'UL-Switch-10', alert_type: 'Information', tone: 'info', ticket_count: 1 }
  ],
  active_category: 'application',
  category_options: EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY
};
