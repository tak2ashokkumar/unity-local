import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';

@Injectable({
  providedIn: 'root'
})
export class WfDynamicListExecuteService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getDynamicWorkflowDetails(workflowUuid: string): Observable<any> {
    return this.http.get<any>(`api/orchestration/v1/dynamic_workflows/${workflowUuid}/`);
  }

  executeDynamicWorkflow(data: any): Observable<any> {
    return this.http.post<any>(`api/orchestration/v1/dynamic_workflows/`, data);
  }

  getTriggerDetails(workflowUuid: string, nodeType: string): Observable<any> {
    if (nodeType === 'Schedule Trigger') {
      return this.http.get<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/schedule/`);
    }

    return this.http.get<any>(`api/orchestration/v1/dynamic_workflows/${workflowUuid}/execute/`, {
      params: { node_type: nodeType }
    });
  }

  sendTriggerDetails(workflowUuid: string, nodeType: string, data: any): Observable<any> {
    if (nodeType === 'Schedule Trigger') {
      return this.http.post<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/schedule/`, data);
    }

    return this.http.post<any>(`api/orchestration/v1/dynamic_workflows/${workflowUuid}/execute/`, data, {
      params: { node_type: nodeType }
    });
  }

  getAllCloud(): Observable<any> {
    const params = new HttpParams().set('page_size', 0);
    return this.http.get<any>(`customer/cloud_fast/`, { params });
  }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    const params = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params });
  }

  getHost(search: string): Observable<any> {
    const params = new HttpParams().set('page_size', 0).set('search', search);
    return this.http.get<any>(`customer/advanced_search_fast/`, { params });
  }

  getUnityOneITSMData(tableId: string): Observable<any> {
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableId}/records/`);
  }

  getCommentActivity(tableId: string, recordUuid: string, activityType: string): Observable<any> {
    const params = new HttpParams().set('page_size', 0).set('activity_type', activityType);
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableId}/records/${recordUuid}/activity/`, { params });
  }

  getAIMLData(page: number, pageSize: number, data: any): Observable<any> {
    const params = {
      page,
      page_size: pageSize
    };

    return this.http.post<any>(`/rest/orchestration/aiml/search/`, data, { params });
  }

  buildManualTriggerForm(param: any): FormGroup {
    return this.createInputsForm(this.resolveInputs(param));
  }

  buildScheduleTriggerForm(param: any): FormGroup {
    return this.createInputsForm(this.resolveInputs(param));
  }

  buildWebhookTriggerForm(param: any): FormGroup {
    const config = this.resolveConfig(param);
    const payload = param?.payload ?? config?.payload ?? {};
    const webhookUrl = param?.webhook_url ?? param?.url ?? config?.webhook_url ?? config?.url ?? '';

    return this.builder.group({
      webhook_url: [{ value: webhookUrl, disabled: true }],
      payload: [typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2), [Validators.required, JsonValidator]]
    });
  }

  buildITSMTriggerForm(param?: any): FormGroup {
    return this.builder.group({
      record_uuid: [param?.record_uuid ?? '', [Validators.required]],
      activity_id: [param?.activity_id ?? '', [Validators.required]]
    });
  }

  buildAIMLTriggerForm(param?: any): FormGroup {
    return this.builder.group({
      id: [param?.id ?? '', [Validators.required]]
    });
  }

  resetInputFormErrors() {
    return {
      inputs: {}
    };
  }

  resetWebhookFormErrors() {
    return {
      payload: ''
    };
  }

  resetITSMFormErrors() {
    return {
      record_uuid: '',
      activity_id: ''
    };
  }

  resetAIMLFormErrors() {
    return {
      id: ''
    };
  }

  inputFormValidationMessages = {
    inputs: {
      default_value: 'Default Value is required'
    }
  };

  webhookFormValidationMessages = {
    payload: {
      required: 'Payload is required',
      invalidJson: 'Please enter a valid JSON'
    }
  };

  itsmFormValidationMessages = {
    record_uuid: {
      required: 'Ticket Record is required'
    },
    activity_id: {
      required: 'Event is required'
    }
  };

  aimlFormValidationMessages = {
    id: {
      required: 'Event is required'
    }
  };

  // getTriggerApiSegment(nodeType: string): string {
  //   switch (this.normalizeNodeType(nodeType)) {
  //     case 'Manual Trigger':
  //       return 'manual';
  //     case 'Schedule Trigger':
  //       return 'schedule';
  //     case 'Webhook Trigger':
  //       return 'webhook';
  //     case 'ITSM Event Trigger':
  //       return 'itsm';
  //     case 'AIML Event Trigger':
  //       return 'aiml';
  //     default:
  //       return '';
  //   }
  // }

  private createInputsForm(inputs: any[] = []): FormGroup {
    return this.builder.group({
      inputs: this.builder.array(inputs.map(input => this.createInputGroup(input)))
    });
  }

  private createInputGroup(input: any): FormGroup {
    return this.builder.group({
      default_value: [input?.default_value ?? '', Validators.required],
      param_name: [input?.param_name ?? ''],
      param_type: [input?.param_type ?? 'Text']
    });
  }

  private resolveInputs(param: any): any[] {
    const config = this.resolveConfig(param);
    const candidates = [
      config?.input_params,
      param?.input_params,
      param?.triggerForm?.inputs,
      config?.inputs,
      param?.inputs
    ];
    const populatedInputs = candidates.find(input => Array.isArray(input) && input.length > 0);
    const emptyInputs = candidates.find(input => Array.isArray(input));
    const inputParams = populatedInputs || emptyInputs || [];

    return Array.isArray(inputParams) ? inputParams : [];
  }

  private resolveConfig(param: any): any {
    return param?.config?.properties
      ?? param?.properties
      ?? param?.config
      ?? param
      ?? {};
  }

  private normalizeNodeType(nodeType: string): string {
    const type = (nodeType || '').toLowerCase().replace(/[_-]/g, ' ').trim();

    if (type.includes('manual')) {
      return 'Manual Trigger';
    }
    if (type.includes('schedule')) {
      return 'Schedule Trigger';
    }
    if (type.includes('webhook')) {
      return 'Webhook Trigger';
    }
    if (type.includes('itsm')) {
      return 'ITSM Event Trigger';
    }
    if (type.includes('aiml')) {
      return 'AIML Event Trigger';
    }

    return nodeType;
  }
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
