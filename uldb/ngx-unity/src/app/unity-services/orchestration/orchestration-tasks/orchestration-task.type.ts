export interface OrchestrationTaskDataType {
    uuid: string;
    task_name: string;
    description: string;
    category: string;
    // playbook_type: string;
    target_type: string;
    cloud: string[];
    source: string; // repo id
    source_name: string; // repo name
    playbook: string; // script
    user: string;
    parameters: parameterDataType[];
    script_image: string;
    output_type: string;
    define_parameter: boolean;
    task_status: string;
    is_created: boolean;
    inputs: TerraFormParams[];
    name: string;
    script: string;
    config: ConfigType;
    script_type: string;
    enabled: boolean;
    edited_by: string;
}

export interface parameterDataType {
    param_name: string;
    param_type: string;
    default_value: string;
}

export interface OrchestrationRepoDataType {
    url: string;
    uuid: string;
    name: string;
}

export interface OrchestrationPlaybookDataType {
    url: string;
    uuid: string;
    name: string;
    type: string;
    description: string;
    playbook: string;
    repo_fk: string;
    default: boolean;
    content: string;
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
    // is_created: boolean;
}

export interface OrchestrationCategoryDataType {
    results: CategoryDataType[];
}

export interface CategoryDataType {
    category: string;
    count: string;
    uuid: string;
}

export interface MetaData {
    category: string[];
    source: Repos[];
    target_type: string[];
    types: string[];
}

export interface Repos {
    playbooks: Playbooks[];
    type: string;
    uuid: string;
    name: string;
}

export interface Playbooks {
    input_variables: any[];
    output_parameters: any[];
    type: string;
    uuid: string;
    name: string;
}

export interface TerraFormParams {
    param_name: string,
    mandatory: boolean,
    param_type: string,
    placeholder: string,
    default_value: any;
    attribute: string;
    template: string;
    template_name: string;
    is_visible: boolean;
    label: string;
    filters: {};
}

export interface ConfigType {
    cloud_type: string;
    cloud_account: string;
}
