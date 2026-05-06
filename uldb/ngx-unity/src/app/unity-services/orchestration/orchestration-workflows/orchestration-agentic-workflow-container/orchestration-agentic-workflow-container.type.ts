
export enum nodeTypes {
  AnsibleBook = 'Ansible Playbook',
  TerraformScript = 'Terraform Script',
  BashScript = 'Bash Script',
  PythonScript = 'Python Script',
  PowershellScript = 'Powershell Script',
  RestApi = 'Rest API',
  ManualTrigger = 'Manual Trigger',
  ScheduleTrigger = 'Schedule Trigger',
  OnChatMessageTrigger = 'Chat Trigger',
  EventTrigger = 'Event Trigger',
  ItsmTrigger = 'ITSM Event Trigger',
  WebhookTrigger = 'Webhook Trigger',
  Email = 'Email',
  Chart = 'Chart',
  IfElse = 'If Else',
  Switch = 'Switch Case',
  LLM = 'LLM Chain',
  Outputs = 'Outputs',
  AIAgent = 'AI Agent',
  Source = 'Source Task',
  CreateITSMTicket = 'Create Ticket',
  UpdateITSMTicket = 'Update Ticket',
  CommentInITSMTicket = 'Add Comment',
  GetITSMTicket = 'Get Ticket',
  Wait = 'Wait',
  Transform = 'Transform Node',
  AimlEventTrigger = 'AIML Event Trigger',
  Action = 'Action Task',
  Loop = 'Loop'
}

const OPERATOR_MAPPING = {
  "==": "==",
  "!=": "!=",
  ">=": ">=",
  "<=": "<=",
  ">": ">",
  "<": "<",
  "contains": "Contains",
  "not_contains": "Not Contains",
};
export const conditionOperators = Object.keys(OPERATOR_MAPPING).map(key => ({
  label: OPERATOR_MAPPING[key],
  value: key
}));



export class NodeDataModel {
  type: string;
  name: string;
  category?: string;
  image?: string;
  uuid?: string;
  playbook?: string;
  pos_x?: number;
  pos_y?: number;
}


export interface TaskDetailsModel {
  templates: TemplateType[];
  inputs: InputParamsType[];
  cloud_type: string;
  target_type: string;
  target?: string;
  credential?: string;
  task_name: string;
  playbook_type: string;
  outputs?: InputParamsType[];
  config?: any;
  uuid: string;
  name?: string;
  description?: string;
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

export interface NodeDetails {
  type?: string;
  name: string;
  category?: string;
  image: string;
  uuid?: string;
  nodeType?: string;
}

export interface FieldsType {
  default_value: any;
  param_name: string;
  field_name?: string;
  field_type?: string;
  is_required?: boolean;
}

export interface OutputParamsType {
  param_name: string;
  expression_type: string;
  expression: string;
}

export interface NodeDetailsArrayModel {
  name: string;
  node_id?: any;
  tool_id?: any;
  node_type: string;
  type_version: number;
  pos_x: number;
  pos_y: number;
  config: any,
  inputs: InputParamsType[],
  outputs: OutputParamsType[]
  form?: any;
  formErrors?: any;
  formValidationMessages?: any;
  isTool?: boolean;
  human_approval?: boolean;
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
  class?: string;
}

type AccessType = "dot" | "bracket";

export interface ParsedJinja {
  root: string;
  path: string[];
  // access: AccessType[];
}