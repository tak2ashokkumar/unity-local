export interface OrchestrationSummaryTaskWidgetType {
  status: OrchestrationSummaryTaskWidgetStatusType;
  total: number;
  type: OrchestrationSummaryTaskWidgetScriptsType[];
  target_type: OrchestrationSummaryTaskWidgetTargetType;
}
export interface OrchestrationSummaryTaskWidgetStatusType {
  enabled: number;
  disabled: number;
}
export interface OrchestrationSummaryTaskWidgetScriptsType {
  name: string;
  count: number;
  image: string;
}
export interface OrchestrationSummaryTaskWidgetTargetType {
  host: number;
  cloud: number;
  local: number;
}

export interface OrchestrationSummaryWorkflowWidgetType {
  status: OrchestrationSummaryWorkflowWidgetStatusType;
  total: number;
  categories: OrchestrationSummaryWorkflowWidgetCategoryType;
  target_type: OrchestrationSummaryWorkflowWidgetTargetType;
}
export interface OrchestrationSummaryWorkflowWidgetStatusType {
  enabled: number;
  disabled: number;
}
export interface OrchestrationSummaryWorkflowWidgetCategoryType {
  provisioning: number;
  integration: number;
  operational: number;
}
export interface OrchestrationSummaryWorkflowWidgetTargetType {
  local: number;
  cloud: number;
  host: number;
}

export interface CountIconModel {
  count: number;
  icon: string;
}


export interface OrchestrationSummaryExecutionType {
  exec_count_summary: OrchestrationExecutionCountSummary;
  execution_by_type: OrchestrationSummaryExecutionsByType;
  average_workflow_percentage: OrchestrationSummaryAverageExecutionTimeType;
  execution_by_user: OrchestrationSummaryExecutionsByUserType[];
}

export interface OrchestrationExecutionCountSummary {
  total: OrchestrationExecutionCountType;
  workflow: OrchestrationExecutionCountType;
  task: OrchestrationExecutionCountType;
}
export interface OrchestrationExecutionCountType {
  Failed: number;
  Success: number;
  'In Progress': number;
}

export interface OrchestrationSummaryExecutionsByType {
  data: OrchestrationSummaryExecutionByTypeData[];
  grouping: string;
}
export interface OrchestrationSummaryExecutionByTypeData {
  range: string;
  task_counts: number;
  workflow_counts: number;
}

export interface OrchestrationSummaryAverageExecutionTimeType {
  average_taskflow: OrchestrationSummaryAverageExecutionTime;
  average_workflow: OrchestrationSummaryAverageExecutionTime;
}
export interface OrchestrationSummaryAverageExecutionTime {
  "0min-5min": number,
  "5min-30min": number,
  "30min-1hr": number,
  ">1hr": number,
  "avg_exec_time": string
}

export interface OrchestrationSummaryExecutionsByUserType {
  username: string;
  count: number;
}


export interface ExecutionsOverview {
  execution_efficiency: ExecutionsByEfficiency;
  execution_success_rate: ExecutionsBySuccessRate;
}

export interface ExecutionsByEfficiency {
  task_data: ExecutionsByTaskEfficiency[];
  workflow_data: ExecutionsByWorkflowEfficiency[];
}
export interface ExecutionsByTaskEfficiency {
  avg_execution_duration: number;
  name: string;
  success_rate: number;
  number_of_executions: number;
}
export interface ExecutionsByWorkflowEfficiency {
  avg_execution_duration: number;
  name: string;
  success_rate: number;
  number_of_executions: number;
}

export interface ExecutionsBySuccessRate {
  success_data: SuccessExecutionsData[];
  failure_data: FailedExecutionsData[];
}
export interface SuccessExecutionsData {
  created_at: string;
  host_size: number;
  execution_id: string;
  execution_duration: number;
}
export interface FailedExecutionsData {
  created_at: string;
  host_size: number;
  execution_id: string;
  execution_duration: number;
}

export interface OrchestrationRecentFailureExecutionsType {
  template_id: string;
  run_id: string;
  template_name: string;
  start_time: string;
  execution_status: string;
  host: string;
  user: string;
  duration: string;
  target: string;
  category: string;
  uuid: string;
  created_by: number;
  end_time: string;
  type: string;
  target_type: string;
  is_advanced: boolean;
  is_agentic: boolean;
}

export interface OrchestrationUpcomingExecutionsType {
  template_id: string;
  category: string;
  task_id?: number;
  frequency: string;
  next_exec: string;
  name: string;
  last_exec: string;
  type: string;
  target: string;
  target_type: string;
}

