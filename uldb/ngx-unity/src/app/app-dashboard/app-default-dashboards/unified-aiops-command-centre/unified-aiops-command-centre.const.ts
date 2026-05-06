import { environment } from 'src/environments/environment';
import {
  UnifiedAiopsAlertRow,
  UnifiedAiopsAlertSource,
  UnifiedAiopsBusinessService,
  UnifiedAiopsCoverageCard,
  UnifiedAiopsFilterOption,
  UnifiedAiopsHeatmapGroup,
  UnifiedAiopsLegendMetric,
  UnifiedAiopsMetric,
  UnifiedAiopsRemediationMetric,
  UnifiedAiopsStackItem,
  UnifiedAiopsTableRow,
  UnifiedAiopsTicketRow,
  UnifiedAiopsTone
} from './unified-aiops-command-centre.type';

export const UNIFIED_AIOPS_ALL_SELECTED_VALUE = 'all';

export const UNIFIED_AIOPS_EXECUTIVE_MONITORING_SUMMARY_ENDPOINT = '/customer/widgets/unified-aiops/executive-monitoring-summary/';
export const UNIFIED_AIOPS_DISCOVERY_VS_MONITORING_ENDPOINT = '/customer/widgets/unified-aiops/discovery-vs-monitoring/';
export const UNIFIED_AIOPS_ALERT_SEGREGATION_BY_TYPE_ENDPOINT = '/customer/widgets/unified-aiops/alert-segregation-by-type/';
export const UNIFIED_AIOPS_BUSINESS_SERVICES_ENDPOINT = '/customer/widgets/unified-aiops/business-services/';
export const UNIFIED_AIOPS_APPLICATION_SERVICES_ALERTS_ENDPOINT = '/customer/widgets/unified-aiops/application-services-alerts/';
export const UNIFIED_AIOPS_GEO_DISTRIBUTION_GLOBAL_OPS_ENDPOINT = '/customer/widgets/unified-aiops/geo-distribution-global-ops/';
export const UNIFIED_AIOPS_PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT = '/customer/widgets/unified-aiops/private-cloud-infra-coverage/';
export const UNIFIED_AIOPS_PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT = '/customer/widgets/unified-aiops/public-cloud-infra-coverage/';
export const UNIFIED_AIOPS_DATACENTER_GEOGRAPHY_ENDPOINT = '/customer/widgets/unified-aiops/datacenter-geography/';
export const UNIFIED_AIOPS_DATACENTER_INFRA_ENDPOINT = '/customer/widgets/unified-aiops/datacenter-infra/';
export const UNIFIED_AIOPS_CONTAINER_SUMMARY_ENDPOINT = '/customer/widgets/unified-aiops/container-summary/';
export const UNIFIED_AIOPS_OBSERVABILITY_SUMMARY_ENDPOINT = '/customer/widgets/unified-aiops/observability-summary/';
export const UNIFIED_AIOPS_APPLICATION_OVERVIEW_ENDPOINT = '/customer/widgets/unified-aiops/application-overview/';
export const UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT = '/customer/widgets/unified-aiops/services-overview/';
export const UNIFIED_AIOPS_DATABASE_MONITORING_ENDPOINT = '/customer/widgets/unified-aiops/database-monitoring/';
export const UNIFIED_AIOPS_OS_MONITORING_ENDPOINT = '/customer/widgets/unified-aiops/os-monitoring/';
export const UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT = '/customer/widgets/unified-aiops/infra-platform-performance/';
export const UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT = '/customer/widgets/unified-aiops/analytics-health-charts/';
export const UNIFIED_AIOPS_ALERTS_ENDPOINT = '/customer/widgets/unified-aiops/alerts/';
export const UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT = '/customer/widgets/unified-aiops/auto-remediation-summary/';
export const UNIFIED_AIOPS_PRIVATE_CLOUD_FAST_ENDPOINT = '/customer/private_cloud_fast/';
export const UNIFIED_AIOPS_PUBLIC_CLOUD_FAST_ENDPOINT = '/customer/public_cloud_fast/';

