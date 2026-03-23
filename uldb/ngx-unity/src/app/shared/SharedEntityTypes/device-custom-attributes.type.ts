export interface UnitySetupCustomAttribute {
    id: number;
    uuid: string;
    name: string;
    resource_type: string;
    value_type: string;
    choice_values: string[];
    default_value: string;
    content_type: number;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number;
    customer: number;
    created_by_name: string;
    updated_by_name: string;
}

export interface DeviceCustomAttribute {
    id: number;
    uuid: string;
    name: string;
    resource_type: string;
    value_type: string;
    choice_values: string[];
    default_value: string;
    content_type: number;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number;
    customer: number;
    created_by_name: string;
    updated_by_name: string;
}