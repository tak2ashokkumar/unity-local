import { DateRangeOption } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';
import {
  UnifiedAiopsDeviceTypeOption,
  UnifiedAiopsExecutiveSectionConfig,
  UnifiedAiopsFilterOption,
  UnifiedAiopsStatusLegendItem,
  UnifiedAiopsTone,
  UnifiedAiopsViewByOption
} from './unified-aiops-command-centre.type';

export const UNIFIED_AIOPS_ALL_SELECTED_VALUE = 'all';
export const UNIFIED_AIOPS_ALERT_SEVERITY_COLORS = {
  critical: '#cc0000',
  warning: '#ff8800',
  info: '#378ad8'
};

// Curated muted palette for the Event & Alert Analytics sankey nodes (source severity tiles keep the
// severity colors above; links are gradients between their two node colors).
export const UNIFIED_AIOPS_SANKEY_NODE_COLORS: { [name: string]: string } = {
  // Left chart: Source -> Events -> Alerts / Dedupe / Suppressed -> Conditions -> Ticket / No Ticket
  Events: '#b3a0d6',
  Alerts: '#8f9bb8',
  'Dedupe Events': '#86c7c0',
  'Suppressed Events': '#c5cdd6',
  Conditions: '#9aa7bd',
  'Ticket Generated': '#6fbf95',
  'No Ticket Generated': '#e2909f',
  // Right chart: Condition -> Open / Resolved -> Acknowledged / Auto Healed / Auto Remediation -> durations
  Condition: '#5fb9bf',
  Open: '#efa766',
  Resolved: '#7cbf8e',
  Acknowledged: '#e6c39a',
  'Auto Healed': '#7cbf8e',
  'Auto Remediation': '#8fcf9f',
  '5 Min': '#62c2a8',
  '30 Min': '#7badc7',
  '> 30 Min': '#df9090'
};

// Device Discovery vs Monitoring coverage bars: Monitored vs Not Monitored.
export const UNIFIED_AIOPS_DISCOVERY_COLORS = {
  monitored: '#4f93e3',
  notMonitored: '#d6dce2'
};

// Small acronym allowlist so the raw-name Title-caser keeps these upper (e.g. gpu -> GPU, os -> OS).
// Generic and shared by all three category widgets - NOT a per-category map.
export const UNIFIED_AIOPS_CATEGORY_ACRONYMS: string[] = [
  'gpu', 'cpu', 'os', 'pdu', 'url', 'urls', 'vm', 'vms', 'db', 'ip',
  'dns', 'vpn', 'ssd', 'nic', 'llm', 'vdb', 'ai', 'k8s'
];

// Status key shown in the Business Services widget header (icons reuse getStatusIcon/getToneClass).
export const UNIFIED_AIOPS_BUSINESS_SERVICE_STATUS_LEGEND: UnifiedAiopsStatusLegendItem[] = [
  { tone: 'success', label: 'Healthy / Up' },
  { tone: 'warning', label: 'Warning / Degraded' },
  { tone: 'danger', label: 'Critical / Down' },
  { tone: 'muted', label: 'No Data / Unknown' }
];

export const UNIFIED_AIOPS_EXECUTIVE_MONITORING_SUMMARY_ENDPOINT = '/customer/aiops-dashboard/executive-monitoring-summary/';
export const UNIFIED_AIOPS_DISCOVERY_VS_MONITORING_ENDPOINT = '/customer/aiops-dashboard/discovery-vs-monitoring/';
export const UNIFIED_AIOPS_ALERT_SEGREGATION_BY_TYPE_ENDPOINT = '/customer/aiops-dashboard/alert-segregation-by-type/';
export const UNIFIED_AIOPS_BUSINESS_SERVICES_ENDPOINT = '/customer/aiops-dashboard/business-services/';
export const UNIFIED_AIOPS_GEO_DISTRIBUTION_GLOBAL_OPS_ENDPOINT = '/customer/aiops-dashboard/geo-distribution-global-ops/';

