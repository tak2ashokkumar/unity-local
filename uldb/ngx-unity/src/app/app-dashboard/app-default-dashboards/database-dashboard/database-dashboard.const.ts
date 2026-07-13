import {
  DatabaseDashboardAlertSummaryMetric,
  DatabaseDashboardBarItem,
  DatabaseDashboardCapacityMetric,
  DatabaseDashboardCriticalAlert,
  DatabaseDashboardCriticalAlertViewData,
  DatabaseDashboardDonutItem,
  DatabaseDashboardFilterOption,
  DatabaseDashboardMetricInfoMap,
  DatabaseDashboardStatusInfo,
  DbDashboardHealthGroup,
  DatabaseDashboardMetric,
  DatabaseDashboardStorageRow,
  DatabaseDashboardTagItem,
  DatabaseDashboardUtilizationRow,
  DatabaseDashboardVersionItem
} from './database-dashboard.type';

export const PROGRESSBARCOLORS = ['#e54b4b', '#f5a623', '#2f80d1', '#5c8f1f'];
export const DBDASHBOARDCOLORS = ['#f5a623','#2F8BD7','#5B9E29','#D03533','#26A69A','#9B59B6','#B7D99A','#FFD099','#9BC9F0','#F5A3A3']

export const DATABASE_DASHBOARD_ALL_SELECTED_VALUE = 'all';

export const DATABASE_DASHBOARD_EFFICIENCY_STATUS_INFO: DatabaseDashboardStatusInfo[] = [
  {
    name: 'Healthy',
    icon: 'fa-check-circle',
    colorClass: 'text-success',
    descriptions: ['All metrics healthy']
  },
  {
    name: 'Warning',
    icon: 'fa-exclamation-circle',
    colorClass: 'text-warning',
    descriptions: ['At least one metric in warning state', 'No critical metrics']
  },
  {
    name: 'Critical',
    icon: 'fa-exclamation-triangle',
    colorClass: 'text-danger',
    descriptions: ['Any critical metric exists']
  },
  {
    name: 'Unknown',
    icon: 'fa-question-circle',
    colorClass: 'text-muted',
    descriptions: ['Missing data']
  }
];

export const DATABASE_DASHBOARD_METRIC_INFO_CONFIG: DatabaseDashboardMetricInfoMap = {
  'Buffer Cache Efficiency': {
    title: 'Buffer Cache Efficiency',
    status: [
      { name: 'Healthy', color: '#28A745', range: '> 95%' },
      { name: 'Warning', color: '#F39C12', range: '90% - 95%' },
      { name: 'Critical', color: '#DC3545', range: '< 90%' }
    ]
  },
  'Database Object Utilization': {
    title: 'Database Object Utilization',
    status: [
      { name: 'Healthy', color: '#28A745', range: '< 70%' },
      { name: 'Warning', color: '#F39C12', range: '70% - 85%' },
      { name: 'Critical', color: '#DC3545', range: '> 85%' }
    ]
  },
  'Open Tables': {
    title: 'Open Tables',
    status: [
      { name: 'Healthy', color: '#28A745', range: '< 70%' },
      { name: 'Warning', color: '#F39C12', range: '70% - 85%' },
      { name: 'Critical', color: '#DC3545', range: '> 85%' }
    ]
  },
  'Temporary Table Performance': {
    title: 'Temporary Table Performance',
    sections: [
      {
        title: 'In-Memory / sec',
        status: [
          { name: 'Healthy', color: '#28A745', range: '> 0.80 sec' },
          { name: 'Warning', color: '#F39C12', range: '0.60 - 0.80 sec' },
          { name: 'Critical', color: '#DC3545', range: '< 0.60 sec' }
        ]
      },
      {
        title: 'On Disk / sec',
        status: [
          { name: 'Healthy', color: '#28A745', range: '< 0.10 sec' },
          { name: 'Warning', color: '#F39C12', range: '0.10 - 0.15 sec' },
          { name: 'Critical', color: '#DC3545', range: '> 0.15 sec' }
        ]
      }
    ]
  },
  'Top 10 - Query Response Time (Ms)': {
    title: 'Top 10 Query Response Time',
    status: [
      { name: 'Healthy', color: '#28A745', range: '< 500 ms' },
      { name: 'Warning', color: '#F39C12', range: '500 ms - 2000 ms' },
      { name: 'Critical', color: '#DC3545', range: '> 2000 ms' }
    ]
  },
  'Top 10 Query Latency (Avg / P95)': {
    title: 'Top 10 Query Latency',
    status: [
      { name: 'Healthy', color: '#28A745', range: '< 500 ms' },
      { name: 'Warning', color: '#F39C12', range: '500 ms - 1500 ms' },
      { name: 'Critical', color: '#DC3545', range: '> 1500 ms' }
    ]
  },
  'Top 10 DBs - Active Sessions / Connections': {
    title: 'Top 10 DBs - Active Sessions / Connections',
    status: [
      { name: 'Normal', color: '#28A745', range: '< 100 sessions' },
      { name: 'Warning', color: '#F39C12', range: '100 - 200 sessions' },
      { name: 'Critical', color: '#DC3545', range: '> 200 sessions' }
    ]
  },
  'Aborted Connections per Second': {
    title: 'Aborted Connections per Second',
    status: [
      { name: 'Healthy', color: '#28A745', range: '< 0.1/sec' },
      { name: 'Warning', color: '#F39C12', range: '0.1 - 0.5/sec' },
      { name: 'Critical', color: '#DC3545', range: '> 0.5/sec' }
    ]
  },
  'Transactions Processed Per Second': {
    title: 'Transactions Processed Per Second',
    status: [
      { name: 'Healthy', color: '#28A745', range: 'TPS < 1' },
      { name: 'Warning', color: '#F39C12', range: 'TPS 1 - 10' },
      { name: 'Critical', color: '#DC3545', range: 'TPS > 10' }
    ]
  },
  'Buffer / Cache Hit Ratio': {
    title: 'Buffer Cache Hit Ratio',
    status: [
      { name: 'Healthy Cache', color: '#28A745', range: '> 95%' },
      { name: 'Moderate Cache', color: '#F39C12', range: '90% - 95%' },
      { name: 'Low Cache', color: '#DC3545', range: '< 90%' }
    ]
  },
  'Buffer Pool Efficiency': {
    title: 'Buffer Pool Efficiency',
    status: [
      { name: 'Healthy', color: '#28A745', range: '> 95%' },
      { name: 'Warning', color: '#F39C12', range: '90% - 95%' },
      { name: 'Critical', color: '#DC3545', range: '< 90%' }
    ]
  },
  'Temporary Table Created In Memory/sec': {
    title: 'In-Memory Temp Tables',
    status: [
      { name: 'Healthy', color: '#28A745', range: '> 0.80' },
      { name: 'Warning', color: '#F39C12', range: '0.60 - 0.80' },
      { name: 'Critical', color: '#DC3545', range: '< 0.60' }
    ]
  },
  'Temporary Table Created In Disk/sec': {
    title: 'Disk Temp Tables',
    status: [
      { name: 'Healthy', color: '#28A745', range: '< 0.10' },
      { name: 'Warning', color: '#F39C12', range: '0.10 - 0.15' },
      { name: 'Critical', color: '#DC3545', range: '> 0.15' }
    ]
  }
};

