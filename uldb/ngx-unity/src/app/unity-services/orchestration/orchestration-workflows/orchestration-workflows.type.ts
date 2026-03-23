export interface UnityWorkflow {
    uuid?: string;
    category?: string;
    workflow_name?: string;
    description?: string;
    parameters?: any;
    design_data?: any;
    workflow_status?: string;
    target_type?: string;
    cloud?: string;
    status?: number;
    created_at?: string;
    updated_at?: string;
    edited_by?: number;
    created_by?: number;
    category_name?: string;
    total_task?: number;
    last_executed?: string;
    tasks?: UnityWorkflowTask[];
}
export interface UnityWorkflowTask {
    uuid?: string;
    name?: string;
    name_id?: string;
    type?: string;
    category?: string;
    target_type?: string;
    task?: string;
    inputs?: UnityWorkflowTaskInputs[];
    outputs?: any[];
    config?: any[];
    dependencies?: string[];
    timeout?: string;
    retries?: number;
    status?: number;
    created_at?: string;
    updated_at?: string;
    edited_by?: number;
    created_by?: number;
    data?: ConditionData;
}

export interface ConditionData {
    name: string;
}
export interface UnityWorkflowTaskInputs {
    param_name: string;
    param_type: string;
    default_value: string;
    template: string;
    attribute: string;
}
// export interface UnityWorkflowTaskInputs {
//     name: string;
//     value: string;
// }
export interface UnityWorkflowTaskOutputs {
    name: string;
}
export interface UnityWorkflowTaskConditions {
    expression: { "key": string, "operator": string, "value": string };
    execute: string;
}

export interface WorkflowType {
    uuid: string;
    w_category: string;
    w_total_task: number
    w_name: string;
    w_description: string;
    parameters: Parameters;
    w_status: string;
    status: number;
    w_created_at: string;
    w_updated_at: string;
    edited_by: null;
    w_created_by: number;
    last_executed: string;
    target_type: string;
    w_is_created: boolean;
    w_is_advanced: boolean;
    w_is_agentic: boolean;
    w_trigger_type: string;
}

interface Parameters {
}

export interface OrchestrationHistoryDataType {
    run_id: string;
    start_time: string;
    end_time: string;
    duration: string;
    execution_status: string;
    user: string;
    host_name: string;
    task_name: string;
}

export interface ListSummaryResModel {
    results: Results;
}

export interface Results {
    status: StatusItem[];
    total: number;
    categories: CategoriesItem[];
    execution_status: ExecutionStatusItem[];
}

export interface StatusItem {
    count: number;
    name: string;
    workflow_status: string;
}

export interface CategoriesItem {
    count: number;
    category: string;
}

export interface ExecutionStatusItem {
    count: number;
    name: string;
}

export interface OnchatWorkflow {
    session_id: string;
    name: string;
    welcome_message?: string;
    query?: string;
    message?: string;
}

export interface ChatHistoryData {
    sender: 'user' | 'bot';
    message?: string;
    status?: 'Running' | 'Success' | 'Failed';
}

