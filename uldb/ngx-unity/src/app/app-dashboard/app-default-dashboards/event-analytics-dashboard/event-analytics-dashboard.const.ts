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

export const EVENT_ANALYTICS_ALL_SOURCE_VALUE = 'all_source';
export const EVENT_ANALYTICS_ALL_SOURCE_OPTION: SelectOption = { value: EVENT_ANALYTICS_ALL_SOURCE_VALUE, label: 'All Sources' };
export const EVENT_ANALYTICS_ALL_SEVERITY_VALUE = 'all_severity';
export const EVENT_ANALYTICS_ALL_SEVERITY_OPTION: SelectOption = { value: EVENT_ANALYTICS_ALL_SEVERITY_VALUE, label: 'All Severity' };
export const EVENT_ANALYTICS_ALL_DATACENTER_VALUE = 'all_datacenter';
export const EVENT_ANALYTICS_ALL_DATACENTER_OPTION: SelectOption = { value: EVENT_ANALYTICS_ALL_DATACENTER_VALUE, label: 'All Datacenter' };

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

export const EVENT_ANALYTICS_TOP_TIME_RANGE_OPTIONS: SelectOption[] = [
  { value: 'last_24_hours', label: 'Last 24 Hours' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_60_days', label: 'Last 60 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  // { value: EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE, label: 'Custom' }
];

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
  timeRange: EVENT_ANALYTICS_TOP_TIME_RANGE_OPTIONS,
  trendTimeline: EVENT_ANALYTICS_TIME_RANGE_OPTIONS,
  category: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  eventDeviceCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  alertSegregationCategory: EVENT_ANALYTICS_CATEGORY_OPTIONS,
  analyticsViewBy: [
    { value: 'source', label: 'Source' },
    { value: 'severity', label: 'Severity' }
  ],
  analyticsSourceType: [
    EVENT_ANALYTICS_ALL_SOURCE_OPTION,
    // { value: 'unity', label: 'Unity' },
    // { value: 'azure', label: 'Azure' },
    // { value: 'nagios', label: 'Nagios' },
    // { value: 'zabbix', label: 'Zabbix' },
    // { value: 'aws_cloudwatch', label: 'AWS CloudWatch' },
    // { value: 'logicmonitor', label: 'LogicMonitor' },
    // { value: 'opsramp', label: 'OpsRamp' },
    // { value: 'appdynamics', label: 'AppDynamics' }
  ],
  analyticsSeverityType: [
    EVENT_ANALYTICS_ALL_SEVERITY_OPTION,
    { value: 'critical', label: 'Critical' },
    { value: 'warning', label: 'Warning' },
    { value: 'information', label: 'Information' }
  ],
  analyticsDatacenter: [
    EVENT_ANALYTICS_ALL_DATACENTER_OPTION
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
  "lastRefreshed": "Today 16:15 IST",
  "scope": {
    "sources": "All sources (6)",
    "deviceTypes": "All device types (6)"
  },
  "activeSources": [
    "AppDynamics",
    "Dynatrace",
    "LogicMonitor",
    "Custom",
    "NewRelic",
    "OpsRamp"
  ]
};

export const DASHBOARD_TOP_FILTERS_API_DUMMY: DashboardFiltersApiResponse = {
  "source": [
    {
      "value": "appdynamics",
      "label": "AppDynamics"
    },
    {
      "value": "dynatrace",
      "label": "Dynatrace"
    },
    {
      "value": "logicmonitor",
      "label": "LogicMonitor"
    },
    {
      "value": "custom",
      "label": "Custom"
    },
    {
      "value": "newrelic",
      "label": "NewRelic"
    },
    {
      "value": "opsramp",
      "label": "OpsRamp"
    }
  ],
  "timeRange": [
    {
      "value": "last_hour",
      "label": "Last Hour"
    },
    {
      "value": "last_24_hours",
      "label": "Last 24 Hours"
    },
    {
      "value": "last_week",
      "label": "Last 7 Days"
    },
    {
      "value": "last_month",
      "label": "Last 30 Days"
    },
    {
      "value": "last_60_days",
      "label": "Last 60 Days"
    },
    {
      "value": "last_quarter",
      "label": "Last Quarter"
    },
    {
      "value": "custom",
      "label": "Custom"
    }
  ],
  "deviceType": [
    {
      "value": "Firewall",
      "label": "Firewall"
    },
    {
      "value": "Load Balancer",
      "label": "Load Balancer"
    },
    {
      "value": "Switch",
      "label": "Switch"
    },
    {
      "value": "Hypervisor",
      "label": "Hypervisor"
    },
    {
      "value": "Virtual Machine",
      "label": "Virtual Machine"
    },
    {
      "value": "Storage",
      "label": "Storage"
    },
    {
      "value": "Cloud Controller",
      "label": "Cloud Controller"
    },
    {
      "value": "BM Server",
      "label": "BM Server"
    },
    {
      "value": "Cabinet",
      "label": "Cabinet"
    },
    {
      "value": "PDU",
      "label": "PDU"
    },
    {
      "value": "Mac Device",
      "label": "Mac Device"
    }
  ]
};

export const EXECUTIVE_SUMMARY_API_DUMMY: ExecutiveSummaryApiResponse = {
  "totalInferenceAlerts": 133847,
  "events": 193343,
  "alerts": 133847,
  "conditions": 8168,
  "cumulativeReduction": 30.77,
  "severity": {
    "information": 97,
    "critical": 1486,
    "warning": 6585
  },
  "noiseReduction": 30.77,
  "correlationReduction": 93.9
};

export const PIPELINE_API_DUMMY: PipelineApiResponse = {
  "funnel": [
    {
      "count": 193343,
      "kpi": null,
      "label": "Raw Events",
      "stage": "Events"
    },
    {
      "count": 133847,
      "kpi": "30.77%",
      "label": "Noise Reduction",
      "stage": "Alerts"
    },
    {
      "count": 8168,
      "kpi": "93.9%",
      "label": "Correlation %",
      "stage": "Conditions"
    }
  ],
  "kpis": {
    "rawEvents": 193343,
    "noiseReduction": "30.77%",
    "correlationPct": "93.9%"
  }
};

export const EVENT_BY_DEVICE_TYPE_API_DUMMY: EventByDeviceTypeApiResponse = {
  "donut": [
    {
      "count": 10,
      "percentage": 0,
      "key": "baremetal_servers",
      "label": "Baremetals"
    },
    {
      "count": 57,
      "percentage": 0,
      "key": "database",
      "label": "Database"
    },
    {
      "count": 1166,
      "percentage": 0,
      "key": "network",
      "label": "Network"
    },
    {
      "count": 73393,
      "percentage": 0,
      "key": "private_cloud_compute",
      "label": "Private Cloud Compute"
    }
  ],
  "tiles": [
    {
      "count": 10,
      "key": "baremetal_servers",
      "label": "Baremetals"
    },
    {
      "count": 57,
      "key": "database",
      "label": "Database"
    },
    {
      "count": 1166,
      "key": "network",
      "label": "Network"
    },
    {
      "count": 73393,
      "key": "private_cloud_compute",
      "label": "Private Cloud Compute"
    }
  ],
  "total": 74626,
  "activeCategory": "all",
  "categoryOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "baremetal_servers",
      "label": "Baremetals"
    },
    {
      "value": "database",
      "label": "Database"
    },
    {
      "value": "network",
      "label": "Network"
    },
    {
      "value": "private_cloud_compute",
      "label": "Private Cloud Compute"
    }
  ]
};

export const ALERT_GENERATED_DUMMY: AlertWidgetApiResponse = {
  "kpis": [
    {
      "tone": "primary",
      "value": 133847,
      "key": "open",
      "label": "Open"
    },
    {
      "tone": "success",
      "value": 8168,
      "key": "correlated",
      "label": "Correlated"
    },
    {
      "tone": "info",
      "value": 125679,
      "key": "suppressed",
      "label": "Suppressed"
    },
    {
      "tone": "danger",
      "value": 4553,
      "key": "ticketed",
      "label": "Ticketed"
    },
    {
      "tone": "success",
      "value": 7485,
      "key": "closed",
      "label": "Closed"
    }
  ],
  "donut": [
    {
      "tone": "primary",
      "value": 133847,
      "key": "open",
      "label": "Open"
    },
    {
      "tone": "success",
      "value": 8168,
      "key": "correlated",
      "label": "Correlated"
    },
    {
      "tone": "info",
      "value": 125679,
      "key": "suppressed",
      "label": "Suppressed"
    },
    {
      "tone": "danger",
      "value": 4553,
      "key": "ticketed",
      "label": "Ticketed"
    },
    {
      "tone": "success",
      "value": 7485,
      "key": "closed",
      "label": "Closed"
    }
  ]
};

