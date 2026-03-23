export interface WidgetDataType {
  id: number;
  uuid: string;
  name: string;
  widget_type: string;
  cloud: string;
  group_by: string;
  platform_type: string;
  created_by: string;
  status: boolean;
  created_at: string;
  last_execution: string;
  data: GraphDataType[] | NetworkTrafficDatatype[];
  graph_type: string;
  period: string;
  period_hour: number;
  period_min: number;
  metrics_network_data: string;
  network_group_by: string;
  view_by: string;
  filter_by: string;
  device_items: any[];
}

export interface GraphDataType {
  name: string;
  count: number;
  Up?: number;
  Down?: number;
  Unknown?: number;
  disk?: string;
  host_name?: string;
  accounts?: number;
  type?: string;
}

export interface NetworkTrafficDatatype {
  receive: string;
  bandwidth: string;
  host: string;
  device_type: string;
  transmit: string;
  interface_name: string;
  speed: string;
}

export enum GroupTypeMapping {
  DeviceType = 'device_type',
  Datacenter = 'datacenter',
  CloudType = 'cloud_type',
  Status = 'status',
  Tags = 'tags',
  Locations = 'locations',
  Regions = 'regions',
  ResourceTypes = 'resource_types',
  AccountName = 'account_name',
  Service = 'service',
  AlertSource = 'alert_source',
  Severity = 'severity',
  Top10CpuHosts = 'top_10_cpu_hosts',
  Top10MemoryHosts = 'top_10_memory_hosts',
  Top10StorageHosts = 'top_10_storage_hosts',
  Top10NetworkTrafficHosts = 'top_10_network_traffic_hosts',
  OSType = 'os_type',
  OSVersion = 'os_version'
}

//For setting height and width for graphs
export const GRAPH_WIDGET_CLASS = {
  host_availability: {
    device_type: "col-6 row-4-h",
    datacenter: "col-6 row-4-h",
    cloud_type: "col-6 row-4-h",
    status: "col-4 row-4-h",
    tags: "col-6 row-6-h",
  },
  cloud: {
    locations: "col-4 row-4-h",
    cloud_type: "col-4 row-4-h",
    regions: "col-4 row-4-h",
    resource_types: "col-4 row-4-h",
    tags: "col-6 row-6-h",
  },
  infra_summary: {
    device_type: "col-4 row-4-h",
    datacenter: "col-4 row-4-h",
    cloud_type: "col-4 row-4-h",
    tags: "col-6 row-6-h",
  },
  cloud_cost: {
    cloud_type: "col-4 row-4-h",
    account_name: "col-4 row-4-h",
    regions: "col-4 row-4-h",
    service: "col-4 row-4-h",
  },
  alerts: {
    alert_source: "col-4 row-4-h",
    severity: "col-4 row-4-h",
    device_type: "col-6 row-4-h",
    datacenter: "col-4 row-4-h",
    cloud_type: "col-4 row-4-h",
    status: "col-4 row-4-h",
  },
  sustainability: {
    device_type: "col-4 row-4-h",
    datacenter: "col-4 row-4-h",
    cloud_type: "col-4 row-4-h",
    tags: "col-4 row-4-h",
  },
  metrices: {
    top_10_cpu_hosts: "col-6 row-4-h",
    top_10_memory_hosts: "col-6 row-4-h",
    top_10_storage_hosts: "col-6 row-4-h",
    top_10_network_traffic_hosts: "col-12 row-4-h",
  },
  device_by_os: {
    os_type: "col-4 row-4-h",
    os_version: "col-12 row-4-h",
  }
}

//For setting height and width for graphs
export const GRAPH_WIDGET_SIZE = {
  host_availability: {
    device_type: { width: '50%', height: '40%' },
    datacenter: { width: '50%', height: '40%' },
    cloud_type: { width: '50%', height: '40%' },
    status: { width: '50%', height: '40%' },
    tags: { width: '50%', height: '40%' },
  },
  cloud: {
    locations: { width: '33%', height: '40%' },
    cloud_type: { width: '33%', height: '40%' },
    regions: { width: '33%', height: '40%' },
    resource_types: { width: '33%', height: '40%' },
    tags: { width: '50%', height: '60%' },
  },
  infra_summary: {
    device_type: { width: '33%', height: '40%' },
    datacenter: { width: '33%', height: '40%' },
    cloud_type: { width: '33%', height: '40%' },
    tags: { width: '50%', height: '60%' },
  },
  cloud_cost: {
    cloud_type: { width: '33%', height: '40%' },
    account_name: { width: '33%', height: '40%' },
    regions: { width: '33%', height: '40%' },
    service: { width: '33%', height: '40%' },
  },
  alerts: {
    alert_source: { width: '33%', height: '40%' },
    severity: { width: '33%', height: '40%' },
    device_type: { width: '33%', height: '40%' },
    datacenter: { width: '33%', height: '40%' },
    cloud_type: { width: '33%', height: '40%' },
    status: { width: '33%', height: '40%' },
  },
  sustainability: {
    device_type: { width: '33%', height: '40%' },
    datacenter: { width: '33%', height: '40%' },
    cloud_type: { width: '33%', height: '40%' },
    tags: { width: '50%', height: '60%' },
  },
  metrices: {
    top_10_cpu_hosts: { width: '33%', height: '40%' },
    top_10_memory_hosts: { width: '33%', height: '40%' },
    top_10_storage_hosts: { width: '50%', height: '40%' },
    top_10_network_traffic_hosts: { width: '66%', height: '40%' },
  },
  device_by_os_type: {
    os_type: { width: '33%', height: '40%' },
    os_version: { width: '33%', height: '40%' },
  }
}