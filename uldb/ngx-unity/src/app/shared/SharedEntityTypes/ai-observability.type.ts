export interface LLMServiceDetails {
    uuid: string;
    name: string;
    service_type: string;
    request_models: string[];
    tokens_usage: number;
    total_prompt_tokens: number;
    total_completion_tokens: number;
    average_response_time: string;
    average_request_temperature: number;
    last_prompt: string;
    server_addresses: string[];
    server_ports: string[];
    created_at: string;
    updated_at: string;
}

export interface VectorDBServiceDetails {
    uuid: string;
    name: string;
    service_type: string;
    db_collection_names: string[];
    db_operation_names: string[];
    vector_db_types: string[];
    server_addresses: string[];
    server_ports: string[];
    total_db_vector_count: number;
    created_at: string;
    updated_at: string;
}

export interface GPUServiceDetails {
    uuid: string;
    name: string;
    service_type: string;
    gpu_uuid: string;
    gpu_name: string;
    gpu_utilization: number;
    memory_usage: number;
    temperature: number;
    power_draw: number;
    power_limit: number;
    created_at: string;
    updated_at: string;
}

export interface LLMTraces {
    uuid: string;
    trace_id: string;
    span_id: string;
    span_name: string;
    span_kind: string;
    start_time: string;
    end_time: string;
    status_code: string;
    timestamp: string;
    deployment_environment: string;
    gen_ai_operation_name: string;
    gen_ai_system: string;
    gen_ai_request_is_stream: boolean;
    gen_ai_request_model: string;
    gen_ai_response_model: string;
    gen_ai_server_time_per_output_token: number;
    gen_ai_server_time_to_first_token: number;
    gen_ai_request_max_tokens: number;
    gen_ai_request_temperature: number;
    gen_ai_request_top_p: number;
    gen_ai_response_id: string;
    gen_ai_response_finish_reasons: string;
    gen_ai_output_type: string;
    gen_ai_usage_input_tokens: number;
    gen_ai_usage_output_tokens: number;
    gen_ai_client_token_usage: number;
    gen_ai_usage_cost: number;
    gen_ai_prompt: string;
    gen_ai_completion: string;
    server_address: string;
    server_port: string;
    service_name: string;
    service_uuid: string;
}

export interface VectorDBTraces {
    uuid: string;
    trace_id: string;
    span_id: string;
    span_name: string;
    span_kind: string;
    start_time: string;
    end_time: string;
    status_code: string;
    timestamp: string;
    deployment_environment: string;
    gen_ai_operation_name: string;
    gen_ai_system: null;
    db_collection_name: string;
    db_operation_name: string;
    db_statement: string;
    db_system_name: string;
    db_vector_count: number;
    service_name: string;
    service_uuid: string;
}

export interface GPUMetrices {
    uuid: string;
    metric_name: string;
    gpu_name: string;
    gpu_uuid: string;
    deployment_environment: string;
    timestamp: string;
    value: number;
    service_name: string;
    service_uuid: string;
}