// export const DATABASE_DASHBOARD_DATABASE_OPTIONS: DatabaseDashboardFilterOption[] = [
//   { value: DATABASE_DASHBOARD_ALL_SELECTED_VALUE, label: 'All Selected' },
//   { value: 'oracle', label: 'Oracle' },
//   { value: 'mysql', label: 'MySQL' },
//   { value: 'mssql', label: 'MSSQL Server' },
//   { value: 'postgresql', label: 'PostgreSQL' },
//   { value: 'mongodb', label: 'MongoDB' },
//   { value: 'redis', label: 'Redis' }
// ];

export const DATABASE_DASHBOARD_SUMMARY_METRICS: DatabaseDashboardMetric[] = [
  { label: 'Total DB instances', key: 'total_databases', value: '128', tone: 'primary' },
  { label: 'Active databases', key: 'active_databases', value: '1,094' },
  { label: 'Inactive / Dormant', key: 'inactive_databases', value: '154' },
  { label: 'Primary Instances', key: 'primary_instances', value: '891' }
];

export const DATABASE_DASHBOARD_CLOUD_TYPE_DISTRIBUTION: DatabaseDashboardDonutItem[] = [
  { name: 'RDBMS', value: 64, color: '#1fc884' },
  { name: 'NoSQL', value: 24, color: '#7b63d8' },
  { name: 'Cloud DB', value: 12, color: '#4ba3ff' }
];

export const DATABASE_DASHBOARD_PLATFORM_COUNTS: DatabaseDashboardBarItem[] = [
  { name: 'Oracle', value: 3800, color: '#6a9f2d' },
  { name: 'MySQL', value: 1200, color: '#e84a4a' },
  { name: 'MS SQL', value: 2850, color: '#3c94d9' },
  { name: 'Postgres', value: 700, color: '#f0a22a' }
];

export const DATABASE_DASHBOARD_ENVIRONMENT_COUNTS: DatabaseDashboardBarItem[] = [
  { name: 'Production', value: 2791, label: '2791%', color: '#e84a4a' },
  { name: 'Development', value: 1299, label: '1299%', color: '#f0a22a' },
  { name: 'Test / QA', value: 722, label: '722%', color: '#3c94d9' }
];

export const DATABASE_DASHBOARD_TAGS: DatabaseDashboardTagItem[] = [
  { name: 'ERP', count: 312, textColor: '#e24f5d', backgroundColor: '#fde8ea' },
  { name: 'CRM', count: 241, textColor: '#b77721', backgroundColor: '#fff0d8' },
  { name: 'Analytics', count: 198, textColor: '#2c76c4', backgroundColor: '#e8f2ff' },
  { name: 'DevOps', count: 144, textColor: '#008f68', backgroundColor: '#dff6ed' },
  { name: 'Other', count: 353, textColor: '#6f7782', backgroundColor: '#eceff2' }
];

export const DATABASE_DASHBOARD_VERSIONS: DatabaseDashboardVersionItem[] = [
  { name: 'Oracle 19c', count: 214 },
  { name: 'Oracle 12c', count: 38 },
  { name: 'MySQL 8.0', count: 189 },
  { name: 'MySQL 5.7', count: 61 },
  { name: 'PostgreSQL 15', count: 176 },
  { name: 'MSSQL 2019', count: 148 },
  { name: 'MSSQL 2014', count: 29 },
  { name: 'Oracle 19c', count: 214 }
];

export const DATABASE_DASHBOARD_UTILIZATION_ROWS: DatabaseDashboardUtilizationRow[] = [
  {
    name: 'Cisco 1',
    cpuSeries: [20, 25, 28, 27, 34, 31, 38, 35, 41, 39, 44, 42, 48, 45, 52, 49, 55],
    cpuStatus: 24,
    cpuTone: 'success',
    memorySeries: [5, 5, 6, 5, 6, 5, 6, 5, 100, 8, 7, 6, 6, 5, 6, 6, 5],
    memoryStatus: 24,
    memoryTone: 'success',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '98k', percent: 68, tone: 'danger' },
    upTime: '26d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [16, 19, 18, 21, 24, 20, 25, 22, 24, 26, 29, 33, 31, 34, 30, 38, 96],
    cpuStatus: 51,
    cpuTone: 'warning',
    memorySeries: [10, 18, 26, 37, 45, 48, 60, 74, 82, 81, 76, 74, 70, 64, 55, 49, 38],
    memoryStatus: 81,
    memoryTone: 'danger',
    storage: { capacity: '256GB', used: '179GB', free: '30%', percent: 70, tone: 'warning' },
    diskIops: { label: '84k', percent: 63, tone: 'warning' },
    upTime: '21h'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [25, 44, 31, 53, 35, 58, 42, 61, 40, 65, 49, 74, 52, 82, 60, 89, 66],
    cpuStatus: 81,
    cpuTone: 'danger',
    memorySeries: [25, 34, 37, 42, 39, 48, 46, 55, 51, 60, 58, 66, 63, 70, 67, 75, 72],
    memoryStatus: 24,
    memoryTone: 'success',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '78k', percent: 60, tone: 'warning' },
    upTime: '20h'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [18, 20, 28, 34, 45, 48, 64, 78, 82, 80, 76, 74, 69, 65, 60, 53, 46],
    cpuStatus: 81,
    cpuTone: 'danger',
    memorySeries: [18, 20, 22, 25, 21, 28, 24, 26, 20, 24, 22, 25, 27, 31, 29, 86, 35],
    memoryStatus: 51,
    memoryTone: 'warning',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '65k', percent: 56, tone: 'warning' },
    upTime: '12d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [6, 6, 7, 6, 6, 7, 6, 6, 6, 7, 6, 6, 95, 7, 6, 7, 6],
    cpuStatus: 24,
    cpuTone: 'success',
    memorySeries: [22, 45, 28, 58, 34, 54, 37, 63, 40, 66, 43, 72, 48, 79, 52, 88, 55],
    memoryStatus: 81,
    memoryTone: 'danger',
    storage: { capacity: '256GB', used: '179GB', free: '30%', percent: 70, tone: 'warning' },
    diskIops: { label: '50k', percent: 48, tone: 'warning' },
    upTime: '29d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [22, 31, 35, 42, 38, 47, 44, 56, 51, 63, 60, 72, 67, 80, 74, 88, 82],
    cpuStatus: 51,
    cpuTone: 'warning',
    memorySeries: [10, 14, 20, 31, 39, 51, 54, 70, 82, 88, 84, 79, 75, 70, 61, 49, 37],
    memoryStatus: 81,
    memoryTone: 'danger',
    storage: { capacity: '256GB', used: '179GB', free: '30%', percent: 70, tone: 'warning' },
    diskIops: { label: '40k', percent: 36, tone: 'success' },
    upTime: '71d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [16, 18, 19, 21, 19, 22, 23, 20, 24, 22, 23, 24, 25, 26, 27, 28, 92],
    cpuStatus: 81,
    cpuTone: 'danger',
    memorySeries: [5, 5, 6, 5, 5, 6, 5, 5, 5, 6, 5, 5, 96, 6, 5, 5, 5],
    memoryStatus: 24,
    memoryTone: 'success',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '34k', percent: 31, tone: 'success' },
    upTime: '5d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [28, 48, 35, 59, 42, 65, 48, 72, 50, 76, 56, 80, 61, 84, 66, 89, 72],
    cpuStatus: 51,
    cpuTone: 'warning',
    memorySeries: [30, 38, 42, 47, 45, 53, 51, 60, 58, 67, 65, 72, 69, 76, 73, 80, 78],
    memoryStatus: 51,
    memoryTone: 'warning',
    storage: { capacity: '256GB', used: '179GB', free: '30%', percent: 70, tone: 'warning' },
    diskIops: { label: '29k', percent: 23, tone: 'success' },
    upTime: '19d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [14, 16, 22, 28, 39, 48, 62, 76, 78, 75, 72, 68, 62, 57, 49, 43, 35],
    cpuStatus: 81,
    cpuTone: 'danger',
    memorySeries: [15, 18, 20, 22, 21, 24, 19, 22, 20, 25, 24, 28, 27, 29, 33, 82, 35],
    memoryStatus: 81,
    memoryTone: 'danger',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '21k', percent: 18, tone: 'success' },
    upTime: '11d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [6, 6, 7, 6, 6, 7, 7, 6, 7, 6, 7, 6, 98, 6, 7, 6, 7],
    cpuStatus: 24,
    cpuTone: 'success',
    memorySeries: [26, 46, 29, 56, 33, 62, 37, 69, 41, 73, 45, 79, 50, 85, 55, 90, 58],
    memoryStatus: 51,
    memoryTone: 'warning',
    storage: { capacity: '1024GB', used: '922GB', free: '10%', percent: 90, tone: 'danger' },
    diskIops: { label: '15k', percent: 13, tone: 'success' },
    upTime: '21d'
  }
];

