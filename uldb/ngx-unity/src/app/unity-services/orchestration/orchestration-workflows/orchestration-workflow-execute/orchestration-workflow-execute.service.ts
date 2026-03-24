import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { ExecutionTask } from '../orchestration-workflows-on-chat/orchestration-workflows-on-chat.type';
import { switchMap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class OrchestrationWorkflowExecuteService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService) { }

  // getManualTriggerDetails(workflowUuid: string): Observable<any> {
  //   return this.http.get<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/manual/`)
  // }

  // sendManualTriggerDetails(workflowUuid: string, data: any): Observable<any> {
  //   return this.http.post<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/manual/`, data)
  // }

  getAllCloud(): Observable<any> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<any>(`customer/cloud_fast/`, { params: param });
  }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: param });
  }

  getHost(search: string): Observable<any> {
    let params = new HttpParams().set('page_size', 0).set('search', search);
    return this.http.get<any>(`customer/advanced_search_fast/`, { params: params });
  }

  getUnityOneITSMData(tableId: string): Observable<any> {
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableId}/records/`);
  }

  getCommentActivity(tableId: string, recordUuid: string, activityType: string): Observable<any> {
    let params = new HttpParams().set('page_size', 0).set('activity_type', activityType);
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableId}/records/${recordUuid}/activity/`, { params: params });
  }

  getExecutionId(req, workflowId): Observable<any> {
    // return this.http.post<any>(`/rest/orchestration/agentic_workflow/${workflowId}/chat/`, req);
    return this.http.post<ExecutionTask>(`/rest/orchestration/agentic_workflow_preview/`, req).pipe(
      switchMap(res => this.appService.pollForAgenticWfExecute(workflowId, 2))
    );
  }

  getAIMLData(page: number, pageSize: number, obj: any): Observable<any> {
    const params = {
      page: page,
      page_size: pageSize
    };

    return this.http.post<any>(`/rest/orchestration/aiml/search/`, obj, { params });
  }

  buildManualTriggerForm(param: any): FormGroup {
    console.log(param, "param")
    const form = this.builder.group({
      inputs: this.builder.array([]),
    });
    const resolvedInputs =
      Array.isArray(param?.inputs) && param.inputs.length > 0
        ? param.inputs
        : Array.isArray(param?.triggerForm?.inputs)
          ? param.triggerForm.inputs
          : [];

    resolvedInputs.forEach((p: any) => {
      const defaultValueGroup = this.builder.group({
        default_value: [p.default_value || '', Validators.required],
        param_name: [p.param_name || ''],
        param_type: [p.param_type || 'Text'],
      });
      (form.get('inputs') as FormArray).push(defaultValueGroup);
    });
    return form;
  }

  resetManualFormErrors() {
    return {
      'inputs': {}
    }
  }

  manualFormValidationMessages = {
    'inputs': {
      'default_value': 'Default Value is required'
    }
  }

  buildScheduleTriggerForm(param: any): FormGroup {
    const form = this.builder.group({
      inputs: this.builder.array([]),
    });
    if (Array.isArray(param.inputs) && param.inputs.length > 0) {
      (param.inputs as any[]).forEach(p => {
        const defaultValueGroup = this.builder.group({
          default_value: [p.default_value || "", Validators.required],
          param_name: [p.param_name || ""],
          param_type: [p.param_type || "Text"],
        });
        (form.get('inputs') as FormArray).push(defaultValueGroup);
      });
    }
    return form;
  }

  resetScheduleFormErrors() {
    return {
      'inputs': {}
    }
  }

  scheduleFormValidationMessages = {
    'inputs': {
      'default_value': 'Default Value is required'
    }
  }

  buildWebhookTriggerForm(param: any): FormGroup {
    let form = this.builder.group({
      // 'webhook_url': [{ value: param.config.webhook_url, disabled: true }],
      'payload': [JSON.stringify(param.config.payload, null, 2), [Validators.required, JsonValidator]]
    });
    return form;
  }

  resetWebhookFormErrors() {
    return {
      'payload': ''
    }
  }

  webhookFormValidationMessages = {
    'payload': {
      'required': 'Payload is required',
      'invalidJson': 'Please enter a valid JSON'
    }
  }

  buildITSMTriggerForm(param: any): FormGroup {
    console.log(param, "param")
    let form = this.builder.group({
      'record_uuid': ['', [Validators.required]],
      'activity_id': ['', [Validators.required]]
    });
    return form;
  }

  resetITSMFormErrors() {
    return {
      'record_uuid': '',
      'activity_id': ''
    }
  }

  itsmFormValidationMessages = {
    'record_uuid': {
      'required': 'Ticket Record is required',
    },
    'activity_id': {
      'required': 'Event is required',
    }
  }

  buildAIMLTriggerForm(param: any): FormGroup {
    console.log(param, "param")
    let form = this.builder.group({
      'id': ['', [Validators.required]]
    });
    return form;
  }

  resetAIMLFormErrors() {
    return {
      'id': ''
    }
  }

  aimlFormValidationMessages = {
    'id': {
      'required': 'Event is required',
    }
  }
}

export interface OnChatExecution {
  chat_response: string;
  status: "Running" | "Success" | "Failed";
}

export function JsonValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'object') {
    return null;
  }
  try {
    JSON.parse(value);
    return null;
  } catch {
    return { invalidJson: true };
  }
}