export const UNIFIED_AIOPS_DATACENTER_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Selected' },
  { value: 'aerys-la1-colocloud', label: 'Aerys LA1 ColoCloud' },
  { value: 'new-york-dc', label: 'New York Datacenter' },
  { value: 'san-francisco-dc', label: 'San Francisco Datacenter' }
];

export const UNIFIED_AIOPS_EXECUTIVE_SUMMARY_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[] }> = [
  { label: 'Total Resources', tone: 'primary', keys: ['total_resources', 'totalResources', 'resources_total', 'resourcesTotal', 'resource_count', 'resourceCount', 'total'] },
  { label: 'Devices Up', tone: 'success', keys: ['devices_up', 'devicesUp', 'device_up', 'deviceUp', 'up'] },
  { label: 'Devices Down', tone: 'danger', keys: ['devices_down', 'devicesDown', 'device_down', 'deviceDown', 'down'] },
  { label: 'Unknown', tone: 'muted', keys: ['unknown', 'unknown_devices', 'unknownDevices'] },
  { label: 'Applications', tone: 'primary', keys: ['applications', 'application_count', 'applicationCount', 'apps'] },
  { label: 'Databases', tone: 'primary', keys: ['databases', 'database_count', 'databaseCount', 'db'] },
  { label: 'VM', tone: 'primary', keys: ['vm', 'vms', 'vm_count', 'vmCount', 'virtual_machines', 'virtualMachines'] },
  { label: 'Orphaned Devices', keys: ['orphaned_devices', 'orphanedDevices', 'orphaned'] },
  { label: 'Idle Devices', keys: ['idle_devices', 'idleDevices', 'idle'] }
];

export const UNIFIED_AIOPS_SUMMARY_METRICS: UnifiedAiopsMetric[] = [
  { label: 'Total Resources', value: '1,000', tone: 'primary' },
  { label: 'Devices Up', value: '934', tone: 'success' },
  { label: 'Devices Down', value: '28', tone: 'danger' },
  { label: 'Unknown', value: '38', tone: 'muted' },
  { label: 'Applications', value: '142', tone: 'primary' },
  { label: 'Databases', value: '86', tone: 'primary' },
  { label: 'VM', value: '480', tone: 'primary' },
  { label: 'Orphaned Devices', value: '78' },
  { label: 'Idle Devices', value: '23' }
];

export const UNIFIED_AIOPS_DISCOVERY_ITEMS: UnifiedAiopsStackItem[] = [
  { name: 'Private Cloud VMs', values: [272, 22] },
  { name: 'Public Cloud', values: [220, 6] },
  { name: 'Bare Metal', values: [0, 98] },
  { name: 'Network Devices', values: [148, 14] },
  { name: 'Applications', values: [142, 12] },
  { name: 'Databases', values: [86, 4] },
  { name: 'K8s / Containers', values: [62, 6] },
  { name: 'Other Devices', values: [38, 14] }
];

export const UNIFIED_AIOPS_ALERT_LEGEND: UnifiedAiopsLegendMetric[] = [
  { icon: 'fa-exclamation-triangle', value: '14', tone: 'danger' },
  { icon: 'fa-exclamation-circle', value: '35', tone: 'warning' },
  { icon: 'fa-info-circle', value: '59', tone: 'primary' }
];

export const UNIFIED_AIOPS_ALERT_SEGREGATION_ITEMS: UnifiedAiopsStackItem[] = [
  { name: 'Private Cloud Compute', values: [3, 6, 9] },
  { name: 'Network', values: [2, 5, 12] },
  { name: 'Storage', values: [1, 4, 7] },
  { name: 'Bare Metal', values: [2, 3, 4] },
  { name: 'Public Clouds', values: [2, 5, 8] },
  { name: 'Application', values: [1, 6, 14] },
  { name: 'URLs', values: [1, 3, 8] },
  { name: 'Databases', values: [2, 3, 6] },
  { name: 'OS', values: [1, 3, 9] },
  { name: 'Maintenance', values: [0, 1, 6] }
];

