import { AlertTrends, CapacityRiskAlert, ITSMTicketView, PerformanceHotspots, PrivateCloudAlertSideCard, PrivateCloudAlertSummaryMetric, PrivateCloudAlertTrendBarGroup, PrivateCloudAlertTrendLegendItem, PrivateCloudCriticalAlert, PrivateCloudTicketDonutItem, PrivateCloudTicketRow, PrivateCloudUtilizationRow } from "./private-cloud-compute-dashboard.type";


//Top 10 clusters
export const Top10ClustersByVMCount = [
  { host: 'PROD-01', value: 420 },
  { host: 'PROD-02', value: 400 },
  { host: 'PROD-03', value: 350 },
  { host: 'PROD-04', value: 300 },
  { host: 'DEV-01', value: 250 },
  { host: 'DEV-02', value: 200 },
  { host: 'TEST-01', value: 150 },
  { host: 'TEST-02', value: 120 }
];

export const Private_CLOUD_UTILIZATION_ROWS: PerformanceHotspots = {
  "topUtilization": [
    {
      "name": "Cisco 1",
      "cpuUtilization": {
        "current": 81,
        "sparkline": [
          45,
          50,
          55,
          60,
          65,
          70,
          75,
          80,
          81
        ]
      },
      "memoryUtilization": {
        "current": 81,
        "sparkline": [
          40,
          45,
          50,
          55,
          60,
          65,
          70,
          75,
          81
        ]
      },
      "storageUtilization": {
        "capacity": 256,
        "used": 170,
        "free": 86,
        "percentage": 66
      },
      "diskIOPS": {
        "value": 40,
        "percentage": 40
      },
      "uptime": "26d"
    }
  ]
}


//For Alerts


export const PRIVATE_CLOUD_ALERT_SUMMARY: any = {
  "alertSummary": {
    "criticalAlerts": 24,
    "highAlerts": 67,
    "openITSMTickets": 14,
    "automationSuccess": "91%",
    "avgMTTR": "3.2h"
  },
  "topCriticalAlerts": [
    {
      "id": 1744,
      "deviceName": "UL_Switch_Disk",
      "severity": "Critical",
      "description": "Ethernet has changed...",
      "source": "Unity",
      "acknowledged": "Yes",
      "duration": "34s"
    },
    {
      "id": 1746,
      "deviceName": "UL_Switch_Test",
      "severity": "Critical",
      "description": "Ethernet has changed...",
      "source": "Unity",
      "acknowledged": "No",
      "duration": "36s"
    }
  ],
  "filters": {}
}

export const PRIVATE_CLOUD_CRITICAL_ALERTS: PrivateCloudCriticalAlert[] = [
  { id: '1744', deviceName: 'UL_Switch_Disk', severity: 'critical', description: 'Ethernet has changed...', source: 'Unity', acknowledged: 'Yes', duration: '34s' },
  { id: '1746', deviceName: 'UL_Switch_Test', severity: 'critical', description: 'Ethernet has changed...', source: 'Unity', acknowledged: 'No', duration: '36s' },
  { id: '2319', deviceName: 'UL_Firewall_Test', severity: 'critical', description: 'High bandwidth usage...', source: 'Unity', acknowledged: 'No', duration: '39s' },
  { id: '6664', deviceName: 'UL_Switch_AT', severity: 'high', description: 'Device has been repla...', source: 'Zabbix', acknowledged: 'Yes', duration: '01m' },
  { id: '9956', deviceName: 'UL_LoadBalancer_09', severity: 'high', description: 'System name has bee...', source: 'Nagios', acknowledged: 'No', duration: '02m 44s' },
  { id: '1470', deviceName: 'UL_Router_AT', severity: 'high', description: 'Device has been repla...', source: 'Unity', acknowledged: 'Yes', duration: '08m 56s' },
  { id: '7452', deviceName: 'UL_LoadBalancer_04', severity: 'critical', description: 'Interface Link down...', source: 'Nagios', acknowledged: 'Yes', duration: '10m 15s' },
  { id: '2354', deviceName: 'UL_Switch_BT', severity: 'high', description: 'Interface : High error...', source: 'Unity', acknowledged: 'No', duration: '20m 13s' },
  { id: '0996', deviceName: 'UL_Firewall_007', severity: 'critical', description: 'Unavailable by ICMP...', source: 'Nagios', acknowledged: 'No', duration: '01h 09m' },
  { id: '0994', deviceName: 'UL_Firewall_007', severity: 'critical', description: 'Unavailable by ICMP...', source: 'Zabbix', acknowledged: 'Yes', duration: '01h 09m' }
];

