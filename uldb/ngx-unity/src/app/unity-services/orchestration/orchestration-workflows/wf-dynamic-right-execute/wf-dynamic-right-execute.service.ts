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
export class WfDynamicRightExecuteService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService) { }

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
    return this.http.post<ExecutionTask>(`/api/orchestration/v1/dynamic_workflow_preview/`, req).pipe(
      switchMap(res => this.appService.pollForAgenticWfExecute(workflowId, 2))
    );
  }

  getAIMLData(page: number, pageSize: number, obj: any): Observable<any> {
    const params = {
      page: page,
      page_size: pageSize
    };

    return this.http.post<any>(`/api/orchestration/v1/aiml/search/`, obj, { params });
  }

  createInputGroup(input: any): FormGroup {
    return this.builder.group({
      default_value: [input.default_value || '', Validators.required],
      param_name: [input.param_name || ''],
      param_type: [input.param_type || 'Text'],
    });
  }

  private createInputsForm(inputs: any[] = []): FormGroup {
    return this.builder.group({
      inputs: this.builder.array(
        inputs.map(input => this.createInputGroup(input))
      )
    });
  }

  buildManualTriggerForm(param: any): FormGroup {
    const inputs = param?.inputs?.length ? param.inputs : param?.triggerForm?.inputs || [];
    return this.createInputsForm(inputs);
  }

  buildScheduleTriggerForm(param: any): FormGroup {
    return this.createInputsForm(param?.inputs || []);
  }

  validationMessages = {
    inputs: {
      default_value: 'Default Value is required'
    },

    payload: {
      required: 'Payload is required',
      invalidJson: 'Please enter a valid JSON'
    },

    record_uuid: {
      required: 'Ticket Record is required'
    },

    activity_id: {
      required: 'Event is required'
    },

    id: {
      required: 'Event is required'
    }
  };

  formErrors() {
    return {
      manual: {
        inputs: []
      },

      schedule: {
        inputs: []
      },

      webhook: {
        payload: ''
      },

      itsm: {
        record_uuid: '',
        activity_id: ''
      },

      aiml: {
        id: ''
      }
    }
  };

  buildWebhookTriggerForm(param: any): FormGroup {
    const payload = param?.payload ?? param?.config?.payload ?? '{}';
    return this.builder.group({
      payload: [payload, [Validators.required, JsonValidator]]
    });
  }

  buildITSMTriggerForm(values?: any): FormGroup {
    return this.builder.group({
      record_uuid: [values?.record_uuid || '', Validators.required],
      activity_id: [values?.activity_id || '', Validators.required]
    });
  }

  buildAIMLTriggerForm(): FormGroup {
    return this.builder.group({
      id: ['', Validators.required]
    });
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