export const ALERT_STATUS_DUMMY: AlertWidgetApiResponse = {
  "kpis": [
    {
      "tone": "danger",
      "value": 2589,
      "key": "critical",
      "label": "Critical"
    },
    {
      "tone": "warning",
      "value": 131146,
      "key": "warning",
      "label": "Warning"
    },
    {
      "tone": "success",
      "value": 112,
      "key": "information",
      "label": "Success"
    }
  ],
  "donut": [
    {
      "value": 2589,
      "key": "critical",
      "label": "Critical"
    },
    {
      "value": 131146,
      "key": "warning",
      "label": "Warning"
    },
    {
      "value": 112,
      "key": "information",
      "label": "Info"
    }
  ]
};

export const TREND_BY_TIMELINE_API_DUMMY: TrendByTimelineApiResponse = {
  "series": {
    "alerts": [
      {
        "count": 195,
        "start_time": "06/28/2026, 03:45:21",
        "end_time": "06/29/2026, 03:45:21"
      },
      {
        "count": 8835,
        "start_time": "06/29/2026, 03:45:21",
        "end_time": "06/30/2026, 03:45:21"
      },
      {
        "count": 10054,
        "start_time": "06/30/2026, 03:45:21",
        "end_time": "07/01/2026, 03:45:21"
      },
      {
        "count": 12191,
        "start_time": "07/01/2026, 03:45:21",
        "end_time": "07/02/2026, 03:45:21"
      },
      {
        "count": 10253,
        "start_time": "07/02/2026, 03:45:21",
        "end_time": "07/03/2026, 03:45:21"
      },
      {
        "count": 5527,
        "start_time": "07/03/2026, 03:45:21",
        "end_time": "07/04/2026, 03:45:21"
      },
      {
        "count": 5062,
        "start_time": "07/04/2026, 03:45:21",
        "end_time": "07/05/2026, 03:45:21"
      },
      {
        "count": 34,
        "start_time": "07/05/2026, 03:45:21",
        "end_time": "07/06/2026, 03:45:21"
      },
      {
        "count": 65,
        "start_time": "07/06/2026, 03:45:21",
        "end_time": "07/07/2026, 03:45:21"
      },
      {
        "count": 40,
        "start_time": "07/07/2026, 03:45:21",
        "end_time": "07/08/2026, 03:45:21"
      },
      {
        "count": 59,
        "start_time": "07/08/2026, 03:45:21",
        "end_time": "07/09/2026, 03:45:21"
      },
      {
        "count": 14,
        "start_time": "07/09/2026, 03:45:21",
        "end_time": "07/10/2026, 03:45:21"
      },
      {
        "count": 28,
        "start_time": "07/10/2026, 03:45:21",
        "end_time": "07/11/2026, 03:45:21"
      },
      {
        "count": 6,
        "start_time": "07/11/2026, 03:45:21",
        "end_time": "07/12/2026, 03:45:21"
      },
      {
        "count": 9,
        "start_time": "07/12/2026, 03:45:21",
        "end_time": "07/13/2026, 03:45:21"
      },
      {
        "count": 11921,
        "start_time": "07/13/2026, 03:45:21",
        "end_time": "07/14/2026, 03:45:21"
      },
      {
        "count": 5810,
        "start_time": "07/14/2026, 03:45:21",
        "end_time": "07/15/2026, 03:45:21"
      },
      {
        "count": 15,
        "start_time": "07/15/2026, 03:45:21",
        "end_time": "07/16/2026, 03:45:21"
      },
      {
        "count": 34,
        "start_time": "07/16/2026, 03:45:21",
        "end_time": "07/17/2026, 03:45:21"
      },
      {
        "count": 9,
        "start_time": "07/17/2026, 03:45:21",
        "end_time": "07/18/2026, 03:45:21"
      },
      {
        "count": 4,
        "start_time": "07/18/2026, 03:45:21",
        "end_time": "07/19/2026, 03:45:21"
      },
      {
        "count": 8,
        "start_time": "07/19/2026, 03:45:21",
        "end_time": "07/20/2026, 03:45:21"
      },
      {
        "count": 17,
        "start_time": "07/20/2026, 03:45:21",
        "end_time": "07/21/2026, 03:45:21"
      },
      {
        "count": 6042,
        "start_time": "07/21/2026, 03:45:21",
        "end_time": "07/22/2026, 03:45:21"
      },
      {
        "count": 12783,
        "start_time": "07/22/2026, 03:45:21",
        "end_time": "07/23/2026, 03:45:21"
      },
      {
        "count": 11719,
        "start_time": "07/23/2026, 03:45:21",
        "end_time": "07/24/2026, 03:45:21"
      },
      {
        "count": 8469,
        "start_time": "07/24/2026, 03:45:21",
        "end_time": "07/25/2026, 03:45:21"
      },
      {
        "count": 9163,
        "start_time": "07/25/2026, 03:45:21",
        "end_time": "07/26/2026, 03:45:21"
      },
      {
        "count": 7958,
        "start_time": "07/26/2026, 03:45:21",
        "end_time": "07/27/2026, 03:45:21"
      },
      {
        "count": 6451,
        "start_time": "07/27/2026, 03:45:21",
        "end_time": "07/28/2026, 03:45:21"
      }
    ],
    "conditions": [
      {
        "count": 22,
        "start_time": "06/28/2026, 03:45:22",
        "end_time": "06/29/2026, 03:45:22"
      },
      {
        "count": 721,
        "start_time": "06/29/2026, 03:45:22",
        "end_time": "06/30/2026, 03:45:22"
      },
      {
        "count": 753,
        "start_time": "06/30/2026, 03:45:22",
        "end_time": "07/01/2026, 03:45:22"
      },
      {
        "count": 735,
        "start_time": "07/01/2026, 03:45:22",
        "end_time": "07/02/2026, 03:45:22"
      },
      {
        "count": 564,
        "start_time": "07/02/2026, 03:45:22",
        "end_time": "07/03/2026, 03:45:22"
      },
      {
        "count": 290,
        "start_time": "07/03/2026, 03:45:22",
        "end_time": "07/04/2026, 03:45:22"
      },
      {
        "count": 247,
        "start_time": "07/04/2026, 03:45:22",
        "end_time": "07/05/2026, 03:45:22"
      },
      {
        "count": 29,
        "start_time": "07/05/2026, 03:45:22",
        "end_time": "07/06/2026, 03:45:22"
      },
      {
        "count": 55,
        "start_time": "07/06/2026, 03:45:22",
        "end_time": "07/07/2026, 03:45:22"
      },
      {
        "count": 36,
        "start_time": "07/07/2026, 03:45:22",
        "end_time": "07/08/2026, 03:45:22"
      },
      {
        "count": 51,
        "start_time": "07/08/2026, 03:45:22",
        "end_time": "07/09/2026, 03:45:22"
      },
      {
        "count": 14,
        "start_time": "07/09/2026, 03:45:22",
        "end_time": "07/10/2026, 03:45:22"
      },
      {
        "count": 27,
        "start_time": "07/10/2026, 03:45:22",
        "end_time": "07/11/2026, 03:45:22"
      },
      {
        "count": 6,
        "start_time": "07/11/2026, 03:45:22",
        "end_time": "07/12/2026, 03:45:22"
      },
      {
        "count": 9,
        "start_time": "07/12/2026, 03:45:22",
        "end_time": "07/13/2026, 03:45:22"
      },
      {
        "count": 411,
        "start_time": "07/13/2026, 03:45:22",
        "end_time": "07/14/2026, 03:45:22"
      },
      {
        "count": 335,
        "start_time": "07/14/2026, 03:45:22",
        "end_time": "07/15/2026, 03:45:22"
      },
      {
        "count": 15,
        "start_time": "07/15/2026, 03:45:22",
        "end_time": "07/16/2026, 03:45:22"
      },
      {
        "count": 30,
        "start_time": "07/16/2026, 03:45:22",
        "end_time": "07/17/2026, 03:45:22"
      },
      {
        "count": 9,
        "start_time": "07/17/2026, 03:45:22",
        "end_time": "07/18/2026, 03:45:22"
      },
      {
        "count": 4,
        "start_time": "07/18/2026, 03:45:22",
        "end_time": "07/19/2026, 03:45:22"
      },
      {
        "count": 8,
        "start_time": "07/19/2026, 03:45:22",
        "end_time": "07/20/2026, 03:45:22"
      },
      {
        "count": 17,
        "start_time": "07/20/2026, 03:45:22",
        "end_time": "07/21/2026, 03:45:22"
      },
      {
        "count": 361,
        "start_time": "07/21/2026, 03:45:22",
        "end_time": "07/22/2026, 03:45:22"
      },
      {
        "count": 698,
        "start_time": "07/22/2026, 03:45:22",
        "end_time": "07/23/2026, 03:45:22"
      },
      {
        "count": 718,
        "start_time": "07/23/2026, 03:45:22",
        "end_time": "07/24/2026, 03:45:22"
      },
      {
        "count": 545,
        "start_time": "07/24/2026, 03:45:22",
        "end_time": "07/25/2026, 03:45:22"
      },
      {
        "count": 537,
        "start_time": "07/25/2026, 03:45:22",
        "end_time": "07/26/2026, 03:45:22"
      },
      {
        "count": 469,
        "start_time": "07/26/2026, 03:45:22",
        "end_time": "07/27/2026, 03:45:22"
      },
      {
        "count": 419,
        "start_time": "07/27/2026, 03:45:22",
        "end_time": "07/28/2026, 03:45:22"
      }
    ],
    "events": [
      {
        "count": 367,
        "start_time": "06/28/2026, 03:45:19",
        "end_time": "06/29/2026, 03:45:19"
      },
      {
        "count": 9172,
        "start_time": "06/29/2026, 03:45:19",
        "end_time": "06/30/2026, 03:45:19"
      },
      {
        "count": 10671,
        "start_time": "06/30/2026, 03:45:19",
        "end_time": "07/01/2026, 03:45:19"
      },
      {
        "count": 12706,
        "start_time": "07/01/2026, 03:45:19",
        "end_time": "07/02/2026, 03:45:19"
      },
      {
        "count": 14695,
        "start_time": "07/02/2026, 03:45:19",
        "end_time": "07/03/2026, 03:45:19"
      },
      {
        "count": 7022,
        "start_time": "07/03/2026, 03:45:19",
        "end_time": "07/04/2026, 03:45:19"
      },
      {
        "count": 5247,
        "start_time": "07/04/2026, 03:45:19",
        "end_time": "07/05/2026, 03:45:19"
      },
      {
        "count": 145,
        "start_time": "07/05/2026, 03:45:19",
        "end_time": "07/06/2026, 03:45:19"
      },
      {
        "count": 163,
        "start_time": "07/06/2026, 03:45:19",
        "end_time": "07/07/2026, 03:45:19"
      },
      {
        "count": 134,
        "start_time": "07/07/2026, 03:45:19",
        "end_time": "07/08/2026, 03:45:19"
      },
      {
        "count": 145,
        "start_time": "07/08/2026, 03:45:19",
        "end_time": "07/09/2026, 03:45:19"
      },
      {
        "count": 39,
        "start_time": "07/09/2026, 03:45:19",
        "end_time": "07/10/2026, 03:45:19"
      },
      {
        "count": 63,
        "start_time": "07/10/2026, 03:45:19",
        "end_time": "07/11/2026, 03:45:19"
      },
      {
        "count": 31,
        "start_time": "07/11/2026, 03:45:19",
        "end_time": "07/12/2026, 03:45:19"
      },
      {
        "count": 10,
        "start_time": "07/12/2026, 03:45:19",
        "end_time": "07/13/2026, 03:45:19"
      },
      {
        "count": 12401,
        "start_time": "07/13/2026, 03:45:19",
        "end_time": "07/14/2026, 03:45:19"
      },
      {
        "count": 6198,
        "start_time": "07/14/2026, 03:45:19",
        "end_time": "07/15/2026, 03:45:19"
      },
      {
        "count": 15,
        "start_time": "07/15/2026, 03:45:19",
        "end_time": "07/16/2026, 03:45:19"
      },
      {
        "count": 41,
        "start_time": "07/16/2026, 03:45:19",
        "end_time": "07/17/2026, 03:45:19"
      },
      {
        "count": 13,
        "start_time": "07/17/2026, 03:45:19",
        "end_time": "07/18/2026, 03:45:19"
      },
      {
        "count": 5,
        "start_time": "07/18/2026, 03:45:19",
        "end_time": "07/19/2026, 03:45:19"
      },
      {
        "count": 8,
        "start_time": "07/19/2026, 03:45:19",
        "end_time": "07/20/2026, 03:45:19"
      },
      {
        "count": 19,
        "start_time": "07/20/2026, 03:45:19",
        "end_time": "07/21/2026, 03:45:19"
      },
      {
        "count": 7414,
        "start_time": "07/21/2026, 03:45:19",
        "end_time": "07/22/2026, 03:45:19"
      },
      {
        "count": 17482,
        "start_time": "07/22/2026, 03:45:19",
        "end_time": "07/23/2026, 03:45:19"
      },
      {
        "count": 20669,
        "start_time": "07/23/2026, 03:45:19",
        "end_time": "07/24/2026, 03:45:19"
      },
      {
        "count": 16706,
        "start_time": "07/24/2026, 03:45:19",
        "end_time": "07/25/2026, 03:45:19"
      },
      {
        "count": 15882,
        "start_time": "07/25/2026, 03:45:19",
        "end_time": "07/26/2026, 03:45:19"
      },
      {
        "count": 16278,
        "start_time": "07/26/2026, 03:45:19",
        "end_time": "07/27/2026, 03:45:19"
      },
      {
        "count": 17780,
        "start_time": "07/27/2026, 03:45:19",
        "end_time": "07/28/2026, 03:45:19"
      }
    ]
  },
  "entityTypeOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "event",
      "label": "Events"
    },
    {
      "value": "alert",
      "label": "Alerts"
    },
    {
      "value": "condition",
      "label": "Conditions"
    }
  ],
  "activeEntityType": "all",
  "granularity": "daily",
  "activeTimeRange": "last_month",
  "timeRangeOptions": [
    {
      "value": "last_24_hours",
      "label": "Last 24 Hours"
    },
    {
      "value": "last_week",
      "label": "Last 7 Days"
    },
    {
      "value": "last_month",
      "label": "Last Month"
    }
  ]
};

