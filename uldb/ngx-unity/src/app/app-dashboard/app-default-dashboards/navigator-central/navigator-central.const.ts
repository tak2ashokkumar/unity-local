import { DateRangeOption } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import {
  UnifiedAiopsDeviceTypeOption,
  UnifiedAiopsExecCardConfig,
  UnifiedAiopsExecGroupConfig,
  UnifiedAiopsFilterOption,
  UnifiedAiopsResourceIcon,
  UnifiedAiopsStatusLegendItem,
  UnifiedAiopsTone,
  UnifiedAiopsViewByOption
} from './navigator-central.type';

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

// Navigator Central uses its own extended executive-summary endpoint (adds by_type / by_provider /
// by_vendor sub-breakdowns, per-cloud orphaned / idle, datacenter_and_iot, routers / wireless_ap /
// services, databases.by_engine) so the original unified-aiops-command-centre response stays untouched.
export const UNIFIED_AIOPS_EXECUTIVE_MONITORING_SUMMARY_ENDPOINT = '/customer/aiops-dashboard/navigator-central-executive-summary/';
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
export const UNIFIED_AIOPS_ALERT_DEFAULT_VIEW_BY = 'source';
export const UNIFIED_AIOPS_TIME_RANGE_DEFAULT = 'last_30_days';

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
  { name: 'Source', key: 'source' },
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

// Shared Time Range options for the global filter AND the Event & Alert Analytics local filter.
// value must match a DateRangePeriod the shared custom-date-dropdown can resolve; the exact
// backend param string is mapped via UNIFIED_AIOPS_TIME_RANGE_PARAM_MAP (see getWidgetFilterParams).
export const UNIFIED_AIOPS_TIME_RANGE_OPTIONS: DateRangeOption[] = [
  { label: 'Last 24 Hours', value: 'last_24_hours' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 60 Days', value: 'last_60_days' },
  { label: 'Last 90 Days', value: 'last_90_days' }
];

// Dropdown period value -> exact backend time_range param value (only where the two differ).
export const UNIFIED_AIOPS_TIME_RANGE_PARAM_MAP: { [period: string]: string } = {
  last_24_hours: 'last_24_hrs'
};

export const UNIFIED_AIOPS_DATACENTER_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Selected' },
  { value: 'aerys-la1-colocloud', label: 'Aerys LA1 ColoCloud' },
  { value: 'new-york-dc', label: 'New York Datacenter' },
  { value: 'san-francisco-dc', label: 'San Francisco Datacenter' }
];