export const DATABASE_DASHBOARD_QUERY_RESPONSE: DatabaseDashboardBarItem[] = [
  { name: 'ora-prod-db-01', value: 94, label: '94k', color: '#e94a4a' },
  { name: 'mysql-prod-gw', value: 81, label: '81k', color: '#e94a4a' },
  { name: 'pg-analytics-01', value: 68, label: '68k', color: '#e94a4a' },
  { name: 'mysql-prod-crm', value: 56, label: '56k', color: '#ff8a00' },
  { name: 'mongo-prod-app', value: 43, label: '43k', color: '#f5a623' },
  { name: 'cassandra-prod', value: 41, label: '41k', color: '#f5a623' },
  { name: 'redis-prod-cache', value: 32, label: '32k', color: '#2f8bd7' },
  { name: 'orcl-prod-dr', value: 27, label: '27k', color: '#2f8bd7' },
  { name: 'pg-prod-repl', value: 23, label: '23k', color: '#2f8bd7' },
  { name: 'mysql-dev-01', value: 14, label: '14k', color: '#5b9e29' }
];

export const DATABASE_DASHBOARD_QUERY_LATENCY: DatabaseDashboardBarItem[] = [
  { name: 'orcl-prod-db-01', value: 281, label: '281ms', color: '#e94a4a' },
  { name: 'mysql-prod-app', value: 221, label: '221ms', color: '#e94a4a' },
  { name: 'pg-analytics-01', value: 182, label: '182ms', color: '#e94a4a' },
  { name: 'mysql-prod-crm', value: 142, label: '142ms', color: '#ff8a00' },
  { name: 'mongo-prod-app', value: 108, label: '108ms', color: '#f5a623' },
  { name: 'orcl-prod-dr', value: 64, label: '64ms', color: '#2f8bd7' },
  { name: 'pg-prod-01', value: 61, label: '61ms', color: '#2f8bd7' },
  { name: 'cassandra-prod', value: 44, label: '44ms', color: '#2f8bd7' },
  { name: 'mysql-dev-01', value: 31, label: '31ms', color: '#2f8bd7' },
  { name: 'mysql-dev-02', value: 21, label: '21ms', color: '#5b9e29' }
];

export const DATABASE_DASHBOARD_ACTIVE_SESSIONS: DatabaseDashboardBarItem[] = [
  { name: 'SELECT * TK_PROD...', value: 40, label: '40 min', color: '#e94a4a' },
  { name: 'UPDATE PAYROLL tbl...', value: 36, label: '36 min', color: '#e94a4a' },
  { name: 'JOIN PERF table report', value: 31, label: '31 min', color: '#e94a4a' },
  { name: 'CLOB app aggregates', value: 24, label: '24 min', color: '#ff8a00' },
  { name: 'Full table scan ORDERS', value: 19, label: '19 min', color: '#f5a623' },
  { name: 'INSERT IN INDEX TIND', value: 16, label: '16 min', color: '#f5a623' },
  { name: 'ETL MERGE STAGING', value: 12, label: '12 min', color: '#2f8bd7' },
  { name: 'VACUUM ANALYZE tx', value: 9, label: '9 min', color: '#2f8bd7' },
  { name: 'DBCC CHECKDB mn', value: 7, label: '7 min', color: '#2f8bd7' },
  { name: 'UPDATE STATS Oracle', value: 5, label: '5 min', color: '#5b9e29' }
];

export const DATABASE_DASHBOARD_ERROR_RATE: DatabaseDashboardBarItem[] = [
  { name: 'orcl-prod-db-01', value: 1241, label: '1241', color: '#e94a4a' },
  { name: 'pg-analytics-01', value: 968, label: '968', color: '#e94a4a' },
  { name: 'mysql-prod-crm', value: 841, label: '841', color: '#e94a4a' },
  { name: 'mysql-prod-app', value: 712, label: '712', color: '#ff8a00' },
  { name: 'mongo-prod-app', value: 618, label: '618', color: '#f5a623' },
  { name: 'cassandra-prod', value: 482, label: '482', color: '#f5a623' },
  { name: 'redis-prod-cache', value: 398, label: '398', color: '#2f8bd7' },
  { name: 'orcl-prod-dr', value: 314, label: '314', color: '#2f8bd7' },
  { name: 'pg-prod-01', value: 242, label: '242', color: '#2f8bd7' },
  { name: 'mysql-dev-01', value: 184, label: '184', color: '#5b9e29' }
];