export const ALERT_SEGREGATION_API_DUMMY: AlertSegregationApiResponse = {
  "totalCritical": 1710,
  "totalWarning": 63733,
  "totalInfo": 112,
  "bars": [
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "application",
      "label": "Application"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 7,
      "key": "baremetal_servers",
      "label": "Baremetals"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "containers",
      "label": "Container"
    },
    {
      "information": 7,
      "critical": 10,
      "warning": 32,
      "key": "database",
      "label": "Database"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "gpu",
      "label": "GPU"
    },
    {
      "information": 34,
      "critical": 28,
      "warning": 868,
      "key": "network",
      "label": "Network"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "others",
      "label": "Others"
    },
    {
      "information": 71,
      "critical": 1672,
      "warning": 62826,
      "key": "private_cloud_compute",
      "label": "Private Cloud Compute"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "public_cloud_compute",
      "label": "Public Cloud Compute"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "platform_services",
      "label": "Platform Services"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "sd_wan",
      "label": "SD-WAN"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "sensors",
      "label": "Sensors"
    },
    {
      "information": 0,
      "critical": 0,
      "warning": 0,
      "key": "storage",
      "label": "Storage"
    }
  ],
  "activeCategory": "all",
  "categoryOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "application",
      "label": "Application"
    },
    {
      "value": "baremetal_servers",
      "label": "Baremetals"
    },
    {
      "value": "containers",
      "label": "Container"
    },
    {
      "value": "database",
      "label": "Database"
    },
    {
      "value": "gpu",
      "label": "GPU"
    },
    {
      "value": "network",
      "label": "Network"
    },
    {
      "value": "others",
      "label": "Others"
    },
    {
      "value": "private_cloud_compute",
      "label": "Private Cloud Compute"
    },
    {
      "value": "public_cloud_compute",
      "label": "Public Cloud Compute"
    },
    {
      "value": "platform_services",
      "label": "Platform Services"
    },
    {
      "value": "sd_wan",
      "label": "SD-WAN"
    },
    {
      "value": "sensors",
      "label": "Sensors"
    },
    {
      "value": "storage",
      "label": "Storage"
    }
  ]
};

