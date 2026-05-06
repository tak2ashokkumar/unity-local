import {
  DatabaseDashboardAlertSummaryMetric,
  DatabaseDashboardBarItem,
  DatabaseDashboardCapacityMetric,
  DatabaseDashboardCriticalAlert,
  DatabaseDashboardDonutItem,
  DatabaseDashboardFilterOption,
  DatabaseDashboardHealthGroup,
  DatabaseDashboardMetric,
  DatabaseDashboardStorageRow,
  DatabaseDashboardTagItem,
  DatabaseDashboardUtilizationRow,
  DatabaseDashboardVersionItem
} from './database-dashboard.type';

export const DATABASE_DASHBOARD_ALL_SELECTED_VALUE = 'all';

export const DATABASE_DASHBOARD_DATABASE_OPTIONS: DatabaseDashboardFilterOption[] = [
  { value: DATABASE_DASHBOARD_ALL_SELECTED_VALUE, label: 'All Selected' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mssql', label: 'MSSQL Server' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'redis', label: 'Redis' }
];

export const DATABASE_DASHBOARD_SUMMARY_METRICS: DatabaseDashboardMetric[] = [
  { label: 'Total DB instances', value: '128', tone: 'primary' },
  { label: 'Active databases', value: '1,094' },
  { label: 'Inactive / Dormant', value: '154' },
  { label: 'Primary Instances', value: '891' }
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
  { name: 'ERP', count: '312', textColor: '#e24f5d', backgroundColor: '#fde8ea' },
  { name: 'CRM', count: '241', textColor: '#b77721', backgroundColor: '#fff0d8' },
  { name: 'Analytics', count: '198', textColor: '#2c76c4', backgroundColor: '#e8f2ff' },
  { name: 'DevOps', count: '144', textColor: '#008f68', backgroundColor: '#dff6ed' },
  { name: 'Other', count: '353', textColor: '#6f7782', backgroundColor: '#eceff2' }
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

export const DATABASE_DASHBOARD_HEALTH_GROUPS: DatabaseDashboardHealthGroup[] = [
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

export const DATABASE_DASHBOARD_ALERT_SUMMARY: DatabaseDashboardAlertSummaryMetric[] = [
  { label: 'Critical Alerts', value: '24', tone: 'danger' },
  { label: 'High Alerts', value: '67', tone: 'warning' },
  { label: 'Open ITSM Tickets', value: '14', tone: 'primary' },
  { label: 'Automation Success', value: '91%', tone: 'success' },
  { label: 'Avg MTTR', value: '3.2h', tone: 'muted' }
];

export const DATABASE_DASHBOARD_CRITICAL_ALERTS: DatabaseDashboardCriticalAlert[] = [
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
