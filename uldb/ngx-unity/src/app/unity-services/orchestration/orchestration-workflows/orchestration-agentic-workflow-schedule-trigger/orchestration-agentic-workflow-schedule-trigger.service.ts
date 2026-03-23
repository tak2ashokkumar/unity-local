import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationAgenticWorkflowScheduleTriggerService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getScheduleTriggerDetails(workflowUuid: string): Observable<any> {
    return this.http.get<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/schedule/`)
  }

  sendScheduleTriggerDetails(workflowUuid: string, data: any): Observable<any> {
    return this.http.post<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/schedule/`, data)
  }

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
}