export const EVENT_ALERT_ANALYTICS_API_DUMMY: EventAlertAnalyticsApiResponse = {
  "viewBy": "source",
  "total": 133847,
  "rows": [
    {
      "information": 112,
      "label": "Unity",
      "critical": 2153,
      "key": "unity",
      "total": 133397,
      "warning": 131132
    },
    {
      "information": 0,
      "label": "OpsRamp",
      "critical": 382,
      "key": "opsramp",
      "total": 396,
      "warning": 14
    },
    {
      "information": 0,
      "label": "Custom",
      "critical": 54,
      "key": "custom",
      "total": 54,
      "warning": 0
    }
  ],
  "viewOptions": [
    {
      "value": "source",
      "label": "Source"
    },
    {
      "value": "severity",
      "label": "Severity"
    }
  ],
  "severityOptions": [
    {
      "value": "all_severity",
      "label": "All Severity"
    },
    {
      "value": "critical",
      "label": "Critical"
    },
    {
      "value": "warning",
      "label": "Warning"
    },
    {
      "value": "information",
      "label": "Information"
    }
  ],
  "kpis": {
    "mttr": "84 min 13 Sec",
    "mtta": "0 min 0 Sec",
    "noiseReduction": "30.8%",
    "correlation": "93.9%",
    "cumulativeReduction": "95.8%"
  },
  "flow": {
    "sources": [
      {
        "name": "Unity",
        "eventCount": 191732
      },
      {
        "name": "OpsRamp",
        "eventCount": 1390
      },
      {
        "name": "Custom",
        "eventCount": 222
      }
    ],
    "resolved": 7485,
    "autoRemediated": 0,
    "ticketGenerated": 4553,
    "dedupeEvents": 14179,
    "open": 683,
    "suppressedEvents": 45318,
    "autoHealed": 3557,
    "alerts": 133847,
    "acknowledged": 0,
    "noTicketGenerated": 3615,
    "conditions": 8168,
    "events": 193344
  },
  "categoryOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "application",
      "label": "Application"
    },
    {
      "value": "baremetal_servers",
      "label": "Baremetals"
    },
    {
      "value": "containers",
      "label": "Container"
    },
    {
      "value": "database",
      "label": "Database"
    },
    {
      "value": "gpu",
      "label": "GPU"
    },
    {
      "value": "network",
      "label": "Network"
    },
    {
      "value": "others",
      "label": "Others"
    },
    {
      "value": "private_cloud_compute",
      "label": "Private Cloud Compute"
    },
    {
      "value": "public_cloud_compute",
      "label": "Public Cloud Compute"
    },
    {
      "value": "platform_services",
      "label": "Platform Services"
    },
    {
      "value": "sd_wan",
      "label": "SD-WAN"
    },
    {
      "value": "sensors",
      "label": "Sensors"
    },
    {
      "value": "storage",
      "label": "Storage"
    }
  ],
  "activeCategory": "all",
  "sourceGraph": {
    "nodes": [
      {
        "id": 1,
        "value": 191732,
        "name": "Unity"
      },
      {
        "id": 2,
        "value": 1390,
        "name": "OpsRamp"
      },
      {
        "id": 3,
        "value": 222,
        "name": "Custom"
      },
      {
        "id": 4,
        "value": 193344,
        "name": "Events"
      },
      {
        "id": 5,
        "value": 133847,
        "name": "Alerts"
      },
      {
        "id": 6,
        "value": 14179,
        "name": "Dedupe Events"
      },
      {
        "id": 7,
        "value": 45318,
        "name": "Suppressed Events"
      },
      {
        "id": 8,
        "value": 8168,
        "name": "Conditions"
      },
      {
        "id": 9,
        "value": 4553,
        "name": "Ticket Generated"
      },
      {
        "id": 10,
        "value": 3615,
        "name": "No Ticket Generated"
      }
    ],
    "links": [
      {
        "sourceId": 1,
        "targetId": 4,
        "value": 191732
      },
      {
        "sourceId": 2,
        "targetId": 4,
        "value": 1390
      },
      {
        "sourceId": 3,
        "targetId": 4,
        "value": 222
      },
      {
        "sourceId": 4,
        "targetId": 5,
        "value": 133847
      },
      {
        "sourceId": 4,
        "targetId": 6,
        "value": 14179
      },
      {
        "sourceId": 4,
        "targetId": 7,
        "value": 45318
      },
      {
        "sourceId": 5,
        "targetId": 8,
        "value": 8168
      },
      {
        "sourceId": 8,
        "targetId": 9,
        "value": 4553
      },
      {
        "sourceId": 8,
        "targetId": 10,
        "value": 3615
      }
    ]
  },
  "severityGraph": {
    "nodes": [
      {
        "id": 1,
        "value": 671,
        "name": "Information"
      },
      {
        "id": 2,
        "value": 188602,
        "name": "Warning"
      },
      {
        "id": 3,
        "value": 4072,
        "name": "Critical"
      },
      {
        "id": 4,
        "value": 193344,
        "name": "Events"
      },
      {
        "id": 5,
        "value": 133847,
        "name": "Alerts"
      },
      {
        "id": 6,
        "value": 14179,
        "name": "Dedupe Events"
      },
      {
        "id": 7,
        "value": 45318,
        "name": "Suppressed Events"
      },
      {
        "id": 8,
        "value": 8168,
        "name": "Conditions"
      },
      {
        "id": 9,
        "value": 4553,
        "name": "Root Cause Identified"
      },
      {
        "id": 10,
        "value": 3615,
        "name": "Root Cause Unknown"
      }
    ],
    "links": [
      {
        "sourceId": 1,
        "targetId": 4,
        "value": 671
      },
      {
        "sourceId": 2,
        "targetId": 4,
        "value": 188602
      },
      {
        "sourceId": 3,
        "targetId": 4,
        "value": 4072
      },
      {
        "sourceId": 4,
        "targetId": 5,
        "value": 133847
      },
      {
        "sourceId": 4,
        "targetId": 6,
        "value": 14179
      },
      {
        "sourceId": 4,
        "targetId": 7,
        "value": 45318
      },
      {
        "sourceId": 5,
        "targetId": 8,
        "value": 8168
      },
      {
        "sourceId": 8,
        "targetId": 9,
        "value": 4553
      },
      {
        "sourceId": 8,
        "targetId": 10,
        "value": 3615
      }
    ]
  },
  "rightGraph": {
    "nodes": [
      {
        "id": 1,
        "value": 8168,
        "name": "Condition"
      },
      {
        "id": 2,
        "value": 683,
        "name": "Open"
      },
      {
        "id": 3,
        "value": 7485,
        "name": "Resolved"
      },
      {
        "id": 4,
        "value": 0,
        "name": "Acknowledged"
      },
      {
        "id": 5,
        "value": 3557,
        "name": "Auto Healed"
      },
      {
        "id": 6,
        "value": 0,
        "name": "Auto Remediation"
      },
      {
        "id": 7,
        "value": 3152,
        "name": "5 Min"
      },
      {
        "id": 8,
        "value": 347,
        "name": "30 Min"
      },
      {
        "id": 9,
        "value": 58,
        "name": ">30 Min"
      }
    ],
    "links": [
      {
        "sourceId": 1,
        "targetId": 2,
        "value": 683
      },
      {
        "sourceId": 1,
        "targetId": 3,
        "value": 7485
      },
      {
        "sourceId": 3,
        "targetId": 5,
        "value": 3557
      },
      {
        "sourceId": 5,
        "targetId": 8,
        "value": 347
      },
      {
        "sourceId": 5,
        "targetId": 9,
        "value": 58
      },
      {
        "sourceId": 5,
        "targetId": 7,
        "value": 3152
      }
    ]
  }
};

