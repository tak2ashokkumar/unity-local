export class CategoriesViewData {
  category: string;
  tasks: TaskViewData[] | SourceTaskViewData[];
}

export class TaskViewData {
  uuid: string;
  name: string;
  image?: string;
  nodeType: string;
  type: string;
  category: string;
}

export class SourceTaskViewData {
  uuid: string;
  name: string;
  image?: string;
  type: string;
  nodeType: string;
  category: string;
}

export class CategoriesData {
  category: string;
  tasks: TaskDetails[];
}

export interface TaskDetails {
  uuid: string;
  name: string
  playbook_type: string;
}

// Dynamic Added (Pushed on 22 may )

export interface WorkflowCategory {
  category: string;
  items: WorkflowItem[];
}

export interface WorkflowGroup {
  key: string;
  name: string;
  description: string;
  icon_path: string;
  group_type: string;
  endpoint?: string;
  items?: WorkflowItem[];
  categories?: WorkflowCategory[];
  isCategorized?: boolean;
}

export interface WorkflowCategory {
  category: string;
  items: WorkflowItem[];
}

export interface WorkflowItem {
  key: string;
  name: string;
  node_type: string;
  description: string;
  icon_path: string;
  endpoint: string;
  category?: string;
  as_tool?: boolean;
}