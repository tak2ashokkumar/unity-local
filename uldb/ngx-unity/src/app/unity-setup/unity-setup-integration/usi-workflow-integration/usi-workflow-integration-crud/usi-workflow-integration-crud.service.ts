import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsiWorkflowIntegrationCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addWorkflow(obj: any): Observable<any> {
    return this.http.post<any>(`customer/workflow/integration/`, obj)
  }

  updateWorkflow(obj: any, workFlowId: string): Observable<any> {
    return this.http.put<any>(`customer/workflow/integration/${workFlowId}/`, obj)
  }

  getWorkflowDetails(workFlowId: string): Observable<any> {
    return this.http.get<any>(`customer/workflow/integration/${workFlowId}/`)
  }

  getWorkflowList(): Observable<any[]> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<any>(`/orchestration/workflows_fast/`, { params: param })
  }

  getTaskList(): Observable<any[]> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<any[]>(`/orchestration/tasks_fast/`, { params: param })
  }

  getTaskParameter(TaskId: string): Observable<any> {
    return this.http.get<any>(`/orchestration/tasks/${TaskId}/get_inputs/`)
  }

  getWorkflowParameter(WorkflowId: string): Observable<any> {
    return this.http.get<any>(`/orchestration/workflows/${WorkflowId}/get_inputs/`)
  }

  buildWorkflowForm(workFlowDetails: any): FormGroup {
    if (workFlowDetails) {
      let form = this.builder.group({
        'name': [workFlowDetails.name, [Validators.required, NoWhitespaceValidator]],
        'category': [workFlowDetails.category, [Validators.required, NoWhitespaceValidator]],
        'task_type': [workFlowDetails.task_type, [Validators.required]],
        'external_id_field': [workFlowDetails.external_id_field],
        'parameter_maps': this.builder.array([]),
        'webhook_url': [workFlowDetails.webhook_url],
        'enabled': [workFlowDetails.enabled, [Validators.required]]
      });
      return form;
    }
    let form = this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'category': ['', [Validators.required, NoWhitespaceValidator]],
      'task_type': ['', [Validators.required]],
      'external_id_field': [''],
      // 'parameter_maps': ['', [Validators.required, jsonValidator, NoWhitespaceValidator]],
      'parameter_maps': this.builder.array([]),
      'webhook_url': [''],
      'enabled': [true, [Validators.required]]
    });
    return form;
  }

  resetWorkflowFormErrors(addParameterMaps?: boolean) {
    const errors = {
      'name': '',
      'category': '',
      'task_type': '',
      'external_id_field': '',
      'webhook_url': '',
      'enabled': '',
      'task': '',
      'workflow': '',
    };
    if (addParameterMaps) {
      errors['parameter_maps'] = [];
    }
    return errors;
  }

  workFlowValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'category': {
      'required': 'Category is required'
    },
    'task_type': {
      'required': 'Type is required'
    },
    'task': {
      'required': 'Task is required'
    },
    'workflow': {
      'required': 'Workflow is required'
    },
    'parameter_maps': {
      'param_name': 'Param Name is required',
      'request_attribute': 'Request Attribute is required',
      'mapping_type': 'Mapping Type is required',
      'conditions': {
        'condition_operator': 'Conditional Operator is required',
        'condition_value': 'Conditional value is required',
        'result_type': 'Output Type is required',
        'result_value': 'Output is required',
      }
    },
    'enabled': {
      'required': 'Status is required'
    }
  }

  prameterMapsFormErrors() {
    return {
      'param_name': '',
      'request_attribute': '',
      'mapping_type': '',
      'default_value': '',
      'conditions': []
    }
  }

  getConditionsFormErrors() {
    return {
      'condition_operator': '',
      'condition_value': '',
      'result_type': '',
      'result_value': '',
    }
  }

  createParameterMaps(inputs: any[]): FormArray {
    return this.builder.array(
      inputs.map((input) => {
        const paramGroup = this.builder.group({
          param_name: [input.param_name || '', Validators.required],
          request_attribute: [input.request_attribute || '', Validators.required],
          mapping_type: [input.mapping_type || 'SIMPLE'],
          default_value: [input.default_value || ''],
        });
        if (input.mapping_type === 'CONDITIONAL') {
          paramGroup.addControl('conditions', this.createConditions(input.conditions || []));
        }
        return paramGroup;
      })
    );
  }

  createConditions(conditions: any[]): FormArray {
    return this.builder.array(
      conditions.map((condition) =>
        this.builder.group({
          condition_operator: [condition.condition_operator || '', Validators.required],
          condition_value: [condition.condition_value || '', Validators.required],
          result_type: [condition.result_type || '', Validators.required],
          result_value: [condition.result_value || '', Validators.required],
        })
      )
    );
  }
}

export const CONDITIONAL_OPERATOR: ConditionalOperator[] = [
  { value: 'EQUALS', label: '=' },
  { value: 'NOT_EQUALS', label: '!=' },
  { value: 'GT', label: '>' },
  { value: 'LT', label: '<' },
  { value: 'GTE', label: '>=' },
  { value: 'LTE', label: '<=' },
  { value: 'CONTAINS', label: 'Contains' },
  { value: 'NOT_CONTAINS', label: 'Not Contains' },
  { value: 'STARTS_WITH', label: 'Starts With' },
  { value: 'ENDS_WITH', label: 'Ends With' },
  { value: 'REGEX_MATCH', label: 'Regex Match' },
  { value: 'REGEX_NOT_MATCH', label: 'Regex Not Match' },
];

export const OUTPUT_TYPE: OutputType[] = [
  { value: 'STRING', label: 'String' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
  { value: 'TASK', label: 'Task' },
  { value: 'WORKFLOW', label: 'Workflow' }
];

export interface ConditionalOperator {
  value: string;
  label: string;
}

export interface OutputType {
  value: string;
  label: string;
}