export const ALERT_BY_DEVICE_TYPE_API_DUMMY: AlertByDeviceTypeApiResponse = {
  "rows": [
    {
      "available": 0,
      "deviceName": "sdxdcwETPEDatabridge",
      "ticketCount": 39216,
      "critical": 129,
      "deviceType": "vm",
      "information": 0,
      "unknown": 0,
      "total": 39437,
      "warning": 39308
    },
    {
      "available": 0,
      "deviceName": "sdxdcw22vcfjh",
      "ticketCount": 10366,
      "critical": 125,
      "deviceType": "vm",
      "information": 0,
      "unknown": 0,
      "total": 10516,
      "warning": 10391
    },
    {
      "available": 0,
      "deviceName": "SDXDcw-ETPE-DataDog",
      "ticketCount": 5636,
      "critical": 82,
      "deviceType": "vm",
      "information": 0,
      "unknown": 0,
      "total": 5820,
      "warning": 5738
    },
    {
      "available": 0,
      "deviceName": "sdxdcl-etpe-swo-otelappd",
      "ticketCount": 1875,
      "critical": 497,
      "deviceType": "vm",
      "information": 0,
      "unknown": 0,
      "total": 2081,
      "warning": 1584
    },
    {
      "available": 0,
      "deviceName": "sdxdcwJS106",
      "ticketCount": 1730,
      "critical": 1,
      "deviceType": "vm",
      "information": 0,
      "unknown": 0,
      "total": 1734,
      "warning": 1733
    },
    {
      "available": 0,
      "deviceName": "sdxdclgrafanaotel",
      "ticketCount": 976,
      "critical": 572,
      "deviceType": "vm",
      "information": 0,
      "unknown": 0,
      "total": 1120,
      "warning": 548
    },
    {
      "available": 0,
      "deviceName": "athena-test-ag",
      "ticketCount": 628,
      "critical": 0,
      "deviceType": "",
      "information": 0,
      "unknown": 0,
      "total": 806,
      "warning": 806
    },
    {
      "available": 0,
      "deviceName": "config-bucket-667811466672",
      "ticketCount": 537,
      "critical": 0,
      "deviceType": "",
      "information": 0,
      "unknown": 0,
      "total": 725,
      "warning": 725
    },
    {
      "available": 0,
      "deviceName": "sdxdclawxzerto2",
      "ticketCount": 618,
      "critical": 108,
      "deviceType": "vm",
      "information": 0,
      "unknown": 0,
      "total": 718,
      "warning": 610
    },
    {
      "available": 0,
      "deviceName": "monotomicro-uibucket-1xquk7hyjlka",
      "ticketCount": 541,
      "critical": 0,
      "deviceType": "",
      "information": 0,
      "unknown": 0,
      "total": 717,
      "warning": 717
    }
  ],
  "categoryOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "vm_host",
      "label": "VM Host"
    },
    {
      "value": "k8s_pod",
      "label": "K8s Pod"
    },
    {
      "value": "vmware_vcenter",
      "label": "VMware Vcenter"
    },
    {
      "value": "storage",
      "label": "Storage"
    },
    {
      "value": "network",
      "label": "Network"
    },
    {
      "value": "database",
      "label": "Database"
    },
    {
      "value": "application",
      "label": "Applications"
    }
  ],
  "activeCategory": "all"
};

export const OPEN_INCIDENT_TICKETS_API_DUMMY: IncidentTicketApiResponse = {
  "rows": [
    {
      "deviceName": "Wipro-Vcenter",
      "affectedService": "Wipro-Vcenter",
      "tone": "danger",
      "uuid": "28f95272-c6d4-4112-a285-e6f401b90bd7",
      "firstAlertDatetime": "2026-07-28T10:17:53.562770+00:00",
      "severity": "Critical",
      "ticketCount": 1,
      "ticketId": "INC1839728",
      "availabilityState": "Critical \u0014 Unavailable",
      "ticketUuid": "b36715ee971e8f58fad47d0de053afc1"
    },
    {
      "deviceName": "aimlnewbuckett",
      "affectedService": "aimlnewbuckett",
      "tone": "warning",
      "uuid": "853c2b8b-b574-41ba-b83f-c39e8ba795cb",
      "firstAlertDatetime": "2026-07-28T10:17:15.299249+00:00",
      "severity": "Warning",
      "ticketCount": 207,
      "ticketId": "INC1839726",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "8627d9ea971e8f58fad47d0de053af5b"
    },
    {
      "deviceName": "BR1-vEdge-01",
      "affectedService": "BR1-vEdge-01",
      "tone": "warning",
      "uuid": "b927ffe8-42bb-464f-abf7-27a836467a8a",
      "firstAlertDatetime": "2026-07-28T10:01:25.565121+00:00",
      "severity": "Warning",
      "ticketCount": 22,
      "ticketId": "INC1839725",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "b68315e2979a8f58fad47d0de053afe9"
    },
    {
      "deviceName": "sdxdclmysqlappd01_MYSQLSERVER",
      "affectedService": "sdxdclmysqlappd01_MYSQLSERVER",
      "tone": "warning",
      "uuid": "d2e02244-c6d8-4f6e-b675-fb0bd80d1399",
      "firstAlertDatetime": "2026-07-28T09:48:29.265376+00:00",
      "severity": "Warning",
      "ticketCount": 2,
      "ticketId": "INC1839722",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "7180d5ee97968f58fad47d0de053afdb"
    },
    {
      "deviceName": "sdxdclgrafanaotel",
      "affectedService": "sdxdclgrafanaotel",
      "tone": "danger",
      "uuid": "9a60125a-7042-449b-88b9-0b76326937c8",
      "firstAlertDatetime": "2026-07-28T09:34:32.701779+00:00",
      "severity": "Critical",
      "ticketCount": 17,
      "ticketId": "INC1839719",
      "availabilityState": "Critical \u0014 Unavailable",
      "ticketUuid": "f0dd01a2c35ecf5871fd3e070501316b"
    },
    {
      "deviceName": "SDX-COE-SFRM-LEAF07",
      "affectedService": "SDX-COE-SFRM-LEAF07",
      "tone": "warning",
      "uuid": "4a702b75-0531-4b5f-89ce-7e24207bcaf1",
      "firstAlertDatetime": "2026-07-28T09:25:29.484818+00:00",
      "severity": "Warning",
      "ticketCount": 1,
      "ticketId": "INC1839716",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "5dcb052697528f58fad47d0de053af74"
    },
    {
      "deviceName": "arn:aws:elasticloadbalancing:us-east-2:667811466675:loadbalancer/app/cloudstudio-prodlb/f06e58b325990177",
      "affectedService": "arn:aws:elasticloadbalancing:us-east-2:667811466675:loadbalancer/app/cloudstudio-prodlb/f06e58b325990177",
      "tone": "warning",
      "uuid": "b6cb87a6-e7c9-4f89-903c-d07afec62047",
      "firstAlertDatetime": "2026-07-28T09:07:21.146482+00:00",
      "severity": "Warning",
      "ticketCount": 3,
      "ticketId": "INC1839714",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "614b016a97128f58fad47d0de053afa6"
    },
    {
      "deviceName": "sdxdcwETPEDatabridge",
      "affectedService": "sdxdcwETPEDatabridge",
      "tone": "warning",
      "uuid": "64f00a29-b353-4367-8fa8-8c225a564f39",
      "firstAlertDatetime": "2026-07-28T09:03:45.690941+00:00",
      "severity": "Warning",
      "ticketCount": 142,
      "ticketId": "INC1839709",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "c146cd6a971e4f58fad47d0de053afa0"
    },
    {
      "deviceName": "amplify-aklamp-staging-15209-deployment",
      "affectedService": "amplify-aklamp-staging-15209-deployment",
      "tone": "warning",
      "uuid": "4cdd686f-02fb-4e7d-bf34-32562cb1a517",
      "firstAlertDatetime": "2026-07-28T09:03:22.819281+00:00",
      "severity": "Warning",
      "ticketCount": 601,
      "ticketId": "INC1839708",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "644641aac31acf5871fd3e07050131e9"
    },
    {
      "deviceName": "sdxdcw22vcfjh",
      "affectedService": "sdxdcw22vcfjh",
      "tone": "warning",
      "uuid": "5ee7344a-a2d5-4642-8c67-5ee9c64694c8",
      "firstAlertDatetime": "2026-07-28T06:20:33.377604+00:00",
      "severity": "Warning",
      "ticketCount": 4,
      "ticketId": "INC1839703",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "52116c62975e0f58fad47d0de053afe7"
    }
  ],
  "total": 625,
  "categoryOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "vm_host",
      "label": "VM Host"
    },
    {
      "value": "k8s_pod",
      "label": "K8s Pod"
    },
    {
      "value": "vmware_vcenter",
      "label": "VMware Vcenter"
    },
    {
      "value": "storage",
      "label": "Storage"
    },
    {
      "value": "network",
      "label": "Network"
    },
    {
      "value": "database",
      "label": "Database"
    },
    {
      "value": "application",
      "label": "Applications"
    }
  ],
  "activeCategory": "all"
};