// Employee / Digital Experience is a static widget that links out to the external Nexthink dashboard.
export const UNIFIED_AIOPS_EMPLOYEE_EXPERIENCE_EXTERNAL_URL = 'https://nam10.safelinks.protection.outlook.com/?url=https%3A%2F%2Fkanopy.us.nexthink.cloud%2Fdigital-experience%2Foverview&data=05%7C02%7Cakumar%40unityone.ai%7Cb44d558871ec43ece36d08dec17ad94b%7Cd5f609efb8ac4047a41f4efa1cbb5bc8%7C0%7C0%7C639160930561405792%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=xVjr9CeG4cYEUDs0MbqSAQnlf7eeqDDtnuT%2Fv3PEqp0%3D&reserved=0';
export const UNIFIED_AIOPS_PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT = '/customer/aiops-dashboard/private-cloud-infra-coverage/';
export const UNIFIED_AIOPS_PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT = '/customer/aiops-dashboard/public-cloud-infra-coverage/';
export const UNIFIED_AIOPS_DATACENTER_GEOGRAPHY_ENDPOINT = '/customer/aiops-dashboard/datacenter-geography/';
export const UNIFIED_AIOPS_APPLICATION_OVERVIEW_ENDPOINT = '/customer/aiops-dashboard/application-overview/';
export const UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT = '/customer/aiops-dashboard/services-overview/';
export const UNIFIED_AIOPS_DATABASE_MONITORING_ENDPOINT = '/customer/aiops-dashboard/database-monitoring/';
export const UNIFIED_AIOPS_OS_MONITORING_ENDPOINT = '/customer/aiops-dashboard/os-monitoring/';
export const UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT = '/customer/aiops-dashboard/infra-platform-performance/';
export const UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT = '/customer/aiops-dashboard/analytics-health-charts/';
export const UNIFIED_AIOPS_AVAILABILITY_BY_CATEGORY_ENDPOINT = '/customer/aiops-dashboard/availability-by-category/';
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

export const UNIFIED_AIOPS_ALERT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const UNIFIED_AIOPS_ALERT_DEFAULT_VIEW_BY = 'event_source';
export const UNIFIED_AIOPS_ALERT_DEFAULT_DURATION = 'last_week';

export const UNIFIED_AIOPS_ALERT_DEVICE_TYPE_OPTIONS: UnifiedAiopsDeviceTypeOption[] = [
  { type: 'Switch', key: 'switch' },
  { type: 'Firewall', key: 'firewall' },
  { type: 'Load Balancer', key: 'load_balancer' },
  { type: 'Hypervisor', key: 'hypervisor' },
  { type: 'Bare Metal Server', key: 'bms' },
  { type: 'Storage Device', key: 'storage' },
  { type: 'MAC Device', key: 'mac_device' },
  { type: 'Database Server', key: 'database' },
  { type: 'PDU', key: 'pdu' },
  { type: 'Virtual Machine', key: 'vm' }
];

export const UNIFIED_AIOPS_ALERT_VIEW_BY_OPTIONS: UnifiedAiopsViewByOption[] = [
  // { name: 'Device Type', key: 'device_type' },
  { name: 'Source', key: 'event_source' },
  // { name: 'Datacenter', key: 'datacenter' },
  // { name: 'Cloud', key: 'private_cloud' },
  { name: 'Severity', key: 'severity' }
];

// Severity Type multiselect shown when "View By" is Severity. Source Type options come from the API.
export const UNIFIED_AIOPS_ALERT_SEVERITY_TYPE_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'information', label: 'Information' }
];

export const UNIFIED_AIOPS_ALERT_DURATION_OPTIONS: DateRangeOption[] = [
  { label: 'Last 24 Hours', value: 'last_24_hours' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last Year', value: 'last_year' }
];

export const UNIFIED_AIOPS_DATACENTER_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Selected' },
  { value: 'aerys-la1-colocloud', label: 'Aerys LA1 ColoCloud' },
  { value: 'new-york-dc', label: 'New York Datacenter' },
  { value: 'san-francisco-dc', label: 'San Francisco Datacenter' }
];

