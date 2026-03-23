import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable()
export class OrchestrationAgenticWorkflowItsmTriggerService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getITSMTriggerDetails(workflowUuid: string): Observable<any> {
    return this.http.get<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/itsm/`)
  }

  sendITSMTriggerDetails(workflowUuid: string, data: any): Observable<any> {
    return this.http.post<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/itsm/`, data)
  }

  getUnityOneITSMData(tableId: string): Observable<any> {
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableId}/records/`);
  }

  getCommentActivity(tableId: string, recordUuid: string, activityType: string): Observable<any> {
    let params = new HttpParams().set('page_size', 0).set('activity_type', activityType);
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableId}/records/${recordUuid}/activity/`, { params: params });
  }

  buildITSMTriggerForm(param: any): FormGroup {
    let form = this.builder.group({
      'record_uuid': [param.record_uuid ?? "", [Validators.required]],
      'activity_id': [param.activity_id ?? "", [Validators.required]]
    });
    return form;
  }

  resetITSMFormErrors() {
    return {
      'record_uuid': '',
      'activity_id': '',
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
}