// Executive Summary redesign (Navigator Central). Two config groups drive the widget:
//  - UNIFIED_AIOPS_EXECUTIVE_HERO_CARDS: the top hero row (Private / Public / Bare Metal / Datacenter
//    and IoTs). Each hero card reads a status object from the executive-monitoring-summary response
//    (monitored / discovered + up / down / unknown), optional chips (Orphaned/Retired, Idle VMs), and
//    a fixed set of sub-cards pulled from a by_type / by_provider / by_vendor array on that object.
//  - UNIFIED_AIOPS_EXECUTIVE_GROUPS: the category rows (Network, Storage, SD-WAN, Database,
//    Applications, Kubernetes, AI / GPU / LLM). Each group has status cards and/or scalar tiles.
// Status object shape: { discovered, monitored, total, up, down, unknown }. All keys are matched
// case / separator-insensitively at any depth, so the API may use any of the candidate spellings.
export const UNIFIED_AIOPS_EXECUTIVE_HERO_CARDS: UnifiedAiopsExecCardConfig[] = [
  {
    key: 'private_cloud',
    label: 'Private Cloud Compute',
    iconClass: 'fa fa-cloud',
    iconColor: '#6f42c1',
    payloadKeys: ['private_cloud_compute_resources', 'privateCloudComputeResources', 'private_cloud_compute'],
    link: 'pccloud',
    chipConfigs: [
      { label: 'Orphaned/Retired', keys: ['orphaned', 'orphaned_retired', 'orphanedRetired', 'retired'] },
      { label: 'Idle VMs', keys: ['idle', 'idle_vms', 'idleVms', 'idle_device_count'] }
    ],
    subArrayKeys: ['by_type', 'byType', 'types', 'sub_types'],
    subItems: [
      { key: 'vmware', label: 'VMware VM', matchKeys: ['vmware', 'vmware_vm', 'esxi'], badgeText: 'VM', badgeClass: 'exec-badge-vmware', link: 'vmAll' },
      { key: 'nutanix', label: 'Nutanix VM', matchKeys: ['nutanix', 'nutanix_vm', 'ahv'], badgeText: 'NX', badgeClass: 'exec-badge-nutanix', link: 'vmAll' }
    ]
  },
  {
    key: 'public_cloud',
    label: 'Public Cloud Compute',
    iconClass: 'fa fa-cloud',
    iconColor: '#0d6efd',
    payloadKeys: ['public_cloud_compute_resources', 'publicCloudComputeResources', 'public_cloud_compute'],
    link: 'publicCloud',
    chipConfigs: [
      { label: 'Orphaned/Retired', keys: ['orphaned', 'orphaned_retired', 'orphanedRetired', 'retired'] },
      { label: 'Idle VMs', keys: ['idle', 'idle_vms', 'idleVms', 'idle_device_count'] }
    ],
    subArrayKeys: ['by_provider', 'byProvider', 'providers'],
    subItems: [
      { key: 'aws', label: 'AWS Instance', matchKeys: ['aws', 'amazon', 'aws_instance'], badgeText: 'AWS', badgeClass: 'exec-badge-aws', link: 'publicCloud' },
      { key: 'azure', label: 'Azure Virtual VM', matchKeys: ['azure', 'microsoft', 'azure_virtual_vm'], badgeText: 'AZ', badgeClass: 'exec-badge-azure', link: 'publicCloud' },
      { key: 'gcp', label: 'Google VM Instances', matchKeys: ['gcp', 'google', 'google_vm_instances', 'googlecloud'], badgeText: 'GC', badgeClass: 'exec-badge-gcp', link: 'publicCloud' },
      { key: 'oci', label: 'OCI', matchKeys: ['oci', 'oracle', 'oracle_cloud'], badgeText: 'OCI', badgeClass: 'exec-badge-oci', link: 'publicCloud' }
    ]
  },
  {
    key: 'bare_metal',
    label: 'Bare Metal Servers',
    iconClass: 'fa fa-server',
    iconColor: '#20638f',
    payloadKeys: ['baremetal_servers', 'baremetalServers', 'bare_metal_servers', 'bareMetalServers'],
    link: 'bmservers',
    subArrayKeys: ['by_vendor', 'byVendor', 'vendors'],
    subItems: [
      { key: 'dell', label: 'Dell', matchKeys: ['dell'], badgeText: 'DL', badgeClass: 'exec-badge-dell', link: 'bmservers' },
      { key: 'hpe', label: 'HPE', matchKeys: ['hpe', 'hp'], badgeText: 'HPE', badgeClass: 'exec-badge-hpe', link: 'bmservers' },
      { key: 'lenovo', label: 'Lenovo', matchKeys: ['lenovo'], badgeText: 'LN', badgeClass: 'exec-badge-lenovo', link: 'bmservers' },
      { key: 'supermicro', label: 'SuperMicro', matchKeys: ['supermicro', 'super_micro'], badgeText: 'SM', badgeClass: 'exec-badge-supermicro', link: 'bmservers' }
    ]
  },
  {
    key: 'datacenter_iot',
    label: 'Datacenter and IoTs',
    iconClass: 'fa fa-building-o',
    iconColor: '#8a6d1b',
    payloadKeys: ['datacenter_and_iot', 'datacenterAndIot', 'datacenter_and_iots', 'datacenter_iot'],
    link: 'datacenter',
    subArrayKeys: ['by_type', 'byType', 'types'],
    subItems: [
      { key: 'pdu', label: 'PDU', matchKeys: ['pdu', 'pdus', 'smart_pdu'], badgeText: 'PDU', badgeClass: 'exec-badge-pdu', link: 'otherDevices' },
      { key: 'temperature_sensors', label: 'Temperature Sensors', matchKeys: ['temperature_sensors', 'temperature', 'temp_sensors', 'sensor', 'sensors'], badgeText: 'TS', badgeClass: 'exec-badge-sensor', link: 'otherDevices' }
    ]
  }
];

