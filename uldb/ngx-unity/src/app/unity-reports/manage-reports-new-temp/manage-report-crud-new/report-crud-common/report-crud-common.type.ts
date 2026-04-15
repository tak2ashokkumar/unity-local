export interface DynamicReportsFieldMeta {
    display_name: string;
    name: string;
    url: null | string;
    operators: string[];
    choices: ChoicesDataType[] | string[][];
    query: boolean;
    type: string;
}

export interface ModuleDataType {
    models: ModelsItem[];
    module_name: string;
    module_display_name: string;
}
export interface ModelsItem {
    model_display_name: string;
    model_name: string;
}

export interface ChoicesDataType {
    id: number;
    uuid: string;
    name: string;
    // monitoring: Monitoring;
    device_type: string;
}