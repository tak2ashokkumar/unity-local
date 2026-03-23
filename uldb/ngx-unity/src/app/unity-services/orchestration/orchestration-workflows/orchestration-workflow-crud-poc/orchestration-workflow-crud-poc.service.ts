import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UnityWorkflow } from '../orchestration-workflows.type';

@Injectable()
export class OrchestrationWorkflowCrudPocService {

  constructor(private http: HttpClient,) { }

  getWorkflowDetails(workflowId: string): Observable<UnityWorkflow> {
    return this.http.get<UnityWorkflow>(`/orchestration/workflows/${workflowId}/`);
  }
}
