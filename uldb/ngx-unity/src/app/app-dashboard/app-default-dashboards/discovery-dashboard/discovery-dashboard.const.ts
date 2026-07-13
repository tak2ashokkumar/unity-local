import { CiDistributionByDevice, CiDistributionByDiscovery, CmdbSyncInsights, CmdbSyncTrend, DiscoveryDashboardFilterOptions, DiscoverySuccessFailureData, DiscoveryTrendAnalyticsData, ExecutiveKpiData, NewlyDiscoveredDeviceItem, OperatingSystemsItem, RecentSyncConfigItem, ResourceDiscoveryData, TopDiscoveryFailuresItem } from './discovery-dashboard.type';

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
  devices_pending_monitoring: 126,
  discovered_devices_total: 24892,
  discovery_failures: 38,
  discovery_success_rate: 98.7,
  newly_discovered_resources: 342
};

export const DISCOVERY_TREND_ANALYTICS_DATA: DiscoveryTrendAnalyticsData = {
  total: [
    { week: 'W5', value: 57 },
    { week: 'W4', value: 64 },
    { week: 'W3', value: 76 },
    { week: 'W2', value: 78 },
    { week: 'W1', value: 70 },
    { week: 'Now', value: 37 }
  ],
  new: [
    { week: 'W5', value: 39 },
    { week: 'W4', value: 80 },
    { week: 'W3', value: 15 },
    { week: 'W2', value: 17 },
    { week: 'W1', value: 65 },
    { week: 'Now', value: 15 }
  ]
};

export const DISCOVERY_SUCCESS_FAILURE_DATA: DiscoverySuccessFailureData = {
  total: [
    { week: 'W5', value: 57 },
    { week: 'W4', value: 64 },
    { week: 'W3', value: 76 },
    { week: 'W2', value: 78 },
    { week: 'W1', value: 70 },
    { week: 'Now', value: 37 }
  ],
  new: [
    { week: 'W5', value: 39 },
    { week: 'W4', value: 80 },
    { week: 'W3', value: 15 },
    { week: 'W2', value: 17 },
    { week: 'W1', value: 65 },
    { week: 'Now', value: 15 }
  ]
};

export const CMDB_SYNC_INSIGHTS_DATA: CmdbSyncInsights = {
  "cmdb_sync_rate": 99.2,
  "cmdb_platform": "ServiceNow",
  "new_cis_added": 428,
  "ci_update_failures": 12,
  "duplicate_cis": 18
}

export const CI_DISTRIBUTION_BY_DEVICE: CiDistributionByDevice = {
  "private_cloud_compute": 21,
  "public_cloud_compute": 52,
  "storage": 206,
  "network": 234,
  "containers": 437,
  "database": 550,
  "pdu": 592,
  "firewalls": 810,
  "switches": 870,
  "bareMetal": 942,
  "others": 965
}

export const CI_DISTRIBUTION_BY_DISCOVERY: CiDistributionByDiscovery = {
  "api": 41,
  "agentless_collector": 80
}

export const NEWLY_DISCOVERED_DEVICE: NewlyDiscoveredDeviceItem[] = [
  {
    "datacenter": "US-East",
    "device_name": "vm-prod-web-01",
    "last_sync": "22 May 2026",
    "manufacturer": "Dell XPS 15",
    "model": "Dell XPS 15",
    "os_type": "Dell XPS 15",
    "os_version": "SN12345678",
    "status": "Healthy",
    "type": "VM"
  },
  {
    "datacenter": "EU-West",
    "device_name": "aks-node-pool-3",
    "last_sync": "05 May 2026",
    "manufacturer": "Red Hat Linux 8",
    "model": "Cisco Catalyst 9300",
    "os_type": "Red Hat Linux 8",
    "os_version": "SN87654321",
    "status": "Warning",
    "type": "Database"
  },
  {
    "datacenter": "AP-South",
    "device_name": "rds-mysql-fin",
    "last_sync": "12 May 2026",
    "manufacturer": "Dell Latitude 7420",
    "model": "Dell Latitude 7420",
    "os_type": "Dell Latitude 7420",
    "os_version": "SN11223344",
    "status": "Critical",
    "type": "Container"
  },
  {
    "datacenter": "US-East",
    "device_name": "fw-dc-east-02",
    "last_sync": "18 May 2026",
    "manufacturer": "Cisco ISR 4000",
    "model": "Cisco ISR 4000",
    "os_type": "Cisco ISR 4000",
    "os_version": "SN55667788",
    "status": "Healthy",
    "type": "Firewall"
  },
  {
    "datacenter": "US-West",
    "device_name": "gcp-gke-worker",
    "last_sync": "15 May 2026",
    "manufacturer": "Dell Alienware m15",
    "model": "Dell Alienware m15",
    "os_type": "Dell Alienware m15",
    "os_version": "SN99887766",
    "status": "Healthy",
    "type": "Container"
  }
]

