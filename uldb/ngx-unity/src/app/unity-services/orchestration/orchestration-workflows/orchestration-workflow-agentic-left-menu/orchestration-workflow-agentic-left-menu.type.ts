export class CategoriesViewData {
  category: string;
  tasks: TaskViewData[] |  SourceTaskViewData[];
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