export const UNIFIED_AIOPS_BUSINESS_SERVICES: UnifiedAiopsBusinessService[] = [
  { serviceName: 'Payment Gateway', status: 'success', uptime: '99.97%', degraded: '0.03%', alerts: '3', alertTone: 'danger' },
  { serviceName: 'Core Banking API', status: 'success', uptime: '99.91%', degraded: '0.09%', alerts: '0', alertTone: 'success' },
  { serviceName: 'CRM Platform', status: 'success', uptime: '98.30%', degraded: '1.70%', alerts: '0', alertTone: 'success' },
  { serviceName: 'Data Warehouse', status: 'success', uptime: '99.85%', degraded: '0.15%', alerts: '4', alertTone: 'danger' },
  { serviceName: 'Auth/SSO', status: 'success', uptime: '96.12%', degraded: '3.88%', alerts: '0', alertTone: 'success' },
  { serviceName: 'Fraud Detection', status: 'warning', uptime: '97.88%', degraded: '2.12%', alerts: '1', alertTone: 'danger' },
  { serviceName: 'Notification', status: 'danger', uptime: '81.73%', degraded: '19.37%', alerts: '0', alertTone: 'success' }
];

export const UNIFIED_AIOPS_EMPLOYEE_METRICS: UnifiedAiopsMetric[] = [
  { label: 'Total Endpoints', value: '1,840', tone: 'primary' },
  { label: 'Applications', value: '142', tone: 'primary' },
  { label: 'Healthy', value: '1,710', tone: 'success' },
  { label: 'Warnings', value: '84', tone: 'warning' },
  { label: 'Critical', value: '46', tone: 'danger' }
];

export const UNIFIED_AIOPS_EMPLOYEE_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[] }> = [
  { label: 'Total Endpoints', tone: 'primary', keys: ['total_endpoints', 'totalEndpoints', 'endpoints', 'endpoint_count', 'total_services', 'totalServices'] },
  { label: 'Applications', tone: 'primary', keys: ['applications', 'total_applications', 'totalApplications', 'application_count', 'applicationCount'] },
  { label: 'Healthy', tone: 'success', keys: ['healthy', 'total_healthy', 'totalHealthy', 'healthy_count', 'healthyCount'] },
  { label: 'Warnings', tone: 'warning', keys: ['warnings', 'warning', 'total_warning', 'totalWarning', 'warning_count', 'warningCount'] },
  { label: 'Critical', tone: 'danger', keys: ['critical', 'total_critical', 'totalCritical', 'critical_count', 'criticalCount'] }
];

export const UNIFIED_AIOPS_DATACENTER_INFRA_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[] }> = [
  { label: 'Compute', tone: 'primary', keys: ['compute', 'bare_metal', 'bareMetal', 'bare_metal_servers'] },
  { label: 'Switches', tone: 'primary', keys: ['switch', 'switches'] },
  { label: 'Firewalls', tone: 'primary', keys: ['firewall', 'firewalls'] },
  { label: 'Load Balancer', tone: 'primary', keys: ['load_balancer', 'loadBalancer'] },
  { label: 'Storage Units', tone: 'primary', keys: ['storage', 'storage_units', 'storageUnits'] },
  { label: 'PDU/Power', tone: 'primary', keys: ['pdu_power', 'pduPower', 'power'] },
  { label: 'URLs Monitored', tone: 'primary', keys: ['urls_monitored', 'urlsMonitored', 'url'] },
  { label: 'MAC Devices', tone: 'primary', keys: ['mac_devices', 'macDevices'] }
];

export const UNIFIED_AIOPS_KUBERNETES_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[] }> = [
  { label: 'K8s Clusters', tone: 'primary', keys: ['kube_clusters', 'kubeClusters', 'k8s_clusters', 'k8sClusters'] },
  { label: 'Nodes', tone: 'primary', keys: ['nodes'] },
  { label: 'Namespaces', tone: 'primary', keys: ['namespaces'] },
  { label: 'Pods Running', tone: 'primary', keys: ['running_pods', 'runningPods', 'pods_running', 'podsRunning'] },
  { label: 'Docker Hosts', tone: 'primary', keys: ['docker_hosts', 'dockerHosts'] },
  { label: 'Pod Restarts/Hr', tone: 'primary', keys: ['pod_restarts_hr', 'podRestartsHr', 'pod_restarts', 'podRestarts'] }
];