export const RESOLVED_INCIDENT_TICKETS_API_DUMMY: IncidentTicketApiResponse = {
  "rows": [
    {
      "deviceName": "sdxdcl-etpe-swo-otelappd",
      "affectedService": "sdxdcl-etpe-swo-otelappd",
      "tone": "warning",
      "uuid": "cb415248-ebac-4705-9dbb-6163dd0485e1",
      "severity": "Warning",
      "ticketCount": 7,
      "ticketId": "INC1839724",
      "resolvedDatetime": "2026-07-28T10:05:46+00:00",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "d1719966971a8f58fad47d0de053afc1"
    },
    {
      "deviceName": "sdxdcwETPEDatabridge",
      "affectedService": "sdxdcwETPEDatabridge",
      "tone": "warning",
      "uuid": "895fc807-8dd7-43bc-83a9-afa3d37c98ca",
      "severity": "Warning",
      "ticketCount": 1,
      "ticketId": "INC1839727",
      "resolvedDatetime": "2026-07-28T09:56:57+00:00",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "3b675926c396039871fd3e070501311c"
    },
    {
      "deviceName": "a3lbprodlbaccesslogs",
      "affectedService": "a3lbprodlbaccesslogs",
      "tone": "warning",
      "uuid": "89f8dffa-e305-4442-b973-8c2d4465a307",
      "severity": "Warning",
      "ticketCount": 31,
      "ticketId": "INC1839704",
      "resolvedDatetime": "2026-07-28T09:10:19+00:00",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "e4426c6a975e0f58fad47d0de053af59"
    },
    {
      "deviceName": "sdxdcl-etpe-swo-otelappd",
      "affectedService": "sdxdcl-etpe-swo-otelappd",
      "tone": "warning",
      "uuid": "76944497-e254-48da-9168-60b8c5120620",
      "severity": "Warning",
      "ticketCount": 3,
      "ticketId": "INC1839701",
      "resolvedDatetime": "2026-07-28T09:07:33+00:00",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "37efd462c31e8f5871fd3e0705013167"
    },
    {
      "deviceName": "sdxdcwETPEDatabridge",
      "affectedService": "sdxdcwETPEDatabridge",
      "tone": "warning",
      "uuid": "6603bd2c-e3a1-4641-a138-0fe297cf6805",
      "severity": "Warning",
      "ticketCount": 1,
      "ticketId": "INC1839720",
      "resolvedDatetime": "2026-07-28T09:03:01+00:00",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "56dd49ae97928f58fad47d0de053af6b"
    },
    {
      "deviceName": "sdxdcl-etpe-swo-otelappd",
      "affectedService": "sdxdcl-etpe-swo-otelappd",
      "tone": "warning",
      "uuid": "ee312808-7591-4767-baef-66f733fcc6bf",
      "severity": "Warning",
      "ticketCount": 2,
      "ticketId": "INC1839721",
      "resolvedDatetime": "2026-07-28T09:01:34+00:00",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "b57ec96697d28f58fad47d0de053affd"
    },
    {
      "deviceName": "sdxdclawxzerto2",
      "affectedService": "sdxdclawxzerto2",
      "tone": "danger",
      "uuid": "e273127d-a1ac-418c-98db-3b9c7f20e6ed",
      "severity": "Critical",
      "ticketCount": 3,
      "ticketId": "INC1839718",
      "resolvedDatetime": "2026-07-28T08:40:47+00:00",
      "availabilityState": "Critical \u0014 Unavailable",
      "ticketUuid": "82ec096297928f58fad47d0de053afc7"
    },
    {
      "deviceName": "sdxdcl-etpe-swo-otelappd",
      "affectedService": "sdxdcl-etpe-swo-otelappd",
      "tone": "warning",
      "uuid": "85bba9f1-cee1-43e6-af08-2e7512203402",
      "severity": "Warning",
      "ticketCount": 4,
      "ticketId": "INC1839712",
      "resolvedDatetime": "2026-07-28T08:35:05+00:00",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "731a49a6c39acf5871fd3e070501318a"
    },
    {
      "deviceName": "smartapps-ecs-cluster",
      "affectedService": "smartapps-ecs-cluster",
      "tone": "warning",
      "uuid": "c0de67a6-542c-4777-af16-b40778bb9887",
      "severity": "Warning",
      "ticketCount": 2,
      "ticketId": "INC1839717",
      "resolvedDatetime": "2026-07-28T08:30:11+00:00",
      "availabilityState": "Warning \u0014 Degraded",
      "ticketUuid": "d47ccda2c31ecf5871fd3e0705013184"
    },
    {
      "deviceName": "sdxdcl-etpe-swo-otelappd",
      "affectedService": "sdxdcl-etpe-swo-otelappd",
      "tone": "danger",
      "uuid": "c1bd2b06-1252-4bbd-a7a7-969b352ff6c4",
      "severity": "Critical",
      "ticketCount": 8,
      "ticketId": "INC1839715",
      "resolvedDatetime": "2026-07-28T08:29:43+00:00",
      "availabilityState": "Critical \u0014 Unavailable",
      "ticketUuid": "7e4b4522c3dacf5871fd3e0705013153"
    }
  ],
  "total": 3928,
  "categoryOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "vm_host",
      "label": "VM Host"
    },
    {
      "value": "k8s_pod",
      "label": "K8s Pod"
    },
    {
      "value": "vmware_vcenter",
      "label": "VMware Vcenter"
    },
    {
      "value": "storage",
      "label": "Storage"
    },
    {
      "value": "network",
      "label": "Network"
    },
    {
      "value": "database",
      "label": "Database"
    },
    {
      "value": "application",
      "label": "Applications"
    }
  ],
  "activeCategory": "all"
};

export const NOISY_EVENTS_API_DUMMY: NoisyEventsApiResponse = {
  "rows": [
    {
      "count": 2927,
      "source": "Unity",
      "deviceType": "vm",
      "uuid": "040619e9-38a4-46f0-b7d9-3b075181d682",
      "lastReported": "2026-07-28T10:11:53+00:00",
      "device": "SDXDcw-ETPE-DataDog",
      "severity": "Warning",
      "tone": "warning",
      "description": "Service \"NgcSvc\" not running on SDXDcw-ETPE-DataDog-Wipro-CIS-COE"
    },
    {
      "count": 1246,
      "source": "Unity",
      "deviceType": "",
      "uuid": "73769873-d16e-4e64-80ca-c1d4b814161f",
      "lastReported": "2026-07-28T10:15:43+00:00",
      "device": "athena-test-ag",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    },
    {
      "count": 1173,
      "source": "Unity",
      "deviceType": "",
      "uuid": "288da1dd-4345-456c-9f86-5c8c6cd73d01",
      "lastReported": "2026-07-28T10:10:22+00:00",
      "device": "config-bucket-667811466672",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    },
    {
      "count": 1169,
      "source": "Unity",
      "deviceType": "",
      "uuid": "b63a9592-ebcf-487f-925a-e2160e5a82eb",
      "lastReported": "2026-07-28T09:55:21+00:00",
      "device": "cf-templates-1puounciql3rm-us-west-1",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    },
    {
      "count": 1152,
      "source": "Unity",
      "deviceType": "",
      "uuid": "c7206f39-80e0-4448-b087-c2431ddce093",
      "lastReported": "2026-07-28T10:07:25+00:00",
      "device": "logarchival-bucket",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    },
    {
      "count": 1144,
      "source": "Unity",
      "deviceType": "",
      "uuid": "2a01fc0a-e5ca-4c45-b53b-9ee5629b42fc",
      "lastReported": "2026-07-28T10:17:09+00:00",
      "device": "elasticbeanstalk-us-west-2-667811466675",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    },
    {
      "count": 1135,
      "source": "Unity",
      "deviceType": "",
      "uuid": "0a5b4204-4c13-4a19-84d2-fee502a2bd86",
      "lastReported": "2026-07-28T10:15:21+00:00",
      "device": "elasticbeanstalk-us-west-1-667811466675",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    },
    {
      "count": 1135,
      "source": "Unity",
      "deviceType": "",
      "uuid": "5b94a98b-7e88-48df-a7d6-20511bc9488e",
      "lastReported": "2026-07-28T10:17:10+00:00",
      "device": "epsagonmonitoringstack-epsagontrailbucket-12f7chh8qo4y5",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    },
    {
      "count": 1132,
      "source": "Unity",
      "deviceType": "",
      "uuid": "dc7909d3-c526-49fb-93c9-e19662ba87d4",
      "lastReported": "2026-07-28T10:17:10+00:00",
      "device": "codepipeline-us-west-2-428115250558",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    },
    {
      "count": 1120,
      "source": "Unity",
      "deviceType": "",
      "uuid": "6b61d3b4-30d5-4b42-8a35-b1148533fab3",
      "lastReported": "2026-07-28T10:17:32+00:00",
      "device": "lex-web-ui-codebuilddeploy-1h2cn92ft-webappbucket-7optziegl5ni",
      "severity": "Warning",
      "tone": "warning",
      "description": "AWS S3: Failed to get alarms data"
    }
  ],
  "categoryOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "application",
      "label": "Application"
    },
    {
      "value": "baremetal_servers",
      "label": "Baremetals"
    },
    {
      "value": "containers",
      "label": "Container"
    },
    {
      "value": "database",
      "label": "Database"
    },
    {
      "value": "gpu",
      "label": "GPU"
    },
    {
      "value": "network",
      "label": "Network"
    },
    {
      "value": "others",
      "label": "Others"
    },
    {
      "value": "private_cloud_compute",
      "label": "Private Cloud Compute"
    },
    {
      "value": "public_cloud_compute",
      "label": "Public Cloud Compute"
    },
    {
      "value": "platform_services",
      "label": "Platform Services"
    },
    {
      "value": "sd_wan",
      "label": "SD-WAN"
    },
    {
      "value": "sensors",
      "label": "Sensors"
    },
    {
      "value": "storage",
      "label": "Storage"
    }
  ],
  "activeCategory": "all"
};