export const DATABASE_DASHBOARD_CACHE_HIT_RATIO: DatabaseDashboardBarItem[] = [
  { name: 'Oracle buffer', value: 97, label: '97%', color: '#62a030' },
  { name: 'MySQL InnoDB', value: 94, label: '94%', color: '#62a030' },
  { name: 'PostgreSQL shared', value: 91, label: '91%', color: '#62a030' },
  { name: 'Redis hit rate', value: 99, label: '99%', color: '#62a030' }
];

export const DATABASE_DASHBOARD_CAPACITY_METRICS: DatabaseDashboardCapacityMetric[] = [
  { label: 'Total DB Size', value: '2137 GB', helper: 'Database Storage' },
  { label: 'Total Free Space', value: '1863 GB', helper: 'Combined Free Capacity' },
  { label: 'Avg Storage Used', value: '71%', helper: 'Across 10 Servers' }
];

export const DATABASE_DASHBOARD_STORAGE_ROWS: DatabaseDashboardStorageRow[] = [
  { server: 'DB-SRV-01', used: '94%', free: 28, dbSize: 412, logSize: 60, logGrowth: 3.2 },
  { server: 'DB-SRV-02', used: '87%', free: 65, dbSize: 380, logSize: 55, logGrowth: 2.8 },
  { server: 'APP-SRV-03', used: '82%', free: 90, dbSize: 290, logSize: 120, logGrowth: 5.1 },
  { server: 'WEB-SRV-01', used: '78%', free: 110, dbSize: 210, logSize: 180, logGrowth: 7.4 },
  { server: 'LOG-SRV-01', used: '76%', free: 120, dbSize: 45, logSize: 435, logGrowth: 12.6 },
  { server: 'BACKUP-01', used: '71%', free: 580, dbSize: 920, logSize: 500, logGrowth: 1.9 }
];

export const DATABASE_DASHBOARD_TABLESPACE_USAGE: DatabaseDashboardBarItem[] = [
  { name: 'system tablespace', value: 8.4, label: '8.4', color: '#e94a4a' },
  { name: 'user tablespace', value: 6.9, label: '6.9', color: '#e94a4a' },
  { name: 'temp tablespace', value: 5.8, label: '5.8', color: '#e94a4a' },
  { name: 'undo tablespace', value: 4.2, label: '4.2', color: '#ff8a00' },
  { name: 'index tablespace', value: 3.6, label: '3.6', color: '#f5a623' },
  { name: 'Archive logs', value: 2.8, label: '2.8', color: '#f5a623' }
];

export const DATABASE_DASHBOARD_LOG_GROWTH_RATE: DatabaseDashboardBarItem[] = [
  { name: 'DB-SRV-09', value: 18, color: '#7b3ff2' },
  { name: 'DB-SRV-04', value: 12, color: '#7b3ff2' },
  { name: 'DB-SRV-03', value: 30, color: '#7b3ff2' },
  { name: 'DB-SRV-08', value: 78, color: '#7b3ff2' },
  { name: 'DB-SRV-06', value: 5, color: '#7b3ff2' },
  { name: 'DB-SRV-02', value: 13, color: '#7b3ff2' },
  { name: 'DB-SRV-05', value: 29, color: '#7b3ff2' },
  { name: 'DB-SRV-07', value: 7, color: '#7b3ff2' },
  { name: 'DB-SRV-01', value: 11, color: '#7b3ff2' }
];

export const DATABASE_DASHBOARD_DB_SIZE_BY_SERVER: DatabaseDashboardBarItem[] = [
  { name: 'DB-SRV-01', value: 48, color: '#3d8df3' },
  { name: 'DB-SRV-02', value: 47, color: '#3d8df3' },
  { name: 'DB-SRV-03', value: 32, color: '#3d8df3' },
  { name: 'DB-SRV-04', value: 21, color: '#3d8df3' },
  { name: 'DB-SRV-05', value: 95, color: '#3d8df3' },
  { name: 'DB-SRV-06', value: 33, color: '#3d8df3' },
  { name: 'DB-SRV-07', value: 27, color: '#3d8df3' },
  { name: 'DB-SRV-08', value: 18, color: '#3d8df3' },
  { name: 'DB-SRV-09', value: 12, color: '#3d8df3' }
];

export const DATABASE_DASHBOARD_LOG_SIZE_BY_SERVER: DatabaseDashboardBarItem[] = [
  { name: 'DB-SRV-01', value: 5, color: '#e84a4a' },
  { name: 'DB-SRV-02', value: 6, color: '#e84a4a' },
  { name: 'DB-SRV-03', value: 12, color: '#e84a4a' },
  { name: 'DB-SRV-04', value: 19, color: '#e84a4a' },
  { name: 'DB-SRV-05', value: 44, color: '#e84a4a' },
  { name: 'DB-SRV-06', value: 51, color: '#e84a4a' },
  { name: 'DB-SRV-07', value: 5, color: '#e84a4a' },
  { name: 'DB-SRV-08', value: 8, color: '#e84a4a' },
  { name: 'DB-SRV-09', value: 4, color: '#e84a4a' }
];

export const DATABASE_DASHBOARD_DISK_UTILIZATION: DatabaseDashboardBarItem[] = [
  { name: 'DB-SRV-01', value: 94, label: '94%', color: '#e84a4a' },
  { name: 'DB-SRV-02', value: 87, label: '87%', color: '#e84a4a' },
  { name: 'DB-SRV-03', value: 82, label: '82%', color: '#ff8a00' },
  { name: 'DB-SRV-04', value: 78, label: '78%', color: '#ff8a00' },
  { name: 'DB-SRV-05', value: 76, label: '76%', color: '#ff8a00' },
  { name: 'DB-SRV-06', value: 71, label: '71%', color: '#f5a623' },
  { name: 'DB-SRV-07', value: 68, label: '68%', color: '#f5a623' },
  { name: 'DB-SRV-08', value: 59, label: '59%', color: '#2f8bd7' },
  { name: 'DB-SRV-09', value: 49, label: '49%', color: '#2f8bd7' },
  { name: 'DB-SRV-10', value: 44, label: '44%', color: '#2f8bd7' }
];

export const DATABASE_DASHBOARD_HEALTH_GROUPS: DbDashboardHealthGroup[] = [
  {
    title: 'Database Availability Status',
    metrics: [
      { label: 'Available / online', value: '298', tone: 'success' },
      { label: 'Degraded performance', value: '9', tone: 'warning' },
      { label: 'Unreachable / down', value: '3', tone: 'danger' },
      { label: 'Maintenance mode', value: '3', tone: 'danger' },
      { label: 'Inactive / dormant', value: '3', tone: 'danger' }
    ]
  },
  {
    title: 'Replication / Sync & Failover Status',
    subtitle: 'Replication health',
    metrics: [
      { label: 'Sync healthy', value: '312', tone: 'success' },
      { label: 'Lag >30s', value: '18', tone: 'warning' },
      { label: 'Deadlocks', value: '4', tone: 'danger' },
      { label: 'Errors per second', value: '0', tone: 'success' },
      { label: 'Connection Errors', value: '0', tone: 'success' }
    ]
  }
];