export const TOP_DISCOVERY_FAILURES: TopDiscoveryFailuresItem[] = [
  {
    "alert_id": "12983718",
    "device_name": "VMware-DC-East",
    "failures": 12,
    "itsm_incident": "INC-104523",
    "last_failure": "2 mins ago"
  },
  {
    "alert_id": "10 mins ago",
    "device_name": "OCI-ObjStorage",
    "failures": 16,
    "itsm_incident": "14 mins ago",
    "last_failure": "14 mins ago"
  },
  {
    "alert_id": "15 mins ago",
    "device_name": "HyperV-Cluster2",
    "failures": 20,
    "itsm_incident": "38 mins ago",
    "last_failure": "38 mins ago"
  },
  {
    "alert_id": "20 mins ago",
    "device_name": "OpenStack-Prod",
    "failures": 10,
    "itsm_incident": "1 hr ago",
    "last_failure": "1 hr ago"
  },
  {
    "alert_id": "25 mins ago",
    "device_name": "AWS-Backup-US",
    "failures": 32,
    "itsm_incident": "2 hr ago",
    "last_failure": "2 hr ago"
  }
]

export const OPERATING_SYSTEMS: OperatingSystemsItem[] = [
  {
    "count": 12,
    "eol_date": "22 May 2025",
    "os_type": "macOS",
    "os_version": "SN12345678"
  },
  {
    "count": 16,
    "eol_date": "05 May 2025",
    "os_type": "Linux",
    "os_version": "SN87654321"
  },
  {
    "count": 20,
    "eol_date": "12 May 2025",
    "os_type": "Ubuntu",
    "os_version": "SN11223344"
  },
  {
    "count": 10,
    "eol_date": "18 May 2025",
    "os_type": "Fedora",
    "os_version": "SN55667788"
  },
  {
    "count": 32,
    "eol_date": "15 May 2025",
    "os_type": "Debian",
    "os_version": "SN99887766"
  }
]

export const RECENT_SYNC_CONFIG: RecentSyncConfigItem[] = [
  {
    "ci_name": "Cisco 1",
    "ci_type": "VM",
    "cmdb_status": "Active CI",
    "last_updated": "22 May 2025",
    "platform": "VMware",
    "source": "Agentless",
    "sync_status": "Synced"
  },
  {
    "ci_name": "Cisco 1",
    "ci_type": "Database",
    "cmdb_status": "New CI",
    "last_updated": "05 May 2025",
    "platform": "AWS",
    "source": "API",
    "sync_status": "Pending"
  },
  {
    "ci_name": "Cisco 1",
    "ci_type": "Firewall",
    "cmdb_status": "New CI",
    "last_updated": "12 May 2025",
    "platform": "BareMetal",
    "source": "Agentless",
    "sync_status": "Failed"
  },
  {
    "ci_name": "Cisco 1",
    "ci_type": "Database",
    "cmdb_status": "Active CI",
    "last_updated": "18 May 2025",
    "platform": "AWS",
    "source": "API",
    "sync_status": "Synced"
  },
  {
    "ci_name": "Cisco 1",
    "ci_type": "VM",
    "cmdb_status": "Active CI",
    "last_updated": "15 May 2025",
    "platform": "BareMetal",
    "source": "API",
    "sync_status": "Synced"
  }
]

export const CMDB_SYNC_TREND: CmdbSyncTrend = {
  "synced_ci": [
    { "month": "April", "value": 29 },
    { "month": "May", "value": 28 },
    { "month": "June", "value": 96 },
    { "month": "July", "value": 11 },
    { "month": "August", "value": 46 },
    { "month": "Sept", "value": 38 }
  ],
  "failed": [
    { "month": "April", "value": 45 },
    { "month": "May", "value": 89 },
    { "month": "June", "value": 85 },
    { "month": "July", "value": 18 },
    { "month": "August", "value": 43 },
    { "month": "Sept", "value": 91 }
  ],
  "pending": [
    { "month": "April", "value": 59 },
    { "month": "May", "value": 70 },
    { "month": "June", "value": 84 },
    { "month": "July", "value": 88 },
    { "month": "August", "value": 67 },
    { "month": "Sept", "value": 97 }
  ]
}

export const CI_DISTRIBUTION: any = {
  "private_cloud_compute": 21,
  "public_cloud_compute": 52,
  "storage": 206,
  "network": 234,
  "containers": 437,
  "database": 550,
  "pdu": 592,
  "firewalls": 810,
  "switches": 870,
  "bareMetal": 942,
  "others": 965
}

export const RESOURCE_DISTRIBUTION: ResourceDiscoveryData = {
  "api_based_discovery": 44754,
  "collector_based_discovery": 5377,
  "snmp_based_discovery": 2001,
  "total_resources": 24892,
  "devices_not_under_monitoring": 24892
};
