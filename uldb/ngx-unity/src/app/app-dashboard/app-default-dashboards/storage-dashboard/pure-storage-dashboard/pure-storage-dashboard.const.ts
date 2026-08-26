import {
  PureStorageActiveClusterGraphResponse,
  PureStorageActiveClusterTableResponse,
  PureStorageAlertsGraphResponse,
  PureStorageAlertsTableResponse,
  PureStorageArraysGraphResponse,
  PureStorageArraysTableResponse,
  PureStorageAutoRemediationSummaryResponse,
  PureStorageCapacityPlanningGraphResponse,
  PureStorageCapacityPlanningTableResponse,
  PureStorageExecutiveSummaryResponse,
  PureStorageGraphWidgetDefinition,
  PureStorageHardwareGraphResponse,
  PureStorageHardwareTableResponse,
  PureStorageHostGroupsGraphResponse,
  PureStorageHostGroupsTableResponse,
  PureStorageHostsGraphResponse,
  PureStorageHostsTableResponse,
  PureStoragePerformanceGraphResponse,
  PureStoragePerformanceTableResponse,
  PureStorageProtectionGroupSnapshotsGraphResponse,
  PureStorageProtectionGroupSnapshotsTableResponse,
  PureStorageProtectionReplicationGraphResponse,
  PureStorageProtectionReplicationTableResponse,
  PureStorageTableColumn,
  PureStorageTone,
  PureStorageVolumeGroupsGraphResponse,
  PureStorageVolumeGroupsTableResponse,
  PureStorageVolumesGraphResponse,
  PureStorageVolumesTableResponse,
  PureStorageVolumeSnapshotsGraphResponse,
  PureStorageVolumeSnapshotsTableResponse
} from './pure-storage-dashboard.type';

const PURE_STORAGE_BASE_ENDPOINT = '/customer/storage/pure-storage-dashboard/';

export const PURE_STORAGE_TONE_CLASS: Record<PureStorageTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-muted'
};