export const DATABASE_DASHBOARD_ALERT_SUMMARY_CONFIG: DatabaseDashboardAlertSummaryMetric[] = [
  { key: 'critical_alerts', label: 'Critical Alerts', value: '24', tone: 'danger', link: true },
  { key: 'high_alerts', label: 'High Alerts', value: '67', tone: 'warning', link: true },
  { key: 'open_itsm_tickets', label: 'Open ITSM Tickets', value: '14', tone: 'primary',  link: false },
  { key: 'automation_success_pct', label: 'Automation Success', value: '91', tone: 'success', suffix: '%', link: false },
  // { key: 'avg_mttr', label: 'Avg MTTR', value: '3.2', tone: 'muted', suffix: 'h', link: false }
];

export const DATABASE_DASHBOARD_CRITICAL_ALERTS: DatabaseDashboardCriticalAlertViewData[] = [
  { uuid: '2', id: 1744, deviceName: 'UL_Switch_Disk', severity: 'Critical', description: 'Ethernet has changed...', source: 'Unity', acknowledged: 'Yes', duration: '34s' },
  { uuid: '2', id: 1746, deviceName: 'UL_Switch_Test', severity: 'Warning', description: 'Ethernet has changed...', source: 'Unity', acknowledged: 'No', duration: '36s' },
  { uuid: '2', id: 2319, deviceName: 'UL_Firewall_Test', severity: 'Critical', description: 'High bandwidth usage...', source: 'Unity', acknowledged: 'No', duration: '39s' },
  { uuid: '2', id: 6664, deviceName: 'UL_Switch_AT', severity: 'Info', description: 'Device has been repla...', source: 'Zabbix', acknowledged: 'Yes', duration: '01m' },
  { uuid: '2', id: 9956, deviceName: 'UL_LoadBalancer_09', severity: 'Warning', description: 'System name has bee...', source: 'Nagios', acknowledged: 'No', duration: '02m 44s' },
  { uuid: '2', id: 1470, deviceName: 'UL_Router_AT', severity: 'Info', description: 'Device has been repla...', source: 'Unity', acknowledged: 'Yes', duration: '08m 56s' },
  { uuid: '2', id: 7452, deviceName: 'UL_LoadBalancer_04', severity: 'Critical', description: 'Interface Link down...', source: 'Nagios', acknowledged: 'Yes', duration: '10m 15s' },
  { uuid: '2', id: 2354, deviceName: 'UL_Switch_BT', severity: 'Info', description: 'Interface : High error...', source: 'Unity', acknowledged: 'No', duration: '20m 13s' },
  { uuid: '2', id: 996, deviceName: 'UL_Firewall_007', severity: 'Critical', description: 'Unavailable by ICMP...', source: 'Nagios', acknowledged: 'No', duration: '01h 09m' },
  { uuid: '2', id: 994, deviceName: 'UL_Firewall_007', severity: 'Warning', description: 'Unavailable by ICMP...', source: 'Zabbix', acknowledged: 'Yes', duration: '01h 09m' }
];


// Single api const for testing
export const INVENTORY_RESP = {
  "total_databases": 4,
  "status": {
    "active": 4,
    "inactive": 0
  },
  "by_cloud_type": [
    {
      "count": 4,
      "percentage": 100,
      "cloud_type": "RDBMS"
    }
  ],
  "by_type": [
    {
      "count": 1,
      "db_type": "MSSQL Server",
      "inactive": 0,
      "active": 1,
      "percentage": 25,
      "server_types": []
    },
    {
      "count": 1,
      "db_type": "MySQL",
      "inactive": 0,
      "active": 1,
      "percentage": 25,
      "server_types": []
    },
    {
      "count": 1,
      "db_type": "Oracle",
      "inactive": 0,
      "active": 1,
      "percentage": 25,
      "server_types": []
    },
    {
      "count": 1,
      "db_type": "PostgreSQL",
      "inactive": 0,
      "active": 1,
      "percentage": 25,
      "server_types": []
    }
  ],
  "by_environment": [
    { "environment": "Production", "count": 20, "percentage": 47.62 },
    { "environment": "Development", "count": 14, "percentage": 33.33 },
    { "environment": "Test", "count": 8, "percentage": 19.05 }
  ],
  "by_version": [
    {
      "count": 1,
      "percentage": 25,
      "version": "MSSQL Server 16.0.1000.6"
    },
    {
      "count": 1,
      "percentage": 25,
      "version": "MySQL 8.0.23"
    },
    {
      "count": 1,
      "percentage": 25,
      "version": "Oracle 19.0"
    },
    {
      "count": 1,
      "percentage": 25,
      "version": "PostgreSQL 13.22"
    }
  ],
  "by_tags": [
    {
      "count": 4,
      "percentage": 100,
      "tag": "Untagged"
    }
  ],
}

export const TOPUTIL_RESP = [
  {
    "disk_used_gb": 44.54,
    "cpu_usage_system_percent": 4.31,
    "name": "Db_instance_psql",
    "disk_capacity_gb": 95.9,
    "disk_iops_max": 4.56,
    "disk_write_ops_per_sec": 2.5571,
    "disk_read_latency_ms": 0.0,
    "host_uuid": "d6945ffb-523a-4465-8ba5-a2feb7460c05",
    "disk_read_ops_per_sec": 0.0,
    "cpu_trend": [
      { "ts": 1782273600, "value": 2.75 },
      { "ts": 1782277200, "value": 2.31 },
      { "ts": 1782280800, "value": 2.26 },
      { "ts": 1782284400, "value": 2.31 },
      { "ts": 1782288000, "value": 2.28 },
      { "ts": 1782291600, "value": 2.3 },
      { "ts": 1782295200, "value": 2.32 },
      { "ts": 1782298800, "value": 2.35 },
      { "ts": 1782302400, "value": 2.26 },
      { "ts": 1782306000, "value": 2.28 },
      { "ts": 1782309600, "value": 2.28 },
      { "ts": 1782313200, "value": 2.29 },
      { "ts": 1782316800, "value": 2.39 }
    ],
    "disk_utilization_percent": 21.005,
    "system_uptime_seconds": 7203334.0,
    "disk_iops": 2.5571,
    "host_id": 10901,
    "memory_used_percent": 68.14,
    "db_uuid": "3516d387-024f-439f-8ed6-305df19ddcbf",
    "memory_trend": [
      { "ts": 1782273600, "value": 68.55 },
      { "ts": 1782277200, "value": 68.4 },
      { "ts": 1782280800, "value": 66.37 },
      { "ts": 1782284400, "value": 67.52 },
      { "ts": 1782288000, "value": 68.23 },
      { "ts": 1782291600, "value": 66.7 },
      { "ts": 1782295200, "value": 68.02 },
      { "ts": 1782298800, "value": 68.88 },
      { "ts": 1782302400, "value": 67.33 },
      { "ts": 1782306000, "value": 67.96 },
      { "ts": 1782309600, "value": 68.15 },
      { "ts": 1782313200, "value": 67.16 },
      { "ts": 1782316800, "value": 67.54 }
    ]
  },
  {
    "host_id": 10902,
    "db_uuid": "79b3351a-03c4-475f-8617-98dab7c02e8c",
    "host_uuid": "2297b248-095c-47ce-8a1e-e466772b95e2",
    "system_uptime_seconds": 0.0,
    "name": "mssql_mon"
  }
]

