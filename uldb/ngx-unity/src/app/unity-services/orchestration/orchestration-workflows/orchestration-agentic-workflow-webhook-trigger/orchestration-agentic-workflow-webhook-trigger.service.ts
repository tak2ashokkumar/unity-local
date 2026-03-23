import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationAgenticWorkflowWebhookTriggerService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getWebhookTriggerDetails(workflowUuid: string): Observable<any> {
    return this.http.get<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/webhook/`)
  }

  sendWebhookTriggerDetails(workflowUuid: string, data: any): Observable<any> {
    return this.http.post<any>(`rest/orchestration/agentic_workflow/${workflowUuid}/webhook/`, data)
  }

  buildWebhookTriggerForm(param: any): FormGroup {
    let form = this.builder.group({
      'webhook_url': [{ value: param.webhook_url, disabled: true }],
      'payload': [JSON.stringify(param.payload, null, 2), [Validators.required, JsonValidator]]
    });
    return form;
  }

  resetManualFormErrors() {
    return {
      'payload': ''
    }
  }

  manualFormValidationMessages = {
    'payload': {
      'payload': 'Payload is required',
      'invalidJson': 'Please enter a valid JSON'
    }
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