export const NOISY_HOSTS_API_DUMMY: NoisyHostsApiResponse = {
  "rows": [
    {
      "count": 45139,
      "source": "Unity",
      "deviceType": "vm",
      "description": "Service \"NcbService\" not running on sdxdcwETPEDatabridge-Wipro-CIS-COE",
      "severity": "Critical",
      "managementIp": "172.17.3.32",
      "hostName": "sdxdcwETPEDatabridge",
      "lastReported": "2026-07-28T10:12:19Z"
    },
    {
      "count": 10945,
      "source": "Unity",
      "deviceType": "vm",
      "description": "Service \"sppsvc\" not running on sdxdcw22vcfjh-Wipro-CIS-COE",
      "severity": "Critical",
      "managementIp": "172.17.66.124",
      "hostName": "sdxdcw22vcfjh",
      "lastReported": "2026-07-28T10:17:14Z"
    },
    {
      "count": 7007,
      "source": "Unity",
      "deviceType": "vm",
      "description": "Service \"NetSetupSvc\" not running on SDXDcw-ETPE-DataDog-Wipro-CIS-COE",
      "severity": "Critical",
      "managementIp": "172.17.137.141",
      "hostName": "SDXDcw-ETPE-DataDog",
      "lastReported": "2026-07-28T10:16:02Z"
    },
    {
      "count": 2304,
      "source": "Unity",
      "deviceType": "vm",
      "description": "Block device [dm-0]: High IO utilization",
      "severity": "Critical",
      "managementIp": "172.17.80.80",
      "hostName": "sdxdcl-etpe-swo-otelappd",
      "lastReported": "2026-07-28T10:16:05Z"
    },
    {
      "count": 1774,
      "source": "Unity",
      "deviceType": "vm",
      "description": "Service \"wuauserv\" not running on sdxdcwJS106-Wipro-CIS-COE",
      "severity": "Critical",
      "managementIp": "172.17.65.233",
      "hostName": "sdxdcwJS106",
      "lastReported": "2026-07-28T10:16:35Z"
    },
    {
      "count": 1277,
      "source": "Unity",
      "deviceType": "vm",
      "description": "Linux by SSH - Complete: High CPU utilization critical",
      "severity": "Critical",
      "managementIp": "172.17.74.133",
      "hostName": "sdxdclgrafanaotel",
      "lastReported": "2026-07-28T10:06:51Z"
    },
    {
      "count": 1254,
      "source": "Unity",
      "deviceType": "NA",
      "description": "AWS S3: Failed to get alarms data",
      "severity": "Warning",
      "managementIp": "{HOST.IP}",
      "hostName": "athena-test-ag",
      "lastReported": "2026-07-28T10:15:43Z"
    },
    {
      "count": 1186,
      "source": "Unity",
      "deviceType": "NA",
      "description": "AWS S3: Failed to get alarms data",
      "severity": "Warning",
      "managementIp": "{HOST.IP}",
      "hostName": "config-bucket-667811466672",
      "lastReported": "2026-07-28T10:10:22Z"
    },
    {
      "count": 1178,
      "source": "Unity",
      "deviceType": "NA",
      "description": "AWS S3: Failed to get alarms data",
      "severity": "Warning",
      "managementIp": "{HOST.IP}",
      "hostName": "cf-templates-1puounciql3rm-us-west-1",
      "lastReported": "2026-07-28T09:55:21Z"
    },
    {
      "count": 1163,
      "source": "Unity",
      "deviceType": "NA",
      "description": "AWS S3: Failed to get alarms data",
      "severity": "Warning",
      "managementIp": "{HOST.IP}",
      "hostName": "logarchival-bucket",
      "lastReported": "2026-07-28T10:07:25Z"
    }
  ],
  "chart": [
    {
      "information": 0,
      "hostName": "sdxdcwETPEDatabridge",
      "warning": 44992,
      "critical": 147
    },
    {
      "information": 0,
      "hostName": "sdxdcw22vcfjh",
      "warning": 10813,
      "critical": 132
    },
    {
      "information": 0,
      "hostName": "SDXDcw-ETPE-DataDog",
      "warning": 6917,
      "critical": 90
    },
    {
      "information": 0,
      "hostName": "sdxdcl-etpe-swo-otelappd",
      "warning": 1764,
      "critical": 540
    },
    {
      "information": 0,
      "hostName": "sdxdcwJS106",
      "warning": 1773,
      "critical": 1
    },
    {
      "information": 0,
      "hostName": "sdxdclgrafanaotel",
      "warning": 638,
      "critical": 639
    },
    {
      "information": 0,
      "hostName": "athena-test-ag",
      "warning": 1254,
      "critical": 0
    },
    {
      "information": 0,
      "hostName": "config-bucket-667811466672",
      "warning": 1186,
      "critical": 0
    },
    {
      "information": 0,
      "hostName": "cf-templates-1puounciql3rm-us-west-1",
      "warning": 1178,
      "critical": 0
    },
    {
      "information": 0,
      "hostName": "logarchival-bucket",
      "warning": 1163,
      "critical": 0
    }
  ],
  "activeTimeRange": "last_month",
  "timeRangeOptions": [
    {
      "value": "last_24_hours",
      "label": "Last 24 Hours"
    },
    {
      "value": "last_week",
      "label": "Last 7 Days"
    },
    {
      "value": "last_month",
      "label": "Last Month"
    },
    {
      "value": "last_quarter",
      "label": "Last Quarter"
    }
  ],
  "categoryOptions": [
    {
      "value": "all",
      "label": "All"
    },
    {
      "value": "baremetal_servers",
      "label": "Baremetals"
    },
    {
      "value": "database",
      "label": "Database"
    },
    {
      "value": "network",
      "label": "Network"
    },
    {
      "value": "others",
      "label": "Others"
    },
    {
      "value": "private_cloud_compute",
      "label": "Private Cloud Compute"
    }
  ],
  "activeCategory": "all"
};