export const PRIVATE_CLOUD_ALERT_TREND_LEGEND: PrivateCloudAlertTrendLegendItem[] = [
  { name: 'Raw Events', value: 878, color: '#ff8f8f' },
  { name: 'Alerts', value: 109, color: '#ffbf69' },
  { name: 'Conditions', value: 32, color: '#9ed0ff' }
];

export const PRIVATE_CLOUD_ALERT_TREND_STACK_GROUPS: PrivateCloudAlertTrendBarGroup[] = [
  { name: 'Raw Events', values: [156, 305, 417] },
  { name: 'Noise Reduction', values: [156, 305, 417] },
  { name: 'First Response', values: [156, 305, 417] }
];

export const PRIVATE_CLOUD_ALERT_SIDE_CARDS: AlertTrends = {
  "summary": {
    "rawEvents": 878,
    "alerts": 109,
    "conditions": 32
  },
  "rawEvents": {
    "total": 878,
    "critical": 156,
    "warning": 305,
    "informative": 417
  },
  "noiseReduction": {
    "percentage": 77,
    "dedupeEvents": 589,
    "suppressedEvents": 289,
    "correlated": 32
  },
  "firstResponse": {
    "percentage": 92,
    "autoCloned": 126,
    "ticketCreated": 456,
    "autoClosed": 378
  }
}
export const PRIVATE_CLOUD_TICKET_PRIORITY: ITSMTicketView = {
  "ticketsByPriority": {
    "High": 9,
    "Moderate": 207,
    "Low": 11,
    "Critical": 0,
    "Planning": 0
  },
  "ticketsByStatus": {
    "Resolved": 219,
    "Open": 8,
    "Closed": 0,
    "In Progress": 0
  },
  "tickets": [
    {
      "ticketId": "INC0022446",
      "shortDescription": "trigger-11",
      "state": "Resolved",
      "priority": "3 - Moderate",
      "createdOn": "Aug 22, 2024, 12:33:09",
      "updatedOn": "Feb 27, 2026, 19:18:47",
      "resolution": "Resolved"
    }
  ],
}

export const PRIVATE_CLOUD_TICKET_STATUS: PrivateCloudTicketDonutItem[] = [
  { name: 'Closed with ST Self heal', value: 22, color: '#696cff' },
  { name: 'New', value: 9, color: '#7bd88f' },
  { name: 'Closed', value: 112, color: '#ff5fb8' },
  { name: 'Assess', value: 15, color: '#5bb9ff' },
  { name: 'Root Cause Analysis', value: 7, color: '#ffd166' },
  { name: 'Schedule', value: 8, color: '#b36bff' },
  { name: 'Authorize', value: 6, color: '#7ee2a8' },
  { name: 'Implement', value: 12, color: '#ff9f43' },
  { name: 'Resolved', value: 29, color: '#8bd450' },
  { name: 'In Progress', value: 17, color: '#4b7bec' },
  { name: 'On Hold', value: 5, color: '#9aa6b2' }
];

export const PRIVATE_CLOUD_TICKETS_TOTAL = 2123;

export const PRIVATE_CLOUD_TICKETS: PrivateCloudTicketRow[] = [
  { id: 'INC1803932', shortDescription: 'AWS RDS: Failed to get events data...', state: 'Closed', priority: '3 - Moderate', createdOn: 'Apr 08, 2026, 23:53:28', updatedOn: 'Apr 10, 2026, 18:30:45', resolution: 'Closed' },
  { id: 'INC1803538', shortDescription: 'AWS ELB ALB: Too many HTTP 5XX ...', state: 'Resolved', priority: '3 - Moderate', createdOn: 'Apr 07, 2026, 19:05:30', updatedOn: 'Apr 07, 2026, 19:31:27', resolution: 'Resolved' },
  { id: 'INC1804591', shortDescription: 'Failed to get alarms data for amplif...', state: 'Closed', priority: '3 - Moderate', createdOn: 'Apr 10, 2026, 17:58:35', updatedOn: 'Apr 11, 2026, 18:36:56', resolution: 'Closed' },
  { id: 'INC1804291', shortDescription: 'Failed to get alarms data for cmspr...', state: 'Closed', priority: '3 - Moderate', createdOn: 'Apr 09, 2026, 19:16:31', updatedOn: 'Apr 11, 2026, 18:30:02', resolution: 'Closed' },
  { id: 'INC1803986', shortDescription: 'AWS S3: Failed to get metrics data ...', state: 'Closed', priority: '3 - Moderate', createdOn: 'Apr 09, 2026, 00:33:39', updatedOn: 'Apr 10, 2026, 18:31:36', resolution: 'Closed' },
  { id: 'INC1804224', shortDescription: 'AWS ELB ALB: Too many HTTP 5XX ...', state: 'Resolved', priority: '3 - Moderate', createdOn: 'Apr 09, 2026, 15:34:31', updatedOn: 'Apr 09, 2026, 15:36:46', resolution: 'Resolved' },
  { id: 'INC1802897', shortDescription: '1.3.6.1.4.1.9.9.187.0.1 is critical', state: 'In Progress', priority: '1 - Critical', createdOn: 'Apr 01, 2026, 5:48:07', updatedOn: 'Apr 02, 2026, 18:30:10', resolution: 'In Progress' }
];