export const TOPQUERY_RESP = {
  "top_cache_hit_ratio": [
    {
      "status": "critical",
      "hit_ratio_pct": 0.595,
      "name": "sdxdclmysqlappd01_MYSQLSERVER",
      "db_type": "MySQL",
      "host_id": 14673,
      "db_uuid": "9ebb1436-790d-410a-84f5-071f86685c91",
      "host_uuid": "a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf"
    },
    {
      "status": "healthy",
      "hit_ratio_pct": 99.882,
      "name": "sdxdclOracleFPPServer_oracledb",
      "db_type": "Oracle",
      "host_id": 14674,
      "db_uuid": "24fa0c07-8eeb-48e6-8989-b0eb5ace24f6",
      "host_uuid": "47fbd374-cccb-458f-b70e-5906c4a5d340"
    },
    {
      "status": "healthy",
      "hit_ratio_pct": 100,
      "name": "sdxdcwmssql_2022_MSSQLSERVER",
      "db_type": "MSSQL Server",
      "host_id": 14583,
      "db_uuid": "9b46dbf9-b00e-4141-8e3f-810173e5fbe8",
      "host_uuid": "86e0d5ef-7d2d-4104-928e-61742f77196c"
    }
  ],
  "top_latency": [
    {
      "status": "critical",
      "name": "sdxdclmysqlappd01_MYSQLSERVER",
      "db_type": "MySQL",
      "host_id": 14673,
      "db_uuid": "9ebb1436-790d-410a-84f5-071f86685c91",
      "host_uuid": "a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf",
      "response_time_ms": 4620.839
    },
    {
      "status": "healthy",
      "name": "sdxdclOracleFPPServer_oracledb",
      "db_type": "Oracle",
      "host_id": 14674,
      "db_uuid": "24fa0c07-8eeb-48e6-8989-b0eb5ace24f6",
      "host_uuid": "47fbd374-cccb-458f-b70e-5906c4a5d340",
      "response_time_ms": 0
    },
    {
      "status": "healthy",
      "name": "sdxdcwmssql_2022_MSSQLSERVER",
      "db_type": "MSSQL Server",
      "host_id": 14583,
      "db_uuid": "9b46dbf9-b00e-4141-8e3f-810173e5fbe8",
      "host_uuid": "86e0d5ef-7d2d-4104-928e-61742f77196c",
      "response_time_ms": 0
    }
  ],
  "top_errors_deadlocks": [
    {
      "status": "healthy",
      "name": "sdxdclmysqlappd01_MYSQLSERVER",
      "db_type": "MySQL",
      "deadlock_count": 0,
      "host_id": 14673,
      "db_uuid": "9ebb1436-790d-410a-84f5-071f86685c91",
      "host_uuid": "a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf"
    },
    {
      "status": "healthy",
      "name": "sdxdclOracleFPPServer_oracledb",
      "db_type": "Oracle",
      "deadlock_count": 0,
      "host_id": 14674,
      "db_uuid": "24fa0c07-8eeb-48e6-8989-b0eb5ace24f6",
      "host_uuid": "47fbd374-cccb-458f-b70e-5906c4a5d340"
    },
    {
      "status": "healthy",
      "name": "sdxdclpostgressrc_POSTGRES_SERVER",
      "db_type": "PostgreSQL",
      "deadlock_count": 0,
      "host_id": 14871,
      "db_uuid": "2e91b612-220a-4861-b1df-56879b0a2695",
      "host_uuid": "45fc9a5e-2f3b-46fa-9ac5-54a6a699d625"
    },
    {
      "status": "healthy",
      "name": "sdxdcwmssql_2022_MSSQLSERVER",
      "db_type": "MSSQL Server",
      "deadlock_count": 0,
      "host_id": 14583,
      "db_uuid": "9b46dbf9-b00e-4141-8e3f-810173e5fbe8",
      "host_uuid": "86e0d5ef-7d2d-4104-928e-61742f77196c"
    }
  ],
  "top_throughput": [
    {
      "status": "healthy",
      "name": "sdxdcwmssql_2022_MSSQLSERVER",
      "trend": [
        {
          "date": "2026-06-19",
          "transactions_per_sec": 0.62
        },
        {
          "date": "2026-06-20",
          "transactions_per_sec": 0.619
        },
        {
          "date": "2026-06-21",
          "transactions_per_sec": 0.62
        },
        {
          "date": "2026-06-22",
          "transactions_per_sec": 0.62
        },
        {
          "date": "2026-06-23",
          "transactions_per_sec": 0.62
        },
        {
          "date": "2026-06-24",
          "transactions_per_sec": 0.619
        },
        {
          "date": "2026-06-25",
          "transactions_per_sec": 0.618
        }
      ],
      "db_type": "MSSQL Server",
      "host_id": 14583,
      "db_uuid": "9b46dbf9-b00e-4141-8e3f-810173e5fbe8",
      "host_uuid": "86e0d5ef-7d2d-4104-928e-61742f77196c"
    },
    {
      "status": "healthy",
      "name": "sdxdclOracleFPPServer_oracledb",
      "trend": [
        {
          "date": "2026-06-19",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-20",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-21",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-22",
          "transactions_per_sec": 0.188
        },
        {
          "date": "2026-06-23",
          "transactions_per_sec": 0.19
        },
        {
          "date": "2026-06-24",
          "transactions_per_sec": 0.193
        },
        {
          "date": "2026-06-25",
          "transactions_per_sec": 0.198
        }
      ],
      "db_type": "Oracle",
      "host_id": 14674,
      "db_uuid": "24fa0c07-8eeb-48e6-8989-b0eb5ace24f6",
      "host_uuid": "47fbd374-cccb-458f-b70e-5906c4a5d340"
    },
    {
      "status": "healthy",
      "name": "sdxdclmysqlappd01_MYSQLSERVER",
      "trend": [
        {
          "date": "2026-06-19",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-20",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-21",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-22",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-23",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-24",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-25",
          "transactions_per_sec": 0
        }
      ],
      "db_type": "MySQL",
      "host_id": 14673,
      "db_uuid": "9ebb1436-790d-410a-84f5-071f86685c91",
      "host_uuid": "a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf"
    },
    {
      "status": "healthy",
      "name": "sdxdclpostgressrc_POSTGRES_SERVER",
      "trend": [
        {
          "date": "2026-06-19",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-20",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-21",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-22",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-23",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-24",
          "transactions_per_sec": 0
        },
        {
          "date": "2026-06-25",
          "transactions_per_sec": 0
        }
      ],
      "db_type": "PostgreSQL",
      "host_id": 14871,
      "db_uuid": "2e91b612-220a-4861-b1df-56879b0a2695",
      "host_uuid": "45fc9a5e-2f3b-46fa-9ac5-54a6a699d625"
    }
  ],
  "top_response_time": [
    {
      "status": "healthy",
      "name": "sdxdclOracleFPPServer_oracledb",
      "db_type": "Oracle",
      "host_id": 14674,
      "db_uuid": "24fa0c07-8eeb-48e6-8989-b0eb5ace24f6",
      "host_uuid": "47fbd374-cccb-458f-b70e-5906c4a5d340",
      "response_time_ms": 1.21
    },
    {
      "status": "healthy",
      "name": "sdxdcwmssql_2022_MSSQLSERVER",
      "db_type": "MSSQL Server",
      "host_id": 14583,
      "db_uuid": "9b46dbf9-b00e-4141-8e3f-810173e5fbe8",
      "host_uuid": "86e0d5ef-7d2d-4104-928e-61742f77196c",
      "response_time_ms": 0
    }
  ],
  "top_connections": [
    {
      "status": "healthy",
      "name": "sdxdclOracleFPPServer_oracledb",
      "db_type": "Oracle",
      "active_connections": 58,
      "host_id": 14674,
      "db_uuid": "24fa0c07-8eeb-48e6-8989-b0eb5ace24f6",
      "host_uuid": "47fbd374-cccb-458f-b70e-5906c4a5d340"
    },
    {
      "status": "healthy",
      "name": "sdxdcwmssql_2022_MSSQLSERVER",
      "db_type": "MSSQL Server",
      "active_connections": 15,
      "host_id": 14583,
      "db_uuid": "9b46dbf9-b00e-4141-8e3f-810173e5fbe8",
      "host_uuid": "86e0d5ef-7d2d-4104-928e-61742f77196c"
    },
    {
      "status": "healthy",
      "name": "sdxdclmysqlappd01_MYSQLSERVER",
      "db_type": "MySQL",
      "active_connections": 5,
      "host_id": 14673,
      "db_uuid": "9ebb1436-790d-410a-84f5-071f86685c91",
      "host_uuid": "a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf"
    }
  ]
}

