import { CiDistributionByDevice, CiDistributionByDeviceData, CiDistributionByDiscovery, CmdbSyncInsights, CmdbSyncTrend, DiscoveryDashboardFilterOptions, DiscoverySuccessFailureData, DiscoveryTrendAnalyticsData, ExecutiveKpiData, NewlyDiscoveredDevice, OperatingSystemsItem, ResourceDiscoveryData, TopDiscoveryFailuresItem } from './discovery-dashboard.type';
import { DateRangeOption } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';

export const DISCOVERY_DASHBOARD_TIME_RANGE_DEFAULT = 'last_30_days';

export const DISCOVERY_DASHBOARD_TIME_RANGE_OPTIONS: DateRangeOption[] = [
  { label: 'Last 24 Hours', value: 'last_24_hours' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 60 Days', value: 'last_60_days' },
  { label: 'Last 90 Days', value: 'last_90_days' }
];

// export const DISCOVERY_DASHBOARD_FILTER_OPTIONS: DiscoveryDashboardFilterOptions = {
//   time_range: [
//     { label: '24 Hours', value: 'last_24_hours' },
//     { label: '7 Days', value: 'last_week' },
//     { label: '30 Days', value: 'last_month' }
//   ],
//   account: [
//     { label: 'All', value: 'all' },
//     { label: 'Api', value: 'api' },
//     { label: 'Agentless Collector', value: 'agentless_collector' }
//   ],
//   region: [
//     '',
//     'northcentralus',
//     'us-east5',
//     'centralindia',
//     'us-central1-f',
//     'us-east-1',
//     'global',
//     'us-west1',
//     'japaneast',
//     'us-south1',
//     'westcentralus',
//     'europe-southwest1',
//     'ap-south-1',
//     'us-west3',
//     'asia-south1',
//     'europe-west3',
//     'canadaeast',
//     'us',
//     'asia-east2',
//     'us-west8',
//     'asia-east1',
//     'africa-south1',
//     'centralus',
//     'europe-north1',
//     'us-central1',
//     'europe-north2',
//     'eastus2',
//     'southamerica-west1',
//     'us-west-2',
//     'canadacentral',
//     'asia-southeast2',
//     'us-west-1',
//     'us-central1-c',
//     'us-central1-b',
//     'us-central1-a',
//     'asia-south2',
//     'australia-southeast2',
//     'australia-southeast1',
//     'me-west1',
//     'us-east1-c',
//     'europe-west10',
//     'europe-west12',
//     'me-central2',
//     'us-west4',
//     'northamerica-northeast1',
//     'europe-west9',
//     'northeurope',
//     'northamerica-south1',
//     'us-west2',
//     'ap-southeast-2',
//     'asia-northeast2',
//     'asia-northeast3',
//     'westus2',
//     'westus3',
//     'southcentralus',
//     'europe-central2',
//     'us-east1-b',
//     'westeurope',
//     'europe-west8',
//     'westus',
//     'us-east1-d',
//     'europe-west2',
//     'asia-southeast1',
//     'us-east4',
//     'europe-west1',
//     'europe-west6',
//     'eastus',
//     'europe-west4',
//     'us-east1',
//     'australiaeast',
//     'me-central1',
//     'US',
//     'us-sanjose-1',
//     'us-east7',
//     'japanwest',
//     'ap-southeast-1',
//     'northamerica-northeast2',
//     'southamerica-east1',
//     'eastasia',
//     'asia-northeast1',
//     'southeastasia'
//   ]
// };

export const DISCOVERY_DASHBOARD_EXECUTIVE_KPI: ExecutiveKpiData = {
  orphan_devices: 461,
  discovery_failures: 7,
  discovery_success_rate: 84.48,
  newly_discovered_resources: 0,
  discovered_devices_total: 4,
  devices_pending_monitoring: 403
};

export const DISCOVERY_TREND_ANALYTICS_DATA: DiscoveryTrendAnalyticsData = {
  total: [
    { week: 'W12', value: 0 },
    { week: 'W11', value: 0 },
    { week: 'W10', value: 0 },
    { week: 'W9', value: 0 },
    { week: 'W8', value: 0 },
    { week: 'W7', value: 0 },
    { week: 'W6', value: 0 },
    { week: 'W5', value: 0 },
    { week: 'W4', value: 0 },
    { week: 'W3', value: 0 },
    { week: 'W2', value: 0 },
    { week: 'W1', value: 0 },
    { week: 'Now', value: 12 }
  ],
  new: [
    { week: 'W12', value: 0 },
    { week: 'W11', value: 0 },
    { week: 'W10', value: 0 },
    { week: 'W9', value: 0 },
    { week: 'W8', value: 0 },
    { week: 'W7', value: 0 },
    { week: 'W6', value: 0 },
    { week: 'W5', value: 0 },
    { week: 'W4', value: 0 },
    { week: 'W3', value: 0 },
    { week: 'W2', value: 0 },
    { week: 'W1', value: 0 },
    { week: 'Now', value: 0 }
  ]
};

export const DISCOVERY_SUCCESS_FAILURE_DATA: DiscoverySuccessFailureData = {
  failure: [
    { week: 'W12', value: 0 },
    { week: 'W11', value: 0 },
    { week: 'W10', value: 0 },
    { week: 'W9', value: 0 },
    { week: 'W8', value: 0 },
    { week: 'W7', value: 0 },
    { week: 'W6', value: 0 },
    { week: 'W5', value: 0 },
    { week: 'W4', value: 0 },
    { week: 'W3', value: 0 },
    { week: 'W2', value: 0 },
    { week: 'W1', value: 0 },
    { week: 'Now', value: 0 }
  ],
  total: [
    { week: 'W12', value: 2 },
    { week: 'W11', value: 0 },
    { week: 'W10', value: 0 },
    { week: 'W9', value: 0 },
    { week: 'W8', value: 0 },
    { week: 'W7', value: 0 },
    { week: 'W6', value: 0 },
    { week: 'W5', value: 0 },
    { week: 'W4', value: 0 },
    { week: 'W3', value: 0 },
    { week: 'W2', value: 0 },
    { week: 'W1', value: 0 },
    { week: 'Now', value: 0 }
  ],
  success: [
    { week: 'W12', value: 2 },
    { week: 'W11', value: 0 },
    { week: 'W10', value: 0 },
    { week: 'W9', value: 0 },
    { week: 'W8', value: 0 },
    { week: 'W7', value: 0 },
    { week: 'W6', value: 0 },
    { week: 'W5', value: 0 },
    { week: 'W4', value: 0 },
    { week: 'W3', value: 0 },
    { week: 'W2', value: 0 },
    { week: 'W1', value: 0 },
    { week: 'Now', value: 0 }
  ]
};

export const CMDB_SYNC_INSIGHTS_DATA: CmdbSyncInsights = {
  "cmdb_sync_rate": {
    "value": 100.0,
    "unit": "percent",
    "successful_syncs": 883,
    "total_sync_attempts": 883,
    "change_percent": 0.2,
    "trend": "up"
  },
  "ci_update_failures": {
    "value": 0,
    "change_percent": -100.0,
    "trend": "down"
  },
  "orphaned_cis": {
    "value": 39,
    "percentage": 15.7,
    "change_percent": 3800.0,
    "trend": "up"
  },
  "unmapped_cis": {
    "value": 0,
    "percentage": 0.0,
    "change_percent": -100.0,
    "trend": "down"
  },
  "duplicate_cis": {
    "value": 1,
    "percentage": 0.4,
    "change_percent": 100.0,
    "trend": "up"
  },
  "filters": {
    "time_range": "last_year",
    "regions": [
      "all"
    ]
  },
  "period": {
    "start": "2025-07-11T09:52:31.799951+00:00",
    "end": "2026-07-11T09:52:31.799951+00:00",
    "comparison_start": "2024-07-11T09:52:31.799951+00:00",
    "comparison_end": "2025-07-11T09:52:31.799951+00:00"
  }
}

export const CI_DISTRIBUTION_BY_DEVICE: CiDistributionByDeviceData = {
  "total": 15,
  "results": [
    {
      "device_type": "Firewalls",
      "device_type_key": "firewall",
      "segregation": "firewall",
      "source_device_types": [
        "firewall"
      ],
      "count": 1,
      "share": 6.7,
      "redirect_url": "/customer/firewalls/?region=all&discovery_type=all&dashboard_from=2026-06-15T06%3A27%3A08.125685%2B00%3A00&page_size=10&time_range=last_month&dashboard_to=2026-07-15T06%3A27%3A08.125685%2B00%3A00&page=1"
    },
    {
      "device_type": "Switches",
      "device_type_key": "switch",
      "segregation": "switch",
      "source_device_types": [
        "switch"
      ],
      "count": 2,
      "share": 13.3,
      "redirect_url": "/customer/switches/?region=all&discovery_type=all&dashboard_from=2026-06-15T06%3A27%3A08.125685%2B00%3A00&page_size=10&time_range=last_month&dashboard_to=2026-07-15T06%3A27%3A08.125685%2B00%3A00&page=1"
    },
    {
      "device_type": "Private Cloud Compute",
      "device_type_key": "vm",
      "segregation": "private_cloud_compute",
      "source_device_types": [
        "hypervisor",
        "vmware",
        "esxi",
        "vcloud",
        "open_stack",
        "proxmox",
        "g3kvm",
        "hyperv",
        "nutanix",
        "virtual_machine"
      ],
      "count": 12,
      "share": 80.0,
      "redirect_url": ""
    }
  ]
}

export const CI_DISTRIBUTION_BY_DISCOVERY: CiDistributionByDiscovery = [
  {
    "down": 0,
    "protocol": "Database Protocol",
    "unknown": 1,
    "target_resources": "unknown",
    "discovery_method": "Agentless Collector",
    "resources_discovered": 1,
    "up": 0,
    "last_run": "20 hours ago"
  },
  {
    "down": 7,
    "protocol": "REST API",
    "unknown": 1,
    "target_resources": "VM instances",
    "discovery_method": "GCP API Discovery",
    "resources_discovered": 27,
    "up": 19,
    "last_run": "12 weeks ago"
  }
]

export const NEWLY_DISCOVERED_DEVICE: NewlyDiscoveredDevice = {
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    {
      "ci_type": "Firewall",
      "uptime": "37 days, 17:06:31.09",
      "availability_status": "Unknown",
      "model": "Dummy model",
      "manufacturer": "Adaptec",
      "datacenter": "DC1",
      "last_discovered": "1 day ago",
      "discovery_method": "SNMP",
      "ci_name": "12",
      "last_discovered_at": "2026-07-10T10:37:53.922505+00:00",
      "platform": "N/A",
      "serial_number": "619f26c4-9a4b-4cd8-a85f-908087085455",
      "os_type": "N/A"
    },
    {
      "ci_type": "Firewall",
      "uptime": "N/A",
      "availability_status": "Unknown",
      "model": "ASA 5585-X 10",
      "manufacturer": "cisco Systems Inc.",
      "datacenter": "DC1",
      "last_discovered": "05 Feb 2026 06:11",
      "discovery_method": "N/A",
      "ci_name": "UnityDemo-fw1-mgmt.sf10",
      "last_discovered_at": "2026-02-05T06:11:03.552153+00:00",
      "platform": "N/A",
      "serial_number": "1817ec5b-17c4-424f-8198-c2a6d780af7b",
      "os_type": "N/A"
    },
    {
      "ci_type": "VMware VM",
      "uptime": "10 days, 19:22:20.694322",
      "availability_status": "Up",
      "model": "N/A",
      "manufacturer": "VMware",
      "datacenter": "DC1",
      "last_discovered": "02 Jan 2026 15:05",
      "discovery_method": "API",
      "ci_name": "unity-lab-lnx-vm1",
      "last_discovered_at": "2026-01-02T15:05:01.488830+00:00",
      "platform": "VMware",
      "serial_number": "420a3bc0-a875-1164-24ff-4482fb568a73",
      "os_type": "Ubuntu Linux (64-bit)"
    },
    {
      "ci_type": "VMware VM",
      "uptime": "N/A",
      "availability_status": "Down",
      "model": "N/A",
      "manufacturer": "VMware",
      "datacenter": "DC1",
      "last_discovered": "02 Jan 2026 15:00",
      "discovery_method": "API",
      "ci_name": "unity-lab-Win-vm8",
      "last_discovered_at": "2026-01-02T15:00:37.573308+00:00",
      "platform": "VMware",
      "serial_number": "420ad540-47e7-2a84-c64f-f892f5b612a2",
      "os_type": "N/A"
    }
  ]
}