// Risk opt
export const riskSummary: any = {
  overUtilHosts: '0',
  overUtilHostsPercent: '0',
  underUtilHosts: '0',
  underUtilHostsPercent: '0',
  idleVms: '0',
  idleVmsMsg: '0',
  capacityAlerts: '0',
  capacityAlertsMsg: '0',
}

export const capacityRiskAlertsData = [
  { name: 'RDS-prod-01', value: 88, color: '#ef4b4b' },
  { name: 'CloudSQL-01', value: 74, color: '#f5a623' },
  { name: 'Azure SQL-02', value: 69, color: '#f5a623' },
  { name: 'RDS-prod-01', value: 88, color: '#ef4b4b' },
  { name: 'CloudSQL-01', value: 74, color: '#f5a623' },
  { name: 'Azure SQL-02', value: 69, color: '#f5a623' }
];

//auto remed
export const autoRemediationExecSummaryData = {
  totalRuns: 1842,
  avgDuration: '4.2 min',
  graphData: [
    { name: 'Successful', value: 91, color: '#5b9f1b' },
    { name: 'Failed', value: 9, color: '#ef4b4b' }
  ]
};

export const remediationActionsData = [
  { name: 'Restart service', value: 412, color: '#3b8edb' },
  { name: 'Scale out ASG', value: 338, color: '#3b8edb' },
  { name: 'Revoke SG rule', value: 261, color: '#f5a623' },
  { name: 'Snapshot cleanup', value: 204, color: '#4d9221' },
  { name: 'Disk resize', value: 138, color: '#4d9221' }
];


// import type {
//   AlertRow,
//   AlertTrendData,
//   CapacityTrendData,
//   HardwareStatusData,
//   NameValue,
//   PerformanceRow,
//   StatusItem,
//   SummaryMetric,
//   TicketRow,
//   UtilizationTrendData
// } from './dashboard.service';

// export const DASHBOARD_SUMMARY_METRICS: SummaryMetric[] = [
//   { label: 'Total VMs', value: '4,812', color: 'primary' },
//   { label: 'Physical Hosts', value: '312' },
//   { label: 'Clusters', value: '28' },
//   { label: 'Powered on', value: '3,641', color: 'success' },
//   { label: 'Powered off', value: '1,171', color: 'danger' }
// ];

// export const CLOUD_TYPE_DISTRIBUTION: NameValue[] = [
//   { name: 'VMware 45%', value: 45 },
//   { name: 'Nutanix 28%', value: 28 },
//   { name: 'Hyper-V 16%', value: 16 },
//   { name: 'OpenStack 11%', value: 11 }
// ];

// export const POWER_ACTIVITY_STATE: NameValue[] = [
//   { name: 'On / Active', value: 2860 },
//   { name: 'Off / Idle', value: 820 },
//   { name: 'Idle', value: 2090 },
//   { name: 'Off', value: 420 }
// ];

// export const VM_COUNT_BY_OS: NameValue[] = [
//   { name: 'Linux 62%', value: 62 },
//   { name: 'Windows 38%', value: 38 }
// ];

// export const ENVIRONMENT_CRITICALITY: StatusItem[] = [
//   { label: 'Production', value: 2791, color: 'danger' },
//   { label: 'Development', value: 1239, color: 'warning' },
//   { label: 'Test / QA', value: 722, color: 'info' }
// ];