export const CAPACITY_RESP = {
  "summary_stats": {
    "total_db_size_gb": 1240.50,
    "total_free_space_gb": 380.20,
    "avg_used_percentage": 68.45
  },
 
  "top_servers": [
    {
      "db_uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "db-server-01",
      "used_percentage": 85.30,
      "free_gb": 45.20,
      "db_size_gb": 310.50,
      "log_size_gb": 22.80,
      "log_growth_gb_per_day": 0.4200
    }
  ],
 
  "top_tablespace_filesystem_usage": [
    {
      "db_uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "db-server-01",
      "disk_used_pct": 78.50,
      "disk_free_gb": 120.30,
      "disk_total_gb": 560.00
    }
  ],
 
  "log_growth_rate": [
    {
      "db_uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "name": "db-server-02",
      "log_growth_gb_per_day": 0.6500
    }
  ],
 
  "disk_utilization": [
    {
      "db_uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "db-server-01",
      "disk_used_pct": 78.50,
      "disk_free_gb": 120.30,
      "disk_total_gb": 560.00
    }
  ],
 
  "log_size_by_server": [
    {
      "db_uuid": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "name": "db-server-03",
      "log_size_gb": 38.40
    }
  ],
 
  "db_size_by_server": [
    {
      "db_uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "db-server-01",
      "db_size_gb": 310.50
    }
  ],
 
  "archive_log_growth_trend": [
    {
      "db_uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "db-server-01",
      "trend": [
        {"date": "2026-05-18", "log_growth_gb": 0.3800},
        {"date": "2026-05-19", "log_growth_gb": 0.4100},
        {"date": "2026-05-20", "log_growth_gb": 0.0000},
        {"date": "2026-05-21", "log_growth_gb": 0.4500},
        {"date": "2026-05-22", "log_growth_gb": 0.3900},
        {"date": "2026-05-23", "log_growth_gb": 0.4200},
        {"date": "2026-05-24", "log_growth_gb": 0.4400}
      ]
    }
  ],
 
  "storage_growth_trend": [
    {
      "db_uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "db-server-01",
      "trend": [
        {"ts": 1748044800, "db_size_gb": 310.2341},
        {"ts": 1748048400, "db_size_gb": 310.2890},
        {"ts": 1748052000, "db_size_gb": 310.3120},
        {"ts": 1748055600, "db_size_gb": 310.3450},
        {"ts": 1748059200, "db_size_gb": 310.3780}
      ]
    }
  ]
}

export const CAPACITY_GROWTH_INSIGHT_SUMMARY_RESP = {
  "status": "critical",
  "buffer_cache_efficiency": {
    "status": "critical",
    "subtitle": "Buffer Pool Efficiency (%)",
    "title": "Buffer Cache Efficiency",
    "value": 66.82,
    "gauge": {
      "max": 100,
      "min": 0
    },
    "stats": {
      "max": 100,
      "avg": 66.82,
      "min": 0.59
    },
    "unit": "%"
  },
  "temporary_table_performance": {
    "stats": {
      "max": {
        "disk": 2.39,
        "memory": 0.76
      },
      "avg": {
        "disk": 0.62,
        "memory": 0.43
      },
      "min": {
        "disk": 0,
        "memory": 0
      }
    },
    "subtitle": "Temporary Tables Created (per sec)",
    "title": "Temporary Table Performance",
    "chart": {
      "labels": [
        "1",
        "2",
        "3",
        "4"
      ],
      "datasets": [
        {
          "data": [0.5445, 0.7589, null, 0],
          "label": "In Memory / sec"
        },
        {
          "data": [2.3942, 0.0675, 0, 0],
          "label": "On Disk / sec"
        }
      ]
    },
    "status_disk": "critical",
    "status_memory": "critical"
  },
  "database_object_utilization": {
    "status": "healthy",
    "stats": {
      "display_max": "2.27 K",
      "min": 1064,
      "max": 2272,
      "display_avg": "1.67 K",
      "avg": 1668,
      "display_min": "1.06 K"
    },
    "subtitle": "Open Tables",
    "unit": "tables",
    "title": "Database Object Utilization",
    "gauge": {
      "max": 3000,
      "min": 0
    },
    "display_value": "1.67 K",
    "value": 1668
  }
}

