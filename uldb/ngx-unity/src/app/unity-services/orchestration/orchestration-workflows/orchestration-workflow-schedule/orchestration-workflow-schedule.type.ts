import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface scheduleType{
    schedule_meta: UnityScheduleType;
}

export interface WorkflowDetails {
    target_type: string;
    cloud_type: string;
    tasks: WorkflowTask[];
    templates: WorkflowTemplate[];
    workflow_name: string;
}

export interface WorkflowTask {
    inputs: WorkflowInput[];
    uuid: string;
    name_id: string;
    name: string;
    type: string;
}

export interface WorkflowInput {
    param_name: string,
    mandatory: boolean,
    param_type: string,
    placeholder: string,
    default_value: any;
    attribute: string;
    template: string;
    template_name: string;
}

export interface WorkflowTemplate {
    label: string;
    dependency_name: string;
    uuid: string;
    name: string;
}

export interface WorkflowMetaData {
    private_cloud: DropdownWithImage[];
    public_cloud: DropdownWithImage[];
    cloud: DropdownWithImage[];
}

export interface DropdownWithImage {
    image: string;
    type: string;
}

export interface Tag {
    id: number;
    uuid: string;
    tag_name: string;
}

export interface Account {
    id: number;
    uuid: string;
    account_name: string;
    cloud_type: string;
}

export interface TemplateOption {
    value: string;
    label: string;
}