// export const ALERT_SEVERITY: StatusItem[] = [
//   { label: 'Critical', value: 1204, color: 'danger' },
//   { label: 'Warning', value: 1991, color: 'warning' },
//   { label: 'Info', value: 1245, color: 'info' }
// ];

// export const VM_DENSITY_PER_HOST: NameValue[] = [
//   { name: 'PROD-01', value: 22 },
//   { name: 'PROD-02', value: 19 },
//   { name: 'PROD-03', value: 21 },
//   { name: 'DEV-01', value: 14 },
//   { name: 'DEV-02', value: 12 },
//   { name: 'TEST-01', value: 10 }
// ];

// export const CAPACITY_TREND: CapacityTrendData = {
//   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//   actual: [4100, 4180, 4260, 4370, 4440, 4520, 4610, 4720, 4780, 4850, 4910, 4940],
//   forecast: [4100, 4180, 4260, 4370, 4440, 4520, 4610, 4720, 4780, 4890, 5020, 5160]
// };

// export const VM_PROVISIONING_STATUS: SummaryMetric[] = [
//   { label: 'Provisioned', value: '248', color: 'success' },
//   { label: 'Decommissioned', value: '91', color: 'danger' }
// ];

// export const TOP_CLUSTERS_BY_VM_COUNT: NameValue[] = [
//   { name: 'PROD', value: 930 },
//   { name: 'PROD-B', value: 890 },
//   { name: 'PROD-C', value: 825 },
//   { name: 'DEV-A', value: 710 },
//   { name: 'TEST-A', value: 560 },
//   { name: 'QA-A', value: 520 },
//   { name: 'EDGE', value: 430 },
//   { name: 'DR', value: 390 }
// ];

// export const CLUSTER_UTILIZATION_TREND: UtilizationTrendData = {
//   labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
//   cpu: [62, 66, 69, 71, 74, 78],
//   memory: [68, 70, 73, 75, 76, 80]
// };

// export const HARDWARE_STATUS: HardwareStatusData = {
//   power: [
//     { label: 'PSU normal', value: 293, color: 'success' },
//     { label: 'PSU degraded', value: 9, color: 'warning' },
//     { label: 'PSU failed', value: 3, color: 'danger' }
//   ],
//   host: [
//     { label: 'Healthy', value: 236, color: 'success' },
//     { label: 'Warning', value: 14, color: 'warning' },
//     { label: 'Critical', value: 6, color: 'danger' },
//     { label: 'Maintenance', value: 3, color: 'secondary' }
//   ],
//   sensor: [
//     { label: 'Temp normal (<60C)', value: 301, color: 'success' },
//     { label: 'Temp Warning', value: 7, color: 'warning' },
//     { label: 'Temp Critical', value: 2, color: 'danger' },
//     { label: 'Fan Failed', value: 1, color: 'danger' }
//   ]
// };

// export const TOP_UTILIZATION: PerformanceRow[] = Array.from({ length: 10 }).map((_, index) => ({
//   name: 'Cisco 1',
//   cpu: [
//     [18, 22, 31, 36, 44, 50, 61, 58, 64, 69],
//     [12, 14, 18, 15, 22, 19, 25, 24, 28, 57],
//     [20, 18, 27, 23, 35, 24, 41, 30, 45, 32],
//     [9, 12, 18, 28, 37, 46, 44, 39, 32, 30],
//     [10, 12, 14, 13, 15, 16, 88, 14, 13, 12]
//   ][index % 5],
//   cpuValue: [26, 57, 61, 26, 67][index % 5],
//   memory: [
//     [20, 18, 27, 23, 35, 24, 41, 30, 45, 32],
//     [9, 12, 18, 28, 37, 46, 44, 39, 32, 30],
//     [10, 12, 14, 13, 15, 16, 88, 14, 13, 12],
//     [18, 22, 31, 36, 44, 50, 61, 58, 64, 69],
//     [12, 14, 18, 15, 22, 19, 25, 24, 28, 57]
//   ][index % 5].map((item) => Math.min(item + 16, 95)),
//   memoryValue: [24, 81, 24, 51, 81][index % 5],
//   capacity: '256GB',
//   used: `${17 + index}GB`,
//   free: `${50 - (index % 4) * 10}%`,
//   diskIops: 93000 - index * 8000,
//   uptime: ['26d', '21h', '20h', '12d', '29d', '71d', '5d', '19d', '11d', '21d'][index]
// }));

