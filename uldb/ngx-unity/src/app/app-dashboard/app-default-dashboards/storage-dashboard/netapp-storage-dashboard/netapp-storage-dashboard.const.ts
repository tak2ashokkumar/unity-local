import {
  AggregateOverviewTableViewType,
  CapacityPlanningTableViewType,
  LUNOverviewTableViewType,
  NetappStorageMetric,
  NetappStorageTone,
  NodeInfoAndMetricsTableViewType,
  PerformanceMetricsTableViewType,
  PortOverviewTableViewType,
  RecentAlertsTableViewType,
  SVMOverviewTableViewType,
  VolumeOverviewTableViewType
} from './netapp-storage-dashboard.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';


// Start of API end point url


export const NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT = '/customer/persona/storage-dashboard/netapp/';
export const NETAPP_STORAGE_EXECUTIVE_SUMMARY_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}executive-summary/`;
export const NETAPP_STORAGE_NODE_HEALTH_PERFORMANCE_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}node-health-performance-chart/`;
export const NETAPP_STORAGE_AGGREGATE_CAPACITY_UTILIZATION_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}aggregate-capacity-utilization-chart/`;
export const NETAPP_STORAGE_SVM_OVERVIEW_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}svm-overview-chart/`;
export const NETAPP_STORAGE_VOLUME_CAPACITY_PERFORMANCE_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}volume-capacity-performance-chart/`;
export const NETAPP_STORAGE_LUN_INVENTORY_CAPACITY_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}lun-inventory-capacity-chart/`;
export const NETAPP_STORAGE_NETWORK_PORT_STATUS_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}network-port-status-chart/`;
export const NETAPP_STORAGE_CLUSTER_PERFORMANCE_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}cluster-performance-chart/`;
export const NETAPP_STORAGE_CAPACITY_PLANNING_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}capacity-planning-chart/`;
export const NETAPP_STORAGE_RECENT_ALERTS_CHART_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}recent-alerts-chart/`;
export const NETAPP_STORAGE_AUTO_REMEDIATION_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}netapp-auto-remediation/`;

export const NETAPP_STORAGE_NODE_HEALTH_PERFORMANCE_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}node-health-performance-table/`;
export const NETAPP_STORAGE_AGGREGATE_CAPACITY_UTILIZATION_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}aggregate-capacity-utilization-table/`;
export const NETAPP_STORAGE_SVM_OVERVIEW_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}svm-overview-table/`;
export const NETAPP_STORAGE_VOLUME_CAPACITY_PERFORMANCE_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}volume-capacity-performance-table/`;
export const NETAPP_STORAGE_LUN_INVENTORY_CAPACITY_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}lun-inventory-capacity-table/`;
export const NETAPP_STORAGE_NETWORK_PORT_STATUS_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}network-port-status-table/`;
export const NETAPP_STORAGE_SNAPMIRROR_REPLICATION_HEALTH_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}snapmirror-replication-health-table/`;
export const NETAPP_STORAGE_CLUSTER_PERFORMANCE_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}cluster-performance-table/`;
export const NETAPP_STORAGE_HARDWARE_HEALTH_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}hardware-health-table/`;
export const NETAPP_STORAGE_CAPACITY_PLANNING_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}capacity-planning-table/`;
export const NETAPP_STORAGE_RECENT_ALERTS_TABLE_ENDPOINT = `${NETAPP_STORAGE_DASHBOARD_BASE_ENDPOINT}recent-alerts-table/`;


// End of API end point url






export const NETAPP_STORAGE_TONE_CLASS: Record<NetappStorageTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-muted'
};

export const CLUSTER_OVERVIEW = {
  "summary": {
    "usedCapacity": "1.21 PB",
    "freeCapacity": "0.61 PB",
    "availability": 99.97,
    "activeAlerts": 12,
    "nodes": 5,
    "aggregates": 18,
    "svms": 12,
    "volumes": 128,
    "luns": 324
  }
}

export const NETAPP_STORAGE_CLUSTER_METRICS: NetappStorageMetric[] = [
  { label: 'Used Capacity', value: '300 TB', tone: 'primary' },
  { label: 'Free Capacity', value: '200 TB', tone: 'primary' },
  { label: 'Availability', value: '99.97%', tone: 'success' },
  { label: 'Active Alerts', value: '12', tone: 'danger' },
  { label: 'Nodes', value: '5' },
  { label: 'Aggregates', value: '18' },
  { label: 'SVMs', value: '12' },
  { label: 'Volumes', value: '128' },
  { label: 'LUNs', value: '324' }
];

export const NETAPP_STORAGE_CPU_USAGE_STATIC = [
  {
    range: '0-10%',
    count: 2,
    nodes: [
      {
        name: 'node-3',
        value: '8%'
      },
      {
        name: 'node-7',
        value: '5%'
      }
    ]
  },
  {
    range: '10-20%',
    count: 3,
    nodes: [
      {
        name: 'node-1',
        value: '15%'
      },
      {
        name: 'node-5',
        value: '18%'
      },
      {
        name: 'node-9',
        value: '12%'
      }
    ]
  },
  {
    range: '20-30%',
    count: 2,
    nodes: [
      {
        name: 'node-2',
        value: '25%'
      },
      {
        name: 'node-11',
        value: '22%'
      }
    ]
  },
  {
    range: '30-40%',
    count: 4,
    nodes: [
      {
        name: 'node-4',
        value: '35%'
      },
      {
        name: 'node-8',
        value: '38%'
      },
      {
        name: 'node-12',
        value: '32%'
      },
      {
        name: 'node-15',
        value: '36%'
      }
    ]
  },
  {
    range: '40-50%',
    count: 3,
    nodes: [
      {
        name: 'node-6',
        value: '45%'
      },
      {
        name: 'node-13',
        value: '48%'
      },
      {
        name: 'node-16',
        value: '42%'
      }
    ]
  },
  {
    range: '50-60%',
    count: 2,
    nodes: [
      {
        name: 'node-10',
        value: '55%'
      },
      {
        name: 'node-18',
        value: '58%'
      }
    ]
  },
  {
    range: '60-70%',
    count: 3,
    nodes: [
      {
        name: 'node-14',
        value: '65%'
      },
      {
        name: 'node-20',
        value: '68%'
      },
      {
        name: 'node-21',
        value: '62%'
      }
    ]
  },
  {
    range: '70-80%',
    count: 2,
    nodes: [
      {
        name: 'node-17',
        value: '75%'
      },
      {
        name: 'node-23',
        value: '78%'
      }
    ]
  },
  {
    range: '80-90%',
    count: 2,
    nodes: [
      {
        name: 'node-19',
        value: '85%'
      },
      {
        name: 'node-24',
        value: '88%'
      }
    ]
  },
  {
    range: '90-100%',
    count: 1,
    nodes: [
      {
        name: 'node-25',
        value: '95%'
      }
    ]
  }
];

export const nodeInfoandMetricsCharView = {
  "summary": {
    "totalNodes": 5,
    "upNodes": 4,
    "downNodes": 1,
    "unknownNodes": 0,
    "avgCpuUtilization": 18.0,
    "avgMemUtilization": 32.0,
    "avgUptime": "45 Days",
    "avgNetworkUtilization":12,
  },
  // "tableView": [
  //   {
  //     "name": "node-1",
  //     "cluster": "cluster-prod-01",
  //     "model": "AFF A400",
  //     "os": "ONTAP 9.12.1P4",
  //     "cpu": "34.5%",
  //     "mem": "62.1%",
  //     "net": "0.73 Gbps",
  //     "rx": "1.2K",
  //     "tx": "0.9K",
  //     "rxLat": "1.2 ms",
  //     "txLat": "2.1 ms",
  //     "uptime": "45d 3h",
  //     "status": "Healthy"
  //   }
  // ],
  "charts": {
    "cpuDistribution": [
     ...NETAPP_STORAGE_CPU_USAGE_STATIC
    ],
    "memDistribution": [...NETAPP_STORAGE_CPU_USAGE_STATIC],
    "networkThroughput": [
      {"name": "node-1", "read": 0.54, "write": 0.17},
      {"name": "node-2", "read": 0.74, "write": 0.67},
      {"name": "node-2", "read": 4, "write": 7}
    ],
    "iopsTopNodes": [
      {"name": "node-1", "read": 22.4, "write": 5.6}
    ],
    "devWriteThroughput": [
      {"name": "node-1", "read": 550.0, "write": 170.0},
      {"name": "node-2", "read": 525.0, "write": 162.0},
      {"name": "node-3", "read": 498.0, "write": 156.0},
      {"name": "node-4", "read": 472.0, "write": 149.0},
      {"name": "node-5", "read": 445.0, "write": 141.0},
      {"name": "node-6", "read": 418.0, "write": 134.0},
      {"name": "node-7", "read": 392.0, "write": 126.0},
      {"name": "node-8", "read": 366.0, "write": 118.0},
      {"name": "node-9", "read": 340.0, "write": 110.0}
    ]
  }
}

export const NETAPP_STORAGE_NODE_INFO_AND_METRICS_TABLE_STATIC: PaginatedResult<NodeInfoAndMetricsTableViewType> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      name: 'node-1',
      cluster: 'cluster-prod-01',
      model: 'AFF A400',
      os: 'ONTAP 9.12.1P4',
      cpu: '34.5%',
      mem: '62.1%',
      net: '0.73 Gbps',
      rx: '1.2K',
      tx: '0.9K',
      rxLat: '1.2 ms',
      txLat: '2.1 ms',
      uptime: '45d 3h',
      status: 'Healthy'
    }
  ]
};

export const NETAPP_STORAGE_AGGREGATE_TABLE_STATIC: PaginatedResult<AggregateOverviewTableViewType> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      name: 'agg-01',
      cluster: 'cluster-prod-01',
      total: '220 TB',
      used: '146.3 TB',
      free: '73.7 TB',
      util: '66.5%',
      nodes: 'node-1',
      raid: 'RAID-DP',
      state: 'Online',
      snapUsed: '11.0 TB (5.0%)',
      nearlyFull: 'No',
      status: 'Healthy'
    }
  ]
};

export const NETAPP_STORAGE_SVM_TABLE_STATIC: PaginatedResult<SVMOverviewTableViewType> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      name: 'SVM-1',
      cluster: 'cluster-prod-01',
      state: 'Online',
      vols: 24,
      luns: 45,
      cap: '120.5 TB',
      rx: null,
      tx: null,
      rxLat: null,
      txLat: null,
      throughput: null,
      status: 'Healthy'
    }
  ]
};

export const NETAPP_STORAGE_VOLUME_TABLE_STATIC: PaginatedResult<VolumeOverviewTableViewType> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      cluster: 'cluster-prod-01',
      name: 'vol_01',
      svm: 'SVM-1',
      agg: 'agg-01',
      state: 'Online',
      type: 'RW',
      total: '200 TB',
      avail: '80 TB'
    }
  ]
};

export const NETAPP_STORAGE_LUN_TABLE_STATIC: PaginatedResult<LUNOverviewTableViewType> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      cluster: 'cluster-prod-01',
      name: 'lun_1',
      path: '/vol/vol_1/lun_1',
      state: 'Online',
      size: '250 GB',
      util: '54%',
      iops: '4.2K',
      usedSpace: "150.5GB",
      latency: '1.8 ms',
      throughput: '180.5 MB/s',
      status: 'Healthy'
    }
  ]
};

export const NETAPP_STORAGE_PERFORMANCE_TABLE_STATIC: PaginatedResult<PerformanceMetricsTableViewType> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      time: 'Jul 31, 14:30',
      rx: '35.6K',
      tx: '22.8K',
      rxLat: '1.8 ms',
      txLat: '2.3 ms',
      throughput: '21.4 GB/s'
    }
  ]
};

export const NETAPP_STORAGE_CAPACITY_TABLE_STATIC: PaginatedResult<CapacityPlanningTableViewType> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      cluster: 'cluster-prod-01',
      total: '2.0 PB',
      used: '1.3 PB',
      free: '0.7 PB',
      util: '65.0%',
      growth: 'N/A',
      days: 'N/A',
      ratio: 'N/A',
      status: 'Healthy'
    }
  ]
};

export const NETAPP_STORAGE_PORT_TABLE_STATIC: PaginatedResult<PortOverviewTableViewType> = {
  count: 3,
  next: null,
  previous: null,
  results: [
    {
      cluster: 'cluster-prod-01',
      node: 'node-2',
      name: 'e0a',
      type: 'Ethernet',
      proto: 'TCP/IP',
      admin: 'Up',
      link: 'Up',
      dev: 'N/A',
      devPort: 'N/A'
    },
    {
      cluster: 'cluster-prod-01',
      node: 'node-2',
      name: 'e0b',
      type: 'Ethernet',
      proto: 'TCP/IP',
      admin: 'Down',
      link: 'Down',
      dev: 'N/A',
      devPort: 'N/A'
    },
    {
      cluster: 'cluster-prod-01',
      node: 'node-2',
      name: '0a',
      type: 'Fibre Channel',
      proto: 'FC',
      admin: 'Up',
      link: 'Online',
      dev: 'N/A',
      devPort: 'N/A'
    }
  ]
};

export const NETAPP_STORAGE_RECENT_ALERTS_TABLE_STATIC: PaginatedResult<RecentAlertsTableViewType> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1501122,
      device: 'node-1',
      count: 3,
      event: 'cpu.util',
      time: 'Jul 13, 2026, 16:22:15',
      severity: 'Critical',
      description: 'High CPU/Memory utilization detected',
      status: 'Open',
      source: 'Unity'
    }
  ]
};

export const SVM_OVERVIEW = {
  summary: {
    totalSVMs: 12,
    runningSVMs: 11,
    stoppedSVMs: 1,
    unknownSVMs: 0,
    avgCapacityUsed: '1.21 PB',
    avgIops: null,
    avgIopsRead: null,
    avgIopsWrite: null,
    avgLatency: null,
    avgLatencyRead: null,
    avgLatencyWrite: null,
    avgThroughput: null
  },
  charts: {
    capacityBySvm: [
      { name: 'SVM-1', cap: 120.5 },
      { name: 'SVM-2', cap: 112.8 },
      { name: 'SVM-3', cap: 104.2 },
      { name: 'SVM-4', cap: 96.7 },
      { name: 'SVM-5', cap: 88.4 },
      { name: 'SVM-6', cap: 81.9 }
    ],
    volumeCountBySvm: [
      { name: 'SVM-1', vols: 24, luns: 45, cap: 120.5 },
      { name: 'SVM-2', vols: 22, luns: 41, cap: 112.8 },
      { name: 'SVM-3', vols: 20, luns: 38, cap: 104.2 },
      { name: 'SVM-4', vols: 18, luns: 34, cap: 96.7 },
      { name: 'SVM-5', vols: 16, luns: 30, cap: 88.4 },
      { name: 'SVM-6', vols: 14, luns: 27, cap: 81.9 }
    ],
    lunCountBySvm: [
      { name: 'SVM-1', luns: 45 },
      { name: 'SVM-2', luns: 41 },
      { name: 'SVM-3', luns: 38 },
      { name: 'SVM-4', luns: 34 },
      { name: 'SVM-5', luns: 30 },
      { name: 'SVM-6', luns: 27 }
    ],
    throughputBySvm: [
      { name: 'SVM-1', throughput: 2.51 }
    ],
    top10CapacityConsumers: [
      { name: 'SVM-1', cap: 120.5 }
    ],
    top10ByIops: [
      { name: 'SVM-1', rxIops: 60.2, txIops: 21.7 },
      { name: 'SVM-2', rxIops: 58.4, txIops: 20.1 },
      { name: 'SVM-3', rxIops: 55.9, txIops: 19.3 },
      { name: 'SVM-4', rxIops: 53.2, txIops: 18.4 },
      { name: 'SVM-5', rxIops: 49.8, txIops: 17.6 },
      { name: 'SVM-6', rxIops: 46.3, txIops: 16.8 }
    ]
  }
};

export const VOLUME_OVERVIEW = {
  summary: {
    totalVolumes: 128,
    onlineVolumes: 126,
    offlineVolumes: 2,
    unknownVolumes: 0,
    usedCapacity: '1.21 PB',
    avgLatency: null,
    totalIops: null,
    snapshotReserve: '384 TB'
  },
  charts: {
    stateDistribution: { online: 126, offline: 2, other: 0 },
    top10Largest: [{ name: 'vol_backup_repo01', total: 20.0 }],
    top10MostUsed: [{ name: 'vol_sap_hana01', used: 5.16 }],
    top10ByAvail: [{ name: 'vol_01', avail: 80.0 }],
    volumeIopsTrend: {
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      rx: [9800, 11400, 14900, 12800, 12100, 14300],
      tx: [2200, 2800, 3600, 3300, 3200, 3900]
    },
    rwRatio: {
      read: 65,
      write: 35
    },
    volumeReadWriteLatencyTrend: {
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      rxLat: [1.2, 1.4, 1.9, 1.5, 1.3, 1.6],
      txLat: [1.8, 2.1, 2.5, 2.0, 1.9, 2.2]
    }
  }
};

export const LUN_OVERVIEW = {
  summary: {
    totalLUNs: 324,
    onlineLUNs: 318,
    offlineLUNs: 6,
    unknownLUNs: 0,
    avgLatency: null,
    totalIops: null
  },
  charts: {
    healthDistribution: [
      { status: 'Healthy', count: 310 },
      { status: 'Warning', count: 10 },
      { status: 'Critical', count: 4 }
    ],
    top10ByUsage: [
      { name: 'lun_1', util: 54.0 },
      { name: 'lun_2', util: 61.0 },
      { name: 'lun_3', util: 67.0 },
      { name: 'lun_4', util: 72.0 },
      { name: 'lun_5', util: 78.0 },
      { name: 'lun_6', util: 84.0 },
      { name: 'lun_7', util: 91.0 },
      { name: 'lun_8', util: 88.0 }
    ],
    growthTrend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [820.0, 1030.6, 1241.2, 1451.8, 1662.4, 1873.0]
    },
    availability: 99.97
  }
};

export const PERFORMANCE_METRICS = {
  summary: {
    totalIops: '58.4K',
    readIops: '35.6K',
    writeIops: '22.8K',
    throughput: '21.4 GB/s',
    readLatency: '1.8 ms',
    writeLatency: '2.3 ms'
  },
  charts: {
    iopsTimeSeries: {
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      rx: [32.7, 36.3, 47.3, 40.6, 38.4, 45.5],
      tx: [21.8, 27.8, 36.0, 33.0, 32.0, 39.0]
    },
    throughputTimeSeries: {
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      data: [16.5, 18.2, 22.6, 21.4, 20.1, 21.4]
    },
    latencyTimeSeries: {
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      rxLat: [1.4, 1.6, 1.8, 1.7, 1.5, 1.8],
      txLat: [2.1, 2.3, 2.5, 2.2, 2.0, 2.3]
    },
    iopsBreakdown: {
      categories: ['NFS', 'CIFS', 'iSCSI', 'FC', 'NVMe'],
      read: [15.2, 10.4, 5.1, 3.2, 1.7],
      write: [8.5, 6.2, 3.8, 2.5, 1.8]
    }
  }
};

export const CAPACITY_PLANNING = {
  summary: {
    usedCapacity: '1.21 PB',
    freeCapacity: '0.61 PB',
    usableCapacity: '1.82 PB',
    growthRate: 'N/A',
    daysUntilFull: 'N/A',
    thinProvisioningPct: '72.0%'
  },
  charts: {
    capacityForecast: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      actual: [0.89, 0.95, 1.01, 1.1, 1.15, 1.21, null, null, null, null, null, null],
      forecast1: [null, null, null, null, null, 1.21, 1.27, 1.33, 1.39, 1.45, 1.51, 1.57],
      forecast2: [null, null, null, null, null, 1.21, 1.29, 1.38, 1.46, 1.55, 1.63, 1.72],
      forecast3: [null, null, null, null, null, 1.21, 1.33, 1.45, 1.57, 1.69, 1.81, 1.93]
    },
    volUtilDistribution: [
      { range: '>90% (Red)', count: 5 },
      { range: '70-90% (Orange)', count: 28 },
      { range: '<70% (Green)', count: 95 }
    ],
    aggUtilDistribution: [
      { range: '>90% (Red)', count: 1 },
      { range: '70-90% (Orange)', count: 4 },
      { range: '<70% (Green)', count: 18 }
    ],
    top5Consumers: [
      { name: 'vol_01', capacity: 200.0 }
    ],
    capacityBySvm: [
      { name: 'SVM-1', cap: 120.5 }
    ],
    monthlyGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [71.0, 78.9, 93.5, 90.1, 103.7, 112.7, 78.9, 93.5, 132.0, 150.0, 93.5, 112.7]
    }
  }
};

export const PORT_OVERVIEW = {
  summary: {
    totalPorts: 10,
    totalEthernetPorts: 6,
    totalFcPorts: 4,
    portsUp: 8,
    portsDown: 1,
    portsUnknown: 1
  },
  charts: {
    linkStatusDistribution: [
      { status: 'Link Up', count: 8 },
      { status: 'Link Down', count: 1 }
    ],
    portTypeDistribution: [
      { type: 'Ethernet', count: 6 },
      { type: 'Fibre Channel', count: 4 }
    ],
    portsByNode: [
      { node: 'node-2', count: 4 },
      { node: 'node-14', count: 3 },
      { node: 'node-8', count: 2 },
      { node: 'node-5', count: 1 }
    ]
  }
};

export const RECENT_ALERTS = {
  summary: {
    totalAlerts: 12,
    critical: 3,
    warning: 5,
    information: 4
  },
  charts: {
    severityDistribution: [
      { severity: 'Critical', count: 3 },
      { severity: 'Warning', count: 5 },
      { severity: 'Info', count: 4 }
    ],
    alertTimeline: {
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      critical: [1, 0, 0, 1, 0, 1, 0, 0],
      warning: [1, 0, 1, 0, 1, 0, 1, 1],
      info: [1, 1, 0, 0, 1, 0, 0, 1]
    }
  }
};

export const AUTO_REMEDIATION_SUMMARY = {
  summary: {
    autoRemediations: 12,
    avgMttr: '45.3 sec',
    runbookSuccess: '83.3%',
    runbookFailures: 2
  }
};

// export const PERFORMANCE_METRICS = {
//   summary: {
//     totalIops: '58.4K',
//     readIops: '35.6K',
//     writeIops: '22.8K',
//     throughput: '21.4 GB/s',
//     readLatency: '1.8 ms',
//     writeLatency: '2.3 ms'
//   },
//   charts: {
//     iopsTimeSeries: {
//       labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
//       rx: [32.7, 36.3, 47.3, 40.6, 38.4, 45.5],
//       tx: [21.8, 27.8, 36.0, 33.0, 32.0, 39.0]
//     },
//     throughputTimeSeries: {
//       labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
//       data: [16.5, 18.2, 22.6, 21.4, 20.1, 21.4]
//     },
//     latencyTimeSeries: {
//       labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
//       rxLat: [1.4, 1.6, 1.8, 1.7, 1.5, 1.8],
//       txLat: [2.1, 2.3, 2.5, 2.2, 2.0, 2.3]
//     },
//     iopsBreakdown: {
//       categories: ['NFS', 'CIFS', 'iSCSI', 'FC', 'NVMe'],
//       read: [15.2, 10.4, 5.1, 3.2, 1.7],
//       write: [8.5, 6.2, 3.8, 2.5, 1.8]
//     }
//   }
// };


export const NETAPP_STORAGE_NODE_INFO_AND_METRICS_STATIC = {
  summary: {
    totalNodes: 5,
    upNodes: 4,
    downNodes: 1,
    unknownNodes: 0,
    avgCpuUtilization: 18.0,
    avgMemUtilization: 32.0,
    avgUptime: '45 Days'
  },
  tableView: [
    {
      cluster: 'cluster-prod-01',
      nodeName: 'node-01',
      model: 'AFF A400',
      osVersion: 'ONTAP 9.14',
      cpuUsage: '18%',
      memoryUsage: '32%',
      netThroughput: '2.1 Gbps',
      iops: '18K / 8K',
      latency: '1.2 / 2.4 ms',
      uptime: '45 Days',
      status: 'Healthy'
    }
  ],
  charts: {
    cpuDistribution: [
      { label: 'node-01', value: 18 },
      { label: 'node-02', value: 21 },
      { label: 'node-03', value: 82 },
      { label: 'node-04', value: 14 },
      { label: 'node-05', value: 25 },
      { label: 'node-06', value: 34 },
      { label: 'node-07', value: 47 }
    ],
    memDistribution: [
      { label: 'node-01', value: 32 },
      { label: 'node-02', value: 35 },
      { label: 'node-03', value: 71 },
      { label: 'node-04', value: 28 },
      { label: 'node-05', value: 41 },
      { label: 'node-06', value: 39 },
      { label: 'node-07', value: 52 }
    ],
    networkThroughput: [
      { label: 'node-03', value: 9.1 },
      { label: 'node-02', value: 8.5 },
      { label: 'node-01', value: 7.8 },
      { label: 'node-05', value: 6.2 },
      { label: 'node-04', value: 5.7 },
      { label: 'node-06', value: 4.9 },
      { label: 'node-07', value: 4.3 }
    ],
    iopsTopNodes: [
      { label: 'node-03', value: 26 },
      { label: 'node-02', value: 24 },
      { label: 'node-01', value: 22 },
      { label: 'node-05', value: 14 },
      { label: 'node-04', value: 12 },
      { label: 'node-06', value: 11 },
      { label: 'node-07', value: 9 }
    ],
    devWriteThroughput: [
      { name: 'node-1', read: 550, write: 170 },
      { name: 'node-2', read: 520, write: 155 },
      { name: 'node-3', read: 490, write: 160 },
      { name: 'node-4', read: 465, write: 148 },
      { name: 'node-5', read: 430, write: 138 },
      { name: 'node-6', read: 405, write: 129 },
      { name: 'node-7', read: 372, write: 120 },
      { name: 'node-8', read: 340, write: 112 },
      { name: 'node-9', read: 318, write: 105 },
      { name: 'node-10', read: 295, write: 98 },
      { name: 'node-11', read: 278, write: 92 },
      { name: 'node-12', read: 255, write: 86 },
      { name: 'node-13', read: 241, write: 80 },
      { name: 'node-14', read: 225, write: 74 },
      { name: 'node-15', read: 208, write: 69 },
      { name: 'node-16', read: 196, write: 65 },
      { name: 'node-17', read: 182, write: 61 }
    ]
  }
};

export const NETAPP_STORAGE_AGGREGATE_SECTION_STATIC = {
  summary: {
    totalAggregates: 18,
    onlineAggregates: 16,
    offlineAggregates: 2,
    unknownAggregates: 0,
    usedCapacity: '1.21 PB',
    freeCapacity: '0.61 PB',
    utilizationPercent: 66.5
  },
  charts: {
    capacityDistribution: [
      { range: '<50% Utilization', count: 10 },
      { range: '50-75%', count: 5 },
      { range: '75-90%', count: 2 },
      { range: '>90% Full', count: 1 }
    ],
    utilizationBuckets: [
      { range: 'Low (0-25%)', count: 3 },
      { range: 'Medium (25-50%)', count: 6 },
      { range: 'Optimal (50-75%)', count: 7 },
      { range: 'Over-Utilized (75-100%)', count: 2 }
    ],
    nearlyFull: [
      { name: 'agg-07', cluster: 'cluster-prod-02', util: '92.1%' },
      { name: 'agg-21', cluster: 'cluster-dr-01', util: '85.4%' }
    ],
    top10Largest: [
      { name: 'agg-01', cluster: 'cluster-prod-01', total: '220 TB' },
      { name: 'agg-02', cluster: 'cluster-prod-01', total: '200 TB' }
    ],
    aggregateGrowthTrend: {
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      data: [0.82, 0.90, 0.98, 1.05, 1.15, 1.21]
    }
  }
};