export const UNIFIED_AIOPS_AI_GPU_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[]; suffix?: string; threshold?: 'utilization' | 'warning' }> = [
  { label: 'GPU Hosts', tone: 'primary', keys: ['gpu_count', 'gpuCount', 'gpu_hosts', 'gpuHosts'] },
  { label: 'GPU Utilization', keys: ['avg_gpu_utilization', 'avgGpuUtilization', 'gpu_utilization', 'gpuUtilization'], suffix: '%', threshold: 'utilization' },
  { label: 'GPU Memory', keys: ['avg_gpu_memory', 'avgGpuMemory', 'gpu_memory', 'gpuMemory'], suffix: '%', threshold: 'warning' },
  { label: 'Avg Thermal', tone: 'primary', keys: ['avg_gpu_temperature', 'avgGpuTemperature', 'avg_thermal', 'avgThermal'] },
  { label: 'LLM Workloads', tone: 'primary', keys: ['llm_counts', 'llmCounts', 'llm_workloads', 'llmWorkloads'] },
  { label: 'Inference Latency', tone: 'primary', keys: ['llm_latency', 'llmLatency', 'inference_latency', 'inferenceLatency'], suffix: 'ms' },
  { label: 'Vector DBs', tone: 'primary', keys: ['vectordb_count', 'vectorDbCount', 'vector_db_count', 'vectorDb'] },
  { label: 'VDB Query Lat.', tone: 'primary', keys: ['vector_db_latency', 'vectorDbLatency', 'vdb_query_latency', 'vdbQueryLatency'], suffix: 'ms' }
];

export const UNIFIED_AIOPS_GEO_HEATMAP: UnifiedAiopsHeatmapGroup[] = [
  {
    name: 'US-Central\nTexas',
    color: '#5875c8',
    labelX: 0,
    labelY: 0,
    children: [
      { name: 'DC-TX-1', value: 32, x: 0, y: 12, width: 17.33, height: 44 },
      { name: 'DC-TX-2', value: 36, x: 17.33, y: 12, width: 17.34, height: 44, usage: 'Usage: 1245 TB' },
      { name: 'DC-TX-3', value: 35, x: 34.67, y: 12, width: 17.33, height: 44 }
    ]
  },
  {
    name: 'Illinois',
    color: '#5875c8',
    labelX: 52,
    labelY: 6,
    children: [
      { name: 'DC-IL-1', value: 33, x: 52, y: 12, width: 8.5, height: 44 },
      { name: 'DC-IL-2', value: 30, x: 60.5, y: 12, width: 8.5, height: 44 }
    ]
  },
  {
    name: 'US-West\nCalifornia',
    color: '#ffca4d',
    labelX: 69,
    labelY: 0,
    children: [
      { name: 'DC-CA-1', value: 42, x: 69, y: 12, width: 15.5, height: 33 },
      { name: 'DC-CA-2', value: 38, x: 69, y: 45, width: 15.5, height: 27 },
      { name: 'DC-CA-3', value: 40, x: 84.5, y: 12, width: 15.5, height: 60 }
    ]
  },
  {
    name: 'US-East\nVirginia',
    color: '#90cc74',
    labelX: 0,
    labelY: 58,
    children: [
      { name: 'DC-VA-1', value: 34, x: 0, y: 68, width: 17.33, height: 32 },
      { name: 'DC-VA-2', value: 35, x: 17.33, y: 68, width: 17.34, height: 32 },
      { name: 'DC-VA-3', value: 31, x: 34.67, y: 68, width: 17.33, height: 32 }
    ]
  },
  {
    name: 'New York',
    color: '#8ccd72',
    labelX: 54,
    labelY: 62,
    children: [
      { name: 'DC-NY-1', value: 30, x: 52, y: 68, width: 17, height: 16 },
      { name: 'DC-NY-2', value: 29, x: 52, y: 84, width: 17, height: 16 }
    ]
  },
  {
    name: 'Oregon',
    color: '#ffc64b',
    labelX: 69,
    labelY: 74,
    children: [
      { name: 'DC-OR-1', value: 28, x: 69, y: 80, width: 15.5, height: 20 },
      { name: 'DC-OR-2', value: 25, x: 84.5, y: 80, width: 15.5, height: 20 }
    ]
  }
];