// export const DISK_LATENCY: NameValue[] = [
//   { name: 'svc-checkout-prod', value: 842 },
//   { name: 'api-search-prod', value: 718 },
//   { name: 'svc-payment-gw', value: 624 },
//   { name: 'rpc-inventory-U1', value: 521 },
//   { name: 'api-analytics-U1', value: 448 },
//   { name: 'svc-notification', value: 381 },
//   { name: 'fn-image-resize', value: 312 },
//   { name: 'api-users-prod', value: 248 },
//   { name: 'svc-email-U1', value: 191 },
//   { name: 'api-reports-U1', value: 148 }
// ];

// export const CPU_READY_WAIT_TIME: NameValue[] = [
//   { name: 'app-orchestr-1', value: 8.4 },
//   { name: 'app-orchestr-2', value: 5.9 },
//   { name: 'app-orchestr-3', value: 5.8 },
//   { name: 'app-orchestr-4', value: 4.2 },
//   { name: 'app-orchestr-5', value: 3.6 },
//   { name: 'app-orchestr-6', value: 2.8 },
//   { name: 'app-orchestr-7', value: 2.1 },
//   { name: 'app-orchestr-8', value: 1.7 },
//   { name: 'app-orchestr-9', value: 1.2 },
//   { name: 'app-orchestr-10', value: 0.8 }
// ];

// export const SWAP_BALLOON_MEMORY: NameValue[] = [
//   { name: 'app-orchestr-1', value: 8.4 },
//   { name: 'app-orchestr-2', value: 6.9 },
//   { name: 'app-orchestr-3', value: 5.8 },
//   { name: 'app-orchestr-4', value: 4.2 },
//   { name: 'app-orchestr-5', value: 3.6 },
//   { name: 'app-orchestr-6', value: 2.8 },
//   { name: 'app-orchestr-7', value: 2.1 },
//   { name: 'app-orchestr-8', value: 1.7 },
//   { name: 'app-orchestr-9', value: 1.2 },
//   { name: 'app-orchestr-10', value: 0.8 }
// ];

// export const ALERT_SUMMARY: SummaryMetric[] = [
//   { label: 'Critical Alerts', value: '24', color: 'danger' },
//   { label: 'High Alerts', value: '67', color: 'warning' },
//   { label: 'Open ITSM Tickets', value: '14', color: 'primary' },
//   { label: 'Automation Success', value: '91%', color: 'success' },
//   { label: 'Avg MTTR', value: '3.2h' }
// ];

// export const CRITICAL_ALERTS: AlertRow[] = [
//   { id: '1744', device: 'UL_sw1c_Link', severity: 'Critical', description: 'Ethernet has changed...', source: 'Unity', acknowledged: 'Yes', duration: '346s' },
//   { id: '1746', device: 'UL_sw1c_Test', severity: 'Critical', description: 'Ethernet has changed...', source: 'Unity', acknowledged: 'No', duration: '26s' },
//   { id: '2319', device: 'UL_Firewall_Test', severity: 'Critical', description: 'High bandwidth usage...', source: 'Unity', acknowledged: 'No', duration: '39s' },
//   { id: '6544', device: 'UL_sw2c_AT', severity: 'Warning', description: 'Drive bay been upda...', source: 'Zabbix', acknowledged: 'Yes', duration: '01m' },
//   { id: '5956', device: 'UL_LoadBalancer_09', severity: 'Warning', description: 'System name has be...', source: 'Nagios', acknowledged: 'No', duration: '02m 44s' },
//   { id: '1470', device: 'UL_Router_AT', severity: 'Warning', description: 'Device has been repl...', source: 'Unity', acknowledged: 'Yes', duration: '00m 36s' },
//   { id: '7452', device: 'UL_LoadBalancer_04', severity: 'Critical', description: 'Interface Link down...', source: 'Nagios', acknowledged: 'Yes', duration: '10m 15s' },
//   { id: '2354', device: 'UL_Switch_DT', severity: 'Critical', description: 'Interface is high erro...', source: 'Unity', acknowledged: 'No', duration: '20m 12s' },
//   { id: '4516', device: 'UL_Firewall_031', severity: 'Warning', description: 'Unusual site by ICMP...', source: 'Nagios', acknowledged: 'No', duration: '01h 05m' },
//   { id: '6964', device: 'UL_Firewall_037', severity: 'Critical', description: 'Unusual site by ICMP...', source: 'Zabbix', acknowledged: 'Yes', duration: '01h 05m' }
// ];