// Executive Summary is a single multi-section card. Each section reads one group object from
// the executive-monitoring-summary response; metrics are either fixed (config below) or dynamic
// (iterate the group's keys). A status object metric renders value + up/down/unknown trend; a
// scalar renders a plain value (with optional suffix / threshold). `plain` forces a dark,
// trend-less count even for a status object (Idle Devices, URL Monitored).
export const UNIFIED_AIOPS_EXECUTIVE_SUMMARY_SECTIONS: UnifiedAiopsExecutiveSectionConfig[] = [
  {
    title: '',
    column: 'full',
    payloadKeys: ['summary', 'metrics', 'summary_metrics'],
    metrics: [
      { label: 'Total Discovered Resources', keys: ['total_discovered_resources', 'totalDiscoveredResources', 'total_discovered'], link: 'devices' },
      { label: 'Total Monitored Resources', keys: ['total_monitored_resources', 'totalMonitoredResources', 'total_monitored'], link: 'devices' },
      { label: 'Private Cloud Compute', keys: ['private_cloud_compute_resources', 'privateCloudComputeResources', 'private_cloud_compute'], link: 'pccloud' },
      { label: 'Public Cloud Compute', keys: ['public_cloud_compute_resources', 'publicCloudComputeResources', 'public_cloud_compute'], link: 'publicCloud' },
      { label: 'Bare Metal Servers', keys: ['baremetal_servers', 'baremetalServers', 'bare_metal_servers', 'bareMetalServers'], link: 'bmservers' },
      { label: 'Idle Devices', keys: ['idle_device_count', 'idleDeviceCount', 'idle_devices', 'idle'], plain: true, link: 'devices' }
    ]
  },
  {
    title: 'Network & Others',
    column: 'full',
    payloadKeys: ['network_and_other', 'networkAndOther', 'network_and_others', 'network'],
    metrics: [
      { label: 'Switches', keys: ['switches', 'switch'], link: 'switches' },
      { label: 'Firewalls', keys: ['firewalls', 'firewall'], link: 'firewalls' },
      { label: 'Load Balancers', keys: ['load_balancers', 'loadBalancers', 'load_balancer'], link: 'loadbalancers' },
      { label: 'PDUs', keys: ['pdus', 'pdu'] },
      { label: 'Applications', keys: ['applications', 'application'], link: 'applications' },
      { label: 'Databases', keys: ['databases', 'database'], link: 'databases' },
      { label: 'URL Monitored', keys: ['urls', 'url', 'urls_monitored', 'urlsMonitored'], plain: true, link: 'otherDevices' }
    ]
  },
  {
    title: 'Kubernetes / Container',
    column: 'full',
    payloadKeys: ['containers', 'container_summary', 'containerSummary'],
    metrics: [
      { label: 'K8s Clusters', keys: ['k8cluster', 'k8s_clusters', 'k8sClusters', 'kube_clusters', 'kubeClusters'], link: 'kubernetes' },
      { label: 'Nodes', keys: ['nodes'], link: 'kubernetes' },
      { label: 'Docker Hosts', keys: ['docker_hosts', 'dockerHosts'], link: 'kubernetes' },
      { label: 'Namespaces', keys: ['namespace_count', 'namespaceCount', 'namespaces'], link: 'kubernetes' },
      { label: 'Pods Running', keys: ['pods_running_count', 'podsRunningCount', 'pods_running', 'running_pods'], link: 'kubernetes' },
      { label: 'Pod Restarts/Hr', keys: ['pod_restarts_per_hour_count', 'podRestartsPerHourCount', 'pod_restarts_per_hour', 'pod_restarts'], link: 'kubernetes' }
    ]
  },
  {
    title: 'AI / GPU / LLM',
    column: 'full',
    payloadKeys: ['gpu_llm_ai', 'gpuLlmAi', 'observability_summary'],
    metrics: [
      { label: 'GPU Hosts', keys: ['gpu_hosts', 'gpuHosts', 'gpu_count', 'gpuCount'], link: 'gpu' },
      { label: 'GPU Utilization', keys: ['gpu_utilization_percent', 'gpuUtilizationPercent', 'gpu_utilization', 'avg_gpu_utilization'], suffix: '%', threshold: 'utilization', link: 'gpu' },
      { label: 'GPU Memory', keys: ['gpu_memory_percent', 'gpuMemoryPercent', 'gpu_memory', 'avg_gpu_memory'], suffix: '%', threshold: 'warning', link: 'gpu' },
      { label: 'Avg Thermal', keys: ['avg_thermal_llm_temp', 'avgThermalLlmTemp', 'avg_gpu_temperature', 'avg_thermal'], link: 'gpu' },
      { label: 'LLM Workloads', keys: ['llm_workloads', 'llmWorkloads', 'llm_counts'], link: 'llm' },
      { label: 'Inference Latency', keys: ['inference_latency', 'inferenceLatency', 'llm_latency'], suffix: 'ms', link: 'llm' },
      { label: 'Vector DBs', keys: ['vector_db_count', 'vectorDbCount', 'vectordb_count'], link: 'vectorDb' },
      { label: 'VDB Query Lat.', keys: ['vector_db_query_latency', 'vectorDbQueryLatency', 'vdb_query_latency', 'vector_db_latency'], suffix: 'ms', link: 'vectorDb' }
    ]
  },
  {
    title: 'SD-WAN',
    column: 'main',
    payloadKeys: ['sdwan', 'sd_wan', 'sdWan'],
    dynamic: true,
    link: 'networkControllers',
    labels: {
      cisco_sdwan_resources: 'Cisco SD-WAN',
      vmware_sdwan_resources: 'VMware SD-WAN',
      fortinet_sdwan_resources: 'Fortinet Secure SD-WAN',
      palo_alto_sdwan_resources: 'Palo Alto Networks SD-WAN'
    }
  },
  {
    title: 'Storage',
    column: 'side',
    payloadKeys: ['storage'],
    dynamic: true,
    link: 'storage',
    labels: {
      pure_storage: 'Pure',
      netapp_storage: 'NetApp'
    }
  }
];