export const CAPACITY_GROWTH_INSIGHT_TABLE_RESP = {
  "count": 4,
  "limit": 4,
  "total_pages": 1,
  "page": 1,
  "servers": [
    {
      "status": "critical",
      "rank": 1,
      "open_tables_status": "healthy",
      "host_id": 14583,
      "host_uuid": "9b46dbf9-b00e-4141-8e3f-810173e5fbe8",
      "temp_tables_in_memory_per_sec": 0.5445,
      "temp_tables_on_disk_per_sec": 2.3942,
      "name": "sdxdcwmssql_2022_MSSQLSERVER",
      "open_tables": 1064,
      "db_type": "MSSQL Server",
      "temp_tables_in_memory_status": "critical",
      "buffer_pool_efficiency": 100,
      "temp_tables_on_disk_status": "critical",
      "buffer_pool_efficiency_status": "healthy"
    },
    {
      "status": "healthy",
      "rank": 2,
      "open_tables_status": "unknown",
      "host_id": 14674,
      "host_uuid": "24fa0c07-8eeb-48e6-8989-b0eb5ace24f6",
      "temp_tables_in_memory_per_sec": null,
      "temp_tables_on_disk_per_sec": 0,
      "name": "sdxdclOracleFPPServer_oracledb",
      "open_tables": null,
      "db_type": "Oracle",
      "temp_tables_in_memory_status": "unknown",
      "buffer_pool_efficiency": 99.88,
      "temp_tables_on_disk_status": "unknown",
      "buffer_pool_efficiency_status": "healthy"
    },
    {
      "status": "critical",
      "rank": 3,
      "open_tables_status": "warning",
      "host_id": 14673,
      "host_uuid": "9ebb1436-790d-410a-84f5-071f86685c91",
      "temp_tables_in_memory_per_sec": 0.7589,
      "temp_tables_on_disk_per_sec": 0.0675,
      "name": "sdxdclmysqlappd01_MYSQLSERVER",
      "open_tables": 2272,
      "db_type": "MySQL",
      "temp_tables_in_memory_status": "warning",
      "buffer_pool_efficiency": 0.59,
      "temp_tables_on_disk_status": "healthy",
      "buffer_pool_efficiency_status": "critical"
    },
    {
      "status": "unknown",
      "rank": 4,
      "open_tables_status": "unknown",
      "host_id": 14871,
      "host_uuid": "2e91b612-220a-4861-b1df-56879b0a2695",
      "temp_tables_in_memory_per_sec": 0,
      "temp_tables_on_disk_per_sec": 0,
      "name": "sdxdclpostgressrc_POSTGRES_SERVER",
      "open_tables": null,
      "db_type": "PostgreSQL",
      "temp_tables_in_memory_status": "unknown",
      "buffer_pool_efficiency": null,
      "temp_tables_on_disk_status": "unknown",
      "buffer_pool_efficiency_status": "unknown"
    }
  ]
}

export const HEALTHGROWTH_RESP = {
  "servers": [
    {
      "status": "online",
      "name": "sdxdclOracleFPPServer_oracledb"
    },
    {
      "status": "online",
      "name": "sdxdclmysqlappd01_MYSQLSERVER"
    },
    {
      "status": "unreachable",
      "name": "sdxdclpostgressrc_POSTGRES_SERVER"
    },
    {
      "status": "online",
      "name": "sdxdcwmssql_2022_MSSQLSERVER"
    }
  ],
  "replication_sync": {
    "servers": [
      {
        "lag_sec": 0,
        "name": "sdxdclOracleFPPServer_oracledb",
        "replication_status": "sync_healthy"
      },
      {
        "name": "sdxdclmysqlappd01_MYSQLSERVER",
        "replication_status": "sync_healthy"
      },
      {
        "name": "sdxdclpostgressrc_POSTGRES_SERVER",
        "replication_status": "sync_healthy"
      },
      {
        "name": "sdxdcwmssql_2022_MSSQLSERVER",
        "replication_status": "sync_healthy"
      }
    ],
    "summary": {
      "deadlocks": 0,
      "no_replication": 0,
      "errors_per_second": 0,
      "sync_healthy": 4,
      "connection_errors": 0,
      "lag_over_30s": 0
    }
  },
  "summary": {
    "inactive": 0,
    "maintenance": 0,
    "online": 3,
    "unreachable": 1,
    "degraded": 0,
    "total": 4
  }
}

export const ALERTS_RESP = {
  "critical_alerts": [
    {
      "source": "Unity",
      "uuid": "344f3580-de37-472e-bee1-719058a4a926",
      "event_count": 3,
      "severity": "Critical",
      "description": "PostgreSQL: Service is down",
      "age": "1d 2h",
      "acknowledged": false,
      "id": "1408866",
      "device_name": "sdxdclpostgressrc_POSTGRES_SERVER"
    },
    {
      "source": "Unity",
      "uuid": "06f268ab-5632-43d9-870e-de618277028b",
      "event_count": 2,
      "severity": "Critical",
      "description": "PostgreSQL: Service is down",
      "age": "7d 1h",
      "acknowledged": false,
      "id": "1345651",
      "device_name": "sdxdclpostgressrc_POSTGRES_SERVER"
    },
    {
      "source": "Unity",
      "uuid": "773ce847-880d-4aae-92aa-c19a4a79a085",
      "event_count": 1,
      "severity": "Critical",
      "description": "Oracle 'DB' TBS 'SYSTEM': Tablespace usage is too high (over 95% for 5m).",
      "age": "2d 18h",
      "acknowledged": false,
      "id": "1396779",
      "device_name": "sdxdclOracleFPPServer_oracledb"
    },
    {
      "source": "Unity",
      "uuid": "719ee4b7-39d6-40d0-bd94-fa22fdd64ff4",
      "event_count": 1,
      "severity": "Critical",
      "description": "MSSQL: Failed to fetch info data (or no data for 30m)",
      "age": "5d 8h",
      "acknowledged": false,
      "id": "1367484",
      "device_name": "sdxdcwmssql_2022_MSSQLSERVER"
    },
    {
      "source": "Unity",
      "uuid": "a27d78d6-ac04-4c5d-b1dd-79d5438aafee",
      "event_count": 1,
      "severity": "Critical",
      "description": "MSSQL: Failed to fetch info data (or no data for 30m)",
      "age": "64d 20h",
      "acknowledged": false,
      "id": "1017477",
      "device_name": "sdxdcwmssql_2022_MSSQLSERVER"
    },
    {
      "source": "Unity",
      "uuid": "9a649486-55c5-4829-beac-d81d8fb06386",
      "event_count": 1,
      "severity": "Critical",
      "description": "PostgreSQL: DB is down",
      "age": "64d 21h",
      "acknowledged": false,
      "id": "1017279",
      "device_name": "sdxdclpostgressrc_POSTGRES_SERVER"
    },
    {
      "source": "Unity",
      "uuid": "3880f120-c960-4b0b-8015-1b6fd93d2968",
      "event_count": 1,
      "severity": "Critical",
      "description": "MSSQL: Service is unavailable",
      "age": "72d 1h",
      "acknowledged": false,
      "id": "979334",
      "device_name": "sdxdclmysqlappd01_MYSQLSERVER"
    }
  ],
  "summary": {
    "open_itsm_tickets": 21,
    "critical_alerts": 7,
    "high_alerts": 10,
    "automation_total_runs": 0,
    "automation_success_pct": 0
  }
}
