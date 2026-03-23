
export interface OrchestrationWorkflowMetadata {
    category: string[];
    public_cloud: any[];
    private_cloud: OrchestrationWorkflowPrivateCloud[];
    target_type: string[];
    cloud: OrchestrationWorkflowCloudType[];
}
export interface OrchestrationWorkflowCategory {
    uuid: string;
    name: string;
}
export interface OrchestrationWorkflowPrivateCloud {
    image: string | null;
    type: string;
}
export interface OrchestrationWorkflowCloudType {
    image: string;
    type: string;
}




export interface OrchestrationTaskCategoryType {
    results: OrchestrationTaskCategoryDataType[];
}
export interface OrchestrationTaskCategoryDataType {
    category: string;
    count: string;
    uuid: string;
}

export interface OrchestrationTaskType {
    uuid: string;
    name: string;
    description: string;
    category: string;
    playbook_type: string;
    target_type: string;
    cloud: string[];
    source: string; // repo id
    source_name: string; // repo name
    playbook: string; // script
    user: string;
    parameters: any;
    inputs?: any;
    image: string;
    output_type: string;
    define_parameter: boolean;
    task_status: string;
}
export interface OrchestrationTaskParameterType {
    param_name?: string;
    param_type?: string;
    default_value?: string;
    arguments?: string;
}

export interface OrchestrationTaskParameters {
    cloud_type: string;
    target_type: string;
    parameter_list: any;
    playbook_type: string;
}