export const UNIFIED_AIOPS_PERFORMANCE_METRIC_CONFIG: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[]; suffix?: string }> = [
  { label: 'Avg CPU', keys: ['avg_cpu', 'avgCpu', 'average_cpu', 'averageCpu', 'cpu', 'cpu_usage', 'cpuUsage'], suffix: '%' },
  { label: 'Avg Memory', tone: 'primary', keys: ['avg_memory', 'avgMemory', 'average_memory', 'averageMemory', 'memory', 'memory_usage', 'memoryUsage'], suffix: '%' },
  { label: 'Avg Bandwidth Utilization', tone: 'primary', keys: ['avg_bandwidth_utilization', 'avgBandwidthUtilization', 'average_bandwidth_utilization', 'averageBandwidthUtilization', 'bandwidth_utilization', 'bandwidthUtilization'], suffix: '%' },
  { label: 'Total Storage Capacity', tone: 'primary', keys: ['total_storage_capacity', 'totalStorageCapacity', 'storage_capacity', 'storageCapacity', 'total_storage', 'totalStorage'] }
];

export const UNIFIED_AIOPS_GEO_DISTRIBUTION_COLORS = [
  '#4a63d6',
  '#7d5fc4',
  '#f2a32a',
  '#33a06a',
  '#e8554e',
  '#23a8a0',
  '#3a9fe0',
  '#d76aa6'
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

// Public Cloud Infrastructure Coverage is rendered as three groups (Compute, Platform Services,
// Other Services); each group shows one card per public cloud provider that has data.
export const UNIFIED_AIOPS_PUBLIC_CLOUD_GROUP_ORDER = ['compute', 'platform_services', 'other_services'];

export const UNIFIED_AIOPS_PUBLIC_CLOUD_GROUP_LABELS: { [key: string]: string } = {
  compute: 'Compute',
  platform_services: 'Platform Services - (Database, Storage & Network)',
  other_services: 'Other Services'
};

export const UNIFIED_AIOPS_PUBLIC_CLOUD_PROVIDER_ORDER = ['aws', 'azure', 'gcp', 'oci'];

// Provider card header logos (already shipped under static/assets/images/external-brand/).
export const UNIFIED_AIOPS_PUBLIC_CLOUD_PROVIDER_LOGOS: { [key: string]: string } = {
  aws: 'logos/AWS.svg',
  azure: 'logos/Azure-short.svg',
  gcp: 'logos/GCP.svg',
  oci: 'logos/Oracle.svg'
};