export const TOP_DISCOVERY_FAILURES: TopDiscoveryFailuresItem[] = [
  {
    "policy_name": "AWS-Backup-US",
    "failure_count": 32,
    "last_failure": "2 hrs ago"
  },
  {
    "policy_name": "HyperV-Cluster2",
    "failure_count": 20,
    "last_failure": "38 mins ago"
  }
]

export const OPERATING_SYSTEMS: OperatingSystemsItem[] = [
  {
    "os_type": "Microsoft Windows",
    "os_version": "Multiprocessor Server 2019 (NT 6.3)",
    "count": 1,
    "eol_data": null
  },
  {
    "os_type": "Ubuntu",
    "os_version": "16.04.2",
    "count": 7,
    "eol_data": null
  }
]

export const CMDB_SYNC_TREND: CmdbSyncTrend = [
  {
    "week": "W1",
    "failed": 0,
    "pending": 0,
    "synced_cis": 0,
    "discovered_cis": 0
  },
  {
    "week": "W2",
    "failed": 0,
    "pending": 0,
    "synced_cis": 0,
    "discovered_cis": 0
  },
  {
    "week": "W3",
    "failed": 0,
    "pending": 0,
    "synced_cis": 0,
    "discovered_cis": 0
  },
  {
    "week": "W4",
    "failed": 0,
    "pending": 0,
    "synced_cis": 0,
    "discovered_cis": 0
  },
  {
    "week": "W5",
    "failed": 0,
    "pending": 0,
    "synced_cis": 0,
    "discovered_cis": 0
  }
]

export const CI_DISTRIBUTION: CiDistributionByDevice = {
  "total": 249,
  "results": [
    {
      "category": "Private Cloud Compute",
      "category_key": "private_cloud_compute",
      "count": 239,
      "share": 96.0
    },
    {
      "category": "Firewalls",
      "category_key": "firewalls",
      "count": 7,
      "share": 2.8
    },
    {
      "category": "Database",
      "category_key": "database",
      "count": 3,
      "share": 1.2
    }
  ]
}

export const RESOURCE_DISTRIBUTION: ResourceDiscoveryData = {
  "api_based_discovery": 44754,
  "collector_based_discovery": 5377,
  "snmp_based_discovery": 2001,
  "total_resources": 24892,
  "devices_not_under_monitoring": 24892
};