export const ITSM_TICKET_VIEW_API_DUMMY: ItsmTicketViewApiResponse = {
  "tab": "all",
  "tabOptions": [
    {
      "value": "all",
      "label": "All tickets"
    },
    {
      "value": "change_request",
      "label": "Change Request"
    },
    {
      "value": "incident",
      "label": "Incident"
    },
    {
      "value": "problem",
      "label": "Problem"
    }
  ],
  "ticketsByPriority": [
    {
      "count": 2427,
      "value": 2427,
      "key": "3 - Moderate",
      "label": "3 - Moderate"
    },
    {
      "count": 229,
      "value": 229,
      "key": "5 - Planning",
      "label": "5 - Planning"
    },
    {
      "count": 89,
      "value": 89,
      "key": "4 - Low",
      "label": "4 - Low"
    },
    {
      "count": 53,
      "value": 53,
      "key": "2 - High",
      "label": "2 - High"
    },
    {
      "count": 35,
      "value": 35,
      "key": "1 - Critical",
      "label": "1 - Critical"
    }
  ],
  "ticketsByStatus": [
    {
      "count": 1500,
      "value": 1500,
      "key": "Closed",
      "label": "Closed"
    },
    {
      "count": 717,
      "value": 717,
      "key": "Resolved",
      "label": "Resolved"
    },
    {
      "count": 451,
      "value": 451,
      "key": "In Progress",
      "label": "In Progress"
    },
    {
      "count": 131,
      "value": 131,
      "key": "New",
      "label": "New"
    },
    {
      "count": 17,
      "value": 17,
      "key": "Scheduled",
      "label": "Scheduled"
    },
    {
      "count": 7,
      "value": 7,
      "key": "Authorize",
      "label": "Authorize"
    },
    {
      "count": 5,
      "value": 5,
      "key": "Implement",
      "label": "Implement"
    },
    {
      "count": 3,
      "value": 3,
      "key": "Assess",
      "label": "Assess"
    },
    {
      "count": 2,
      "value": 2,
      "key": "Review",
      "label": "Review"
    }
  ],
  "solvedByResponseTime": {
    "buckets": [
      {
        "count": 0,
        "value": 0,
        "key": "greaterthan_month",
        "label": "> Month"
      },
      {
        "count": 0,
        "value": 0,
        "key": "one_month",
        "label": "1 Month"
      },
      {
        "count": 0,
        "value": 0,
        "key": "one_week",
        "label": "1 Week"
      },
      {
        "count": 0,
        "value": 0,
        "key": "one_day",
        "label": "1 Day"
      }
    ]
  },
  "filters": {
    "search": "",
    "state": "",
    "priority": "",
    "type": "all",
    "startDate": "2026-07-14",
    "endDate": "2026-07-28"
  },
  "filterOptions": {
    "state": [
      {
        "value": "",
        "label": "All"
      },
      {
        "value": "9",
        "label": "Closed with ST Self-heal"
      },
      {
        "value": "-5",
        "label": "New"
      },
      {
        "value": "3",
        "label": "Closed"
      },
      {
        "value": "-4",
        "label": "Assess"
      },
      {
        "value": "101",
        "label": "New"
      },
      {
        "value": "1",
        "label": "New"
      },
      {
        "value": "103",
        "label": "Root Cause Analysis"
      },
      {
        "value": "107",
        "label": "Closed"
      },
      {
        "value": "-2",
        "label": "Scheduled"
      },
      {
        "value": "-3",
        "label": "Authorize"
      },
      {
        "value": "102",
        "label": "Assess"
      },
      {
        "value": "-1",
        "label": "Implement"
      },
      {
        "value": "21",
        "label": "Failed with ST Self-heal"
      },
      {
        "value": "106",
        "label": "Resolved"
      },
      {
        "value": "4",
        "label": "Canceled"
      },
      {
        "value": "0",
        "label": "Review"
      },
      {
        "value": "104",
        "label": "Fix in Progress"
      },
      {
        "value": "2",
        "label": "In Progress"
      },
      {
        "value": "3",
        "label": "On Hold"
      },
      {
        "value": "6",
        "label": "Resolved"
      },
      {
        "value": "7",
        "label": "Closed"
      },
      {
        "value": "8",
        "label": "Canceled"
      }
    ],
    "priority": [
      {
        "value": "",
        "label": "All"
      },
      {
        "value": "2",
        "label": "2 - High"
      },
      {
        "value": "4",
        "label": "4 - Low"
      },
      {
        "value": "3",
        "label": "3 - Moderate"
      },
      {
        "value": "1",
        "label": "1 - Critical"
      },
      {
        "value": "4",
        "label": "4 - Low"
      },
      {
        "value": "3",
        "label": "3 - Moderate"
      },
      {
        "value": "2",
        "label": "2 - High"
      },
      {
        "value": "5",
        "label": "5 - Planning"
      },
      {
        "value": "1",
        "label": "1 - Critical"
      }
    ],
    "type": [
      {
        "value": "all",
        "label": "All"
      },
      {
        "value": "incident",
        "label": "Incident"
      },
      {
        "value": "change_request",
        "label": "Change Request"
      },
      {
        "value": "problem",
        "label": "Problem"
      }
    ]
  },
  "tickets": [
    {
      "updatedOn": "2026-07-26 11:30:10",
      "resolution": "Closed",
      "createdOn": "2026-07-24 13:23:32",
      "priority": "3 - Moderate",
      "state": "Closed",
      "ticketId": "INC1838610",
      "shortDescription": "Linux by SSH - Complete: Memory utilization warning for sdxdclawxzerto2"
    },
    {
      "updatedOn": "2026-07-22 23:44:12",
      "resolution": "Authorize",
      "createdOn": "2026-07-22 23:40:54",
      "priority": "2 - High",
      "state": "Authorize",
      "ticketId": "CHG0035555",
      "shortDescription": "Change for INC1838086: Critical - Oracle_database_tablespace_almost_full Hostname: oradb_Backup , IP Address: 172.16.6.112, Metric Name: Oracle database tablesp"
    },
    {
      "updatedOn": "2026-07-16 11:30:11",
      "resolution": "Closed",
      "createdOn": "2026-07-14 11:39:37",
      "priority": "3 - Moderate",
      "state": "Closed",
      "ticketId": "INC1837257",
      "shortDescription": "Linux by SSH - Complete: Too many zombie processes for sdxdclgrafanaotel"
    },
    {
      "updatedOn": "2026-07-21 11:30:04",
      "resolution": "Closed",
      "createdOn": "2026-07-20 02:18:17",
      "priority": "1 - Critical",
      "state": "Closed",
      "ticketId": "INC1837418",
      "shortDescription": "Critical - Oracle_database_tablespace_almost_full Hostname: oradb_Backup , IP Address: 172.16.6.112, Metric Name: Oracle database tablespace almost full  : Reso"
    },
    {
      "updatedOn": "2026-07-26 11:30:08",
      "resolution": "Closed",
      "createdOn": "2026-07-24 16:20:13",
      "priority": "3 - Moderate",
      "state": "Closed",
      "ticketId": "INC1838656",
      "shortDescription": "No WinRM data alerts for sdxdcw22vcfjh, sdxdcwJS106"
    },
    {
      "updatedOn": "2026-07-27 11:30:13",
      "resolution": "Closed",
      "createdOn": "2026-07-25 22:20:15",
      "priority": "3 - Moderate",
      "state": "Closed",
      "ticketId": "INC1839054",
      "shortDescription": "Block device [dm-0]: High IO utilization for sdxdcl-etpe-swo-otelappd"
    },
    {
      "updatedOn": "2026-07-26 11:30:16",
      "resolution": "In Progress",
      "createdOn": "2026-07-26 01:24:19",
      "priority": "3 - Moderate",
      "state": "In Progress",
      "ticketId": "INC1839115",
      "shortDescription": "AWS alerts for db-OK7W3EFESXU652BRU3WN4NNPTM, db-VCWYE7TLJTVUYHFBZCAAQ7NF5M"
    },
    {
      "updatedOn": "2026-07-23 11:30:40",
      "resolution": "In Progress",
      "createdOn": "2026-07-22 17:45:06",
      "priority": "3 - Moderate",
      "state": "In Progress",
      "ticketId": "INC1837983",
      "shortDescription": "Linux SSH: Load average per CPU is high (over 1.5 for 5m) for sdxdclawxzerto2"
    },
    {
      "updatedOn": "2026-07-16 11:30:03",
      "resolution": "Closed",
      "createdOn": "2026-07-14 11:41:32",
      "priority": "3 - Moderate",
      "state": "Closed",
      "ticketId": "INC1837259",
      "shortDescription": "Memory utilization >95% for 5m on sdxdcwETPEDatabridge-Wipro-CIS-COE for sdxdcwETPEDatabridge"
    },
    {
      "updatedOn": "2026-07-21 11:30:04",
      "resolution": "In Progress",
      "createdOn": "2026-07-20 06:39:29",
      "priority": "5 - Planning",
      "state": "In Progress",
      "ticketId": "INC1837434",
      "shortDescription": "EC2 restricted ports open :sg-06afeba1a63962aab"
    }
  ],
  "total": 2833,
  "page": 1,
  "perPage": 10
};
