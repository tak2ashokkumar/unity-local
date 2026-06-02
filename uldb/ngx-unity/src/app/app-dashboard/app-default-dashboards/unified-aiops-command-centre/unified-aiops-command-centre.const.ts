import {
  UnifiedAiopsFilterOption,
  UnifiedAiopsTone
} from './unified-aiops-command-centre.type';

export const UNIFIED_AIOPS_ALL_SELECTED_VALUE = 'all';
export const UNIFIED_AIOPS_ALERT_SEVERITY_COLORS = {
  critical: '#cc0000',
  warning: '#ff8800',
  info: '#378ad8'
};

export const UNIFIED_AIOPS_EXECUTIVE_MONITORING_SUMMARY_ENDPOINT = '/customer/aiops-dashboard/executive-monitoring-summary/';
export const UNIFIED_AIOPS_DISCOVERY_VS_MONITORING_ENDPOINT = '/customer/aiops-dashboard/discovery-vs-monitoring/';
export const UNIFIED_AIOPS_ALERT_SEGREGATION_BY_TYPE_ENDPOINT = '/customer/aiops-dashboard/alert-segregation-by-type/';
export const UNIFIED_AIOPS_BUSINESS_SERVICES_ENDPOINT = '/customer/aiops-dashboard/business-services/';
export const UNIFIED_AIOPS_APPLICATION_SERVICES_ALERTS_ENDPOINT = '/customer/aiops-dashboard/application-services-alerts/';
export const UNIFIED_AIOPS_GEO_DISTRIBUTION_GLOBAL_OPS_ENDPOINT = '/customer/aiops-dashboard/geo-distribution-global-ops/';
export const UNIFIED_AIOPS_PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT = '/customer/aiops-dashboard/private-cloud-infra-coverage/';
export const UNIFIED_AIOPS_PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT = '/customer/aiops-dashboard/public-cloud-infra-coverage/';
export const UNIFIED_AIOPS_DATACENTER_GEOGRAPHY_ENDPOINT = '/customer/aiops-dashboard/datacenter-geography/';
export const UNIFIED_AIOPS_DATACENTER_INFRA_ENDPOINT = '/customer/aiops-dashboard/datacenter-infra/';
export const UNIFIED_AIOPS_CONTAINER_SUMMARY_ENDPOINT = '/customer/aiops-dashboard/container-summary/';
export const UNIFIED_AIOPS_OBSERVABILITY_SUMMARY_ENDPOINT = '/customer/aiops-dashboard/observability-summary/';
export const UNIFIED_AIOPS_APPLICATION_OVERVIEW_ENDPOINT = '/customer/aiops-dashboard/application-overview/';
export const UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT = '/customer/aiops-dashboard/services-overview/';
export const UNIFIED_AIOPS_DATABASE_MONITORING_ENDPOINT = '/customer/aiops-dashboard/database-monitoring/';
export const UNIFIED_AIOPS_OS_MONITORING_ENDPOINT = '/customer/aiops-dashboard/os-monitoring/';
export const UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT = '/customer/aiops-dashboard/infra-platform-performance/';
export const UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT = '/customer/aiops-dashboard/analytics-health-charts/';
export const UNIFIED_AIOPS_ALERTS_ENDPOINT = '/customer/aiops-dashboard/alerts/';
export const UNIFIED_AIOPS_PARENT_APPLICATIONS_ENDPOINT = '/apm/monitoring/parent_app_list/';
export const UNIFIED_AIOPS_ORPHANED_DEVICES_ENDPOINT = '/customer/aiops-dashboard/orphaned-devices/';
export const UNIFIED_AIOPS_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT = '/customer/aiops-dashboard/orphaned-devices-summary/';
export const UNIFIED_AIOPS_IDLE_DEVICES_ENDPOINT = '/customer/aiops-dashboard/idle-device-analysis/';
export const UNIFIED_AIOPS_IDLE_DEVICES_BY_DURATION_ENDPOINT = '/customer/aiops-dashboard/idle-duration-distribution/';
export const UNIFIED_AIOPS_RECENT_ALERTS_ENDPOINT = '/customer/aiops-dashboard/recent-alerts/';
export const UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT = '/customer/aiops-dashboard/auto-remediation-summary/';
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

export const UNIFIED_AIOPS_EMPLOYEE_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[] }> = [
  { label: 'Total Endpoints', tone: 'primary', keys: ['total_endpoints', 'totalEndpoints', 'endpoints', 'endpoint_count', 'total_services', 'totalServices'] },
  { label: 'Applications', tone: 'primary', keys: ['applications', 'total_applications', 'totalApplications', 'application_count', 'applicationCount'] },
  { label: 'Healthy', tone: 'success', keys: ['healthy', 'total_healthy', 'totalHealthy', 'healthy_count', 'healthyCount'] },
  { label: 'Warnings', tone: 'warning', keys: ['warnings', 'warning', 'total_warning', 'totalWarning', 'warning_count', 'warningCount'] },
  { label: 'Critical', tone: 'danger', keys: ['critical', 'total_critical', 'totalCritical', 'critical_count', 'criticalCount'] }
];

export const UNIFIED_AIOPS_DATACENTER_INFRA_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[]; aggregateKeys?: string[] }> = [
  { label: 'Bare Metal Servers', tone: 'primary', keys: ['bare_metal_servers', 'bareMetalServers', 'bare_metal', 'bareMetal', 'compute'] },
  { label: 'Network Devices', tone: 'primary', keys: ['network_devices', 'networkDevices', 'network'], aggregateKeys: ['switch', 'switches', 'firewall', 'firewalls'] },
  { label: 'Load Balancer', tone: 'primary', keys: ['load_balancer', 'loadBalancer'] },
  { label: 'Storage Units', tone: 'primary', keys: ['storage_units', 'storageUnits', 'storage'] },
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

export const UNIFIED_AIOPS_PERFORMANCE_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[]; suffix?: string }> = [
  { label: 'Avg CPU', keys: ['avg_cpu', 'avgCpu', 'average_cpu', 'averageCpu', 'cpu', 'cpu_usage', 'cpuUsage'], suffix: '%' },
  { label: 'Avg Memory', tone: 'primary', keys: ['avg_memory', 'avgMemory', 'average_memory', 'averageMemory', 'memory', 'memory_usage', 'memoryUsage'], suffix: '%' },
  { label: 'Avg Bandwidth Utilization', tone: 'primary', keys: ['avg_bandwidth_utilization', 'avgBandwidthUtilization', 'average_bandwidth_utilization', 'averageBandwidthUtilization', 'bandwidth_utilization', 'bandwidthUtilization'], suffix: '%' },
  { label: 'Total Storage Capacity', tone: 'primary', keys: ['total_storage_capacity', 'totalStorageCapacity', 'storage_capacity', 'storageCapacity', 'total_storage', 'totalStorage'] }
];

export const UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS = [
  '#6b7ff5',
  '#6ccf91',
  '#ffb04b',
  '#16c7d9',
  '#8b7cf6',
  '#f06a6a',
  '#46a3f3',
  '#9aa6b2'
];

export const UNIFIED_AIOPS_IDLE_DURATION_COLORS = [
  '#13bd77',
  '#ff8a00',
  '#d63b3b',
  '#ff9aa2'
];
