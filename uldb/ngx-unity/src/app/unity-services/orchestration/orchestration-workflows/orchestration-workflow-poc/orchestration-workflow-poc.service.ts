import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { OrchestrationWorkflowCrudUtilsService } from '../orchestration-workflow-crud/orchestration-workflow-crud.utils.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { playbookTypes, TaskViewData } from '../../orchestration-tasks/orchestration-tasks.service';
import { cloneDeep as _clone } from 'lodash-es';
import { CeleryTask, EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { UnityWorkflow } from '../orchestration-workflows.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CategoryData, CategoryViewData, InputParamsType, OrchestrationWorkflowMetadata, SourceCategoryViewData, SourceTaskDetailsViewData, TaskDetailsModel, TaskDetailsViewData, UnityWorkflowViewData } from './orchestration-workflow-poc.type';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationWorkflowPocService {

  constructor(
    private tableService: TableApiServiceService,
    private crudSvc: OrchestrationWorkflowCrudUtilsService,
    private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService
  ) { }


  // ************ Left Side Panel Supporting Code Start *********** //
  /*
   - Below method calls the API to get Tasks by Category.
  */
  getData(criteria: SearchCriteria): Observable<CategoryData[]> {
    return this.tableService.getData<CategoryData[]>('orchestration/tasks/by_category/', criteria);
  }

  /*
    - This method is used to convert the category data to UI format.
  */
  convertToViewData(data: CategoryData[]): CategoryViewData[] {
    let categoryViewData: CategoryViewData[] = [];
    data.forEach(cat => {
      let c = new CategoryViewData();
      let taskViewData: TaskDetailsViewData[] = [];
      cat.tasks.forEach(task => {
        let t = new TaskDetailsViewData()
        t.taskName = task.name;
        t.image = this.crudSvc.getTaskTargetImage(task.playbook_type);
        t.taskUuid = task.uuid;
        t.playbookType = task.playbook_type;
        taskViewData.push(t);
      });
      c.category = cat.category;
      c.tasks = _clone(taskViewData);
      categoryViewData.push(c);
    });
    return categoryViewData;
  }
  // ************ Left Side Panel Supporting Code End *********** //



  // ********* Input Templates Supporting Code Start ************ //
  getTaskInputTemplates(): Observable<inputTemplateType[]> {
    return this.http.get<inputTemplateType[]>(`/orchestration/input_template/?page_size=0`);
  }
  getTemplatesByTaskId(taskId: string) {
    return this.http.get<TaskDetailsModel>(`/orchestration/tasks/${taskId}/get_variable/`);
  }
  // ********* Input Templates Supporting Code Start ************ //

  //********************************************* Drawflow Plot Start ***************************************************//
  getMetadata(): Observable<OrchestrationWorkflowMetadata> {
    return this.http.get<OrchestrationWorkflowMetadata>(`/orchestration/workflows/get_metadata/`);
  }
  //********************************************* Drawflow Plot End ***************************************************//


  //********************************************* Task Right Panel Start ***************************************************//
  buildSelectedTaskForm(selectedTask, uniqueId) {
    return this.builder.group({
      task_name: [selectedTask.task_name ? selectedTask.task_name : selectedTask.name],
      inputs: selectedTask.inputs ? this.builder.array(selectedTask.inputs?.map(input => this.createParamGroup(input))) : [],
      outputs: [selectedTask.output ? selectedTask.output.join(',') : ''],
      triggerRule: [selectedTask.trigger_rule ? selectedTask.trigger_rule : 'all_success'],
      timeouts: [selectedTask.timeout ? selectedTask.timeout : 3600],
      retries: [selectedTask.retries ? selectedTask.retries : 0],
      name_id: [uniqueId]
    });
  }

  createParamGroup(input: InputParamsType) {
    return this.builder.group({
      param_name: [input.param_name || ''],
      param_type: [input.param_type || ''],
      template_name: [{ value: input.param_type === 'Input Template' ? input.template_name : '', disabled: true }],
      template: [input.param_type === 'Input Template' ? input.template : ''],
      default_value: [input.default_value ? (input.param_type === 'List' || input.param_type === 'Dictionary') ? JSON.stringify(input.default_value) : input.default_value : ''],
      attribute: [{ value: input.attribute ? input.attribute : '', disabled: true }]
    })
  }

  getInputs(form: FormGroup): FormArray {
    return form.get('inputs') as FormArray;
  }
  //********************************************* Task Right Panel End ***************************************************//


  saveWorkFlow(obj: UnityWorkflowViewData, workflowId?: string): Observable<CeleryTask> {
    let url = '';
    if (workflowId) {
      url = `/orchestration/workflows/${workflowId}/`;
      return this.http.put<CeleryTask>(url, obj);
    } else {
      url = '/orchestration/workflows/';
      return this.http.post<CeleryTask>(url, obj);
    }
  }

  pollByTaskId(taskId: string): Observable<TaskStatus> {
    return this.appService.pollForTask(taskId, 2, 100)
      .pipe(switchMap(res => this.appService.pollForTask(taskId, 2, 100).pipe(take(1))), take(1));
  }

  getWorkflowDetails(workflowId: string): Observable<UnityWorkflow> {
    // return this.http.get<UnityWorkflow>(GET_WORKFLOW_DETAILS());
    return this.http.get<UnityWorkflow>(`/orchestration/workflows/${workflowId}/`);
  }


  convertToEntityTaskRelation(workflowId: string, workflowName: string, taskId: string): EntityTaskRelation {
    return { entityId: workflowId, entityName: workflowName, taskId: taskId };
  }


  convertToWorkflowPopupViewData(d?: any): UnityWorkflowViewData {
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
    return a;
  }

  buildWorkflowDetailsForm(d: any): FormGroup {
    if (d) {
      let form = this.builder.group({
        'workflow_name': [d.workflow_name, [Validators.required]],
        'description': [d.description ? d.description : ''],
        'category': [d.category, [Validators.required]],
        'target_type': [d.target_type, [Validators.required]],
      })
      if (d.target_type == 'Cloud') {
        form.addControl('cloud', new FormControl(d.cloud ? d.cloud : '', [Validators.required]));
      }
      return form;
    } else {
      return this.builder.group({
        'workflow_name': ['', [Validators.required]],
        'description': [''],
        'category': ['', [Validators.required]],
        'target_type': ['', [Validators.required]],
      })
    }
  }

  resetWorkflowDetailsFormErrors() {
    return {
      'workflow_name': '',
      'category': '',
      'target_type': '',
      'cloud': ''
    }
  }

  workflowDetailsFormValidationMessages = {
    'workflow_name': {
      'required': 'Name is required'
    },
    'category': {
      'required': 'Category is required'
    },
    'target_type': {
      'required': 'Target Type is required'
    },
    'cloud': {
      'required': 'Cloud Type is required'
    }
  }


  buildIfElseForm(selectedCondition, conditionId) {
    return this.builder.group({
      name: [(selectedCondition?.name && selectedCondition?.data?.condition !== 'Switch Case') ? selectedCondition?.name : 'If Else'],
      name_id: [conditionId],
      operator: [selectedCondition?.config[0]?.expression.operator ? selectedCondition?.config[0]?.expression.operator : ''],
      updatedValue: [selectedCondition?.config[0]?.expression.value ? selectedCondition?.config[0]?.expression.value : ''],
      executeIf: [{ value: Array.isArray(selectedCondition?.config) ? selectedCondition?.config[0]?.execute_if : selectedCondition?.config?.next_if ? selectedCondition?.config?.next_if : '', disabled: true }],
      executeElse: [{ value: Array.isArray(selectedCondition?.config) ? selectedCondition?.config[0]?.execute_else : selectedCondition?.config?.next_else ? selectedCondition?.config?.next_else : '', disabled: true }],
      ifKey: [selectedCondition?.config[0]?.expression.key ? selectedCondition?.config[0]?.expression.key : '']
    })
  }

  buildEmailForm(selectedOutput, outputId) {
    return this.builder.group({
      name: [selectedOutput?.name ? selectedOutput?.name : 'Email'],
      name_id: [outputId],
      to: [selectedOutput?.config ? selectedOutput?.config[0]?.to : ''],
      subject: [selectedOutput?.config ? selectedOutput?.config[0]?.subject : ''],
      body: [selectedOutput?.config ? selectedOutput?.config[0]?.body : ''],
      timeouts: [selectedOutput?.timeout ? selectedOutput?.timeout : 3600],
      retries: [selectedOutput?.retries ? selectedOutput?.retries : 0],
      triggerRule: [selectedOutput?.trigger_rule ? selectedOutput?.trigger_rule : 'all_success'],
    })
  }

  buildLLMForm(selectedLLM, llmId) {
    return this.builder.group({
      name: [selectedLLM?.name ? selectedLLM?.name : 'LLM'],
      name_id: [llmId],
      // system_prompt: [selectedLLM?.config[0]?.body ? selectedLLM?.config[0]?.body : ''],
      user_prompt: [selectedLLM?.config ? selectedLLM?.config[0]?.user_prompt ? selectedLLM?.config[0]?.user_prompt : '' : ''],
      output_type: [selectedLLM?.config ? selectedLLM?.config[0]?.output_type ? selectedLLM?.config[0]?.output_type : 'Text' : ''],
      outputs: this.builder.array(
        (selectedLLM?.outputs?.length
          ? selectedLLM.outputs
          : [{}] // fallback to one empty object
        ).map(output => this.createOutputParamGroup(output))
      ),
      timeouts: [selectedLLM?.timeout ? selectedLLM?.timeout : 3600],
      retries: [selectedLLM?.retries ? selectedLLM?.retries : 0]
    })
  }
  buildChartForm(selectedOutput, outputId) {
    return this.builder.group({
      name: [selectedOutput?.name ? selectedOutput?.name : 'Chart'],
      name_id: [outputId],
      chart_type: [selectedOutput?.chart_type ? selectedOutput?.chart_type : 'Pie'],
      x_label: [selectedOutput?.config ? selectedOutput?.config[0]?.x_label ? selectedOutput?.config[0]?.x_label : '' : ''],
      y_label: [selectedOutput?.config ? selectedOutput?.config[0]?.y_label ? selectedOutput?.config[0]?.y_label : '' : ''],
      x_values: [selectedOutput?.config ? selectedOutput?.config[0]?.x_values ? selectedOutput?.config[0]?.x_values : '' : ''],
      y_values: [selectedOutput?.config ? selectedOutput?.config[0]?.y_values ? selectedOutput?.config[0]?.y_values : '' : ''],
      timeouts: [selectedOutput?.timeout ? selectedOutput?.timeout : 3600],
      retries: [selectedOutput?.retries ? selectedOutput?.retries : 0],
    })
  }

  createConditionArray() {
    return this.builder.group({
      task: [''],
      output: [''],
      operator: [''],
      updatedValue: [''],
      execute: ['']
    })
  }

  buildSwitchForm(selectedCondition, conditionId) {
    const switchConditionsArray = this.builder.array([]);

    if (selectedCondition) {
      selectedCondition?.config?.forEach(cfg => {
        switchConditionsArray.push(this.builder.group({
          switchKey: this.builder.control(cfg?.expression?.key || ''),
          operator: this.builder.control(cfg?.expression?.operator || ''),
          updatedValue: this.builder.control(cfg?.expression?.value || ''),
          execute: this.builder.control({ value: cfg?.execute || cfg?.next || '', disabled: true })
        }));
      });
    } else {
      switchConditionsArray.push(this.builder.group({
        switchKey: this.builder.control(''),
        operator: this.builder.control(''),
        updatedValue: this.builder.control(''),
        execute: this.builder.control({ value: '', disabled: true })
      }));
    }

    return this.builder.group({
      name: this.builder.control(selectedCondition?.name || 'Switch Case', { validators: [Validators.required] }),
      name_id: this.builder.control(conditionId),
      switchConditions: switchConditionsArray
    });
  }


  buildWorkflowParamForm(d?: any): FormGroup {
    const workflowDetailsForm = this.buildWorkflowDetailsForm(d);
    return this.builder.group({
      ...workflowDetailsForm.controls,
      parameters: this.builder.array(
        d?.parameters?.map(input => this.getParameterForm(input)) || [this.getParameterForm()]
      )
    })
  }

  getParameterForm(param?: InputParamsType) {
    if (param) {
      let group = this.builder.group({
        "param_name": [param.param_name, [Validators.required]],
        "param_type": [param.param_type, [Validators.required]],
        // "is_visible": [param.is_visible, [Validators.required]]
      });
      if (param.param_type == 'Input Template') {
        group.addControl('template', new FormControl(param.template, [Validators.required]));
        group.addControl('attribute', new FormControl(param.attribute, [Validators.required]));
      } else {
        group.addControl('default_value', new FormControl(param.default_value, [validateDefaultValue]));
      }
      return group;
    } else {
      // Create a blank group
      let group = this.builder.group({
        "param_name": ['', [Validators.required]],
        "param_type": ['', [Validators.required]],
        "template": ['', [Validators.required]],
        "attribute": ['', [Validators.required]],
        "default_value": ['', [Validators.required]],
        // "is_visible": ['', [Validators.required]]
      });
      return group;
    }
  }

  buildAssistantForm() {
    return this.builder.group({
      'chat': ['']
    });
  }


  workFlowParamFormValidationMessages = {
    'parameters': {
      'param_name': {
        'required': 'Name is required'
      },
      'param_type': {
        'required': 'Type is required'
      },
      'default_value': {
        'invalidNumberValue': 'Value should be a number',
        'invalidBooleanValue': 'Value should be true or false'
      },
      'template': {
        'required': 'Template is required'
      },
      'attribute': {
        'required': 'Attribute is required'
      },
    },
  }

  getParameterErrors() {
    return {
      'param_name': '',
      'param_type': '',
      'default_value': '',
      'template': '',
      'attribute': '',
    }
  }

  //********************************************* Source Task Start ***************************************************//
  getSourcetaskByCategory(): Observable<CategoryData[]> {
    return this.http.get<CategoryData[]>('/orchestration/source_tasks/by_category/');
  }

  getSourceTaskDetails(uuid) {
    return this.http.get<TaskDetailsModel>(`/orchestration/source_tasks/${uuid}/`);
  }

  convertToSourceTaskViewData(data: CategoryData[]): SourceCategoryViewData[] {
    let sourceCategoryViewData: SourceCategoryViewData[] = [];
    data.forEach(cat => {
      let c = new SourceCategoryViewData();
      let sourceTaskViewData: SourceTaskDetailsViewData[] = [];
      cat.tasks.forEach(task => {
        let t = new SourceTaskDetailsViewData()
        t.taskName = task.name;
        t.icon = 'fas fa-sign-in-alt';
        t.taskUuid = task.uuid;
        sourceTaskViewData.push(t);
      });
      c.category = cat.category;
      c.tasks = _clone(sourceTaskViewData);
      sourceCategoryViewData.push(c);
    });
    return sourceCategoryViewData;
  }


  buildSelectedSourceTaskForm(selectedSourceTask, uniqueId) {
    return this.builder.group({
      task_name: [selectedSourceTask.name],
      inputs: selectedSourceTask.inputs ? this.builder.array(selectedSourceTask.inputs?.map(input => this.createParamGroup(input))) : [],
      outputs: selectedSourceTask.outputs ? this.builder.array(selectedSourceTask.outputs?.map(output => this.createOutputParamGroup(output))) : [],
      triggerRule: [selectedSourceTask.trigger_rule ? selectedSourceTask.trigger_rule : 'all_success'],
      timeouts: [selectedSourceTask.timeout ? selectedSourceTask.timeout : 3600],
      retries: [selectedSourceTask.retries ? selectedSourceTask.retries : 0],
      name_id: [uniqueId]
    });
  }

  createOutputParamGroup(output: InputParamsType) {
    return this.builder.group({
      param_name: [output.param_name || ''],
    })
  }
  //********************************************* Source Task End ***************************************************//

  getLLMResponse(body): Observable<any> {
    return this.http.post<any>(`/rest/orchestration/workflow_assistant/`, body);
  }

  callApisForTasks(tasks) {
    const calls = tasks
      .filter(task => task.uuid)
      .map(task => {
        let url = '';
        if (Object.values(playbookTypes).includes(task.type)) {
          url = `/orchestration/tasks/${task.uuid}/get_variable/`;
        }
        if (task.type === 'Source Task') {
          url = `/orchestration/source_tasks/${task.uuid}/`;
        }
        return this.http.get(url);
      });

    return forkJoin(calls);
  }
}

export const scriptParamDataTypes: string[] = [
  "String", "Number", "Boolean", "Input Template"
];

export function validateDefaultValue(control: AbstractControl): ValidationErrors | null {
  const paramTypeControl = control.parent?.get('param_type');
  if (!paramTypeControl) {
    return null;
  }
  const paramType = paramTypeControl.value;
  const defaultValue = control.value;

  if (paramType === 'Number') {
    const numberValue = Number(defaultValue);
    if (isNaN(numberValue)) {
      return { invalidNumberValue: true };
    }
  } else if (paramType === 'Boolean') {
    if (defaultValue.toLowerCase() !== 'true' && defaultValue.toLowerCase() !== 'false') {
      return { invalidBooleanValue: true };
    }
  } else {
    return null;
  }
}