export const UNIFIED_AIOPS_EXECUTIVE_GROUPS: UnifiedAiopsExecGroupConfig[] = [
  {
    key: 'network',
    title: 'Network',
    iconClass: 'fa fa-globe',
    iconColor: '#2d86dd',
    containerKeys: ['network_and_other', 'networkAndOther', 'network_and_others', 'network'],
    cards: [
      { key: 'routers', label: 'Routers', payloadKeys: ['routers', 'router'] },
      { key: 'switches', label: 'Switches', payloadKeys: ['switches', 'switch'], link: 'switches' },
      { key: 'firewalls', label: 'Firewalls', payloadKeys: ['firewalls', 'firewall'], link: 'firewalls' },
      { key: 'load_balancers', label: 'Load Balancers', payloadKeys: ['load_balancers', 'loadBalancers', 'load_balancer'], link: 'loadbalancers' },
      { key: 'wireless_ap', label: 'Wireless AP', payloadKeys: ['wireless_ap', 'wirelessAp', 'wireless_access_points', 'wireless'] }
    ]
  },
  {
    key: 'storage',
    title: 'Storage',
    iconClass: 'fa fa-hdd-o',
    iconColor: '#3032b4',
    containerKeys: ['storage'],
    cards: [
      { key: 'netapp', label: 'NetApp', payloadKeys: ['netapp_storage', 'netapp'], link: 'storage' },
      { key: 'pure', label: 'Pure', payloadKeys: ['pure_storage', 'pure'], link: 'storage' }
    ]
  },
  {
    key: 'sdwan',
    title: 'SD-WAN',
    iconClass: 'fa fa-random',
    iconColor: '#6f42c1',
    containerKeys: ['sdwan', 'sd_wan', 'sdWan'],
    cards: [
      { key: 'cisco_meraki', label: 'Cisco Meraki', payloadKeys: ['cisco_meraki_resources', 'cisco_meraki', 'meraki'], link: 'networkControllers' },
      { key: 'cisco_viptela', label: 'Cisco Viptela', payloadKeys: ['cisco_viptela_resources', 'cisco_viptela', 'viptela'], link: 'networkControllers' }
    ]
  },
  {
    key: 'database',
    title: 'Database',
    iconClass: 'fa fa-database',
    iconColor: '#d9822b',
    containerKeys: ['network_and_other', 'networkAndOther', 'network'],
    unit: 'Onboarded',
    cardArrayContainerKeys: ['databases', 'database'],
    cardArrayKeys: ['by_engine', 'byEngine', 'engines'],
    cardItems: [
      { key: 'mysql', label: 'MySQL', matchKeys: ['mysql'], badgeText: 'My', badgeClass: 'exec-badge-mysql', link: 'databases' },
      { key: 'sqlserver', label: 'SQL Server', matchKeys: ['sqlserver', 'mssql', 'sql_server', 'mssqlserver', 'mssql_server'], badgeText: 'SQL', badgeClass: 'exec-badge-mssql', link: 'databases' },
      { key: 'oracle', label: 'Oracle', matchKeys: ['oracle'], badgeText: 'OR', badgeClass: 'exec-badge-oracle', link: 'databases' },
      { key: 'postgresql', label: 'PostgreSQL', matchKeys: ['postgresql', 'postgres', 'postgre_sql'], badgeText: 'PG', badgeClass: 'exec-badge-postgres', link: 'databases' }
    ]
  },
  {
    key: 'applications',
    title: 'Applications',
    iconClass: 'fa fa-th-large',
    iconColor: '#2fa36b',
    containerKeys: ['network_and_other', 'networkAndOther', 'network'],
    cards: [
      { key: 'applications', label: 'Applications', payloadKeys: ['applications', 'application'], link: 'applications' },
      { key: 'services', label: 'Services', payloadKeys: ['services', 'service'], link: 'applications' },
      { key: 'urls', label: 'URL Monitored', payloadKeys: ['urls', 'url', 'urls_monitored', 'urlsMonitored'], link: 'otherDevices' }
    ]
  },
  {
    key: 'kubernetes',
    title: 'Kubernetes / Containers',
    iconClass: 'fa fa-cubes',
    iconColor: '#2d86dd',
    containerKeys: ['containers', 'container_summary', 'containerSummary'],
    cards: [
      { key: 'k8s_clusters', label: 'K8s Clusters', payloadKeys: ['k8cluster', 'k8s_clusters', 'k8sClusters', 'kube_clusters', 'kubeClusters'], link: 'kubernetes' },
      { key: 'nodes', label: 'Nodes', payloadKeys: ['nodes'], link: 'kubernetes' },
      { key: 'docker_hosts', label: 'Docker Hosts', payloadKeys: ['docker_hosts', 'dockerHosts'], link: 'kubernetes' }
    ],
    tiles: [
      { key: 'namespaces', label: 'Namespaces', keys: ['namespace_count', 'namespaceCount', 'namespaces'], link: 'kubernetes' },
      { key: 'pods_running', label: 'Pods Running', keys: ['pods_running_count', 'podsRunningCount', 'pods_running', 'running_pods'], link: 'kubernetes' },
      { key: 'pod_restarts', label: 'Pod Restarts/Hr', keys: ['pod_restarts_per_hour_count', 'podRestartsPerHourCount', 'pod_restarts_per_hour', 'pod_restarts'], link: 'kubernetes' }
    ]
  },
  {
    key: 'ai_gpu_llm',
    title: 'AI / GPU / LLM',
    iconClass: 'fa fa-microchip',
    iconColor: '#c0398b',
    containerKeys: ['gpu_llm_ai', 'gpuLlmAi', 'observability_summary'],
    cards: [
      { key: 'gpu_hosts', label: 'GPU Hosts', payloadKeys: ['gpu_hosts', 'gpuHosts'], link: 'gpu' }
    ],
    tiles: [
      { key: 'gpu_utilization', label: 'GPU Utilization', keys: ['gpu_utilization_percent', 'gpuUtilizationPercent', 'gpu_utilization', 'avg_gpu_utilization'], suffix: '%', threshold: 'utilization', link: 'gpu' },
      { key: 'gpu_memory', label: 'GPU Memory', keys: ['gpu_memory_percent', 'gpuMemoryPercent', 'gpu_memory', 'avg_gpu_memory'], suffix: '%', threshold: 'warning', link: 'gpu' },
      { key: 'avg_thermal', label: 'Avg Thermal', keys: ['avg_thermal_llm_temp', 'avgThermalLlmTemp', 'avg_gpu_temperature', 'avg_thermal'], link: 'gpu' },
      { key: 'llm_workloads', label: 'LLM Workloads', keys: ['llm_workloads', 'llmWorkloads', 'llm_counts'], link: 'llm' },
      { key: 'inference_latency', label: 'Inference Latency', keys: ['inference_latency', 'inferenceLatency', 'llm_latency'], suffix: 'ms', link: 'llm' },
      { key: 'vector_dbs', label: 'Vector DBs', keys: ['vector_db_count', 'vectorDbCount', 'vectordb_count'], link: 'vectorDb' },
      { key: 'vdb_query_latency', label: 'VDB Query Lat.', keys: ['vector_db_query_latency', 'vectorDbQueryLatency', 'vdb_query_latency', 'vector_db_latency'], suffix: 'ms', link: 'vectorDb' }
    ]
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

// Private-cloud resource-type slug (normalized: lowercased, non-alphanumerics stripped) -> Font Awesome
// glyph + color. Mirrors the private-cloud summary page's Component Summary icons (which use the shared
// FaIconMapping glyphs) so resource icons stay consistent app-wide. The private-cloud coverage API sends
// no icon, so icons are resolved client-side from the resource slug. Keys are pre-normalized (no
// underscores) and include singular + plural because the slug normalizer does not collapse them.
export const UNIFIED_AIOPS_PRIVATE_RESOURCE_ICONS: { [normalizedSlug: string]: UnifiedAiopsResourceIcon } = {
  cluster: { iconClass: FaIconMapping.CLUSTER, iconColor: '#22a6eb' },
  clusters: { iconClass: FaIconMapping.CLUSTER, iconColor: '#22a6eb' },
  vm: { iconClass: FaIconMapping.VIRTUAL_MACHINE, iconColor: '#22a6eb' },
  vms: { iconClass: FaIconMapping.VIRTUAL_MACHINE, iconColor: '#22a6eb' },
  virtualmachine: { iconClass: FaIconMapping.VIRTUAL_MACHINE, iconColor: '#22a6eb' },
  virtualmachines: { iconClass: FaIconMapping.VIRTUAL_MACHINE, iconColor: '#22a6eb' },
  hypervisor: { iconClass: FaIconMapping.HYPERVISOR, iconColor: '#f2b53f' },
  hypervisors: { iconClass: FaIconMapping.HYPERVISOR, iconColor: '#f2b53f' },
  host: { iconClass: FaIconMapping.HOST, iconColor: '#f2b53f' },
  hosts: { iconClass: FaIconMapping.HOST, iconColor: '#f2b53f' },
  baremetal: { iconClass: FaIconMapping.BARE_METAL_SERVER, iconColor: '#ff4545' },
  baremetalserver: { iconClass: FaIconMapping.BARE_METAL_SERVER, iconColor: '#ff4545' },
  switch: { iconClass: FaIconMapping.SWITCH, iconColor: '#009688' },
  switches: { iconClass: FaIconMapping.SWITCH, iconColor: '#009688' },
  distributedswitch: { iconClass: FaIconMapping.SWITCH, iconColor: '#009688' },
  distributedswitches: { iconClass: FaIconMapping.SWITCH, iconColor: '#009688' },
  portgroup: { iconClass: FaIconMapping.SWITCH, iconColor: '#009688' },
  portgroups: { iconClass: FaIconMapping.SWITCH, iconColor: '#009688' },
  network: { iconClass: FaIconMapping.NETWORKS, iconColor: '#009688' },
  networks: { iconClass: FaIconMapping.NETWORKS, iconColor: '#009688' },
  firewall: { iconClass: FaIconMapping.FIREWALL, iconColor: '#e56717' },
  firewalls: { iconClass: FaIconMapping.FIREWALL, iconColor: '#e56717' },
  loadbalancer: { iconClass: FaIconMapping.LOAD_BALANCER, iconColor: '#a66829' },
  loadbalancers: { iconClass: FaIconMapping.LOAD_BALANCER, iconColor: '#a66829' },
  storage: { iconClass: FaIconMapping.STORAGE_DEVICE, iconColor: '#3032b4' },
  storagedevice: { iconClass: FaIconMapping.STORAGE_DEVICE, iconColor: '#3032b4' },
  database: { iconClass: FaIconMapping.DATABASE, iconColor: '#3032b4' },
  databases: { iconClass: FaIconMapping.DATABASE, iconColor: '#3032b4' },
  datastore: { iconClass: FaIconMapping.DATASTORE, iconColor: '#3032b4' },
  datastores: { iconClass: FaIconMapping.DATASTORE, iconColor: '#3032b4' },
  mac: { iconClass: FaIconMapping.MAC_MINI, iconColor: '#6c757d' },
  macmini: { iconClass: FaIconMapping.MAC_MINI, iconColor: '#6c757d' }
};

// Neutral glyph for resource slugs not in the map above.
export const UNIFIED_AIOPS_PRIVATE_RESOURCE_ICON_FALLBACK: UnifiedAiopsResourceIcon = {
  iconClass: FaIconMapping.OTHER_DEVICES,
  iconColor: '#6c757d'
};

// Private Cloud Geo Distribution - a map widget cloned from Datacenter Geographies, markers colored by
// platform (VMware / Nutanix) and sized by total resources at the site.
export const UNIFIED_AIOPS_PRIVATE_CLOUD_GEO_DISTRIBUTION_ENDPOINT = '/customer/aiops-dashboard/private-cloud-geo-distribution/';

export const UNIFIED_AIOPS_PRIVATE_CLOUD_GEO_PLATFORM_COLORS: { [platformKey: string]: string } = {
  vmware: '#2f6bdf',
  nutanix: '#7b5cd6'
};

export const UNIFIED_AIOPS_PRIVATE_CLOUD_GEO_PLATFORM_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'Select All' },
  { value: 'vmware', label: 'VMware' },
  { value: 'nutanix', label: 'Nutanix' }
];

