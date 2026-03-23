export interface TraceRecord {
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
    status: number;
} 