export const UNIFIED_AIOPS_PRIVATE_CLOUD_COVERAGE: UnifiedAiopsCoverageCard[] = [
  {
    title: 'VMware',
    rows: [
      { label: 'vCenter Count', value: '4' },
      { label: 'ESXi Hosts', value: '48' },
      { label: 'VMs - Windows', value: '96' },
      { label: 'VMs - Linux', value: '72' },
      { label: 'Datastores', value: '26' }
    ]
  },
  {
    title: 'Nutanix',
    rows: [
      { label: 'Prism Instances', value: '4' },
      { label: 'Clusters', value: '48' },
      { label: 'Hosts / CVMs', value: '96' },
      { label: 'VMs', value: '72' },
      { label: 'Storage Containers', value: '26' }
    ]
  },
  {
    title: 'Hyper-V',
    rows: [
      { label: 'Hyper-V Hosts', value: '4' },
      { label: 'SCVMM Instances', value: '48' },
      { label: 'Clusters', value: '96' },
      { label: 'VMs', value: '72' },
      { label: 'CSV Volumes', value: '26' }
    ]
  },
  {
    title: 'Proxmox',
    rows: [
      { label: 'Clusters', value: '4' },
      { label: 'Nodes', value: '48' },
      { label: 'VMs', value: '96' },
      { label: 'LXC Containers', value: '72' },
      { label: 'Storage Pools', value: '26' }
    ]
  },
  {
    title: 'OpenStack',
    rows: [
      { label: 'Regions / Zones', value: '4' },
      { label: 'Controllers', value: '48' },
      { label: 'Compute Nodes', value: '96' },
      { label: 'Instances', value: '72' },
      { label: 'Volumes', value: '26' }
    ]
  }
];

export const UNIFIED_AIOPS_PUBLIC_CLOUD_COVERAGE: UnifiedAiopsCoverageCard[] = [
  {
    title: 'Amazon Web Service',
    rows: [
      { label: 'Accounts', value: '4' },
      { label: 'EC2 Instances', value: '48' },
      { label: 'RDS Databases', value: '96' },
      { label: 'EBS Volumes', value: '72' },
      { label: 'VPC', value: '26' }
    ]
  },
  {
    title: 'Microsoft Azure',
    rows: [
      { label: 'Subscriptions', value: '4' },
      { label: 'Virtual Machines', value: '48' },
      { label: 'Azure SQL', value: '96' },
      { label: 'Managed Disks', value: '72' },
      { label: 'VNet', value: '26' }
    ]
  },
  {
    title: 'Google Cloud Platform',
    rows: [
      { label: 'Projects', value: '4' },
      { label: 'Compute Engine', value: '48' },
      { label: 'Cloud SQL', value: '96' },
      { label: 'Persistent Disk', value: '72' },
      { label: 'VPC', value: '26' }
    ]
  },
  {
    title: 'Oracle Cloud',
    rows: [
      { label: 'Tenancies', value: '4' },
      { label: 'Compute Instances', value: '48' },
      { label: 'DB Systems', value: '96' },
      { label: 'Block Volumes', value: '72' },
      { label: 'VCN', value: '26' }
    ]
  }
];