// export const ALERT_RADAR: number[] = [878, 109, 32, 620, 740];

// export const ALERT_TREND: AlertTrendData = {
//   labels: ['Critical', 'Warning', 'Informative'],
//   stacks: [
//     { name: 'Raw Events', values: [878, 0, 878] },
//     { name: 'Noise Reduction', values: [0, 156, 305] },
//     { name: 'First Response', values: [417, 156, 305] }
//   ]
// };

// export const ITSM_TICKETS_BY_PRIORITY: NameValue[] = [
//   { name: 'High', value: 8 },
//   { name: 'Low', value: 9 },
//   { name: 'Moderate', value: 24 },
//   { name: 'Critical', value: 6 },
//   { name: 'Planning', value: 4 }
// ];

// export const ITSM_TICKETS_BY_STATUS: NameValue[] = [
//   { name: 'Closed', value: 26 },
//   { name: 'Resolved', value: 14 },
//   { name: 'Assigned', value: 9 },
//   { name: 'In Progress', value: 6 },
//   { name: 'New', value: 4 }
// ];

// export const ITSM_TICKETS: TicketRow[] = Array.from({ length: 7 }).map((_, index) => ({
//   id: `INC180${8932 + index}`,
//   description: [
//     'AWS RDS: Failed to get events data...',
//     'AWS EIA: ALB Too many HTTP 5XX...',
//     'Failed to get alarms data for app...',
//     'AWS S3: Failed to get metrics data...',
//     'AWS EIA: Too many HTTP 5XX...',
//     '1.1.6.1.4.1.9.9.187.1 is critical'
//   ][index % 6],
//   state: ['Closed', 'Resolved', 'In Progress'][index % 3],
//   priority: ['3 - Moderate', '2 - High', '1 - Critical'][index % 3],
//   createdOn: `Apr ${8 + index}, 2026, 10:3${index}:23`,
//   updatedOn: `Apr ${10 + index}, 2026, 18:3${index}:45`,
//   resolution: ['Resolved', 'Closed', 'In Progress'][index % 3]
// }));

// export const RISK_METRICS: SummaryMetric[] = [
//   { label: 'Overutilized Hosts', value: '18', color: 'danger' },
//   { label: 'Underutilized Hosts', value: '34', color: 'warning' },
//   { label: 'Idle VMs', value: '29', color: 'warning' },
//   { label: 'Capacity Alerts', value: '11', color: 'danger' }
// ];

// export const CAPACITY_RISK_ALERTS: NameValue[] = [
//   { name: 'RDS-prod-01', value: 88 },
//   { name: 'CloudSQL-01', value: 74 },
//   { name: 'Azure SQL-01', value: 65 },
//   { name: 'RDS-prod-02', value: 58 },
//   { name: 'CloudSQL-02', value: 74 },
//   { name: 'Azure SQL-02', value: 69 }
// ];

// export const AUTO_REMEDIATION_SUMMARY: NameValue[] = [
//   { name: 'Successful 91%', value: 91 },
//   { name: 'Failed 9%', value: 9 }
// ];

// export const TOP_AUTO_REMEDIATION_ACTIONS: NameValue[] = [
//   { name: 'Restart service', value: 412 },
//   { name: 'Scale out ASG', value: 338 },
//   { name: 'Revoke SG rule', value: 261 },
//   { name: 'Snapshot cleanup', value: 204 },
//   { name: 'Disk resize', value: 138 }
// ];


export const VmDensityPerHostChartColors = ['#3a8dde', '#20a77a', '#3a8dde', '#7b72d9', '#7b72d9', '#f5a623'];
export const ProgressBarcolors = ['#e54b4b', '#f5a623', '#2f80d1', '#5c8f1f'];


