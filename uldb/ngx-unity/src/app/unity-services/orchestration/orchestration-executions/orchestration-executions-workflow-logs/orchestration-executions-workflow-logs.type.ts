export interface WorkflowLogDetails {
  uuid: string;
  workflow: string;
  workflow_name: string;
  target_type: string;
  parameters: any;
  design_data?: any;
  run_id: string;
  tasks_execution: WorkflowLogTasksExecution[];
  start_time: string;
  end_time: string;
  duration: string;
  host: WorkflowLogHost[];
  account_id: string;
  credentials: string;
  execution_status: string;
  user: string;
  status: number;
  created_at: string;
  updated_at: string;
  edited_by: number;
  created_by: number;
  category: string;
  description: string;
  cloud: string;
  execution_inputs?: any;
  nodes_execution: [];
}
export interface WorkflowLogTasksExecution {
  uuid: string;
  name: string;
  name_id: string;
  start_time: string;
  end_time: string;
  duration: string;
  execution_status: string;
  inputs: any;
  outputs: any;
  status: number;
  created_at: string;
  updated_at: string;
  edited_by: null;
  created_by: number;
  target_type: string;
  category: string;
  dependencies: string[];
  config?: any[];
  type: string;
  execution_inputs?: any;
}

export interface WorkflowLogHost {
  monitoring: WorkflowLogHostMonitoring;
  uuid: string;
  tags: any[];
  ip_address: string;
  dc_uuid: string;
  ctype_id: number;
  device_type: string;
  private_cloud: string[];
  os: string;
  name: string;
}
export interface WorkflowLogHostMonitoring {
  zabbix: boolean;
  observium: boolean;
  enabled: boolean;
  configured: boolean;
}


export interface WorkflowDetails {
  created_by: string | number;
  duration: string;
  end_time: string;
  execution_status: string;
  start_time: string;
  workflow_name: string;
  user: string;
  uuid: string;
  target_type: string;
  run_id: string;
}

export interface WorkflowLogs {
  execution_log: string;
}

export interface WorkflowOutputResponse {
  execution_status: string;
  output: string;
  task_name: string;
  type: string;
  id: number;
}


// AGENTIC WORKFLOW INTERFACES

export interface AgenticWorkflowLogDetails {
  uuid: string;
  workflow: string;
  workflow_name: string;
  run_id: string;
  start_time: string;
  end_time: string;
  duration: string;
  status: string;
  executed_by: string;
  nodes_execution: NodesExecutionItem[];
  connections: ConnectionsItem[];
}
interface NodesExecutionItem {
  name: string;
  node_id: number;
  node_type: string;
  type_version: number;
  pos_x: number;
  pos_y: number;
  start_time: string;
  end_time: string;
  duration: string;
  status: string;
  inputs: InputsItem[];
}
interface InputsItem {
  param_name: string;
  default_value: string;
}
interface ConnectionsItem {
  source_node: number;
  source_output: string;
  target_node: number;
  target_input: string;
}