export const UNIFIED_AIOPS_DATACENTER_INFRASTRUCTURE: UnifiedAiopsMetric[] = [
  { label: 'Bare Metal Servers', value: '82', up: '65', down: '15', unknown: '2', tone: 'primary' },
  { label: 'Network Devices', value: '148', up: '135', down: '10', unknown: '3', tone: 'primary' },
  { label: 'Load Balancer', value: '12', up: '10', down: '2', unknown: '0', tone: 'primary' },
  { label: 'Storage Units', value: '34', up: '30', down: '4', unknown: '0', tone: 'primary' },
  { label: 'PDU/Power', value: '28', up: '27', down: '0', unknown: '1', tone: 'primary' },
  { label: 'URLs Monitored', value: '480', up: '445', down: '25', unknown: '10', tone: 'primary' },
  { label: 'MAC Devices', value: '218', up: '205', down: '10', unknown: '3', tone: 'primary' }
];

export const UNIFIED_AIOPS_KUBERNETES_METRICS: UnifiedAiopsMetric[] = [
  { label: 'K8s Clusters', value: '6', up: '6', down: '0', unknown: '0', tone: 'primary' },
  { label: 'Nodes', value: '48', up: '40', down: '4', unknown: '4', tone: 'primary' },
  { label: 'Namespaces', value: '84', tone: 'primary' },
  { label: 'Pods Running', value: '34', tone: 'primary' },
  { label: 'Docker Hosts', value: '24', up: '21', down: '2', unknown: '1', tone: 'primary' },
  { label: 'Pod Restarts/Hr', value: '64', tone: 'primary' }
];

export const UNIFIED_AIOPS_AI_GPU_METRICS: UnifiedAiopsMetric[] = [
  { label: 'GPU Hosts', value: '8', up: '6', down: '1', unknown: '1', tone: 'primary' },
  { label: 'GPU Utilization', value: '78%', tone: 'danger' },
  { label: 'GPU Memory', value: '82%', tone: 'warning' },
  { label: 'Avg Thermal', value: '42', tone: 'primary' },
  { label: 'LLM Workloads', value: '14', tone: 'primary' },
  { label: 'Inference Latency', value: '148ms', tone: 'primary' },
  { label: 'Vector DBs', value: '4', tone: 'primary' },
  { label: 'VDB Query Lat.', value: '12ms', tone: 'primary' }
];

export const UNIFIED_AIOPS_APPLICATION_ROWS: UnifiedAiopsTableRow[] = [
  { name: 'Astronomy Shop', throughput: '0.01', availability: 'N/A', responseTime: '0', status: 'success' },
  { name: 'Easy Trade', throughput: '0.13', availability: 'N/A', responseTime: '0', status: 'warning' },
  { name: 'Bank of Anthos', throughput: '0.01', availability: 'N/A', responseTime: '0', status: 'danger' },
  { name: 'Flask', throughput: '0.13', availability: 'N/A', responseTime: '0', status: 'success' },
  { name: 'Nginx', throughput: '0.01', availability: 'N/A', responseTime: '0', status: 'success' }
];

export const UNIFIED_AIOPS_SERVICE_ROWS: UnifiedAiopsTableRow[] = [
  { name: 'Shipping', throughput: '0.01', availability: 'N/A', responseTime: '0', status: 'success' },
  { name: 'Product-Catalog', throughput: '0.13', availability: 'N/A', responseTime: '0', status: 'warning' },
  { name: 'Accounting', throughput: '0.01', availability: 'N/A', responseTime: '0', status: 'danger' },
  { name: 'Recommendation', throughput: '0.13', availability: 'N/A', responseTime: '0', status: 'success' },
  { name: 'Checkout', throughput: '0.01', availability: 'N/A', responseTime: '0', status: 'success' }
];

export const UNIFIED_AIOPS_DATABASE_ROWS: UnifiedAiopsTableRow[] = [
  { name: 'Shipping', count: '12', status: 'success', queries: '8,420' },
  { name: 'Product-Catalog', count: '16', status: 'warning', queries: '6,230' },
  { name: 'Accounting', count: '20', status: 'danger', queries: '12,480' },
  { name: 'Recommendation', count: '10', status: 'success', queries: '4,830' },
  { name: 'Checkout', count: '32', status: 'success', queries: '3,840' }
];