export const PURE_STORAGE_EXECUTIVE_SUMMARY_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}executive-summary/`;
export const PURE_STORAGE_AUTO_REMEDIATION_SUMMARY_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}auto-remediation/summary/`;
export const PURE_STORAGE_ARRAYS_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}arrays/graph/`;
export const PURE_STORAGE_ARRAYS_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}arrays/table/`;
export const PURE_STORAGE_HOSTS_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}hosts/graph/`;
export const PURE_STORAGE_HOSTS_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}hosts/table/`;
export const PURE_STORAGE_HOST_GROUPS_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}host-groups/graph/`;
export const PURE_STORAGE_HOST_GROUPS_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}host-groups/table/`;
export const PURE_STORAGE_VOLUMES_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}volumes/graph/`;
export const PURE_STORAGE_VOLUMES_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}volumes/table/`;
export const PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}volume-snapshots/graph/`;
export const PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}volume-snapshots/table/`;
export const PURE_STORAGE_VOLUME_GROUPS_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}volume-groups/graph/`;
export const PURE_STORAGE_VOLUME_GROUPS_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}volume-groups/table/`;
export const PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}protection-replication/graph/`;
export const PURE_STORAGE_PROTECTION_REPLICATION_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}protection-replication/table/`;
export const PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}protection-group-snapshots/graph/`;
export const PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}protection-group-snapshots/table/`;
export const PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}active-cluster/graph/`;
export const PURE_STORAGE_ACTIVE_CLUSTER_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}active-cluster/table/`;
export const PURE_STORAGE_PERFORMANCE_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}performance/graph/`;
export const PURE_STORAGE_PERFORMANCE_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}performance/table/`;
export const PURE_STORAGE_CAPACITY_PLANNING_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}capacity-planning/graph/`;
export const PURE_STORAGE_CAPACITY_PLANNING_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}capacity-planning/table/`;
export const PURE_STORAGE_HARDWARE_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}hardware/graph/`;
export const PURE_STORAGE_HARDWARE_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}hardware/table/`;
export const PURE_STORAGE_ALERTS_GRAPH_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}alerts/graph/`;
export const PURE_STORAGE_ALERTS_TABLE_ENDPOINT = `${PURE_STORAGE_BASE_ENDPOINT}alerts/table/`;

export const PURE_STORAGE_ARRAYS_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Total Capacity (TB)', sortKey: 'total_capacity_tb', format: 'number' },
  { label: 'Used Capacity (TB)', sortKey: 'used_capacity_tb', format: 'number' },
  { label: 'Free Capacity (TB)', sortKey: 'free_capacity_tb', format: 'number' },
  { label: 'Utilization %', sortKey: 'utilization_percentage', format: 'percent' },
  { label: 'Data Reduction Ratio', sortKey: 'data_reduction_ratio', format: 'ratio' },
  { label: 'Thin Provisioning', sortKey: 'thin_provisioning_percentage', format: 'percent' },
  { label: 'Read IOPS', sortKey: 'read_iops', format: 'number' },
  { label: 'Write IOPS', sortKey: 'write_iops', format: 'number' },
  { label: 'Read Latency (ms)', sortKey: 'read_latency_ms', format: 'number' },
  { label: 'Write Latency (ms)', sortKey: 'write_latency_ms', format: 'number' },
  { label: 'Combined Bandwidth (MB/s)', sortKey: 'combined_bandwidth_mbps', format: 'number' }
];

export const PURE_STORAGE_HOSTS_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Host Name', sortKey: 'host_name' },
  { label: 'Size (GB)', sortKey: 'size_gb', format: 'number' },
  { label: 'Data Reduction', sortKey: 'data_reduction_ratio', format: 'ratio' },
  { label: 'Volume (GB)', sortKey: 'volume_gb', format: 'number' },
  { label: 'Snapshots (GB)', sortKey: 'snapshots_gb', format: 'number' },
  { label: 'Shared (GB)', sortKey: 'shared_gb', format: 'number' },
  { label: 'System (GB)', sortKey: 'system_gb', format: 'number' },
  { label: 'Total (GB)', sortKey: 'total_gb', format: 'number' },
  { label: 'Connected Volumes', sortKey: 'connected_volumes', format: 'list' },
  { label: 'Protection Groups', sortKey: 'protection_groups', format: 'list' }
];

export const PURE_STORAGE_HOST_GROUPS_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Host Group Name', sortKey: 'host_group_name' },
  { label: 'Size (GB)', sortKey: 'size_gb', format: 'number' },
  { label: 'Hosts', sortKey: 'host_count', format: 'number' },
  { label: 'Data Reduction', sortKey: 'data_reduction_ratio', format: 'ratio' },
  { label: 'Volume (GB)', sortKey: 'volume_gb', format: 'number' },
  { label: 'Snapshots (GB)', sortKey: 'snapshots_gb', format: 'number' },
  { label: 'Shared (GB)', sortKey: 'shared_gb', format: 'number' },
  { label: 'System (GB)', sortKey: 'system_gb', format: 'number' },
  { label: 'Total (GB)', sortKey: 'total_gb', format: 'number' }
];

export const PURE_STORAGE_VOLUMES_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Volume Name', sortKey: 'volume_name' },
  { label: 'Serial Number', sortKey: 'serial_number' },
  { label: 'Provisioned Size (GB)', sortKey: 'provisioned_size_gb', format: 'number' },
  { label: 'Used Capacity (GB)', sortKey: 'used_capacity_gb', format: 'number' },
  { label: 'Data Reduction', sortKey: 'data_reduction_ratio', format: 'ratio' },
  { label: 'Thin Provisioning', sortKey: 'thin_provisioning_percentage', format: 'percent' },
  { label: 'Read IOPS', sortKey: 'read_iops', format: 'number' },
  { label: 'Write IOPS', sortKey: 'write_iops', format: 'number' },
  { label: 'Read Latency (ms)', sortKey: 'read_latency_ms', format: 'number' },
  { label: 'Write Latency (ms)', sortKey: 'write_latency_ms', format: 'number' },
  { label: 'SAN Latency (ms)', sortKey: 'san_latency_ms', format: 'number' }
];

export const PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Snapshot Name', sortKey: 'snapshot_name' },
  { label: 'Serial Number', sortKey: 'serial_number' },
  { label: 'Parent Volume', sortKey: 'parent_volume' },
  { label: 'Snapshot Size (GB)', sortKey: 'snapshot_size_gb', format: 'number' },
  { label: 'Snapshot Time', sortKey: 'snapshot_time', format: 'datetime' }
];

export const PURE_STORAGE_VOLUME_GROUPS_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Volume Group Name', sortKey: 'volume_group_name' },
  { label: 'Size (GB)', sortKey: 'size_gb', format: 'number' },
  { label: 'Volumes', sortKey: 'volumes', format: 'number' },
  { label: 'Snapshots', sortKey: 'snapshots', format: 'number' },
  { label: 'Data Reduction', sortKey: 'data_reduction_ratio', format: 'ratio' },
  { label: 'Protection Group', sortKey: 'protection_group' }
];

export const PURE_STORAGE_PROTECTION_REPLICATION_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Session/Group Name', sortKey: 'session_group_name' },
  { label: 'Type', sortKey: 'type' },
  { label: 'Source Array', sortKey: 'source_array' },
  { label: 'Target Array', sortKey: 'target_array' },
  { label: 'Status', sortKey: 'status' },
  { label: 'Direction', sortKey: 'direction' },
  { label: 'Snapshot Count', sortKey: 'snapshot_count', format: 'number' },
  { label: 'Last Sync Time', sortKey: 'last_sync_time', format: 'datetime' }
];

export const PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Protection Group Name', sortKey: 'protection_group_name' },
  { label: 'Connected Volumes', sortKey: 'connected_volumes', format: 'number' },
  { label: 'Connected Hosts', sortKey: 'connected_hosts', format: 'number' },
  { label: 'Connected Host Groups', sortKey: 'connected_host_groups', format: 'number' },
  { label: 'Connected Snapshots', sortKey: 'connected_snapshots', format: 'number' },
  { label: 'Snapshot Schedule', sortKey: 'snapshot_schedule' },
  { label: 'Snapshot Retention', sortKey: 'snapshot_retention_days', format: 'number' },
  { label: 'Replication Enabled', sortKey: 'replication_enabled', format: 'boolean' },
  { label: 'Replication Frequency', sortKey: 'replication_frequency' },
  { label: 'Target Retention', sortKey: 'target_retention_days', format: 'number' }
];

export const PURE_STORAGE_ACTIVE_CLUSTER_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'POD Name', sortKey: 'pod_name' },
  { label: 'Array Name', sortKey: 'array_name' },
  { label: 'Status', sortKey: 'status' },
  { label: 'Mediator Connected', sortKey: 'mediator_connected', format: 'boolean' },
  { label: 'Health Score', sortKey: 'health_score', format: 'number' },
  { label: 'Days In Status', sortKey: 'days_in_status', format: 'number' }
];

export const PURE_STORAGE_PERFORMANCE_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Resource Name', sortKey: 'resource_name' },
  { label: 'Resource Type', sortKey: 'resource_type' },
  { label: 'Read IOPS (K)', sortKey: 'read_iops_k', format: 'number' },
  { label: 'Write IOPS (K)', sortKey: 'write_iops_k', format: 'number' },
  { label: 'Total IOPS (K)', sortKey: 'total_iops_k', format: 'number' },
  { label: 'Throughput (MB/s)', sortKey: 'throughput_mbps', format: 'number' },
  { label: 'Read Latency (ms)', sortKey: 'read_latency_ms', format: 'number' },
  { label: 'Write Latency (ms)', sortKey: 'write_latency_ms', format: 'number' },
  { label: 'SAN Latency (ms)', sortKey: 'san_latency_ms', format: 'number' }
];

export const PURE_STORAGE_CAPACITY_PLANNING_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Array Name', sortKey: 'array_name' },
  { label: 'Total Capacity (TB)', sortKey: 'total_capacity_tb', format: 'number' },
  { label: 'Current Used Capacity (TB)', sortKey: 'current_used_capacity_tb', format: 'number' },
  { label: 'Current Free Capacity (TB)', sortKey: 'current_free_capacity_tb', format: 'number' },
  { label: 'Utilization %', sortKey: 'utilization_percentage', format: 'percent' },
  { label: 'Data Reduction', sortKey: 'data_reduction_ratio', format: 'ratio' },
  { label: 'Growth Rate %', sortKey: 'growth_rate_percentage', format: 'percent' },
  { label: 'Growth Rate (TB/Month)', sortKey: 'growth_rate_tb_per_month', format: 'number' },
  { label: 'Thin Provisioning Savings (TB)', sortKey: 'thin_provisioning_savings_tb', format: 'number' },
  { label: 'Days Until Full', sortKey: 'days_until_full', format: 'number' },
  { label: '30-Day Forecast (TB)', sortKey: 'forecast_30_days_tb', format: 'number' },
  { label: '60-Day Forecast (TB)', sortKey: 'forecast_60_days_tb', format: 'number' },
  { label: '90-Day Forecast (TB)', sortKey: 'forecast_90_days_tb', format: 'number' },
  { label: 'Estimated Full Date', sortKey: 'estimated_full_date', format: 'date' }
];

export const PURE_STORAGE_HARDWARE_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Component Name', sortKey: 'component_name' },
  { label: 'Component Type', sortKey: 'component_type' },
  { label: 'Manufacturer', sortKey: 'manufacturer' },
  { label: 'Model', sortKey: 'model' },
  { label: 'OS Version', sortKey: 'os_version' },
  { label: 'Management IP', sortKey: 'management_ip' },
  { label: 'CPU Cores', sortKey: 'cpu_cores', format: 'number' },
  { label: 'Memory (GB)', sortKey: 'memory_gb', format: 'number' },
  { label: 'Disk Space (TB)', sortKey: 'disk_space_tb', format: 'number' },
  { label: 'Ports Count', sortKey: 'ports_count', format: 'number' },
  { label: 'Health Status', sortKey: 'health_status' }
];

export const PURE_STORAGE_ALERTS_TABLE_COLUMNS: PureStorageTableColumn[] = [
  { label: 'Alert ID', sortKey: 'alert_id' },
  { label: 'Array HostName', sortKey: 'array_hostname' },
  { label: 'Resource Name', sortKey: 'resource_name' },
  { label: 'Alert Name', sortKey: 'alert_name' },
  { label: 'Count', sortKey: 'count', format: 'number' },
  { label: 'Category', sortKey: 'category' },
  { label: 'Severity', sortKey: 'severity' },
  { label: 'Status', sortKey: 'status' },
  { label: 'Event Metric', sortKey: 'event_metric' },
  { label: 'Message', sortKey: 'message' },
  { label: 'Source', sortKey: 'source' },
  { label: 'Created At', sortKey: 'created_at', format: 'datetime' },
  { label: 'Updated At', sortKey: 'updated_at', format: 'datetime' }
];

export const PURE_STORAGE_ARRAYS_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  {
    key: 'array_capacity',
    title: 'Array Capacity, Shared Space & Used Space',
    chart_type: 'bar',
    tooltip: 'Capacity, Shared Space, and Used Space are displayed for the top 10 array with the highest Used % utilization.'
  },
  {
    key: 'array_iops',
    title: 'Read & Write IOPS (array)',
    chart_type: 'grouped_bar',
    tooltip: 'Displays the top 10 arrays with the highest aggregate Read & Write IOPS.'
  },
  {
    key: 'array_latency',
    title: 'Read & Write Latency (array)',
    chart_type: 'grouped_bar',
    tooltip: 'Displays the top 10 arrays with the highest aggregate Read & Write Latency.'
  },
  {
    key: 'san_latency',
    title: 'SAN Read & Write Latency',
    chart_type: 'grouped_bar',
    tooltip: 'Displays the top 10 arrays with the highest aggregate SAN Read & Write Latency.'
  },
  {
    key: 'data_reduction_thin_provisioning',
    title: 'Data Reduction Ratio & Thin Provisioning',
    chart_type: 'bar_line',
    tooltip: 'Displays arrays with a Data Reduction Ratio of 5:1 or higher (filtered), along with their Thin Provisioning Ratio.'
  },
  {
    key: 'combined_bandwidth',
    title: 'Combined Bandwidth by Array',
    chart_type: 'treemap',
    tooltip: 'Displays the top 10 arrays with the highest Bandwidth Utilization.'
  }
];

export const PURE_STORAGE_HOSTS_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'volumes_mapped_per_host', title: 'Top 10- Total Volumes Mapped per Host', chart_type: 'bar' },
  { key: 'host_group_by_size', title: 'Top 10 Host Group by Size', chart_type: 'grouped_bar' },
  { key: 'top_storage_consumers', title: 'Top 10 Storage Consumers', chart_type: 'treemap' },
  {
    key: 'volume_snapshot_analysis',
    title: 'Top 10 Volume vs Snapshot Analysis',
    chart_type: 'bubble',
    tooltip: 'Displays the top 10 arrays ranked by total capacity (Volume + Snapshot), comparing Volume and Snapshot capacity.'
  },
  {
    key: 'host_performance_comparison',
    title: 'Top 10 Host Performance Comparison',
    chart_type: 'heatmap',
    tooltip: 'Displays the top 10 hosts ranked by Total Capacity (GB), comparing Size, Volume, Snapshots, Shared, System, and Total capacity. Darker shades indicate higher values.'
  },
  {
    key: 'host_metrics_heatmap',
    title: 'Top 10 Host Metrics Heatmap',
    chart_type: 'heatmap',
    tooltip: 'Displays the top 10 hosts across key storage metrics (Size, Volume, Snapshots, Shared, System, and Total Capacity) to compare utilization patterns and identify trends.'
  },
  {
    key: 'host_storage_composition',
    title: 'Top 10 Storage Composition',
    chart_type: 'radar',
    tooltip: 'Displays the storage composition of the top 10 hosts, comparing Volume, Snapshots, Shared, and System capacity across each host.'
  },
  {
    key: 'host_resource_profile',
    title: 'Top 10 Host Resource Profile',
    chart_type: 'sankey',
    tooltip: 'Displays how storage capacity is distributed across the top 10 hosts, showing the contribution of Volume, Snapshots, Shared, and System storage for each host.'
  }
];

export const PURE_STORAGE_HOST_GROUPS_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  {
    key: 'host_group_capacity',
    title: 'Total Capacity by Host Group',
    chart_type: 'bar',
    tooltip: 'Top 10 host groups are selected by ranking all host groups based on total storage capacity (GB). This chart displays the capacity distribution across the highest-capacity host groups.'
  },
  {
    key: 'host_group_storage_utilization',
    title: 'Top 10 Host Groups by Storage Utilization',
    chart_type: 'bar',
    tooltip: 'Top 10 host groups are selected by ranking all host groups based on total storage capacity (GB). This chart compares the storage utilization (%) of the selected host groups.'
  },
  {
    key: 'storage_composition',
    title: 'Host Group Storage Composition',
    chart_type: 'stacked_bar',
    tooltip: 'Top 10 host groups are selected by ranking all host groups based on total storage capacity (GB). This chart shows the Volume, Snapshots, Shared, and System capacity composition for each selected host group.'
  },
  {
    key: 'host_group_capacity_data_reduction',
    title: 'Host Group Capacity vs Data Reduction',
    chart_type: 'bubble',
    tooltip: 'Top 10 host groups are selected by ranking all host groups based on total storage capacity (GB). This chart compares capacity distribution against Data Reduction Ratio for the selected host groups.'
  },
  {
    key: 'host_group_performance_profile',
    title: 'Host Group Performance Profile',
    chart_type: 'radar',
    tooltip: 'Top 10 host groups are selected by ranking all host groups based on total storage capacity (GB). This chart compares storage component distribution (Volume, Snapshots, Shared, and System) across the selected host groups.'
  },
  {
    key: 'host_group_metrics_heatmap',
    title: 'Host Group Metrics Heatmap',
    chart_type: 'heatmap',
    tooltip: 'Top 10 host groups are selected by ranking all host groups based on total storage capacity (GB). This heatmap compares key storage metrics across the selected host groups, with darker shades indicating higher values.'
  },
  {
    key: 'host_group_multi_metric_comparison',
    title: 'Host Group Multi-Metric Comparison',
    chart_type: 'sunburst',
    tooltip: 'Top 10 host groups are selected by ranking all host groups based on total storage capacity (GB). This chart compares capacity, Data Reduction Ratio, storage components, and host count across the selected host groups.'
  }
];

export const PURE_STORAGE_VOLUMES_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  {
    key: 'volume_iops',
    title: 'Read & Write IOPS per Volume',
    chart_type: 'grouped_bar',
    span: 3,
    tooltip: 'Top 10 volumes are selected based on highest aggregate Read & Write IOPS. The chart compares Read and Write IOPS across the selected volumes.'
  },
  {
    key: 'volume_throughput',
    title: 'Read & Write Throughput per Volume',
    chart_type: 'grouped_bar',
    span: 3,
    tooltip: 'Top 10 volumes are selected based on highest aggregate Read & Write Throughput. The chart compares Read and Write throughput across the selected volumes.'
  },
  {
    key: 'snapshot_size_per_volume',
    title: 'Snapshot Size per Volume',
    chart_type: 'polar_area',
    span: 3,
    tooltip: 'Top 10 volumes are selected based on highest snapshot capacity usage. The chart displays snapshot size distribution across the selected volumes.'
  },
  {
    key: 'thin_provisioning_per_volume',
    title: 'Thin Provisioning per Volume',
    chart_type: 'doughnut',
    span: 3,
    tooltip: 'Top 10 volumes are selected based on highest Thin Provisioning ratio. The chart compares provisioning efficiency across the selected volumes.'
  },
  {
    key: 'data_reduction_per_volume',
    title: 'Data Reduction per Volume',
    chart_type: 'polar_area',
    span: 6,
    tooltip: 'Top 10 volumes are selected based on highest Data Reduction Ratio. The chart compares storage efficiency across the selected volumes.'
  },
  {
    key: 'total_data_reduction_per_volume',
    title: 'Total Data Reduction per Volume',
    chart_type: 'bar',
    span: 6,
    tooltip: 'Top 10 volumes are selected based on highest total data reduction achieved. The chart compares overall storage efficiency across the selected volumes.'
  }
];

export const PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  {
    key: 'snapshot_size',
    title: 'Top 10 Volume Snapshots by Size',
    chart_type: 'bar',
    tooltip: 'Displays the 10 snapshots with the largest physical size (GB), ranked in descending order.'
  },
  {
    key: 'snapshot_capacity_rank',
    title: 'Top 10 Volume Snapshots by Capacity',
    chart_type: 'lollipop',
    tooltip: 'Displays the 10 snapshots consuming the highest capacity, ranked from highest to lowest.'
  },
  {
    key: 'snapshot_composition',
    title: 'Volume Snapshot Composition',
    chart_type: 'stacked_bar',
    tooltip: 'Shows the data and metadata composition for the 10 snapshots with the highest capacity.'
  },
  {
    key: 'snapshot_capacity_data_reduction',
    title: 'Snapshot Capacity vs Data Reduction',
    chart_type: 'bubble',
    tooltip: 'Compares the 10 snapshots with the highest capacity against their data reduction ratio.'
  },
  {
    key: 'snapshot_performance_profile',
    title: 'Volume Snapshot Performance Profile',
    chart_type: 'radar',
    tooltip: 'Compares key performance metrics for the 10 snapshots with the highest capacity.'
  },
  {
    key: 'snapshot_metrics_heatmap',
    title: 'Volume Snapshot Metrics Heatmap',
    chart_type: 'heatmap',
    tooltip: 'Visualizes key metrics for the 10 snapshots with the highest capacity. Darker shades indicate higher metric values.'
  },
  {
    key: 'snapshot_comparison_matrix',
    title: 'Volume Snapshot Comparison Matrix',
    chart_type: 'sunburst',
    tooltip: 'Compares multiple attributes of the 10 snapshots with the highest capacity across all dimensions.'
  }
];

export const PURE_STORAGE_VOLUME_GROUPS_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'volume_group_size', title: 'Top 10 Volume Groups by Size', chart_type: 'bar' },
  { key: 'storage_distribution', title: 'Volume Group Storage Distribution', chart_type: 'polar_area' },
  { key: 'snapshot_density', title: 'Volume Group Snapshot Density', chart_type: 'funnel' },
  { key: 'capacity_flow', title: 'Volume Group Capacity Flow', chart_type: 'sankey' }
];

export const PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'protection_groups', title: 'Protection Groups', chart_type: 'bar' },
  { key: 'replication_status', title: 'Replication Sessions', chart_type: 'doughnut' },
  { key: 'snapshot_count', title: 'Active Snapshots count', chart_type: 'polar_area' },
  { key: 'snapshot_size_per_volume', title: 'Snapshot Size (per volume)', chart_type: 'horizontal_bar' }
];

export const PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'connected_snapshots', title: 'Connected Snapshots by Protection Group', chart_type: 'bar' },
  { key: 'snapshot_count', title: 'Top 10 Protection Groups by Snapshot Count', chart_type: 'lollipop' },
  { key: 'schedule_distribution', title: 'Protection Schedule Distribution', chart_type: 'scatter' },
  { key: 'retention_analysis', title: 'Snapshot Retention Analysis', chart_type: 'stacked_bar' },
  { key: 'protection_group_profile', title: 'Protection Group Profile', chart_type: 'radar' },
  { key: 'protection_coverage_heatmap', title: 'Protection Coverage Heatmap', chart_type: 'heatmap' },
  { key: 'protection_dependency_flow', title: 'Protection Dependency Flow', chart_type: 'sankey' }
];

export const PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'pod_status_distribution', title: 'POD Status Breakdown', chart_type: 'doughnut' },
  { key: 'pod_health', title: 'Top 10 POD Health Status', chart_type: 'lollipop' },
  { key: 'pod_status_scatter', title: 'POD Status Distribution', chart_type: 'scatter' },
  { key: 'pod_connectivity_overview', title: 'POD Connectivity Overview', chart_type: 'sankey' },
  { key: 'pod_status_comparison', title: 'POD Status Comparison', chart_type: 'radar' },
  { key: 'pod_health_heatmap', title: 'POD Health Heatmap', chart_type: 'heatmap' },
  { key: 'pod_synchronization_matrix', title: 'POD Synchronization Matrix', chart_type: 'parallel_coordinates' }
];

export const PURE_STORAGE_PERFORMANCE_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'volume_level_iops', title: 'Volume-level IOPS (Top 5 Volumes)', chart_type: 'bar' },
  { key: 'host_level_iops', title: 'Host-level IOPS (Top 5 Hosts)', chart_type: 'bar' }
];

export const PURE_STORAGE_CAPACITY_PLANNING_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'capacity_forecast', title: 'Capacity Forecast (30/60/90 Days)', chart_type: 'line' },
  { key: 'volume_utilization_distribution', title: 'Volume Utilization Distribution', chart_type: 'bar' },
  { key: 'monthly_growth', title: 'Monthly Growth Chart (Last 6 Months)', chart_type: 'bar' }
];

export const PURE_STORAGE_HARDWARE_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'cpu_cores', title: 'CPU Cores', chart_type: 'bar' },
  { key: 'memory', title: 'Total Physical Memory', chart_type: 'bar' },
  { key: 'disk_space', title: 'Total Disk Space', chart_type: 'bar' },
  { key: 'ports', title: 'Total Network Ports', chart_type: 'bar' },
  { key: 'manufacturer', title: 'Manufacturer', chart_type: 'doughnut' },
  { key: 'os_version', title: 'OS Version', chart_type: 'doughnut' },
  { key: 'model', title: 'Model', chart_type: 'doughnut' }
];

export const PURE_STORAGE_ALERTS_GRAPH_WIDGETS: PureStorageGraphWidgetDefinition[] = [
  { key: 'severity_distribution', title: 'Alert Severity Distribution', chart_type: 'doughnut' },
  { key: 'alert_trend', title: 'Alert Timeline (Count)', chart_type: 'stacked_bar' }
];

export const PURE_STORAGE_EXECUTIVE_SUMMARY_API_DUMMY = {
  "status": true,
  "data": {
    "total_data_reduction_ratio": 38.92,
    "data_reduction_ratio": 4.83,
    "total_arrays": 4,
    "total_protection_groups": 13,
    "total_volumes": 656,
    "space_savings_percentage": 79.31,
    "availability_percentage": 0,
    "effective_capacity": {
      "unit": "TB",
      "value": 22.11
    },
    "active_alerts": 0,
    "free_capacity": {
      "unit": "TB",
      "value": 10.95
    },
    "total_hosts": 166,
    "availability_trend": {
      "down": 0,
      "unknown": 4,
      "up": 0
    },
    "total_host_groups": 3,
    "used_capacity": {
      "unit": "TB",
      "value": 0.57
    },
    "total_raw_capacity": {
      "unit": "TB",
      "value": 11.52
    },
    "space_savings": {
      "unit": "TB",
      "value": 0.08
    }
  },
  "message": "Executive summary fetched successfully",
  "last_updated": "2026-07-27T02:43:17.894295-07:00"
} as PureStorageExecutiveSummaryResponse;

export const PURE_STORAGE_AUTO_REMEDIATION_SUMMARY_API_DUMMY = {
  "status": true,
  "summary": {
    "average_mttr_minutes": 0,
    "runbook_failures": 0,
    "auto_remediations": 0,
    "runbook_success": 0
  }
} as PureStorageAutoRemediationSummaryResponse;

export const PURE_STORAGE_ARRAYS_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [11.52, 11.52, 0, 0],
          "name": "Total Capacity",
          "unit": "TB"
        },
        {
          "data": [0.57, 0.7, 0, 0],
          "name": "Used Capacity",
          "unit": "TB"
        },
        {
          "data": [0.08, 0.06, 0, 0],
          "name": "Shared Space",
          "unit": "TB"
        }
      ],
      "categories": [
        "SDxX20R3-FA1",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDX Lab - Pure Storage Flash Array"
      ],
      "chart_type": "bar",
      "key": "array_capacity",
      "title": "Array Capacity, Shared Space & Used Space"
    },
    {
      "series": [
        {
          "data": [1.9, 0.02, 7.93, 0],
          "name": "Read IOPS",
          "unit": "K"
        },
        {
          "data": [0.63, 0.1, 1.07, 0],
          "name": "Write IOPS",
          "unit": "K"
        }
      ],
      "categories": [
        "SDxX20R3-FA1",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDX Lab - Pure Storage Flash Array"
      ],
      "chart_type": "grouped_bar",
      "key": "array_iops",
      "title": "Read & Write IOPS"
    },
    {
      "series": [
        {
          "data": [0.2327, 0.0876, 0.1483, 0],
          "name": "Read Latency",
          "unit": "ms"
        },
        {
          "data": [0.1838, 0.176, 0.193, 0],
          "name": "Write Latency",
          "unit": "ms"
        }
      ],
      "categories": [
        "SDxX20R3-FA1",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDX Lab - Pure Storage Flash Array"
      ],
      "chart_type": "grouped_bar",
      "key": "array_latency",
      "title": "Read & Write Latency"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 0],
          "name": "SAN Read Latency",
          "unit": "ms"
        },
        {
          "data": [0, 0, 0, 0],
          "name": "SAN Write Latency",
          "unit": "ms"
        }
      ],
      "categories": [
        "SDxX20R3-FA1",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDX Lab - Pure Storage Flash Array"
      ],
      "chart_type": "grouped_bar",
      "key": "san_latency",
      "title": "SAN Read & Write Latency"
    },
    {
      "series": [
        {
          "data": [38.92, 17.98, 0, 0],
          "name": "Data Reduction Ratio",
          "unit": "ratio"
        },
        {
          "data": [0.83, 0.86, 0, 0],
          "name": "Thin Provisioning",
          "unit": "%"
        }
      ],
      "categories": [
        "SDxX20R3-FA1",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDX Lab - Pure Storage Flash Array"
      ],
      "chart_type": "bar_line",
      "key": "data_reduction_thin_provisioning",
      "title": "Data Reduction Ratio & Thin Provisioning"
    },
    {
      "data": [
        {
          "unit": "MB/s",
          "name": "SDxX20R3-FA1",
          "value": 0
        },
        {
          "unit": "MB/s",
          "name": "SDX Lab Pure Storage - 27 IP",
          "value": 0
        },
        {
          "unit": "MB/s",
          "name": "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
          "value": 0
        },
        {
          "unit": "MB/s",
          "name": "SDX Lab - Pure Storage Flash Array",
          "value": 0
        }
      ],
      "chart_type": "treemap",
      "key": "combined_bandwidth",
      "title": "Combined Bandwidth by Array"
    }
  ],
  "message": "Array graph data fetched successfully",
  "summary": {
    "total_arrays": 4,
    "used_capacity_pb": 0,
    "total_capacity_pb": 0.02,
    "total_iops": 11644.65,
    "average_read_latency_ms": 0.1171,
    "average_write_latency_ms": 0.1382
  }
} as PureStorageArraysGraphResponse;

export const PURE_STORAGE_HOSTS_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [51, 44, 22, 20, 7, 7, 4, 3, 3, 3],
          "name": "Mapped Volumes"
        }
      ],
      "categories": [
        "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
        "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
        "Winjumphost137",
        "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
        "linuxhost8511",
        "ESXi17640",
        "linuxhost8814",
        "winhost7737",
        "winhost8518",
        "winhost8519"
      ],
      "chart_type": "bar",
      "key": "volumes_mapped_per_host",
      "title": "Top 10 Total Volumes Mapped per Host"
    },
    {
      "data": [
        {
          "unit": "GB",
          "name": "ESXi65222",
          "value": 158.38
        },
        {
          "unit": "GB",
          "name": "ESXi65171",
          "value": 158.38
        },
        {
          "unit": "GB",
          "name": "ESXi17640",
          "value": 116.33
        },
        {
          "unit": "GB",
          "name": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "value": 26.47
        },
        {
          "unit": "GB",
          "name": "ESXi-66-60",
          "value": 4.25
        },
        {
          "unit": "GB",
          "name": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "value": 2.69
        },
        {
          "unit": "GB",
          "name": "Winjumphost137",
          "value": 2.28
        },
        {
          "unit": "GB",
          "name": "sdxdcloraclevmrac",
          "value": 2.24
        },
        {
          "unit": "GB",
          "name": "sdxdcloraclevmrac02",
          "value": 2.24
        },
        {
          "unit": "GB",
          "name": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "value": 2.2
        }
      ],
      "chart_type": "treemap",
      "key": "top_storage_consumers",
      "title": "Top 10 Storage Consumers"
    },
    {
      "series": [
        {
          "data": [158.38, 158.38, 116.33, 26.47, 2.34, 2.69, 2.28, 2.24, 2.24, 2.2],
          "name": "Volume",
          "unit": "GB"
        },
        {
          "data": [0, 0, 0, 0, 1.92, 0, 0, 0, 0, 0],
          "name": "Snapshots",
          "unit": "GB"
        },
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Shared",
          "unit": "GB"
        },
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "System",
          "unit": "GB"
        }
      ],
      "categories": [
        "ESXi65222",
        "ESXi65171",
        "ESXi17640",
        "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
        "ESXi-66-60",
        "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
        "Winjumphost137",
        "sdxdcloraclevmrac",
        "sdxdcloraclevmrac02",
        "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27"
      ],
      "chart_type": "stacked_bar",
      "key": "host_storage_composition",
      "title": "Top 10 Storage Composition"
    },
    {
      "series": [
        {
          "data": [2, 2, 2],
          "name": "Hosts Count",
          "unit": "count"
        },
        {
          "data": [100, 80, 0],
          "name": "Size",
          "unit": "GB"
        },
        {
          "data": [2.4, 2.9, 1],
          "name": "Data Reduction Ratio",
          "unit": "ratio"
        }
      ],
      "categories": [
        "Pacemaker-cluster",
        "sdxdcloraclevmrac-HG",
        "Cisco-M4-Infra-80-150"
      ],
      "chart_type": "grouped_bar",
      "key": "host_group_by_size",
      "title": "Top 10 Host Group by Size"
    },
    {
      "title": "Top 10 Volume vs Snapshot Analysis",
      "x_axis": {
        "name": "Volume",
        "unit": "GB"
      },
      "chart_type": "bubble",
      "key": "volume_snapshot_analysis",
      "y_axis": {
        "name": "Snapshots",
        "unit": "GB"
      },
      "data": [
        {
          "y": 0,
          "x": 158.38,
          "name": "ESXi65222",
          "value": 158.38
        },
        {
          "y": 0,
          "x": 158.38,
          "name": "ESXi65171",
          "value": 158.38
        },
        {
          "y": 0,
          "x": 116.33,
          "name": "ESXi17640",
          "value": 116.33
        },
        {
          "y": 0,
          "x": 26.47,
          "name": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "value": 26.47
        },
        {
          "y": 1.92,
          "x": 2.34,
          "name": "ESXi-66-60",
          "value": 4.25
        },
        {
          "y": 0,
          "x": 2.69,
          "name": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "value": 2.69
        },
        {
          "y": 0,
          "x": 2.28,
          "name": "Winjumphost137",
          "value": 2.28
        },
        {
          "y": 0,
          "x": 2.24,
          "name": "sdxdcloraclevmrac",
          "value": 2.24
        },
        {
          "y": 0,
          "x": 2.24,
          "name": "sdxdcloraclevmrac02",
          "value": 2.24
        },
        {
          "y": 0,
          "x": 2.2,
          "name": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "value": 2.2
        }
      ]
    },
    {
      "title": "Top 10 Host Performance Comparison",
      "y_categories": [
        "ESXi65222",
        "ESXi65171",
        "ESXi17640",
        "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
        "ESXi-66-60",
        "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
        "Winjumphost137",
        "sdxdcloraclevmrac",
        "sdxdcloraclevmrac02",
        "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27"
      ],
      "x_categories": [
        "Mapped Volumes",
        "Data Reduction",
        "Total Capacity (GB)"
      ],
      "chart_type": "heatmap",
      "key": "host_performance_comparison",
      "data": [
        [2, 4.83, 158.38],
        [2, 4.83, 158.38],
        [7, 4.83, 116.33],
        [44, 4.83, 26.47],
        [1, 4.83, 4.25],
        [51, 4.83, 2.69],
        [22, 4.83, 2.28],
        [0, 4.83, 2.24],
        [0, 4.83, 2.24],
        [20, 4.83, 2.2]
      ]
    },
    {
      "title": "Top 10 Host Metrics Heatmap",
      "y_categories": [
        "ESXi65222",
        "ESXi65171",
        "ESXi17640",
        "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
        "ESXi-66-60",
        "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
        "Winjumphost137",
        "sdxdcloraclevmrac",
        "sdxdcloraclevmrac02",
        "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27"
      ],
      "x_categories": [
        "Size (GB)",
        "Volume (GB)",
        "Snapshots (GB)",
        "Shared (GB)",
        "System (GB)",
        "Total (GB)"
      ],
      "chart_type": "heatmap",
      "key": "host_metrics_heatmap",
      "data": [
        [1300.48, 158.38, 0, 0, 0, 158.38],
        [1300.48, 158.38, 0, 0, 0, 158.38],
        [2109.44, 116.33, 0, 0, 0, 116.33],
        [1208.32, 26.47, 0, 0, 0, 26.47],
        [100, 2.34, 1.92, 0, 0, 4.25],
        [513.5, 2.69, 0, 0, 0, 2.69],
        [1607.68, 2.28, 0, 0, 0, 2.28],
        [80, 2.24, 0, 0, 0, 2.24],
        [80, 2.24, 0, 0, 0, 2.24],
        [600.01, 2.2, 0, 0, 0, 2.2]
      ]
    },
    {
      "nodes": [
        {
          "type": "host",
          "name": "ESXi65222"
        },
        {
          "type": "volume",
          "name": "ESXi65222_vol01"
        },
        {
          "type": "volume",
          "name": "ESXi65222_vol02"
        },
        {
          "type": "host",
          "name": "ESXi65171"
        },
        {
          "type": "host",
          "name": "ESXi17640"
        },
        {
          "type": "volume",
          "name": "ESXi17640_agent_test"
        },
        {
          "type": "volume",
          "name": "ESXi17640_vol01"
        },
        {
          "type": "volume",
          "name": "testvol0504"
        },
        {
          "type": "volume",
          "name": "testvol0508"
        },
        {
          "type": "volume",
          "name": "testvol0512"
        },
        {
          "type": "volume",
          "name": "testvol0533"
        },
        {
          "type": "volume",
          "name": "testvol0535"
        },
        {
          "type": "host",
          "name": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-039d0d7f-32ce-4693-bb95-be9bbe26d96f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-08016889-ae88-4170-be7d-f4bdf9e8eb08"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-0c31d6cd-e1e6-4a1a-9d75-a0a660977722"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-11c06840-52c9-43e1-80e2-8cc1b6e799ab"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-12fda961-6da2-4a41-8df4-b7561788905b"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-1a39b157-4d67-404d-af6b-75882710d06b"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-2aba3edc-d549-48e8-a9d2-bebe1fbeb326"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-2c098fff-095c-45a0-859c-60bb5f1c0361"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-2c36c60a-3635-4e4b-a4a2-ddeba16cea29"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-2fe2198f-0d36-4efe-9b79-17d53e10a388"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-3d3bffa6-ca4b-455d-b277-6305539f4d6e"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-40c944cb-6b61-4229-a665-736752497a3c"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-41f468d1-f69f-4e1b-a21f-7c46890c495d"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-591cc7f1-b3f6-454a-9e91-12d2bdf354d2"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-5a3ea67a-9518-422c-a35f-723bc934befe"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-5bdf101f-26af-4874-8796-24fbd9d8ed2f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-5ed7c0c0-438a-4f6e-a62a-d50e140a5851"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-6100f5f8-8ba3-4926-8310-0044c3dcb37f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-62488f23-cc4a-4b1c-a3c0-ce3fbd795914"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-6b4b9e03-ec34-494c-8e5f-7064b2c012a0"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-7114a722-7466-4256-83e7-62e83d150e07"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-778023d3-7ab5-4d59-9e25-a803a979b34e"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-7fc8e86e-9592-43ad-b9e3-073412d9a77f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-87caf982-af91-4475-ac16-326c8b81e5a3"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-8f309cee-391d-4c79-bea0-10e364e59319"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-8fd7aa67-aa4a-428c-9ae7-20fbf546f241"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-937c3432-b624-414e-876a-9faa076452d4"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-a72cdc59-0dda-4583-b7e5-76c30dfb13df"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-a892ccd5-c675-40a3-b54c-14d1f92dd9de"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-a89ad424-12a2-4478-90ce-0a3d79f96fca"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-aac21af2-7b3d-4fb8-aecc-dc44fa41c09c"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-be9dabe9-ef8f-453a-8c08-1148bbd9fb4b"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-bf8a8500-5042-4f29-bafd-4d72db501d7e"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-c0cdf3db-6c65-4c1d-aa5c-d02a7fa08f1f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-c47dbdf6-7a9c-4926-a1d1-6de7ffce3b95"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-cdd3e44d-3897-4ff0-bfa6-6bcdb688c13f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-d96fcfce-da05-4c71-94e2-50a27190d5f7"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-dc7bf290-64ee-4cf2-af48-0f5ecd3389c3"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-e0c63fb5-0ec0-4a95-b1ae-a894d25429a9"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-e81a51e9-2123-46ac-be9d-2df414bfa87c"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-f0c99985-37f1-4277-99d0-901ad021e460"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-f5a18567-538b-4c32-ad52-e2c1c939d143"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-f762d4a9-6826-4d31-9138-23d59b4398f0"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-fce07872-dd7e-4282-8258-51a32adaca25"
        },
        {
          "type": "host",
          "name": "ESXi-66-60"
        },
        {
          "type": "volume",
          "name": "ESXi-66-60-Vol01"
        },
        {
          "type": "host",
          "name": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-08df5232-8efa-41b4-9482-7fb4c0c3cec4"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-0997c271-a552-41d1-bac3-97835c07a864"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-113a4291-7759-4cca-ba23-a91478ec9f58"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-1f304fd9-5d3a-47fa-b9ff-31761c9b6044"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-2449c0ee-5678-497f-9914-611b1a5e3f59"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-26c9b2e8-371c-4b55-854b-54510a705ae2"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-2f155cbb-02a3-43ef-bdd9-23f4756a3be7"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-2f1f0351-079d-43d1-8ff9-210493171055"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-309b2b62-d341-40a3-9c09-598b0ea41277"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-33c6909f-25af-4fe5-b0dc-a75d4010bc66"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-3457e893-127a-459a-8284-6e69fdb9babe"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-3ce7f7b0-a83f-4c21-b094-dc32a32cd092"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-40f6c420-43d1-4e35-959a-caadfc85f95f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-410ea014-b486-4457-9a29-964ed23721e5"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-4b10b349-c700-47d3-875a-2375b1139ffa"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-52e1e8f8-db00-4183-afb9-51a4ca1ee4de"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-5aa44e77-b2bc-4e9a-9937-82d24d0c4dd4"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-5c66388f-b673-4154-9943-cb89001f10e6"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-5dbea0a6-ec78-4df5-a3bb-a18837824c27"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-64b50f96-07eb-4f6a-aa73-74e2f83218e4"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-66d3f907-7ab8-41be-9d24-23143cc3fdab"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-71ec7e8b-7c43-4206-849c-e88055506112"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-7e8e84b4-f555-46fc-bf3e-f0111cd145a4"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-7ff2cff0-b324-4a71-84b7-64e17eb624bc"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-850726cf-702d-466b-8c0b-36b06bda13d8"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-867f9ae6-01cf-4b08-851a-70ffb63124e7"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-87377ca7-99a6-47ae-87ca-7d613dc59464"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-87c40397-8eee-4357-b269-5b5c5fe4caf8"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-9242e2c5-ed5a-419a-b246-539e76ca6ccc"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-94523907-ec68-4fe4-9cb7-a52c2810c580"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-a5b593f1-89bd-4990-8d8c-127fd7bbb6d1"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-a8d568a8-674c-4875-8518-049f589084e2"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-ab7c9faf-3619-4f0f-8d94-43efb427b87f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-af1545bd-ecfc-483f-b71c-338bf7422e92"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-b30c5c60-f1e9-4db6-b64e-c3ec5f7dcfb4"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-b4dde5a9-b89c-4a12-bdc7-c354e298d996"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-b58c7700-09fb-4429-8764-cd855951e7da"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-b5c08c77-d1ec-4c61-886c-c445ba35cb72"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-bd71f95a-aade-4592-b482-1d048c8eb3db"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-c7f8b652-892a-4699-95b2-3bb8a546e4bd"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-ca289411-f323-47c4-abcf-4189011ec33a"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-d2e21205-111c-4368-a0ff-478b44eef24b"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-d5dc3bda-88e2-4769-89ed-4146d7fb0636"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-d95d0262-15bf-40dc-98df-dd76240bd46b"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-dbef89aa-1290-42b8-8b1c-ac5818540f36"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-dbf5eb7f-5a1a-41ca-beef-96ec6ab8352f"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-e32a1b45-2ff0-4875-ba34-ad4405109f94"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-e66f0983-56b7-43fb-a573-6dae9bfc6568"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-ea739e57-d180-4282-b105-0f138a8327e6"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-f3fbdc51-d806-453b-9b55-6c05df0501f2"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-faa9b43d-836b-4f78-9fa7-1c1c400786ef"
        },
        {
          "type": "host",
          "name": "Winjumphost137"
        },
        {
          "type": "volume",
          "name": "Kubernetes-92-164-worker1-vol01"
        },
        {
          "type": "volume",
          "name": "Kubernetes-92-164-worker2-vol01"
        },
        {
          "type": "volume",
          "name": "Kubernetes-92-164-worker3"
        },
        {
          "type": "volume",
          "name": "Linux9257_vol01"
        },
        {
          "type": "volume",
          "name": "Linux9257_vol02"
        },
        {
          "type": "volume",
          "name": "Testvolmig_v01"
        },
        {
          "type": "volume",
          "name": "Winhost65-30-vol02"
        },
        {
          "type": "volume",
          "name": "Winjumphost137_V01"
        },
        {
          "type": "volume",
          "name": "Winjumphost137_VeeamBkp"
        },
        {
          "type": "volume",
          "name": "Winjumphost137_vol8585"
        },
        {
          "type": "volume",
          "name": "linuxhost8814_vol01"
        },
        {
          "type": "volume",
          "name": "linuxhost8814_vol02"
        },
        {
          "type": "volume",
          "name": "linuxhost8814_vol03"
        },
        {
          "type": "volume",
          "name": "linuxhost8814_vol04"
        },
        {
          "type": "volume",
          "name": "sdxdclocpinfas2w1-vol01"
        },
        {
          "type": "volume",
          "name": "sdxdclocpinfas2w2-vol01"
        },
        {
          "type": "volume",
          "name": "sdxdclocpinfas2w3-vol01"
        },
        {
          "type": "volume",
          "name": "vol-2d2fee9b-test-vol-0000-wjxgw"
        },
        {
          "type": "volume",
          "name": "vol-a563b6b2-SQL-data-Vol-0000-gjbbv"
        },
        {
          "type": "volume",
          "name": "vol-c976947c-OracleRAC-Redo-V0-0000-w5c68"
        },
        {
          "type": "volume",
          "name": "winhost65-30-vol01"
        },
        {
          "type": "volume",
          "name": "yogesh-linux-vol"
        },
        {
          "type": "host",
          "name": "sdxdcloraclevmrac"
        },
        {
          "type": "host",
          "name": "sdxdcloraclevmrac02"
        },
        {
          "type": "host",
          "name": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-000d20ea-fab4-4ae0-8eb8-3a4fcbd2da4d"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-0d948f95-4194-40ce-9a4a-ead388b3ea7b"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-23a75299-8f4c-4e2b-8d80-af7632ce245a"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-3119e85e-b1b4-443e-aea0-55546e916004"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-5621bf03-da5b-4b8d-890a-2f8cd605e7e8"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-5622617a-f560-4364-94ca-7c5da19c42b3"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-60750a45-a846-4f53-a773-f4d92b246760"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-6cddcd1c-16a2-4c7a-a06d-e42cd1b05e66"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-6fc67e34-a296-4082-b690-559038825989"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-7df27a25-11e0-4d28-9c9e-bcc2fe2ceec4"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-8f943603-0987-435f-9550-eed350cfaeda"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-9abc0ca8-4463-4dc2-a72e-3a3ecc9b8e44"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-acc38a46-9bfe-4fda-826b-e1cf7927edff"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-ad600ac6-bd8f-4361-bdec-132ef6d56490"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-af4c84d1-b5c9-483c-8d44-94bfcb00bbf8"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-c80707b1-9e43-4639-aecd-d8d862e04e22"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-cfeb1f6f-566b-41d9-924c-dce4ddb95f50"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-d5e27ab0-066d-4b7a-ba9b-6ef184b8a22e"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-f3baf20d-9946-4072-906a-7b9e09ca2489"
        },
        {
          "type": "volume",
          "name": "px_0ce1f570-pvc-f74cedf7-566c-4046-83da-8b902b562e46"
        }
      ],
      "links": [
        {
          "source": "ESXi65222",
          "target": "ESXi65222_vol01",
          "value": 1
        },
        {
          "source": "ESXi65222",
          "target": "ESXi65222_vol02",
          "value": 1
        },
        {
          "source": "ESXi65171",
          "target": "ESXi65222_vol01",
          "value": 1
        },
        {
          "source": "ESXi65171",
          "target": "ESXi65222_vol02",
          "value": 1
        },
        {
          "source": "ESXi17640",
          "target": "ESXi17640_agent_test",
          "value": 1
        },
        {
          "source": "ESXi17640",
          "target": "ESXi17640_vol01",
          "value": 1
        },
        {
          "source": "ESXi17640",
          "target": "testvol0504",
          "value": 1
        },
        {
          "source": "ESXi17640",
          "target": "testvol0508",
          "value": 1
        },
        {
          "source": "ESXi17640",
          "target": "testvol0512",
          "value": 1
        },
        {
          "source": "ESXi17640",
          "target": "testvol0533",
          "value": 1
        },
        {
          "source": "ESXi17640",
          "target": "testvol0535",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-039d0d7f-32ce-4693-bb95-be9bbe26d96f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-08016889-ae88-4170-be7d-f4bdf9e8eb08",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-0c31d6cd-e1e6-4a1a-9d75-a0a660977722",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-11c06840-52c9-43e1-80e2-8cc1b6e799ab",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-12fda961-6da2-4a41-8df4-b7561788905b",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-1a39b157-4d67-404d-af6b-75882710d06b",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-2aba3edc-d549-48e8-a9d2-bebe1fbeb326",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-2c098fff-095c-45a0-859c-60bb5f1c0361",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-2c36c60a-3635-4e4b-a4a2-ddeba16cea29",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-2fe2198f-0d36-4efe-9b79-17d53e10a388",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-3d3bffa6-ca4b-455d-b277-6305539f4d6e",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-40c944cb-6b61-4229-a665-736752497a3c",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-41f468d1-f69f-4e1b-a21f-7c46890c495d",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-591cc7f1-b3f6-454a-9e91-12d2bdf354d2",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-5a3ea67a-9518-422c-a35f-723bc934befe",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-5bdf101f-26af-4874-8796-24fbd9d8ed2f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-5ed7c0c0-438a-4f6e-a62a-d50e140a5851",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-6100f5f8-8ba3-4926-8310-0044c3dcb37f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-62488f23-cc4a-4b1c-a3c0-ce3fbd795914",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-6b4b9e03-ec34-494c-8e5f-7064b2c012a0",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-7114a722-7466-4256-83e7-62e83d150e07",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-778023d3-7ab5-4d59-9e25-a803a979b34e",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-7fc8e86e-9592-43ad-b9e3-073412d9a77f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-87caf982-af91-4475-ac16-326c8b81e5a3",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-8f309cee-391d-4c79-bea0-10e364e59319",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-8fd7aa67-aa4a-428c-9ae7-20fbf546f241",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-937c3432-b624-414e-876a-9faa076452d4",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-a72cdc59-0dda-4583-b7e5-76c30dfb13df",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-a892ccd5-c675-40a3-b54c-14d1f92dd9de",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-a89ad424-12a2-4478-90ce-0a3d79f96fca",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-aac21af2-7b3d-4fb8-aecc-dc44fa41c09c",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-be9dabe9-ef8f-453a-8c08-1148bbd9fb4b",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-bf8a8500-5042-4f29-bafd-4d72db501d7e",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-c0cdf3db-6c65-4c1d-aa5c-d02a7fa08f1f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-c47dbdf6-7a9c-4926-a1d1-6de7ffce3b95",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-cdd3e44d-3897-4ff0-bfa6-6bcdb688c13f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-d96fcfce-da05-4c71-94e2-50a27190d5f7",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-dc7bf290-64ee-4cf2-af48-0f5ecd3389c3",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-e0c63fb5-0ec0-4a95-b1ae-a894d25429a9",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-e81a51e9-2123-46ac-be9d-2df414bfa87c",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-f0c99985-37f1-4277-99d0-901ad021e460",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-f5a18567-538b-4c32-ad52-e2c1c939d143",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-f762d4a9-6826-4d31-9138-23d59b4398f0",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw3-27ad3d7e-bca7-4596-bb19-2b61700c3136",
          "target": "px_0ce1f570-pvc-fce07872-dd7e-4282-8258-51a32adaca25",
          "value": 1
        },
        {
          "source": "ESXi-66-60",
          "target": "ESXi-66-60-Vol01",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-08df5232-8efa-41b4-9482-7fb4c0c3cec4",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-0997c271-a552-41d1-bac3-97835c07a864",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-113a4291-7759-4cca-ba23-a91478ec9f58",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-1f304fd9-5d3a-47fa-b9ff-31761c9b6044",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-2449c0ee-5678-497f-9914-611b1a5e3f59",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-26c9b2e8-371c-4b55-854b-54510a705ae2",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-2f155cbb-02a3-43ef-bdd9-23f4756a3be7",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-2f1f0351-079d-43d1-8ff9-210493171055",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-309b2b62-d341-40a3-9c09-598b0ea41277",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-33c6909f-25af-4fe5-b0dc-a75d4010bc66",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-3457e893-127a-459a-8284-6e69fdb9babe",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-3ce7f7b0-a83f-4c21-b094-dc32a32cd092",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-40f6c420-43d1-4e35-959a-caadfc85f95f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-410ea014-b486-4457-9a29-964ed23721e5",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-4b10b349-c700-47d3-875a-2375b1139ffa",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-52e1e8f8-db00-4183-afb9-51a4ca1ee4de",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-5aa44e77-b2bc-4e9a-9937-82d24d0c4dd4",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-5c66388f-b673-4154-9943-cb89001f10e6",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-5dbea0a6-ec78-4df5-a3bb-a18837824c27",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-64b50f96-07eb-4f6a-aa73-74e2f83218e4",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-66d3f907-7ab8-41be-9d24-23143cc3fdab",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-71ec7e8b-7c43-4206-849c-e88055506112",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-7e8e84b4-f555-46fc-bf3e-f0111cd145a4",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-7ff2cff0-b324-4a71-84b7-64e17eb624bc",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-850726cf-702d-466b-8c0b-36b06bda13d8",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-867f9ae6-01cf-4b08-851a-70ffb63124e7",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-87377ca7-99a6-47ae-87ca-7d613dc59464",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-87c40397-8eee-4357-b269-5b5c5fe4caf8",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-9242e2c5-ed5a-419a-b246-539e76ca6ccc",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-94523907-ec68-4fe4-9cb7-a52c2810c580",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-a5b593f1-89bd-4990-8d8c-127fd7bbb6d1",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-a8d568a8-674c-4875-8518-049f589084e2",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-ab7c9faf-3619-4f0f-8d94-43efb427b87f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-af1545bd-ecfc-483f-b71c-338bf7422e92",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-b30c5c60-f1e9-4db6-b64e-c3ec5f7dcfb4",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-b4dde5a9-b89c-4a12-bdc7-c354e298d996",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-b58c7700-09fb-4429-8764-cd855951e7da",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-b5c08c77-d1ec-4c61-886c-c445ba35cb72",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-bd71f95a-aade-4592-b482-1d048c8eb3db",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-c7f8b652-892a-4699-95b2-3bb8a546e4bd",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-ca289411-f323-47c4-abcf-4189011ec33a",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-d2e21205-111c-4368-a0ff-478b44eef24b",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-d5dc3bda-88e2-4769-89ed-4146d7fb0636",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-d95d0262-15bf-40dc-98df-dd76240bd46b",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-dbef89aa-1290-42b8-8b1c-ac5818540f36",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-dbf5eb7f-5a1a-41ca-beef-96ec6ab8352f",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-e32a1b45-2ff0-4875-ba34-ad4405109f94",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-e66f0983-56b7-43fb-a573-6dae9bfc6568",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-ea739e57-d180-4282-b105-0f138a8327e6",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-f3fbdc51-d806-453b-9b55-6c05df0501f2",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw1-e336ce2e-2a06-4116-b1ec-b9f6a2a0a779",
          "target": "px_0ce1f570-pvc-faa9b43d-836b-4f78-9fa7-1c1c400786ef",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Kubernetes-92-164-worker1-vol01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Kubernetes-92-164-worker2-vol01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Kubernetes-92-164-worker3",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Linux9257_vol01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Linux9257_vol02",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Testvolmig_v01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Winhost65-30-vol02",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Winjumphost137_V01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Winjumphost137_VeeamBkp",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "Winjumphost137_vol8585",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "linuxhost8814_vol01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "linuxhost8814_vol02",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "linuxhost8814_vol03",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "linuxhost8814_vol04",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "sdxdclocpinfas2w1-vol01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "sdxdclocpinfas2w2-vol01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "sdxdclocpinfas2w3-vol01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "vol-2d2fee9b-test-vol-0000-wjxgw",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "vol-a563b6b2-SQL-data-Vol-0000-gjbbv",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "vol-c976947c-OracleRAC-Redo-V0-0000-w5c68",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "winhost65-30-vol01",
          "value": 1
        },
        {
          "source": "Winjumphost137",
          "target": "yogesh-linux-vol",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-000d20ea-fab4-4ae0-8eb8-3a4fcbd2da4d",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-0d948f95-4194-40ce-9a4a-ead388b3ea7b",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-23a75299-8f4c-4e2b-8d80-af7632ce245a",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-3119e85e-b1b4-443e-aea0-55546e916004",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-5621bf03-da5b-4b8d-890a-2f8cd605e7e8",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-5622617a-f560-4364-94ca-7c5da19c42b3",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-60750a45-a846-4f53-a773-f4d92b246760",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-6cddcd1c-16a2-4c7a-a06d-e42cd1b05e66",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-6fc67e34-a296-4082-b690-559038825989",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-7df27a25-11e0-4d28-9c9e-bcc2fe2ceec4",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-8f943603-0987-435f-9550-eed350cfaeda",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-9abc0ca8-4463-4dc2-a72e-3a3ecc9b8e44",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-acc38a46-9bfe-4fda-826b-e1cf7927edff",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-ad600ac6-bd8f-4361-bdec-132ef6d56490",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-af4c84d1-b5c9-483c-8d44-94bfcb00bbf8",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-c80707b1-9e43-4639-aecd-d8d862e04e22",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-cfeb1f6f-566b-41d9-924c-dce4ddb95f50",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-d5e27ab0-066d-4b7a-ba9b-6ef184b8a22e",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-f3baf20d-9946-4072-906a-7b9e09ca2489",
          "value": 1
        },
        {
          "source": "sdxcoesjpocpvirtualw2-a48a4e84-b8a4-412e-8259-703bc6bb3b27",
          "target": "px_0ce1f570-pvc-f74cedf7-566c-4046-83da-8b902b562e46",
          "value": 1
        }
      ],
      "chart_type": "sankey",
      "key": "host_resource_profile",
      "title": "Top 10 Host Resource Profile"
    }
  ],
  "summary": {
    "average_latency_ms": 0.2082,
    "throughput_per_host_mbps": 0,
    "total_hosts": 52,
    "total_iops_per_host": 48.53,
    "host_groups": 3,
    "average_volumes_mapped_per_host": 3.94
  }
} as PureStorageHostsGraphResponse;

export const PURE_STORAGE_HOST_GROUPS_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [2.24, 0, 0],
          "name": "Total Capacity",
          "unit": "GB"
        }
      ],
      "categories": [
        "sdxdcloraclevmrac-HG",
        "Cisco-M4-Infra-80-150",
        "Pacemaker-cluster"
      ],
      "chart_type": "bar",
      "key": "host_group_capacity",
      "title": "Top 10 Host Groups by Total Capacity"
    },
    {
      "series": [
        {
          "data": [2.24, 0, 0],
          "name": "Volume",
          "unit": "GB"
        },
        {
          "data": [0, 0, 0],
          "name": "Snapshots",
          "unit": "GB"
        },
        {
          "data": [0, 0, 0],
          "name": "Shared",
          "unit": "GB"
        },
        {
          "data": [0, 0, 0],
          "name": "System",
          "unit": "GB"
        }
      ],
      "categories": [
        "sdxdcloraclevmrac-HG",
        "Cisco-M4-Infra-80-150",
        "Pacemaker-cluster"
      ],
      "chart_type": "stacked_bar",
      "key": "storage_composition",
      "title": "Host Group Storage Composition"
    },
    {
      "series": [
        {
          "data": [2.8, 0, 0],
          "name": "Storage Utilization",
          "unit": "%"
        }
      ],
      "categories": [
        "sdxdcloraclevmrac-HG",
        "Cisco-M4-Infra-80-150",
        "Pacemaker-cluster"
      ],
      "chart_type": "bar",
      "key": "host_group_storage_utilization",
      "title": "Top 10 Host Groups by Storage Utilization"
    },
    {
      "title": "Host Group Capacity vs Data Reduction",
      "x_axis": {
        "name": "Provisioned Size",
        "unit": "GB"
      },
      "chart_type": "bubble",
      "key": "host_group_capacity_data_reduction",
      "y_axis": {
        "name": "Data Reduction Ratio",
        "unit": "ratio"
      },
      "data": [
        {
          "y": 2.9,
          "x": 80,
          "name": "sdxdcloraclevmrac-HG",
          "value": 2.24
        },
        {
          "y": 1,
          "x": 0,
          "name": "Cisco-M4-Infra-80-150",
          "value": 2
        },
        {
          "y": 2.4,
          "x": 100,
          "name": "Pacemaker-cluster",
          "value": 100
        }
      ]
    },
    {
      "series": [
        {
          "data": [2.24, 0, 0, 0],
          "name": "sdxdcloraclevmrac-HG"
        },
        {
          "data": [0, 0, 0, 0],
          "name": "Cisco-M4-Infra-80-150"
        },
        {
          "data": [0, 0, 0, 0],
          "name": "Pacemaker-cluster"
        }
      ],
      "categories": [
        "Volume (GB)",
        "Snapshots (GB)",
        "Shared (GB)",
        "System (GB)"
      ],
      "chart_type": "radar",
      "key": "host_group_performance_profile",
      "title": "Host Group Performance Profile"
    },
    {
      "title": "Host Group Metrics Heatmap",
      "y_categories": [
        "sdxdcloraclevmrac-HG",
        "Cisco-M4-Infra-80-150",
        "Pacemaker-cluster"
      ],
      "x_categories": [
        "Size (GB)",
        "Volume (GB)",
        "Snapshots (GB)",
        "Shared (GB)",
        "System (GB)",
        "Total (GB)"
      ],
      "chart_type": "heatmap",
      "key": "host_group_metrics_heatmap",
      "data": [
        [80, 2.24, 0, 0, 0, 2.24],
        [0, 0, 0, 0, 0, 0],
        [100, 0, 0, 0, 0, 0]
      ]
    },
    {
      "data": [
        {
          "name": "sdxdcloraclevmrac-HG",
          "children": [
            {
              "unit": "GB",
              "name": "Size",
              "value": 80
            },
            {
              "unit": "GB",
              "name": "Volume",
              "value": 2.24
            },
            {
              "unit": "GB",
              "name": "Snapshots",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "Shared",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "System",
              "value": 0
            }
          ]
        },
        {
          "name": "Cisco-M4-Infra-80-150",
          "children": [
            {
              "unit": "GB",
              "name": "Size",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "Volume",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "Snapshots",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "Shared",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "System",
              "value": 0
            }
          ]
        },
        {
          "name": "Pacemaker-cluster",
          "children": [
            {
              "unit": "GB",
              "name": "Size",
              "value": 100
            },
            {
              "unit": "GB",
              "name": "Volume",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "Snapshots",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "Shared",
              "value": 0
            },
            {
              "unit": "GB",
              "name": "System",
              "value": 0
            }
          ]
        }
      ],
      "chart_type": "sunburst",
      "key": "host_group_multi_metric_comparison",
      "title": "Host Group Multi-Metric Comparison"
    }
  ]
} as PureStorageHostGroupsGraphResponse;

export const PURE_STORAGE_VOLUMES_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Read IOPS",
          "unit": "K"
        },
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Write IOPS",
          "unit": "K"
        }
      ],
      "categories": [
        "px_0ce1f570-pvc-778023d3-7ab5-4d59-9e25-a803a979b34e",
        "Kubernetes-92-164-worker3",
        "winhost65-30-vol01",
        "Winhost65-30-vol02",
        "sdxdclocpinfas2w2-vol01",
        "testvol0533",
        "linuxhost8814_vol03",
        "linuxhost8814_vol04",
        "Winjumphost137_V01",
        "Testvolmig_v01"
      ],
      "chart_type": "grouped_bar",
      "key": "volume_iops",
      "title": "Read & Write IOPS per Volume"
    },
    {
      "series": [
        {
          "data": [1.92, 0.3, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Snapshot Size",
          "unit": "GiB"
        }
      ],
      "categories": [
        "ESXi-66-60-Vol01",
        "Linuxhost77118_vol01",
        "px_0ce1f570-pvc-778023d3-7ab5-4d59-9e25-a803a979b34e",
        "Kubernetes-92-164-worker3",
        "winhost65-30-vol01",
        "Winhost65-30-vol02",
        "sdxdclocpinfas2w2-vol01",
        "testvol0533",
        "linuxhost8814_vol03",
        "linuxhost8814_vol04"
      ],
      "chart_type": "horizontal_bar",
      "key": "snapshot_size_per_volume",
      "title": "Snapshot Size per Volume"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Read Throughput",
          "unit": "MB/s"
        },
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Write Throughput",
          "unit": "MB/s"
        }
      ],
      "categories": [
        "px_0ce1f570-pvc-778023d3-7ab5-4d59-9e25-a803a979b34e",
        "Kubernetes-92-164-worker3",
        "winhost65-30-vol01",
        "Winhost65-30-vol02",
        "sdxdclocpinfas2w2-vol01",
        "testvol0533",
        "linuxhost8814_vol03",
        "linuxhost8814_vol04",
        "Winjumphost137_V01",
        "Testvolmig_v01"
      ],
      "chart_type": "grouped_bar",
      "key": "volume_throughput",
      "title": "Read & Write Throughput per Volume"
    },
    {
      "data": [
        {
          "unit": "%",
          "name": "px_0ce1f570-pvc-778023d3-7ab5-4d59-9e25-a803a979b34e",
          "value": 0
        },
        {
          "unit": "%",
          "name": "Kubernetes-92-164-worker3",
          "value": 0
        },
        {
          "unit": "%",
          "name": "winhost65-30-vol01",
          "value": 0
        },
        {
          "unit": "%",
          "name": "Winhost65-30-vol02",
          "value": 0
        },
        {
          "unit": "%",
          "name": "sdxdclocpinfas2w2-vol01",
          "value": 0
        },
        {
          "unit": "%",
          "name": "testvol0533",
          "value": 0
        },
        {
          "unit": "%",
          "name": "linuxhost8814_vol03",
          "value": 0
        },
        {
          "unit": "%",
          "name": "linuxhost8814_vol04",
          "value": 0
        },
        {
          "unit": "%",
          "name": "Winjumphost137_V01",
          "value": 0
        },
        {
          "unit": "%",
          "name": "Testvolmig_v01",
          "value": 0
        }
      ],
      "chart_type": "donut",
      "key": "thin_provisioning_per_volume",
      "title": "Thin Provisioning per Volume"
    },
    {
      "data": [
        {
          "unit": "ratio",
          "name": "px_0ce1f570-pvc-7688cda5-b59a-44d1-ad00-8b57cdc88349",
          "value": 13.7
        },
        {
          "unit": "ratio",
          "name": "px_0ce1f570-pvc-2fe2198f-0d36-4efe-9b79-17d53e10a388",
          "value": 13.7
        },
        {
          "unit": "ratio",
          "name": "px_0ce1f570-pvc-e32a1b45-2ff0-4875-ba34-ad4405109f94",
          "value": 13.6
        },
        {
          "unit": "ratio",
          "name": "px_0ce1f570-pvc-0b38882b-c6e0-463a-b700-30410e09cff0",
          "value": 13.5
        },
        {
          "unit": "ratio",
          "name": "OCPMIG",
          "value": 13.2
        },
        {
          "unit": "ratio",
          "name": "px_0ce1f570-pvc-afd2a7e9-d078-4d46-8b27-17626af60fdc",
          "value": 13.2
        },
        {
          "unit": "ratio",
          "name": "px_0ce1f570-pvc-08430606-d440-4a16-8bc8-a070c6abd9a7",
          "value": 13.2
        },
        {
          "unit": "ratio",
          "name": "Winjumphost137_VeeamBkp",
          "value": 13.2
        },
        {
          "unit": "ratio",
          "name": "px_d96bab57-pvc-3c09d1be-b5d6-40ed-926e-61f579ac3f46",
          "value": 13.2
        },
        {
          "unit": "ratio",
          "name": "OCPMIG-clone",
          "value": 13.2
        }
      ],
      "chart_type": "polar_area",
      "key": "data_reduction_per_volume",
      "title": "Data Reduction per Volume"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Total Data Reduction",
          "unit": "ratio"
        }
      ],
      "categories": [
        "px_0ce1f570-pvc-778023d3-7ab5-4d59-9e25-a803a979b34e",
        "Kubernetes-92-164-worker3",
        "winhost65-30-vol01",
        "Winhost65-30-vol02",
        "sdxdclocpinfas2w2-vol01",
        "testvol0533",
        "linuxhost8814_vol03",
        "linuxhost8814_vol04",
        "Winjumphost137_V01",
        "Testvolmig_v01"
      ],
      "chart_type": "bar",
      "key": "total_data_reduction_per_volume",
      "title": "Total Data Reduction per Volume"
    }
  ],
  "summary": {
    "average_latency_ms": 0,
    "san_latency_ms": 0,
    "used_capacity_tb": 0.33,
    "provisioned_size_pb": 0.02,
    "total_volumes": 256
  }
} as PureStorageVolumesGraphResponse;

export const PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [],
          "name": "Snapshot Size",
          "unit": "GB"
        }
      ],
      "categories": [],
      "chart_type": "bar",
      "key": "snapshot_size",
      "title": "Top 10 Volume Snapshots by Capacity"
    },
    {
      "series": [
        {
          "data": [],
          "name": "Snapshot Capacity",
          "unit": "GB"
        }
      ],
      "categories": [],
      "chart_type": "lollipop",
      "key": "snapshot_capacity_rank",
      "title": "Top 10 Volume Snapshots by Capacity"
    },
    {
      "series": [
        {
          "data": [],
          "name": "Data",
          "unit": "GB"
        },
        {
          "data": [],
          "name": "Metadata",
          "unit": "GB"
        }
      ],
      "categories": [],
      "chart_type": "stacked_bar",
      "key": "snapshot_composition",
      "title": "Volume Snapshot Composition"
    },
    {
      "title": "Snapshot Capacity vs Data Reduction",
      "x_axis": {
        "name": "Snapshot Capacity",
        "unit": "GB"
      },
      "chart_type": "bubble",
      "key": "snapshot_capacity_data_reduction",
      "y_axis": {
        "name": "Data Reduction Ratio",
        "unit": "ratio"
      },
      "data": []
    },
    {
      "series": [],
      "categories": [
        "Size (GB)",
        "Data Reduction",
        "Retention (Days)",
        "Age (Days)"
      ],
      "chart_type": "radar",
      "key": "snapshot_performance_profile",
      "title": "Volume Snapshot Performance Profile"
    },
    {
      "title": "Volume Snapshot Metrics Heatmap",
      "y_categories": [],
      "x_categories": [
        "Size (GB)",
        "Data Reduction",
        "Retention (Days)",
        "Age (Days)"
      ],
      "chart_type": "heatmap",
      "key": "snapshot_metrics_heatmap",
      "data": []
    },
    {
      "data": [],
      "chart_type": "sunburst",
      "key": "snapshot_comparison_matrix",
      "title": "Volume Snapshot Comparison Matrix"
    }
  ]
} as PureStorageVolumeSnapshotsGraphResponse;

export const PURE_STORAGE_VOLUME_GROUPS_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "data": [],
      "chart_type": "polar_area",
      "key": "storage_distribution",
      "title": "Volume Group Storage Distribution"
    },
    {
      "data": [],
      "chart_type": "funnel",
      "key": "snapshot_density",
      "title": "Volume Group Snapshot Density"
    },
    {
      "nodes": [
        {
          "name": "High DR (6:1+)"
        },
        {
          "name": "Medium DR (4-6:1)"
        },
        {
          "name": "Low DR (\u003C4:1)"
        }
      ],
      "links": [],
      "chart_type": "sankey",
      "key": "capacity_flow",
      "title": "Volume Group Capacity Flow"
    },
    {
      "series": [
        {
          "data": [],
          "name": "Size",
          "unit": "GB"
        }
      ],
      "categories": [],
      "chart_type": "bar",
      "key": "volume_group_size",
      "title": "Top 10 Volume Groups by Size"
    }
  ]
} as PureStorageVolumeGroupsGraphResponse;

export const PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [5, 5, 3, 3, 3, 2, 2, 1, 1, 1],
          "name": "Protected Volumes"
        }
      ],
      "categories": [
        "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw",
        "pg-a563b6b2-SQL-Repl-Plan-82s2s",
        "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s",
        "pg-44befa74-test-repl2-cwz9z",
        "pg-44befa74-test-snap2-dd84v",
        "pg-9380f43b-dummy-snap-q7s9j",
        "pg-9380f43b-dummy-repl-h4ksg",
        "pg-2d2fee9b-test-snap-7xpwm",
        "TestPG",
        "pg-2d2fee9b-test-replication-c2j8v"
      ],
      "chart_type": "bar",
      "key": "protection_groups",
      "title": "Protection Groups"
    },
    {
      "data": [
        {
          "name": "Active",
          "value": 6
        },
        {
          "name": "Paused",
          "value": 7
        }
      ],
      "chart_type": "doughnut",
      "key": "replication_status",
      "title": "Replication Status Distribution"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Snapshot Count"
        }
      ],
      "categories": [
        "pg-2d2fee9b-test-snap-7xpwm",
        "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s",
        "TestPG",
        "pg-2d2fee9b-test-replication-c2j8v",
        "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw",
        "pg-44befa74-test-repl2-cwz9z",
        "pg-a563b6b2-SQL-Repl-Plan-82s2s",
        "pg-44befa74-test-snap2-dd84v",
        "pg-9380f43b-dummy-snap-q7s9j",
        "pg-9380f43b-dummy-repl-h4ksg"
      ],
      "chart_type": "bar",
      "key": "snapshot_count",
      "title": "Snapshots by Protection Session"
    },
    {
      "series": [
        {
          "data": [0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Snapshot Size",
          "unit": "GB"
        }
      ],
      "categories": [
        "Linuxhost77118_vol01",
        "vol-2d2fee9b-test-vol-0000-wjxgw",
        "vol-c976947c-OracleRAC-Redo-V0-0000-w5c68",
        "vol-c976947c-OracleRAC-Redo-V0-0001-hrs5s",
        "vol-c976947c-OracleRAC-Redo-V0-0002-nl7vk",
        "yogesh-linux-vol",
        "vol-2d2fee9b-test-vol-0000-wjxgw",
        "vol-a563b6b2-SQL-data-Vol-0000-gjbbv",
        "vol-a563b6b2-SQL-data-Vol-0001-xvtq4",
        "vol-a563b6b2-SQL-data-Vol-0002-wwzt8"
      ],
      "chart_type": "horizontal_bar",
      "key": "snapshot_size_per_volume",
      "title": "Snapshot Size per Volume"
    }
  ]
} as PureStorageProtectionReplicationGraphResponse;

export const PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Connected Snapshots"
        }
      ],
      "categories": [
        "pg-2d2fee9b-test-snap-7xpwm",
        "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s",
        "TestPG",
        "pg-2d2fee9b-test-replication-c2j8v",
        "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw",
        "pg-44befa74-test-repl2-cwz9z",
        "pg-a563b6b2-SQL-Repl-Plan-82s2s",
        "pg-44befa74-test-snap2-dd84v",
        "pg-9380f43b-dummy-snap-q7s9j",
        "pg-9380f43b-dummy-repl-h4ksg"
      ],
      "chart_type": "bar",
      "key": "connected_snapshots",
      "title": "Connected Snapshots by Protection Group"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          "name": "Connected Snapshots"
        }
      ],
      "categories": [
        "pg-2d2fee9b-test-snap-7xpwm",
        "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s",
        "TestPG",
        "pg-2d2fee9b-test-replication-c2j8v",
        "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw",
        "pg-44befa74-test-repl2-cwz9z",
        "pg-a563b6b2-SQL-Repl-Plan-82s2s",
        "pg-44befa74-test-snap2-dd84v",
        "pg-9380f43b-dummy-snap-q7s9j",
        "pg-9380f43b-dummy-repl-h4ksg"
      ],
      "chart_type": "lollipop",
      "key": "snapshot_count",
      "title": "Top 10 Protection Groups by Snapshot Count"
    },
    {
      "data": [
        {
          "schedule_hours": 24,
          "connected_snapshots": 0,
          "name": "pg-2d2fee9b-test-snap-7xpwm",
          "retention_days": 0
        },
        {
          "schedule_hours": 24,
          "connected_snapshots": 0,
          "name": "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s",
          "retention_days": 0
        },
        {
          "schedule_hours": 1,
          "connected_snapshots": 0,
          "name": "TestPG",
          "retention_days": 7
        },
        {
          "schedule_hours": 1,
          "connected_snapshots": 0,
          "name": "pg-2d2fee9b-test-replication-c2j8v",
          "retention_days": 7
        },
        {
          "schedule_hours": 24,
          "connected_snapshots": 0,
          "name": "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw",
          "retention_days": 0
        },
        {
          "schedule_hours": 1,
          "connected_snapshots": 0,
          "name": "pg-44befa74-test-repl2-cwz9z",
          "retention_days": 7
        },
        {
          "schedule_hours": 1,
          "connected_snapshots": 0,
          "name": "pg-a563b6b2-SQL-Repl-Plan-82s2s",
          "retention_days": 7
        },
        {
          "schedule_hours": 24,
          "connected_snapshots": 0,
          "name": "pg-44befa74-test-snap2-dd84v",
          "retention_days": 0
        },
        {
          "schedule_hours": 24,
          "connected_snapshots": 0,
          "name": "pg-9380f43b-dummy-snap-q7s9j",
          "retention_days": 0
        },
        {
          "schedule_hours": 1,
          "connected_snapshots": 0,
          "name": "pg-9380f43b-dummy-repl-h4ksg",
          "retention_days": 7
        }
      ],
      "chart_type": "scatter",
      "key": "schedule_distribution",
      "title": "Protection Schedule Distribution"
    },
    {
      "series": [
        {
          "data": [0, 0, 7, 7, 0, 7, 7, 0, 0, 7],
          "name": "Local Retention",
          "unit": "days"
        },
        {
          "data": [7, 7, 7, 0, 7, 0, 0, 7, 7, 0],
          "name": "Target Retention",
          "unit": "days"
        }
      ],
      "categories": [
        "pg-2d2fee9b-test-snap-7xpwm",
        "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s",
        "TestPG",
        "pg-2d2fee9b-test-replication-c2j8v",
        "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw",
        "pg-44befa74-test-repl2-cwz9z",
        "pg-a563b6b2-SQL-Repl-Plan-82s2s",
        "pg-44befa74-test-snap2-dd84v",
        "pg-9380f43b-dummy-snap-q7s9j",
        "pg-9380f43b-dummy-repl-h4ksg"
      ],
      "chart_type": "stacked_bar",
      "key": "retention_analysis",
      "title": "Snapshot Retention Analysis"
    },
    {
      "series": [
        {
          "data": [0, 24, 0, 7],
          "name": "pg-2d2fee9b-test-snap-7xpwm"
        },
        {
          "data": [0, 24, 0, 7],
          "name": "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s"
        },
        {
          "data": [0, 1, 7, 7],
          "name": "TestPG"
        },
        {
          "data": [0, 1, 7, 0],
          "name": "pg-2d2fee9b-test-replication-c2j8v"
        },
        {
          "data": [0, 24, 0, 7],
          "name": "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw"
        }
      ],
      "categories": [
        "Snapshots",
        "Schedule (Hours)",
        "Retention (Days)",
        "Target Retention (Days)"
      ],
      "chart_type": "radar",
      "key": "protection_group_profile",
      "title": "Protection Group Profile"
    },
    {
      "title": "Protection Coverage Heatmap",
      "y_categories": [
        "pg-2d2fee9b-test-snap-7xpwm",
        "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s",
        "TestPG",
        "pg-2d2fee9b-test-replication-c2j8v",
        "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw",
        "pg-44befa74-test-repl2-cwz9z",
        "pg-a563b6b2-SQL-Repl-Plan-82s2s",
        "pg-44befa74-test-snap2-dd84v",
        "pg-9380f43b-dummy-snap-q7s9j",
        "pg-9380f43b-dummy-repl-h4ksg"
      ],
      "x_categories": [
        "Snapshots",
        "Schedule (Hours)",
        "Retention (Days)",
        "Target Retention (Days)"
      ],
      "chart_type": "heatmap",
      "key": "protection_coverage_heatmap",
      "data": [
        [0, 24, 0, 7],
        [0, 24, 0, 7],
        [0, 1, 7, 7],
        [0, 1, 7, 0],
        [0, 24, 0, 7],
        [0, 1, 7, 0],
        [0, 1, 7, 0],
        [0, 24, 0, 7],
        [0, 24, 0, 7],
        [0, 1, 7, 0]
      ]
    },
    {
      "nodes": [
        {
          "name": "pg-2d2fee9b-test-snap-7xpwm"
        },
        {
          "name": "Not Replicated"
        },
        {
          "name": "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s"
        },
        {
          "name": "TestPG"
        },
        {
          "name": "Replicated"
        },
        {
          "name": "pg-2d2fee9b-test-replication-c2j8v"
        },
        {
          "name": "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw"
        },
        {
          "name": "pg-44befa74-test-repl2-cwz9z"
        },
        {
          "name": "pg-a563b6b2-SQL-Repl-Plan-82s2s"
        },
        {
          "name": "pg-44befa74-test-snap2-dd84v"
        },
        {
          "name": "pg-9380f43b-dummy-snap-q7s9j"
        },
        {
          "name": "pg-9380f43b-dummy-repl-h4ksg"
        }
      ],
      "links": [
        {
          "source": "pg-2d2fee9b-test-snap-7xpwm",
          "target": "Not Replicated",
          "value": 1
        },
        {
          "source": "pg-c976947c-Oracle-RAC-Cluster-Snap-Policy-fsb4s",
          "target": "Not Replicated",
          "value": 3
        },
        {
          "source": "TestPG",
          "target": "Replicated",
          "value": 1
        },
        {
          "source": "pg-2d2fee9b-test-replication-c2j8v",
          "target": "Replicated",
          "value": 1
        },
        {
          "source": "pg-a563b6b2-SQL-Snapshot-Policy-zwkvw",
          "target": "Not Replicated",
          "value": 5
        },
        {
          "source": "pg-44befa74-test-repl2-cwz9z",
          "target": "Replicated",
          "value": 3
        },
        {
          "source": "pg-a563b6b2-SQL-Repl-Plan-82s2s",
          "target": "Replicated",
          "value": 5
        },
        {
          "source": "pg-44befa74-test-snap2-dd84v",
          "target": "Not Replicated",
          "value": 3
        },
        {
          "source": "pg-9380f43b-dummy-snap-q7s9j",
          "target": "Not Replicated",
          "value": 2
        },
        {
          "source": "pg-9380f43b-dummy-repl-h4ksg",
          "target": "Replicated",
          "value": 2
        }
      ],
      "chart_type": "sankey",
      "key": "protection_dependency_flow",
      "title": "Protection Dependency Flow"
    }
  ]
} as PureStorageProtectionGroupSnapshotsGraphResponse;

export const PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "data": [],
      "chart_type": "doughnut",
      "key": "pod_status_distribution",
      "title": "POD Status Distribution"
    },
    {
      "series": [
        {
          "data": [],
          "name": "Health Score"
        }
      ],
      "categories": [],
      "chart_type": "lollipop",
      "key": "pod_health",
      "title": "Top 10 POD Health Status"
    },
    {
      "data": [],
      "chart_type": "scatter",
      "key": "pod_status_scatter",
      "title": "POD Status by Array"
    },
    {
      "nodes": [],
      "links": [],
      "chart_type": "sankey",
      "key": "pod_connectivity_overview",
      "title": "POD Connectivity Overview"
    },
    {
      "series": [],
      "categories": [
        "Health Score",
        "Mediator",
        "Array Load",
        "Days in Status"
      ],
      "chart_type": "radar",
      "key": "pod_status_comparison",
      "title": "POD Status Comparison"
    },
    {
      "title": "POD Health Heatmap",
      "y_categories": [],
      "x_categories": [
        "Health Score",
        "Days in Status",
        "Array Load",
        "Mediator"
      ],
      "chart_type": "heatmap",
      "key": "pod_health_heatmap",
      "data": []
    },
    {
      "dimensions": [
        "Health Score",
        "Days in Status",
        "Array Load",
        "Mediator"
      ],
      "data": [],
      "chart_type": "parallel_coordinates",
      "key": "pod_synchronization_matrix",
      "title": "POD Synchronization Matrix"
    }
  ]
} as PureStorageActiveClusterGraphResponse;

export const PURE_STORAGE_PERFORMANCE_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [13.37, 13.06, 7.23, 6.26, 0.79],
          "name": "IOPS",
          "unit": "K"
        }
      ],
      "categories": [
        "SDx-Core-Datastore-01",
        "PROD-SDx-Common-DS02",
        "Rookie",
        "SDx-LaaS-Datastore-01",
        "VM2OPV7"
      ],
      "chart_type": "bar",
      "key": "volume_level_iops",
      "title": "Volume-level IOPS"
    },
    {
      "series": [
        {
          "data": [32.37, 13.55, 12.29, 12.13, 11.77],
          "name": "IOPS",
          "unit": "K"
        }
      ],
      "categories": [
        "ESXi17640",
        "ESXi65222",
        "ESXi6579",
        "SDx-Core-65-86",
        "SDx-Core-66-60"
      ],
      "chart_type": "bar",
      "key": "host_level_iops",
      "title": "Host-level IOPS"
    }
  ],
  "summary": {
    "total_iops_k": 283.64,
    "read_iops_k": 179.37,
    "write_throughput_gbps": 5.49,
    "write_iops_k": 104.27,
    "queue_depth": 1.13,
    "read_throughput_gbps": 8.19,
    "read_latency_ms": 0.16,
    "bandwidth_gbps": 13.67,
    "write_latency_ms": 0.19
  }
} as PureStoragePerformanceGraphResponse;

export const PURE_STORAGE_CAPACITY_PLANNING_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [1.27, 1.27, 1.27, 1.28, 1.28, 1.28, 1.28, 1.28, 1.28, 1.28],
          "name": "Projection",
          "unit": "TB"
        }
      ],
      "categories": [
        "Today",
        "30 Days",
        "60 Days",
        "90 Days",
        "120 Days",
        "150 Days",
        "180 Days",
        "210 Days",
        "240 Days",
        "270 Days"
      ],
      "chart_type": "line",
      "key": "capacity_forecast",
      "title": "Capacity Forecast"
    },
    {
      "series": [
        {
          "data": [256, 0, 0],
          "name": "Volumes"
        }
      ],
      "categories": [
        "\u003C50%",
        "50-80%",
        "\u003E80%"
      ],
      "chart_type": "bar",
      "key": "volume_utilization_distribution",
      "title": "Volume Utilization Distribution"
    },
    {
      "series": [
        {
          "data": [0.02],
          "name": "Growth",
          "unit": "TB"
        }
      ],
      "categories": [
        "Aug"
      ],
      "chart_type": "bar",
      "key": "monthly_growth",
      "title": "Monthly Growth Chart"
    }
  ],
  "summary": {
    "growth_rate_tb_per_day": 0,
    "data_reduction_ratio": 28.45,
    "thin_provisioning_savings_pb": 0,
    "monthly_growth_tb": 0,
    "free_capacity_tb": 21.76,
    "effective_capacity_pb": 0.64,
    "used_capacity_tb": 1.27,
    "days_until_full": 752855
  }
} as PureStorageCapacityPlanningGraphResponse;

export const PURE_STORAGE_HARDWARE_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "series": [
        {
          "data": [0, 0, 0, 0],
          "name": "CPU Cores"
        }
      ],
      "categories": [
        "SDX Lab - Pure Storage Flash Array",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDxX20R3-FA1"
      ],
      "chart_type": "bar",
      "key": "cpu_cores",
      "title": "CPU Cores"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 0],
          "name": "Memory",
          "unit": "GB"
        }
      ],
      "categories": [
        "SDX Lab - Pure Storage Flash Array",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDxX20R3-FA1"
      ],
      "chart_type": "bar",
      "key": "memory",
      "title": "Memory"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 11.52],
          "name": "Disk Space",
          "unit": "TB"
        }
      ],
      "categories": [
        "SDX Lab - Pure Storage Flash Array",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDxX20R3-FA1"
      ],
      "chart_type": "bar",
      "key": "disk_space",
      "title": "Disk Space"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 0],
          "name": "Ports"
        }
      ],
      "categories": [
        "SDX Lab - Pure Storage Flash Array",
        "SDX Lab Pure Storage - 27 IP",
        "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
        "SDxX20R3-FA1"
      ],
      "chart_type": "bar",
      "key": "ports",
      "title": "Ports Count"
    },
    {
      "data": [
        {
          "name": "PureStorage",
          "value": 4
        }
      ],
      "chart_type": "doughnut",
      "key": "manufacturer",
      "title": "Manufacturer"
    },
    {
      "data": [
        {
          "name": "1.19",
          "value": 2
        },
        {
          "name": "1.16",
          "value": 1
        },
        {
          "name": "unknown",
          "value": 1
        }
      ],
      "chart_type": "doughnut",
      "key": "os_version",
      "title": "OS Version"
    },
    {
      "data": [
        {
          "name": "FlashArray",
          "value": 4
        }
      ],
      "chart_type": "doughnut",
      "key": "model",
      "title": "Model"
    }
  ],
  "summary": {
    "os_version": "Purity //FA 1.x",
    "total_network_ports": 0,
    "total_disk_space_pb": 0.01,
    "manufacturer": "PureStorage"
  }
} as PureStorageHardwareGraphResponse;

export const PURE_STORAGE_ALERTS_GRAPH_API_DUMMY = {
  "status": true,
  "graphs": [
    {
      "data": [
        {
          "name": "Critical",
          "value": 0
        },
        {
          "name": "Warning",
          "value": 0
        },
        {
          "name": "Information",
          "value": 0
        }
      ],
      "chart_type": "doughnut",
      "key": "severity_distribution",
      "title": "Alerts by Severity"
    },
    {
      "series": [
        {
          "data": [0, 0, 0, 0, 0],
          "name": "Critical"
        },
        {
          "data": [0, 0, 0, 0, 0],
          "name": "Warning"
        },
        {
          "data": [0, 0, 0, 0, 0],
          "name": "Information"
        }
      ],
      "categories": [
        "W1",
        "W2",
        "W3",
        "W4",
        "W5"
      ],
      "chart_type": "stacked_bar",
      "key": "alert_trend",
      "title": "Alert Timeline (Count)"
    }
  ],
  "summary": {
    "resolved": 0,
    "information": 0,
    "total_alerts": 0,
    "warning": 0,
    "critical": 0,
    "active": 0
  }
} as PureStorageAlertsGraphResponse;

export const PURE_STORAGE_ARRAYS_TABLE_API_DUMMY = {
  "status": true,
  "count": 4,
  "current_page": 1,
  "results": [
    {
      "data_reduction_ratio": 0,
      "thin_provisioning_percentage": 0,
      "array_hostname": "SDX Lab - Pure Storage Flash Array",
      "combined_bandwidth_mbps": 0,
      "free_capacity_tb": 0,
      "write_latency_ms": 0,
      "total_capacity_tb": 0,
      "read_latency_ms": 0,
      "write_iops": 0,
      "read_iops": 0,
      "used_capacity_tb": 0,
      "utilization_percentage": 0
    },
    {
      "data_reduction_ratio": 17.98,
      "thin_provisioning_percentage": 0.86,
      "array_hostname": "SDX Lab Pure Storage - 27 IP",
      "combined_bandwidth_mbps": 0,
      "free_capacity_tb": 10.81,
      "write_latency_ms": 0.176,
      "total_capacity_tb": 11.52,
      "read_latency_ms": 0.0876,
      "write_iops": 100.91,
      "read_iops": 18.18,
      "used_capacity_tb": 0.7,
      "utilization_percentage": 6.12
    },
    {
      "data_reduction_ratio": 0,
      "thin_provisioning_percentage": 0,
      "array_hostname": "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
      "combined_bandwidth_mbps": 0,
      "free_capacity_tb": 0,
      "write_latency_ms": 0.193,
      "total_capacity_tb": 0,
      "read_latency_ms": 0.1483,
      "write_iops": 1074.4,
      "read_iops": 7927.64,
      "used_capacity_tb": 0,
      "utilization_percentage": 0
    },
    {
      "data_reduction_ratio": 38.92,
      "thin_provisioning_percentage": 0.83,
      "array_hostname": "SDxX20R3-FA1",
      "combined_bandwidth_mbps": 0,
      "free_capacity_tb": 10.95,
      "write_latency_ms": 0.1838,
      "total_capacity_tb": 11.52,
      "read_latency_ms": 0.2327,
      "write_iops": 626.67,
      "read_iops": 1896.85,
      "used_capacity_tb": 0.57,
      "utilization_percentage": 4.93
    }
  ],
  "message": "Array table data fetched successfully",
  "previous": null,
  "total_pages": 1,
  "summary": {
    "total_arrays": 4,
    "total_capacity": {
      "unit": "TB",
      "value": 23.03
    },
    "used_capacity": {
      "unit": "TB",
      "value": 1.27
    },
    "total_iops": 11644.65,
    "average_read_latency_ms": 0.1172,
    "average_write_latency_ms": 0.1382
  },
  "page_size": 5,
  "next": null
} as PureStorageArraysTableResponse;

export const PURE_STORAGE_HOSTS_TABLE_API_DUMMY = {
  "status": true,
  "count": 52,
  "current_page": 1,
  "results": [
    {
      "size_gb": 100,
      "snapshots_gb": 1.92,
      "data_reduction_ratio": 4.83,
      "array_hostname": "SDxX20R3-FA1",
      "total_gb": 4.25,
      "system_gb": 0,
      "connected_volumes": [
        "ESXi-66-60-Vol01"
      ],
      "protection_groups": [],
      "shared_gb": 0,
      "host_name": "ESXi-66-60",
      "volume_gb": 2.34
    },
    {
      "size_gb": 2109.44,
      "snapshots_gb": 0,
      "data_reduction_ratio": 4.83,
      "array_hostname": "SDxX20R3-FA1",
      "total_gb": 116.33,
      "system_gb": 0,
      "connected_volumes": [
        "ESXi17640_agent_test",
        "ESXi17640_vol01",
        "testvol0504",
        "testvol0508",
        "testvol0512",
        "testvol0533",
        "testvol0535"
      ],
      "protection_groups": [],
      "shared_gb": 0,
      "host_name": "ESXi17640",
      "volume_gb": 116.33
    },
    {
      "size_gb": 1300.48,
      "snapshots_gb": 0,
      "data_reduction_ratio": 4.83,
      "array_hostname": "SDxX20R3-FA1",
      "total_gb": 158.38,
      "system_gb": 0,
      "connected_volumes": [
        "ESXi65222_vol01",
        "ESXi65222_vol02"
      ],
      "protection_groups": [],
      "shared_gb": 0,
      "host_name": "ESXi65171",
      "volume_gb": 158.38
    },
    {
      "size_gb": 50,
      "snapshots_gb": 0,
      "data_reduction_ratio": 4.83,
      "array_hostname": "SDxX20R3-FA1",
      "total_gb": 0,
      "system_gb": 0,
      "connected_volumes": [
        "Esxi65173_vol01"
      ],
      "protection_groups": [],
      "shared_gb": 0,
      "host_name": "ESXi65173",
      "volume_gb": 0
    },
    {
      "size_gb": 0,
      "snapshots_gb": 0,
      "data_reduction_ratio": 4.83,
      "array_hostname": "SDxX20R3-FA1",
      "total_gb": 0,
      "system_gb": 0,
      "connected_volumes": [],
      "protection_groups": [],
      "shared_gb": 0,
      "host_name": "esxi65175",
      "volume_gb": 0
    }
  ],
  "previous": null,
  "total_pages": 11,
  "summary": {
    "average_latency_ms": 0.2082,
    "throughput_per_host_mbps": 0,
    "total_hosts": 52,
    "total_iops_per_host": 48.53,
    "host_groups": 3,
    "average_volumes_mapped_per_host": 3.94
  },
  "page_size": 5,
  "next": "/customer/storage/pure-storage-dashboard/hosts/table/?arrays=all&datacenter=all&page=2&page_size=5&time_range=30d"
} as PureStorageHostsTableResponse;

export const PURE_STORAGE_HOST_GROUPS_TABLE_API_DUMMY = {
  "status": true,
  "count": 3,
  "previous": null,
  "current_page": 1,
  "total_pages": 1,
  "results": [
    {
      "host_count": 2,
      "size_gb": 0,
      "snapshots_gb": 0,
      "host_group_name": "Cisco-M4-Infra-80-150",
      "shared_gb": 0,
      "volume_gb": 0,
      "system_gb": 0,
      "data_reduction_ratio": 1,
      "total_gb": 0,
      "array_hostname": "SDxX20R3-FA1"
    },
    {
      "host_count": 2,
      "size_gb": 100,
      "snapshots_gb": 0,
      "host_group_name": "Pacemaker-cluster",
      "shared_gb": 0,
      "volume_gb": 0,
      "system_gb": 0,
      "data_reduction_ratio": 2.4,
      "total_gb": 0,
      "array_hostname": "SDxX20R3-FA1"
    },
    {
      "host_count": 2,
      "size_gb": 80,
      "snapshots_gb": 0,
      "host_group_name": "sdxdcloraclevmrac-HG",
      "shared_gb": 0,
      "volume_gb": 2.24,
      "system_gb": 0,
      "data_reduction_ratio": 2.9,
      "total_gb": 2.24,
      "array_hostname": "SDxX20R3-FA1"
    }
  ],
  "page_size": 5,
  "next": null
} as PureStorageHostGroupsTableResponse;

export const PURE_STORAGE_VOLUMES_TABLE_API_DUMMY = {
  "status": true,
  "count": 256,
  "results": [
    {
      "provisioned_size_gb": 2,
      "used_capacity_gb": 0,
      "data_reduction_ratio": 2,
      "thin_provisioning_percentage": 0,
      "array_hostname": "SDxX20R3-FA1",
      "write_latency_ms": 0,
      "san_latency_ms": 0,
      "read_latency_ms": 0,
      "write_iops": 0,
      "read_iops": 0,
      "volume_name": "Copy_Linux9257_vol02",
      "serial_number": "8CFB2D60742F46DB00011854"
    },
    {
      "provisioned_size_gb": 100,
      "used_capacity_gb": 2.38,
      "data_reduction_ratio": 4.4,
      "thin_provisioning_percentage": 0,
      "array_hostname": "SDxX20R3-FA1",
      "write_latency_ms": 0,
      "san_latency_ms": 0,
      "read_latency_ms": 0,
      "write_iops": 0,
      "read_iops": 0,
      "volume_name": "ESXi-66-60-Vol01",
      "serial_number": "8CFB2D60742F46DB0001627C"
    },
    {
      "provisioned_size_gb": 15,
      "used_capacity_gb": 0,
      "data_reduction_ratio": 10.2,
      "thin_provisioning_percentage": 0,
      "array_hostname": "SDxX20R3-FA1",
      "write_latency_ms": 0,
      "san_latency_ms": 0,
      "read_latency_ms": 0,
      "write_iops": 0,
      "read_iops": 0,
      "volume_name": "ESXi17640_agent_test",
      "serial_number": "8CFB2D60742F46DB0001DA4B"
    },
    {
      "provisioned_size_gb": 2048,
      "used_capacity_gb": 116.21,
      "data_reduction_ratio": 2.9,
      "thin_provisioning_percentage": 0,
      "array_hostname": "SDxX20R3-FA1",
      "write_latency_ms": 0,
      "san_latency_ms": 0,
      "read_latency_ms": 0,
      "write_iops": 0,
      "read_iops": 0,
      "volume_name": "ESXi17640_vol01",
      "serial_number": "8CFB2D60742F46DB0001B713"
    },
    {
      "provisioned_size_gb": 50,
      "used_capacity_gb": 0,
      "data_reduction_ratio": 1,
      "thin_provisioning_percentage": 0,
      "array_hostname": "SDxX20R3-FA1",
      "write_latency_ms": 0,
      "san_latency_ms": 0,
      "read_latency_ms": 0,
      "write_iops": 0,
      "read_iops": 0,
      "volume_name": "Esxi65173_vol01",
      "serial_number": "8CFB2D60742F46DB000114B7"
    }
  ],
  "previous": null,
  "current_page": 1,
  "total_pages": 52,
  "summary": {
    "average_latency_ms": 0,
    "san_latency_ms": 0,
    "used_capacity_tb": 0.33,
    "provisioned_size_pb": 0.02,
    "total_volumes": 256
  },
  "page_size": 5,
  "next": "/customer/storage/pure-storage-dashboard/volumes/table/?arrays=all&datacenter=all&page=2&page_size=5&time_range=30d"
} as PureStorageVolumesTableResponse;

export const PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_API_DUMMY = {
  "status": true,
  "count": 1414,
  "previous": null,
  "current_page": 1,
  "total_pages": 142,
  "results": [
    {
      "parent_volume": "yogesh-linux-vol",
      "snapshot_time": "2026-04-14T00:46:00+00:00",
      "snapshot_size_gb": 10,
      "array_hostname": "SDxX20R3-FA1",
      "snapshot_name": "TestPG.6411.yogesh-linux-vol",
      "serial_number": "8CFB2D60742F46DB0001F632"
    },
    {
      "parent_volume": "vol-9380f43b-dummy-vol-0000-r885n",
      "snapshot_time": "2026-04-14T00:43:30+00:00",
      "snapshot_size_gb": 2,
      "array_hostname": "SDxX20R3-FA1",
      "snapshot_name": "pg-9380f43b-dummy-repl-h4ksg.13119.vol-9380f43b-dummy-vol-0000-r885n",
      "serial_number": "8CFB2D60742F46DB0001F630"
    },
    {
      "parent_volume": "vol-9380f43b-dummy-vol-0001-scb4r",
      "snapshot_time": "2026-04-14T00:43:30+00:00",
      "snapshot_size_gb": 2,
      "array_hostname": "SDxX20R3-FA1",
      "snapshot_name": "pg-9380f43b-dummy-repl-h4ksg.13119.vol-9380f43b-dummy-vol-0001-scb4r",
      "serial_number": "8CFB2D60742F46DB0001F631"
    },
    {
      "parent_volume": "vol-2d2fee9b-test-vol-0000-wjxgw",
      "snapshot_time": "2026-04-14T00:30:00+00:00",
      "snapshot_size_gb": 10,
      "array_hostname": "SDxX20R3-FA1",
      "snapshot_name": "pg-2d2fee9b-test-replication-c2j8v.39.vol-2d2fee9b-test-vol-0000-wjxgw",
      "serial_number": "8CFB2D60742F46DB0001F628"
    },
    {
      "parent_volume": "vol-2d2fee9b-test-vol-0000-wjxgw",
      "snapshot_time": "2026-04-14T00:30:00+00:00",
      "snapshot_size_gb": 10,
      "array_hostname": "SDxX20R3-FA1",
      "snapshot_name": "pg-2d2fee9b-test-snap-7xpwm.39.vol-2d2fee9b-test-vol-0000-wjxgw",
      "serial_number": "8CFB2D60742F46DB0001F629"
    },
  ],
  "page_size": 5,
  "next": null
} as PureStorageVolumeSnapshotsTableResponse;

export const PURE_STORAGE_VOLUME_GROUPS_TABLE_API_DUMMY = {
    "status": true,
    "count": 2,
    "previous": null,
    "current_page": 1,
    "total_pages": 1,
    "results": [
        {
            "size_gb": 120,
            "data_reduction_ratio": 6.4,
            "snapshots": 0,
            "array_hostname": "WiproSDXX20",
            "protection_group": "vp-auto-local-11aefd24-efd005d8",
            "volumes": 4,
            "volume_group_name": "vvol-Pure-Oracle-DB--Template-626549d2-vg"
        },
        {
            "size_gb": 54,
            "data_reduction_ratio": 6.0,
            "snapshots": 0,
            "array_hostname": "WiproSDXX20",
            "protection_group": "vp-auto-local-11aefd24-efd005d8",
            "volumes": 2,
            "volume_group_name": "vvol-Oracle-DB-Stand-allation-942003f7-vg"
        }
    ],
    "page_size": 5,
    "next": null
} as PureStorageVolumeGroupsTableResponse;

export const PURE_STORAGE_PROTECTION_REPLICATION_TABLE_API_DUMMY = {
  "status": true,
  "count": 13,
  "previous": null,
  "current_page": 1,
  "total_pages": 3,
  "results": [
    {
      "status": "Active",
      "source_array": "SDxX20R3-FA1",
      "direction": "Outbound",
      "snapshot_count": 0,
      "session_group_name": "Oraclestandalone-DB",
      "last_sync_time": null,
      "type": "Protection Group",
      "target_array": "Unknown",
      "array_hostname": "SDxX20R3-FA1"
    },
    {
      "status": "Active",
      "source_array": "SDxX20R3-FA1",
      "direction": "Outbound",
      "snapshot_count": 0,
      "session_group_name": "pg-2d2fee9b-test-replication-c2j8v",
      "last_sync_time": null,
      "type": "Protection Group",
      "target_array": "Unknown",
      "array_hostname": "SDxX20R3-FA1"
    },
    {
      "status": "Paused",
      "source_array": "SDxX20R3-FA1",
      "direction": "Outbound",
      "snapshot_count": 0,
      "session_group_name": "pg-2d2fee9b-test-snap-7xpwm",
      "last_sync_time": null,
      "type": "Protection Group",
      "target_array": "Unknown",
      "array_hostname": "SDxX20R3-FA1"
    },
    {
      "status": "Paused",
      "source_array": "SDxX20R3-FA1",
      "direction": "Outbound",
      "snapshot_count": 0,
      "session_group_name": "pg-4139e96b-dummy-repl-w46jw",
      "last_sync_time": null,
      "type": "Protection Group",
      "target_array": "Unknown",
      "array_hostname": "SDxX20R3-FA1"
    },
    {
      "status": "Paused",
      "source_array": "SDxX20R3-FA1",
      "direction": "Outbound",
      "snapshot_count": 0,
      "session_group_name": "pg-4139e96b-dummy-snap-d7vxf",
      "last_sync_time": null,
      "type": "Protection Group",
      "target_array": "Unknown",
      "array_hostname": "SDxX20R3-FA1"
    }
  ],
  "page_size": 5,
  "next": "/customer/storage/pure-storage-dashboard/protection-replication/table/?arrays=all&datacenter=all&page=2&page_size=5&time_range=30d"
} as PureStorageProtectionReplicationTableResponse;

export const PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_API_DUMMY = {
  "status": true,
  "count": 13,
  "previous": null,
  "current_page": 1,
  "total_pages": 3,
  "results": [
    {
      "snapshot_schedule": "Disabled",
      "array_hostname": "SDxX20R3-FA1",
      "replication_frequency": "Every 2 hours",
      "connected_host_groups": 0,
      "replication_enabled": true,
      "protection_group_name": "Oraclestandalone-DB",
      "connected_hosts": 0,
      "connected_volumes": 1,
      "snapshot_retention_days": 7,
      "target_retention_days": 7,
      "connected_snapshots": 0
    },
    {
      "snapshot_schedule": "Disabled",
      "array_hostname": "SDxX20R3-FA1",
      "replication_frequency": "Every 24 hours",
      "connected_host_groups": 0,
      "replication_enabled": true,
      "protection_group_name": "pg-2d2fee9b-test-replication-c2j8v",
      "connected_hosts": 0,
      "connected_volumes": 1,
      "snapshot_retention_days": 7,
      "target_retention_days": 0,
      "connected_snapshots": 0
    },
    {
      "snapshot_schedule": "Every 24 hours",
      "array_hostname": "SDxX20R3-FA1",
      "replication_frequency": "Disabled",
      "connected_host_groups": 0,
      "replication_enabled": false,
      "protection_group_name": "pg-2d2fee9b-test-snap-7xpwm",
      "connected_hosts": 0,
      "connected_volumes": 1,
      "snapshot_retention_days": 0,
      "target_retention_days": 7,
      "connected_snapshots": 0
    },
    {
      "snapshot_schedule": "Disabled",
      "array_hostname": "SDxX20R3-FA1",
      "replication_frequency": "Disabled",
      "connected_host_groups": 0,
      "replication_enabled": false,
      "protection_group_name": "pg-4139e96b-dummy-repl-w46jw",
      "connected_hosts": 0,
      "connected_volumes": 0,
      "snapshot_retention_days": 7,
      "target_retention_days": 0,
      "connected_snapshots": 0
    },
    {
      "snapshot_schedule": "Disabled",
      "array_hostname": "SDxX20R3-FA1",
      "replication_frequency": "Disabled",
      "connected_host_groups": 0,
      "replication_enabled": false,
      "protection_group_name": "pg-4139e96b-dummy-snap-d7vxf",
      "connected_hosts": 0,
      "connected_volumes": 0,
      "snapshot_retention_days": 0,
      "target_retention_days": 7,
      "connected_snapshots": 0
    }
  ],
  "page_size": 5,
  "next": "/customer/storage/pure-storage-dashboard/protection-group-snapshots/table/?arrays=all&datacenter=all&page=2&page_size=5&time_range=30d"
} as PureStorageProtectionGroupSnapshotsTableResponse;

export const PURE_STORAGE_ACTIVE_CLUSTER_TABLE_API_DUMMY = {
  "status": true,
  "summary": {
    "total_pods": 10,
    "online_pods": 7,
    "synchronizing_pods": 1,
    "alerting_offline_pods": 2
  },
  "count": 10,
  "current_page": 1,
  "page_size": 5,
  "total_pages": 2,
  "next": "/customer/storage/pure-storage-dashboard/active-cluster/table/?page=2&page_size=5&search=oracle&status=online",
  "previous": null,
  "results": [
    {
      "pod_name": "oracle-01",
      "array_name": "pure-array-a01",
      "status": "Online",
      "mediator_connected": true,
      "health_score": 100,
      "days_in_status": 45
    },
    {
      "pod_name": "oracle-02",
      "array_name": "pure-array-a02",
      "status": "Online",
      "mediator_connected": true,
      "health_score": 100,
      "days_in_status": 60
    },
    {
      "pod_name": "k8s-prod",
      "array_name": "pure-array-a02",
      "status": "Synchronizing",
      "mediator_connected": true,
      "health_score": 60,
      "days_in_status": 3
    }
  ]
} as PureStorageActiveClusterTableResponse;

export const PURE_STORAGE_PERFORMANCE_TABLE_API_DUMMY = {
  "status": true,
  "count": 258,
  "next": "/customer/storage/pure-storage-dashboard/performance/table/?arrays=all&datacenter=all&page=2&page_size=5&time_range=30d",
  "previous": null,
  "current_page": 1,
  "total_pages": 52,
  "results": [
    {
      "total_iops_k": 37.53,
      "read_iops_k": 32.37,
      "san_latency_ms": 0,
      "resource_name": "ESXi17640",
      "throughput_mbps": 1409.97,
      "write_iops_k": 5.15,
      "read_latency_ms": 1.98,
      "resource_type": "Host",
      "write_latency_ms": 0.74
    },
    {
      "total_iops_k": 33.25,
      "read_iops_k": 13.37,
      "san_latency_ms": 0,
      "resource_name": "SDx-Core-Datastore-01",
      "throughput_mbps": 940.92,
      "write_iops_k": 19.88,
      "read_latency_ms": 0.56,
      "resource_type": "Volume",
      "write_latency_ms": 0.48
    },
    {
      "total_iops_k": 22.79,
      "read_iops_k": 11.77,
      "san_latency_ms": 0,
      "resource_name": "SDx-Core-66-60",
      "throughput_mbps": 1028.22,
      "write_iops_k": 11.02,
      "read_latency_ms": 1.52,
      "resource_type": "Host",
      "write_latency_ms": 0.89
    },
    {
      "total_iops_k": 18.9,
      "read_iops_k": 13.55,
      "san_latency_ms": 0,
      "resource_name": "ESXi65222",
      "throughput_mbps": 262.57,
      "write_iops_k": 5.35,
      "read_latency_ms": 1.19,
      "resource_type": "Host",
      "write_latency_ms": 0.42
    },
    {
      "total_iops_k": 17.5,
      "read_iops_k": 12.13,
      "san_latency_ms": 0,
      "resource_name": "SDx-Core-65-86",
      "throughput_mbps": 249.58,
      "write_iops_k": 5.37,
      "read_latency_ms": 1.05,
      "resource_type": "Host",
      "write_latency_ms": 0.44
    }
  ],
  "page_size": 5,
  "summary": {
    "total_iops_k": 283.64,
    "read_iops_k": 179.37,
    "write_throughput_gbps": 5.49,
    "write_iops_k": 104.27,
    "queue_depth": 1.13,
    "read_throughput_gbps": 8.19,
    "read_latency_ms": 0.16,
    "bandwidth_gbps": 13.67,
    "write_latency_ms": 0.19
  }
} as PureStoragePerformanceTableResponse;

export const PURE_STORAGE_CAPACITY_PLANNING_TABLE_API_DUMMY = {
  "status": true,
  "count": 4,
  "results": [
    {
      "forecast_60_days_tb": 0.71,
      "data_reduction_ratio": 17.98,
      "growth_rate_percentage": 0.12,
      "current_free_capacity_tb": 10.81,
      "estimated_full_date": "3050-10-05",
      "array_name": "SDX Lab Pure Storage - 27 IP",
      "days_until_full": 374069,
      "forecast_30_days_tb": 0.71,
      "forecast_90_days_tb": 0.71,
      "current_used_capacity_tb": 0.7,
      "thin_provisioning_savings_tb": 0.55,
      "growth_rate_tb_per_month": 0,
      "total_capacity_tb": 11.52,
      "utilization_percentage": 6.12
    },
    {
      "forecast_60_days_tb": 0.57,
      "data_reduction_ratio": 38.92,
      "growth_rate_percentage": 0,
      "current_free_capacity_tb": 10.95,
      "estimated_full_date": null,
      "array_name": "SDxX20R3-FA1",
      "days_until_full": null,
      "forecast_30_days_tb": 0.57,
      "forecast_90_days_tb": 0.57,
      "current_used_capacity_tb": 0.57,
      "thin_provisioning_savings_tb": 0.4,
      "growth_rate_tb_per_month": 0,
      "total_capacity_tb": 11.52,
      "utilization_percentage": 4.93
    },
    {
      "forecast_60_days_tb": 0,
      "data_reduction_ratio": 0,
      "growth_rate_percentage": 0,
      "current_free_capacity_tb": 0,
      "estimated_full_date": null,
      "array_name": "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35",
      "days_until_full": null,
      "forecast_30_days_tb": 0,
      "forecast_90_days_tb": 0,
      "current_used_capacity_tb": 0,
      "thin_provisioning_savings_tb": 0,
      "growth_rate_tb_per_month": 0,
      "total_capacity_tb": 0,
      "utilization_percentage": 0
    },
    {
      "forecast_60_days_tb": 0,
      "data_reduction_ratio": 0,
      "growth_rate_percentage": 0,
      "current_free_capacity_tb": 0,
      "estimated_full_date": null,
      "array_name": "SDX Lab - Pure Storage Flash Array",
      "days_until_full": null,
      "forecast_30_days_tb": 0,
      "forecast_90_days_tb": 0,
      "current_used_capacity_tb": 0,
      "thin_provisioning_savings_tb": 0,
      "growth_rate_tb_per_month": 0,
      "total_capacity_tb": 0,
      "utilization_percentage": 0
    }
  ],
  "previous": null,
  "current_page": 1,
  "total_pages": 1,
  "summary": {
    "growth_rate_tb_per_day": 0,
    "data_reduction_ratio": 28.45,
    "thin_provisioning_savings_pb": 0,
    "monthly_growth_tb": 0,
    "free_capacity_tb": 21.76,
    "effective_capacity_pb": 0.64,
    "used_capacity_tb": 1.27,
    "days_until_full": 752855
  },
  "page_size": 5,
  "next": null
} as PureStorageCapacityPlanningTableResponse;

export const PURE_STORAGE_HARDWARE_TABLE_API_DUMMY = {
  "status": true,
  "count": 4,
  "results": [
    {
      "disk_space_tb": 0,
      "ports_count": 0,
      "manufacturer": "PureStorage",
      "memory_gb": 0,
      "component_type": "Array",
      "health_status": "Unknown",
      "cpu_cores": 0,
      "os_version": "1.19",
      "management_ip": "172.16.133.140",
      "model": "FlashArray",
      "component_name": "SDX Lab - Pure Storage Flash Array"
    },
    {
      "disk_space_tb": 0,
      "ports_count": 0,
      "manufacturer": "PureStorage",
      "memory_gb": 0,
      "component_type": "Array",
      "health_status": "Unknown",
      "cpu_cores": 0,
      "os_version": "1.19",
      "management_ip": "172.17.63.27",
      "model": "FlashArray",
      "component_name": "SDX Lab Pure Storage - 27 IP"
    },
    {
      "disk_space_tb": 0,
      "ports_count": 0,
      "manufacturer": "PureStorage",
      "memory_gb": 0,
      "component_type": "Array",
      "health_status": "Unknown",
      "cpu_cores": 0,
      "os_version": "1.16",
      "management_ip": "172.17.63.35",
      "model": "FlashArray",
      "component_name": "SDX Lab- Pure Storage Flash Arrary - 172.17.63.35"
    },
    {
      "disk_space_tb": 11.52,
      "ports_count": 0,
      "manufacturer": "PureStorage",
      "memory_gb": 0,
      "component_type": "Array",
      "health_status": "Unknown",
      "cpu_cores": 0,
      "os_version": "unknown",
      "management_ip": "172.17.63.21",
      "model": "FlashArray",
      "component_name": "SDxX20R3-FA1"
    }
  ],
  "previous": null,
  "current_page": 1,
  "total_pages": 1,
  "summary": {
    "os_version": "Purity //FA 1.x",
    "total_network_ports": 0,
    "total_disk_space_pb": 0.01,
    "manufacturer": "PureStorage"
  },
  "page_size": 5,
  "next": null
} as PureStorageHardwareTableResponse;

export const PURE_STORAGE_ALERTS_TABLE_API_DUMMY = {
    "status": true,
    "count": 2,
    "results": [
        {
            "status": "Active",
            "count": 1,
            "resource_name": "Pure-Storage-SF",
            "event_metric": "pure.volume.write.per.sec[SV1-UG301-PURE-STORAGE-01]",
            "updated_at": "2026-02-27T05:22:52.561168+00:00",
            "array_hostname": "Pure-Storage-SF",
            "alert_id": "191044226",
            "message": "SV1-UG301-PURE-STORAGE-01 Write Per Second is high",
            "category": "Capacity",
            "severity": "Critical",
            "created_at": "2025-10-07T13:27:39+00:00",
            "source": "Unity",
            "alert_name": "pure.volume.write.per.sec[SV1-UG301-PURE-STORAGE-01]"
        },
        {
            "status": "Active",
            "count": 1,
            "resource_name": "Pure-Storage-SF",
            "event_metric": "pure.volume.total.data.reduction[@WFS_boot-ct0_20211123093015]",
            "updated_at": "2026-02-27T05:22:52.561168+00:00",
            "array_hostname": "Pure-Storage-SF",
            "alert_id": "191044225",
            "message": "@WFS_boot-ct0_20211123093015 Total Data Reduction is more  than 10",
            "category": "Capacity",
            "severity": "Warning",
            "created_at": "2025-10-07T13:27:39+00:00",
            "source": "Unity",
            "alert_name": "pure.volume.total.data.reduction[@WFS_boot-ct0_20211123093015]"
        }
    ],
    "previous": null,
    "current_page": 1,
    "total_pages": 1,
    "summary": {
        "resolved": 0,
        "information": 0,
        "total_alerts": 2,
        "warning": 1,
        "critical": 1,
        "active": 2
    },
    "page_size": 10,
    "next": null
} as PureStorageAlertsTableResponse;
