import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { OrchestrationTaskCategoryType, OrchestrationTaskParameters, OrchestrationTaskType, OrchestrationWorkflowMetadata } from '../../orchestration.type';
import { UnityWorkflow, UnityWorkflowTask } from '../orchestration-workflows.type';
import { OrchestrationWorkflowCrudUtilsService } from './orchestration-workflow-crud.utils.service';
import { CeleryTask, EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { ORCHESTRATION_CATEGORY } from 'src/app/shared/api-endpoint.const';


@Injectable()
export class OrchestrationWorkflowCrudService {
  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private crudSvc: OrchestrationWorkflowCrudUtilsService) { }

  getMetadata(): Observable<OrchestrationWorkflowMetadata> {
    return this.http.get<OrchestrationWorkflowMetadata>(`/orchestration/workflows/get_metadata/`);
  }

  getTaskInputTemplates(): Observable<inputTemplateType[]> {
    return this.http.get<inputTemplateType[]>(`/orchestration/input_template/?page_size=0`);
  }

  getTaskCategories(): Observable<OrchestrationTaskCategoryType> {
    return this.http.get<OrchestrationTaskCategoryType>(ORCHESTRATION_CATEGORY());
  }

  getTasksByCategory(category: string): Observable<OrchestrationTaskType[]> {
    let params = new HttpParams().set('category', category).set('page_size', 0);
    return this.http.get<OrchestrationTaskType[]>('/orchestration/tasks/', { params: params });
  }

  getTaskParams(taskId: String): Observable<OrchestrationTaskParameters> {
    return this.http.get<OrchestrationTaskParameters>(`/orchestration/tasks/${taskId}/get_variable/`);
  }

  getWorkflowDetails(workflowId: string): Observable<UnityWorkflow> {
    // return this.http.get<UnityWorkflow>(GET_WORKFLOW_DETAILS());
    return this.http.get<UnityWorkflow>(`/orchestration/workflows/${workflowId}/`);
  }

  convertToViewData(d?: UnityWorkflow): UnityWorkflowViewData {
    let a = new UnityWorkflowViewData();
    if (d.uuid) {
      a.id = d.uuid;
    }
    a.workflow_name = d.workflow_name;
    a.description = d.description;
    a.category = d.category;
    a.target_type = d.target_type;
    if (d.cloud) {
      a.cloud = d.cloud;
    }

    let tasks: UnityWorkflowTask[] = [];
    let multiLevelTasks: Array<UnityWorkflowTasksViewData[]> = [];
    if (d.tasks && d.tasks.length) {
      d.tasks.forEach(t => {
        t.dependencies = t.dependencies.reduce(function (a, b) { if (a.indexOf(b) < 0) a.push(b); return a; }, []);
      })
      tasks = d.tasks;
      if (d.design_data && d.design_data.length) {
        d.design_data.forEach(params => {
          params.forEach(p => {
            p.dependencies = p.dependencies.reduce(function (a, b) { if (a.indexOf(b) < 0) a.push(b); return a; }, []);
            if (!p.uuid) {
              let task = tasks.find(tsk => tsk.name_id == p.name_id);
              if (task) {
                p.uuid = task.uuid;
              }
            }
          })
        })
        multiLevelTasks = d.design_data;
      }
    } else {
      tasks = this.crudSvc.getInitialWorkflowTasks();
      let insideTasks: UnityWorkflowTasksViewData[] = [];
      tasks.forEach(task => {
        let t = new UnityWorkflowTasksViewData();
        t.name = task.name;
        t.name_id = task.name_id;
        t.type = task.type;
        t.dependencies = task.dependencies;
        t.inputs = task.inputs;
        t.outputs = task.outputs;
        t.targets = this.getTaskTargets(_clone(tasks), _clone(task));
        insideTasks.push(t);
      })
      multiLevelTasks.push([].concat(insideTasks));
    }
    // console.log('tasks : ', _clone(tasks));
    // console.log('multiLevelTasks : ', _clone(multiLevelTasks));
    a.tasks = this.convertToTasksViewData(tasks);
    a.multiLevelTasks = _clone(multiLevelTasks);
    return a;
  }

  convertToTasksViewData(tasks: UnityWorkflowTask[]) {
    let insideTasks: UnityWorkflowTasksViewData[] = [];
    for (let k = 0; k < tasks.length; k++) {
      let t = new UnityWorkflowTasksViewData();
      t.name = tasks[k].name;
      t.name_id = tasks[k].name_id;
      t.type = tasks[k].type;
      if (tasks[k].uuid) {
        t.uuid = tasks[k].uuid;
      }
      if (tasks[k].task) {
        t.task = tasks[k].task;
      }
      if (tasks[k].category) {
        t.category = tasks[k].category;
      }
      if (tasks[k].target_type) {
        t.target_type = tasks[k].target_type;
      }
      // t.taskTypeIcon = this.crudSvc.getTaskTypeIcon(mlt);
      // t.taskImage = this.crudSvc.getTaskTargetImage(mlt.type);
      t.dependencies = tasks[k].dependencies;
      t.inputs = tasks[k].inputs;
      t.outputs = tasks[k].outputs;
      if (tasks[k].type == unityWorkflowTaskTypes.CONDITION) {
        t.conditions = tasks[k].config;
        tasks[k].config.map(inp => {
          t.targets.push(inp.execute);
        })
      } else {
        t.targets = this.getTaskTargets(_clone(tasks), _clone(tasks[k]));
      }
      insideTasks.push(t);
    }
    return insideTasks;
  }

  searchValue(arr, val) {
    // found another array
    if (arr instanceof Array) {
      for (var i = 0; i < arr.length; i++) {
        if (this.searchValue(arr[i], val)) {
          return true; // stop on first valid result
        }
      }
      return false;
    } else {
      // found a leaf
      return arr == val; // <-- if you want strict check, use ===
    }
  }

  getTaskTargets(tasks: UnityWorkflowTask[], currentTask: UnityWorkflowTask) {
    let targets: string[] = [];
    tasks?.map(t => {
      let tgt = t?.dependencies?.find(dp => dp == currentTask.name_id);
      if (tgt) {
        targets.push(t.name_id);
      }
    })
    return targets;
  }

  convertToIntegrationWidgetViewData(formData: any, prev: UnityWorkflowTasksViewData, next: UnityWorkflowTasksViewData) {
    let t = new UnityWorkflowTasksViewData();
    t.name = formData.name;
    let name = <string>formData.name;
    t.name_id = this.crudSvc.convertToNameId(name);
    t.type = 'Integration Task';
    t.task = formData.integration_type;
    t.taskTypeIcon = `fas fa-wrench`;
    t.taskImage = this.crudSvc.getTaskTargetImage('bmc-helix');
    t.dependencies = [prev?.name_id];
    t.targets = [next?.name_id];
    t.inputs = [];
    t.outputs = [];
    return t;
  }

  convertToWorkflowWidgetViewData(formData: any, prev: UnityWorkflowTasksViewData, next: UnityWorkflowTasksViewData) {
    let t = new UnityWorkflowTasksViewData();
    t.name = formData.name;
    let name = <string>formData.name;
    t.name_id = this.crudSvc.convertToNameId(name);
    t.type = 'Workflow Task';
    t.task = formData.integration_type;
    t.taskTypeIcon = `fas fa-wrench`;
    t.taskImage = this.crudSvc.getTaskTargetImage('bmc-helix');
    t.dependencies = [prev?.name_id];
    t.targets = [next?.name_id];
    t.inputs = [];
    t.outputs = [];
    return t;
  }

  convertToTaskWidgetViewData(formData: UnityWorkflowTaskFormData, prev?: UnityWorkflowTasksViewData, next?: UnityWorkflowTasksViewData) {
    // console.log('form data : ', formData);
    let t = new UnityWorkflowTasksViewData();
    t.task = formData.task.uuid;
    t.name = formData.task.name;
    t.name_id = this.crudSvc.convertToNameId(formData.task.name);
    t.type = formData.task.playbook_type;
    if (formData.task.category) {
      t.category = formData.task.category;
    }
    if (formData.task.target_type) {
      t.target_type = formData.task.target_type;
    }
    t.category = formData.task.category;
    t.target_type = formData.task.target_type;
    t.taskTypeIcon = `fas fa-clipboard-check`;
    t.taskImage = this.crudSvc.getTaskTargetImage(formData.task.playbook_type);
    t.dependencies = prev ? [prev?.name_id] : [];
    t.targets = next ? [next?.name_id] : [];
    t.inputs = formData.task.inputs ? formData.task.inputs : [];
    // console.log('t : ', t);
    return t;
  }

  convertToTaskWidgetInputsViewData(task: UnityWorkflowTasksViewData) {
    let taskInputs = task.inputs;
    let inputs: any[];
    if (taskInputs) {
      if (taskInputs instanceof Array) {
        taskInputs.forEach(p => {
          let obj = {
            "name": p.param_name,
            "value": "${params.param_name}"
          }
          inputs.push(obj);
        })
      } else if ((typeof taskInputs == 'object') && taskInputs.arguments) {
        let obj = {
          "name": taskInputs.arguments,
          "value": "${params.arguments}"
        }
        inputs.push(obj);
      }
    }
    // let inputForm = this.crudSvc.buildTaskInputForm(_clone(t));
  }

  convertToConditionWidgetViewData(formData: any, prev: UnityWorkflowTasksViewData, next: UnityWorkflowTasksViewData) {
    let t = new UnityWorkflowTasksViewData();
    t.name = formData.name;
    t.name_id = `task_${this.crudSvc.convertToNameId(formData.name)}`;
    t.type = 'Condition Task';
    t.dependencies = prev ? [prev?.name_id] : [];
    t.inputs = [];
    t.outputs = [];
    for (let i = 0; i < formData.conditions.length; i++) {
      let cdn = formData.conditions[i];
      let exp = cdn.output_parameter ? `${cdn.source_task}.outputs.${cdn.output_parameter}` : `${cdn.source_task}.outputs`;
      let condition = {
        "expression": { "key": '${task.' + exp + '}', "operator": `${cdn.operator}`, "value": `${cdn.value}` },
        "execute": cdn.target_task
      }
      t.conditions.push(condition);
    }
    t.conditions.forEach((cd, index) => {
      t.targets.push(cd.execute ? cd.execute : null);
    })
    return t;
  }

  saveWorkFlow(obj: UnityWorkflowViewData, workflowId?: string): Observable<CeleryTask> {
    // let obj = _clone(workflow);
    // obj.tasks = [].concat(...obj.multiLevelTasks);
    // delete obj.multiLevelTasks;
    obj.multiLevelTasks.forEach(mlt => {
      mlt.forEach(t => {
        delete t.inputForm;
        delete t.outputForm;
      })
    })

    obj.design_data = _clone(obj.multiLevelTasks);

    if (obj.tasks && obj.tasks.length) {
      // obj.tasks[obj.tasks.length - 1]?.dependencies.push(obj.tasks[obj.tasks.length - 2]?.name_id);
      obj.tasks.forEach(t => {
        delete t.inputForm;
        delete t.outputForm;
        t.dependencies = t.dependencies.reduce(function (a, b) {
          if (b != t.name_id && a.indexOf(b) < 0) a.push(b); return a;
        }, []);
        if (t.type == unityWorkflowTaskTypes.CONDITION) {
          t.config = t.conditions;
        }
      })
    }

    if (obj.multiLevelTasks) {
      delete obj.multiLevelTasks;
    }

    let url = '';
    if (workflowId) {
      url = `/orchestration/workflows/${workflowId}/`;
      return this.http.put<CeleryTask>(url, obj);
    } else {
      url = '/orchestration/workflows/';
      return this.http.post<CeleryTask>(url, obj);
    }

    // return this.http.post<CeleryTask>(url, obj);
    // return this.http.post<CeleryTask>(url, obj)
    //   .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }

  pollByTaskId(taskId: string): Observable<TaskStatus> {
    return this.appService.pollForTask(taskId, 2, 100)
      .pipe(switchMap(res => this.appService.pollForTask(taskId, 2, 100).pipe(take(1))), take(1));
  }

  convertToEntityTaskRelation(workflowId: string, workflowName: string, taskId: string): EntityTaskRelation {
    return { entityId: workflowId, entityName: workflowName, taskId: taskId };
  }
}

export class UnityWorkflowViewData {
  id?: string;
  workflow_name: string;
  description?: string;
  category?: string;
  target_type?: string;
  cloud?: string;
  tasks: UnityWorkflowTasksViewData[] = [];
  multiLevelTasks?: Array<UnityWorkflowTasksViewData[]> = [];
  parameters?: any;
  design_data?: any;
  isInProgress: boolean = false;
  name: string;
}

export class UnityWorkflowTasksViewData {
  name: string;
  uuid: string
  type: string;
  name_id: string;
  category?: string;
  target_type?: string;
  task?: string;
  taskTypeIcon?: string;
  taskImage?: string;
  inputs?: any;
  inputForm: FormGroup;
  outputs?: any[] = [];
  outputForm: FormGroup;
  config?: UnityWorkflowTaskConditionViewData[] = [];
  conditions?: UnityWorkflowTaskConditionViewData[] = [];
  dependencies?: string[];
  leaderLines?: any[] = [];
  targets?: string[] = [];
  execution_status?: string;
}

export class UnityWorkflowTaskInputViewData {
  name: string;
  value: string;
}

export class UnityWorkflowTaskOutputViewData {
  name: string;
}

export class UnityWorkflowTaskConditionViewData {
  expression: { "key": string, "operator": string, "value": string };
  execute: string;
}

export interface UnityWorkflowTaskFormData {
  task_category: string;
  task: OrchestrationTaskType;
}


export enum unityWorkflowTaskTypes {
  START = 'Start Task',
  INTEGRATION = 'Integration Task',
  CONDITION = 'Condition Task',
  WORKFLOW = 'Workflow',
  TASK = 'Task',
  ANSIBLE = 'Ansible Playbook',
  TERRAFORM = 'Terraform Script',
  BASH = 'Bash Script',
  POWERSHELL = 'Powershell Script',
  PYTHON = 'Python Script',
  REST_API = 'Rest API',
  END = 'End Task',
  SWITCH = 'Switch Case',
  IF = 'If Else',
  EMAIL = 'Email',
  SOURCE = 'Source Task',
  LLM = 'LLM',
  CHART = 'Chart'
}
