export interface LogEntryData {
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
  
//   export interface LogAttributes {
//     otelTraceSampled: boolean;
//     'code.file.path': string;
//     'code.function.name': string;
//     otelServiceName: string;
//     'code.line.number': number;
//     otelTraceID: string;
//     otelSpanID: string;
//   }
  
//   export interface LogResources {
//     service_name: string;
//     trace_end_url: string;
//     device_ip: string;
//     metrics_end_url: string;
//     tenant_id: string;
//     telemetry_sdk_language: string;
//     telemetry.sdk.name: string;
//     log_end_url: string;
//     auth: string;
//     device.name: string;
//     device.type: string;
//     'telemetry.sdk.version': string;
//     'telemetry.auto.version': string;
//   }
  