// Newly Provisioned VMs - a paginated table widget. The request carries the global top filters
// (dc_uuids / cloud_uuids / time_range) plus these widget-local filters and page / page_size.
export const UNIFIED_AIOPS_NEWLY_PROVISIONED_VMS_ENDPOINT = '/customer/aiops-dashboard/newly-provisioned-vms/';

export const UNIFIED_AIOPS_NEW_VM_CLOUD_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Clouds' },
  { value: 'AWS', label: 'AWS' },
  { value: 'Azure', label: 'Azure' },
  { value: 'GCP', label: 'GCP' },
  { value: 'OCI', label: 'OCI' }
];

export const UNIFIED_AIOPS_NEW_VM_STATUS_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Statuses' },
  { value: 'Running', label: 'Running' },
  { value: 'Provisioning', label: 'Provisioning' },
  { value: 'Stopped', label: 'Stopped' }
];

export const UNIFIED_AIOPS_NEW_VM_STATE_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All States' },
  { value: 'Up', label: 'Up' },
  { value: 'Down', label: 'Down' },
  { value: 'Unknown', label: 'Unknown' }
];

export const UNIFIED_AIOPS_NEW_VM_LIFECYCLE_STAGE_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Stages' },
  { value: 'Deployed', label: 'Deployed' },
  { value: 'In Use', label: 'In Use' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'End of Life', label: 'End of Life' },
  { value: 'Retired', label: 'Retired' }
];

export const UNIFIED_AIOPS_NEW_VM_LIFECYCLE_STATUS_OPTIONS: UnifiedAiopsFilterOption[] = [
  { value: UNIFIED_AIOPS_ALL_SELECTED_VALUE, label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Under Maintenance', label: 'Under Maintenance' },
  { value: 'Retired', label: 'Retired' },
  { value: 'Decommissioned', label: 'Decommissioned' }
];