export const UNIFIED_AIOPS_OS_ROWS: UnifiedAiopsTableRow[] = [
  { name: 'macOS', count: '12', eolDate: '22 May 2025' },
  { name: 'Linux', count: '16', eolDate: '05 May 2025' },
  { name: 'Ubuntu', count: '20', eolDate: '12 May 2025' },
  { name: 'Fedora', count: '10', eolDate: '18 May 2025' },
  { name: 'Debian', count: '32', eolDate: '15 May 2025' }
];

export const UNIFIED_AIOPS_PERFORMANCE_METRICS: UnifiedAiopsMetric[] = [
  { label: 'Avg CPU', value: '72%', tone: 'danger' },
  { label: 'Avg Memory', value: '68%', tone: 'primary' },
  { label: 'Avg Bandwidth Utilization', value: '90%', tone: 'primary' },
  { label: 'Total Storage Capacity', value: '4.8 PB', tone: 'primary' }
];

export const UNIFIED_AIOPS_ALERT_REDUCTION_METRICS: UnifiedAiopsMetric[] = [
  { label: 'Cumulative Reduction', value: '97%', tone: 'primary' },
  { label: 'Noise Reduction', value: '94%', tone: 'primary' },
  { label: 'Correlation', value: '89%', tone: 'primary' }
];

export const UNIFIED_AIOPS_ALERT_RESPONSE_METRICS: UnifiedAiopsMetric[] = [
  { label: 'MTTA', value: '6 min 51 Sec', tone: 'primary' },
  { label: 'MTTR', value: '15 min 26 Sec', tone: 'primary' }
];

export const UNIFIED_AIOPS_ALERT_SOURCES: UnifiedAiopsAlertSource[] = [
  {
    name: 'UNITYONECLOUD',
    count: 42,
    logoPath: `${environment.assetsUrl}brand/unity-logo-old.png`,
    logoWidth: 112,
    logoHeight: 28,
    color: '#00a970'
  },
  {
    name: 'LogicMonitor',
    count: 42,
    logoPath: `${environment.assetsUrl}external-brand/logos/logicmonitor 1.svg`,
    logoWidth: 126,
    logoHeight: 24,
    color: '#6245aa'
  },
  {
    name: 'OpsRamp',
    count: 32,
    logoPath: `${environment.assetsUrl}external-brand/logos/opsramp 1.svg`,
    logoWidth: 96,
    logoHeight: 42,
    color: '#2c8dde'
  },
  {
    name: 'dynatrace',
    count: 56,
    logoPath: `${environment.assetsUrl}external-brand/logos/dynatrace_logo.svg`,
    logoWidth: 118,
    logoHeight: 24,
    color: '#70c718'
  },
  {
    name: 'new relic',
    count: 45,
    logoPath: `${environment.assetsUrl}external-brand/logos/new-relic.svg`,
    logoWidth: 116,
    logoHeight: 24,
    color: '#0cb674'
  }
];

export const UNIFIED_AIOPS_CRITICAL_ALERTS: UnifiedAiopsAlertRow[] = [
  { id: '1744', deviceName: 'UL_Switch_Disk', severity: 'critical', description: 'Ethernet has changed...', source: 'Unity', acknowledged: 'Yes', duration: '34s' },
  { id: '1746', deviceName: 'UL_Switch_Test', severity: 'critical', description: 'Ethernet has changed...', source: 'Unity', acknowledged: 'No', duration: '36s' },
  { id: '2319', deviceName: 'UL_Firewall_Test', severity: 'critical', description: 'High bandwidth usage...', source: 'Unity', acknowledged: 'No', duration: '39s' },
  { id: '6644', deviceName: 'UL_Switch_AT', severity: 'high', description: 'Device has been repla...', source: 'Zabbix', acknowledged: 'Yes', duration: '01m' },
  { id: '9956', deviceName: 'UL_LoadBalancer_09', severity: 'high', description: 'System name has bee...', source: 'Nagios', acknowledged: 'No', duration: '02m 44s' },
  { id: '1470', deviceName: 'UL_Router_AT', severity: 'high', description: 'Device has been repla...', source: 'Unity', acknowledged: 'Yes', duration: '08m 56s' },
  { id: '7452', deviceName: 'UL_LoadBalancer_04', severity: 'critical', description: 'Interface Link down...', source: 'Nagios', acknowledged: 'Yes', duration: '10m 15s' },
  { id: '2354', deviceName: 'UL_Switch_BT', severity: 'high', description: 'Interface : High error...', source: 'Unity', acknowledged: 'No', duration: '20m 13s' },
  { id: '0996', deviceName: 'UL_Firewall_007', severity: 'critical', description: 'Unavailable by ICMP...', source: 'Nagios', acknowledged: 'No', duration: '01h 09m' },
  { id: '0994', deviceName: 'UL_Firewall_007', severity: 'critical', description: 'Unavailable by ICMP...', source: 'Zabbix', acknowledged: 'Yes', duration: '01h 09m' }
];