export const ExecutiveSummary = {
  "executiveSummary": {
    "totalVMs": 75,
    "physicalHosts": 4,
    "clusters": 1,
    "poweredOnVMs": 10,
    "poweredOffVMs": 58
  },
  "cloudTypeDistribution": [
    {
      "type": "VMware vCenter",
      "percentage": 90.7,
      "count": 68
    },
    {
      "type": "Custom",
      "percentage": 9.3,
      "count": 7
    }
  ],
  "powerActivityState": [
    {
      "state": "Powered Off",
      "count": 58,
      "percentage": 77.3
    },
    {
      "state": "Active",
      "count": 10,
      "percentage": 13.3
    },
    {
      "state": "Idle",
      "count": 0,
      "percentage": 0.0
    }
  ],
  "vmCountByOSType": [
    {
      "os": "Linux",
      "percentage": 55,
      "count": 41
    },
    {
      "os": "Windows",
      "percentage": 31,
      "count": 23
    }
  ],
  "environmentCriticality": [
    {
      "environment": "Production",
      "count": 0,
      "percentage": 0.0
    },
    {
      "environment": "Development",
      "count": 0,
      "percentage": 0.0
    },
    {
      "environment": "Test",
      "count": 0,
      "percentage": 0.0
    },
    {
      "environment": "None",
      "count": 75,
      "percentage": 100.0
    }
  ],
  "alertsSeverity": {
    "critical": 0,
    "warning": 0,
    "info": 0,
    "total": 0
  },
  "filters": {
    "platforms": [
      {
        "value": "VMware",
        "label": "VMware vCenter"
      },
      {
        "value": "Custom",
        "label": "Custom"
      }
    ],
    "datacenters": [
      {
        "value": "DATA-CEN",
        "label": "DATA-CEN"
      },
      {
        "value": "DataCentre-1",
        "label": "DataCentre-1"
      }
    ],
    "accounts": [
      {
        "value": "c0319706-5033-4ede-934b-3e307ec8ed2f",
        "label": "treas"
      },
      {
        "value": "7b24efc8-6a5f-4bc0-80ed-8a1713be01e7",
        "label": "custom_clouds"
      }
    ],
    "environments": [
      {
        "value": "Production",
        "label": "Production"
      },
      {
        "value": "Development",
        "label": "Development"
      },
      {
        "value": "Test",
        "label": "Test"
      },
      {
        "value": "None",
        "label": "None"
      }
    ]
  }
}

export const headerData = {
  "lastRefreshed": "Today 10:00 IST",
  "scope": {
    "providers": "All providers",
    "regions": "All regions",
    "accounts": "All accounts"
  }
}

export const executiveSummaryData = {
  "executiveSummary": {
    "totalVMs": 75,
    "physicalHosts": 4,
    "clusters": 1,
    "poweredOnVMs": 10,
    "poweredOffVMs": 58
  },
  "cloudTypeDistribution": [
    {
      "type": "VMware vCenter",
      "percentage": 90.7,
      "count": 68
    },
    {
      "type": "Custom",
      "percentage": 9.3,
      "count": 7
    }
  ],
  "powerActivityState": [
    {
      "state": "Powered Off",
      "count": 58,
      "percentage": 77.3
    },
    {
      "state": "Active",
      "count": 10,
      "percentage": 13.3
    },
    {
      "state": "Idle",
      "count": 0,
      "percentage": 0.0
    }
  ],
  "vmCountByOSType": [
    {
      "os": "Linux",
      "percentage": 55,
      "count": 41
    },
    {
      "os": "Windows",
      "percentage": 31,
      "count": 23
    }
  ],
  "environmentCriticality": [
    {
      "environment": "Production",
      "count": 0,
      "percentage": 0.0
    },
    {
      "environment": "Development",
      "count": 0,
      "percentage": 0.0
    },
    {
      "environment": "Test",
      "count": 0,
      "percentage": 0.0
    },
    {
      "environment": "None",
      "count": 75,
      "percentage": 100.0
    }
  ],
  "alertsSeverity": {
    "critical": 0,
    "warning": 0,
    "info": 0,
    "total": 0
  },
  "filters": {
    "platforms": [
      {
        "value": "VMware",
        "label": "VMware vCenter"
      },
      {
        "value": "Custom",
        "label": "Custom"
      }
    ],
    "datacenters": [
      {
        "value": "DATA-CEN",
        "label": "DATA-CEN"
      },
      {
        "value": "DataCentre-1",
        "label": "DataCentre-1"
      }
    ],
    "accounts": [
      {
        "value": "c0319706-5033-4ede-934b-3e307ec8ed2f",
        "label": "treas"
      },
      {
        "value": "7b24efc8-6a5f-4bc0-80ed-8a1713be01e7",
        "label": "custom_clouds"
      }
    ],
    "environments": [
      {
        "value": "Production",
        "label": "Production"
      },
      {
        "value": "Development",
        "label": "Development"
      },
      {
        "value": "Test",
        "label": "Test"
      },
      {
        "value": "None",
        "label": "None"
      }
    ]
  }
}

