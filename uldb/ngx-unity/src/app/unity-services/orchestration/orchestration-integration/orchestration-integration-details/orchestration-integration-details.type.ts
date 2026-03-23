export interface OrchestrationViewDetailDataType {
    uuid: string;
    name: string;
    username: string;
    default_branch: string;
    role_path: string;
}

export interface ScriptDataType {
    uuid: string;
    name: string;
    script_type: string;
    description: string;
    content: any | null;
    edited_by: string | null;
    created_at: string;
    updated_at: string;
    created_by: string;
    created_by_name: string;
    is_default: boolean;
}

export interface ScriptType {
    count: number;
    name: string;
    icon: string | null;
}

export interface ScriptCountByType {
    default: number;
    custom: number;
}

export interface Results {
    by_script_type: ScriptType[];
    by_type: ScriptCountByType;
    total_scripts: number;
    repo_name: string;
}