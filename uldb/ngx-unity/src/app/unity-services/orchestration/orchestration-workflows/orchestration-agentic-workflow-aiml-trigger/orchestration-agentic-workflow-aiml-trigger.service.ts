import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable()
export class OrchestrationAgenticWorkflowAimlTriggerService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getAIMLTriggerDetails(workflowUuid: string): Observable<any> {
    return this.http.get<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/aiml/`)
  }

  sendAIMLTriggerDetails(workflowUuid: string, data: any): Observable<any> {
    return this.http.post<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/aiml/`, data)
  }

  getAIMLData(obj: any): Observable<any> {
    return this.http.post<any>(`/rest/orchestration/aiml/search/`, obj);
  }

  buildAIMLTriggerForm(param: any): FormGroup {
    let form = this.builder.group({
      'id': [param.id ?? "", [Validators.required]]
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