export const capacityGrowthInsightsData = {
  "vmDensityPerHost": [
    {
      "hostName": "ul-sv1-unity-lab-esx01.unitedlayer.com",
      "vmCount": 34
    },
    {
      "hostName": "ul-sv1-unity-lab-esx02.unitedlayer.com",
      "vmCount": 34
    }
  ],
  "capacityTrendAndForecast": [
    { "month": "Jun", "count": 68, "isForecast": false },
    { "month": "Jul", "count": 68, "isForecast": false },
    { "month": "Aug", "count": 68, "isForecast": false },
    { "month": "Sep", "count": 68, "isForecast": false },
    { "month": "Oct", "count": 68, "isForecast": false },
    { "month": "Nov", "count": 68, "isForecast": false },
    { "month": "Dec", "count": 68, "isForecast": false },
    { "month": "Jan", "count": 68, "isForecast": false },
    { "month": "Feb", "count": 68, "isForecast": false },
    { "month": "Mar", "count": 68, "isForecast": false },
    { "month": "Apr", "count": 68, "isForecast": false },
    { "month": "May", "count": 68, "isForecast": false },
    { "month": "Jun", "count": 68, "isForecast": true },
    { "month": "Jul", "count": 68, "isForecast": true },
    { "month": "Aug", "count": 68, "isForecast": true },
    { "month": "Sep", "count": 68, "isForecast": true },
    { "month": "Oct", "count": 68, "isForecast": true },
    { "month": "Nov", "count": 68, "isForecast": true }
  ],
  "provisioningStatus": {
    "provisioned": 0,
    "decommissioned": 0
  },
  "filters": {
    "platforms": [
      { "value": "VMware", "label": "VMware vCenter" },
      { "value": "Custom", "label": "Custom" }
    ],
    "datacenters": [
      { "value": "DC1", "label": "DC1" },
      { "value": "DC2", "label": "DC2" }
    ],
    "accounts": [
      { "value": "uuid-123", "label": "treas" },
      { "value": "uuid-456", "label": "custom_clouds" }
    ],
    "environments": [
      { "value": "Production", "label": "Production" },
      { "value": "Development", "label": "Development" },
      { "value": "Test", "label": "Test" },
      { "value": "None", "label": "None" }
    ]
  }
}

export const InfrastructureHealthStatus = {
  "powerStatus": {
    "psuNormal": 298,
    "psuDegraded": 9,
    "psuFailed": 3
  },
  "hostHealthStatus": {
    "healthy": 298,
    "warning": 14,
    "critical": 6,
    "maintenance": 3
  },
  "fanTemperatureSensors": {
    "tempNormal": 301,
    "tempWarning": 7,
    "tempCritical": 2,
    "fanFailed": 1
  },
}

export const performanceWorkloadData = {
  "diskLatencyTop10": [
    { "vmName": "svc-checkpoint-prod", "value": 842 },
    { "vmName": "api-search-prod", "value": 718 },
    { "vmName": "svc-payment-gw", "value": 624 }
  ],
  "cpuReadyWaitTop10": [
    { "vmName": "svc-checkpoint-prod", "value": 8.4 },
    { "vmName": "api-search-prod", "value": 6.9 },
    { "vmName": "fn-data-ingest", "value": 5.8 }
  ],
  "swapBalloonMemoryTop10": [
    { "vmName": "svc-checkpoint-prod", "value": 8.4 },
    { "vmName": "api-search-prod", "value": 6.9 },
    { "vmName": "fn-data-ingest", "value": 5.8 }
  ],
  "filters": {
    "platforms": [{ "value": "All", "label": "All" },],
    "datacenters": [{ "value": "All", "label": "All" },],
    "accounts": [{ "value": "All", "label": "All" },],
    "environments": [{ "value": "All", "label": "All" },]
  }
}

export const autoRemediationSummary = {
  "executionSummary": {
    "successfulPercentage": 91,
    "failedPercentage": 9,
    "totalRuns": 1842,
    "avgDuration": 4.2
  },
  "topActions": [
    { "actionName": "Restart service", "executionCount": 412 },
    { "actionName": "Scale out ASG", "executionCount": 338 },
    { "actionName": "Revoke SG rule", "executionCount": 261 },
    { "actionName": "Snapshot cleanup", "executionCount": 204 },
    { "actionName": "Disk resize", "executionCount": 138 }
  ],
}
