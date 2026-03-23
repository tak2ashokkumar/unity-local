import { UnityViewNetworkTopology } from "src/app/shared/SharedEntityTypes/network-topology.type";

export interface UtilizationDataPoint {
  timestamp: string; // ISO format
  value: number;
}

export interface UtilizationTrendData {
  memory_utilization: UtilizationDataPoint[];
  cpu_utilization: UtilizationDataPoint[];
}


export interface ServerUtilization {
  http_flavor: string;
  latency: string;
  http_target: string;
  throughput: string;
  name: string;
  http_status: number;
  sdk_language: string;
  hostname: string;
  service_version: string | null;
  user_agent: string;
  server_name: string;
  host_ip: string;
  port: string;
  filepath: string;
  error_rate: string;
}

export interface TopTraces {
  trace_id: string;
  span_id: string;
  service_name: string;
  start_time: string;
  end_time: string;
  hostname: string;
  http_url: string;
  http_method: string;
  sdk_language: string;
  host_port: string;
  user_agent: string;
  status_code: string;
  status: string;
}

export interface TopLogs {
  id: number;
  timestamp: string;
  hostname: string;
  application: string;
  http_route: string;
  status: string
  service_name: string;
  tenant_id: string;
  message: string;
  severity: string;
  trace_id: string | null;
  span_id: string | null;
  file_path: string | null;
  function_name: string | null;
  line_number: number | null;
  flags: any;
  created_at: string;
  updated_at: string;
  status_code: string;
  app: number;
}

export interface TopLogsAndTraces {
  top_traces: TopTraces[];
  top_logs: TopLogs[];
}

export interface LatestMetricValue {
  latest_value: number;
  latest_timestamp: string;
  metric_name: string;
}

export interface UtilizationRange {
  range: string;
  average: number;
}

export interface DeviceUtilization {
  current_memory_utilization: number;
  memory_utilization: UtilizationRange[];
  peak_memory_utilization: string;

  cpu_utilization: UtilizationRange[];
  average_cpu_utilization: number;
  current_cpu_utilization: number;
  peak_cpu_utilization: string;

  average_memory_utilization: number;
  grouping: 'hour' | 'day' | 'week' | 'month';
}