export const UNIFIED_AIOPS_TICKETS: UnifiedAiopsTicketRow[] = [
  { ticketId: 'INC1803932', shortDescription: 'AWS RDS: Failed to get events data...', state: 'Closed', priority: '3 - Moderate', createdOn: 'Apr 08, 2026, 23:53:28', updatedOn: 'Apr 10, 2026, 18:30:45', resolution: 'Closed' },
  { ticketId: 'INC1803538', shortDescription: 'AWS ELB ALB: Too many HTTP 5XX ...', state: 'Resolved', priority: '3 - Moderate', createdOn: 'Apr 07, 2026, 19:05:30', updatedOn: 'Apr 07, 2026, 19:31:27', resolution: 'Resolved' },
  { ticketId: 'INC1804591', shortDescription: 'Failed to get alarms data for amplif...', state: 'Closed', priority: '3 - Moderate', createdOn: 'Apr 10, 2026, 17:58:35', updatedOn: 'Apr 11, 2026, 18:36:56', resolution: 'Closed' },
  { ticketId: 'INC1804291', shortDescription: 'Failed to get alarms data for cmspr...', state: 'Closed', priority: '3 - Moderate', createdOn: 'Apr 09, 2026, 19:16:31', updatedOn: 'Apr 11, 2026, 18:03:02', resolution: 'Closed' },
  { ticketId: 'INC1803986', shortDescription: 'AWS S3: Failed to get metrics data ...', state: 'Closed', priority: '3 - Moderate', createdOn: 'Apr 09, 2026, 00:03:39', updatedOn: 'Apr 10, 2026, 18:31:36', resolution: 'Closed' },
  { ticketId: 'INC1804224', shortDescription: 'AWS ELB ALB: Too many HTTP 5XX ...', state: 'Resolved', priority: '3 - Moderate', createdOn: 'Apr 09, 2026, 15:34:31', updatedOn: 'Apr 09, 2026, 15:36:46', resolution: 'Resolved' },
  { ticketId: 'INC1802897', shortDescription: '1.3.6.1.4.1.9.9.187.0.1 is critical', state: 'In Progress', priority: '1 - Critical', createdOn: 'Apr 01, 2026, 5:48:07', updatedOn: 'Apr 02, 2026, 18:30:10', resolution: 'In Progress' }
];

export const UNIFIED_AIOPS_REMEDIATION_SUMMARY: UnifiedAiopsMetric[] = [
  { label: 'Successful', value: '91%', tone: 'success' },
  { label: 'Failed', value: '9%', tone: 'danger' },
  { label: 'Total runs', value: '1,842' },
  { label: 'Avg duration', value: '4.2 min' }
];

export const UNIFIED_AIOPS_REMEDIATION_METRICS: UnifiedAiopsRemediationMetric[] = [
  { label: 'Auto-Remediations', value: '48', tone: 'success' },
  { label: 'Runbook Success', value: '96.4%', tone: 'success' },
  { label: 'Avg MTTR', value: '14.2m', tone: 'success' },
  { label: 'Runbook Failures', value: '3', tone: 'danger' }
];
