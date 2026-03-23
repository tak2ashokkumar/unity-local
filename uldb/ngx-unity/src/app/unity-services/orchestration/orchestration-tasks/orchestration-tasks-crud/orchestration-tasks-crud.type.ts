export interface OrchestrationTaskCrudDataType {
    uuid: string;
    task_name: string;
    description: string;
    category: string;
    playbook_type: string;
    target_type: string;
    cloud: string[];
    source: string; // repo id
    source_name: string; // repo name
    playbook: string; // script
    user: string;
    inputs: parameterDataType[];
    config: parameterRestApi;
    image: string;
    output_type: string;
    outputs: { param_name: string }[];
    define_parameter: boolean;
    task_status: string;
    name: string;
    script_type: string;
    script: string;
}

export type parametersType = parameterDataType[];

export interface parameterDataType {
    param_name: string;
    param_type: string;
    default_value: string;
    template: string;
    attribute: string;
    // is_visible: boolean;
}

export interface parameterRestApi {
    url_type: string;
    collector: string;
    method: string;
    url: string;
    auth: Token | Basic | null;
    body_type: string;
    parameters: parameterDataType
    response_validation: ResponseValidation[];
    request_type: string;
    callback_url_key?: string;
    callback_request_validation?: CallbackRequestValidation[];
    callback_url: string;
    headers: RestApiHeadersModel[];
    connection: string;
    verify_ssl: boolean;
    targets: Target[];
    cred: string;
    credentials: string;
    username: string;
    password: string;
    cloud_account: string;
    cloud_type: string;
    requirements: string;
}

export interface Target {
    id_address: string;
    uuid: string;
    name: string;
}

export interface Basic {
    type: 'basic',
    basic: {
        username: string;
        password: string;
    }
}

export interface Token {
    type: 'token',
    token: {
        prefix: string;
        token: string;
    }
}

// export interface Body {
//     form: FormEntry[];
// }

// export interface JSON {
//     json: any;
// }

// export interface FormEntry {
//     key: string;
//     value: string;
// }

export interface ResponseValidation {
    response_type: string;
    response_operator: string;
    response_key?: string;
    response_value: string | number;
}

export interface CallbackRequestValidation {
    request_type: string;
    request_operator: string;
    request_key?: string;
    request_value: string;
}

export interface inputTemplateType {
    name: string;
    category: any;
    description: string;
    input_type: string;
    input_name: string;
    type: string;
    options: string;
    dependency: any;
    template_status: string;
    uuid: string;
    attributes: string[];
}

export interface ConnectionsModel {
    uuid: string;
    name: string;
    base_url: string;
    auth_type: string;
}

export interface RestApiHeadersModel {
    header_name: string;
    header_value: string;
}