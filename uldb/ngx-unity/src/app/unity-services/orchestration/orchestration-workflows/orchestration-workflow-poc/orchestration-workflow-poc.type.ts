import { FormGroup } from "@angular/forms";

export interface TaskDetails {
  uuid: string;
  name: string
  playbook_type: string;
}

export class CategoryData {
  category: string;
  tasks: TaskDetails[];
}

export class CategoryViewData {
  category: string;
  tasks: TaskDetailsViewData[];
}

export class SourceCategoryViewData {
  category: string;
  tasks: SourceTaskDetailsViewData[];
}


export class NodeDataModel {
  id?: number;
  type?: string;
  name?: string;
  category?: string;
  image?: string;
  uuid?: string;
  playbook?: string;
  pos_x?: number;
  pos_y?: number;
  plusSlots?:  Array<{ filled: boolean; iconUrl?: string }>;
}

export class TaskDetailsViewData {
  taskUuid: string;
  taskName: string;
  image?: string;
  playbookType?: string
}

export class SourceTaskDetailsViewData {
  taskUuid: string;
  taskName: string;
  icon?: string;
  type?: string;
}

export class UnityWorkflowViewData {
  id?: string;
  workflow_name: string;
  description?: string;
  category?: string;
  target_type?: string;
  cloud?: string;
  parameters?: any;
  isInProgress: boolean = false;
}

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

export interface OrchestrationTaskType {
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
  parameters: any;
  inputs?: any;
  image: string;
  output_type: string;
  define_parameter: boolean;
  task_status: string;
}

export interface TaskArrayModel {
  category: string;
  config: [];
  dependencies: [];
  inputs: InputParamsType[];
  name: string;
  name_id: string;
  pos_x: number;
  pos_y: number;
  outputs: [];
  task: string;
  taskImage: string;
  type: string;
  timeout: number;
  retries: number;
  trigger_rule: string;
  cloud_type?: string;
  inputForm?: FormGroup;
  targets: [];
  uuid?: string;
  data?: any;
}

export interface SourceTaskArrayModel {
  category: string;
  config: [];
  dependencies: [];
  inputs: InputParamsType[];
  name: string;
  name_id: string;
  pos_x: number;
  pos_y: number;
  outputs: InputParamsType[];
  source_task: string;
  taskImage: string;
  type: string;
  timeout: number;
  retries: number;
  trigger_rule: string;
  cloud_type?: string;
  sourceTaskForm?: FormGroup;
  targets: [];
  uuid?: string;
}

export interface ConditionArrayModel {
  data: any;
  category: string;
  config: [];
  dependencies: [];
  inputs: InputParamsType[];
  name: string;
  name_id: string;
  pos_x: number;
  pos_y: number;
  outputs: [];
  task: string;
  taskImage: string;
  type: string;
  timeout: number;
  retries: number;
  trigger_rule: string;
  cloud_type?: string;
  ifConditionForm?: FormGroup;
  switchConditionForm?: FormGroup;
  targets: [];
}

export interface OutputArrayModel {
  data: any;
  category: string;
  config: [];
  dependencies: [];
  inputs: InputParamsType[];
  name: string;
  name_id: string;
  pos_x: number;
  pos_y: number;
  outputs: [];
  task: string;
  taskImage: string;
  type: string;
  timeout: number;
  retries: number;
  trigger_rule: string;
  cloud_type?: string;
  outputForm?: FormGroup;
  targets: [];
}
export interface TaskDetailsModel {
  templates: TemplateType[];
  inputs: InputParamsType[];
  cloud_type: string;
  target_type: string;
  task_name: string;
  playbook_type: string;
  outputs?: InputParamsType[];
}

export interface InputParamsType {
  default_value: string;
  param_name: string;
  attribute: string;
  param_type: string;
  template: string;
  template_name: string;
  is_visible?: boolean;
}

export interface TemplateType {
  label: string;
  dependency_name: string;
  uuid: string;
  name: string;
}


export interface TaskNode {
  id: number;
  name: string;
  type: string;
  data: any;
  outputs: number[]; // list of target node IDs
}

export interface DrawflowNode {
  id: number;
  name: string;
  inputs: any;
  outputs: any;
  pos_x: number;
  pos_y: number;
  html: string;
  typenode: boolean;
  data?: any;
  class: string;
}
