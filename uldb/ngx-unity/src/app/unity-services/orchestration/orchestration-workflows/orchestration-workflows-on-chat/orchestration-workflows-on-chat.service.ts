import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OnchatWorkflow, UnityWorkflow } from '../orchestration-workflows.type';
import { Observable } from 'rxjs';
import { ExecutionTask, PollingRes } from './orchestration-workflows-on-chat.type';
import { AppLevelService } from 'src/app/app-level.service';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class OrchestrationWorkflowsOnChatService {

  constructor(
    private http: HttpClient,
    private appService: AppLevelService) { }

  getWorkflowDetails(workflowId: string): Observable<UnityWorkflow> {
    // return this.http.get<UnityWorkflow>(GET_WORKFLOW_DETAILS());
    return this.http.get<UnityWorkflow>(`/orchestration/workflows/${workflowId}/`);
  }

  getStartingChat(workflowId: string): Observable<OnchatWorkflow> {
    return this.http.get<OnchatWorkflow>(`/rest/orchestration/agentic_workflow/${workflowId}/chat/`);
  }

  getExecutionId(req, workflowId): Observable<any> {
    // return this.http.post<any>(`/rest/orchestration/agentic_workflow/${workflowId}/chat/`, req);
    return this.http.post<ExecutionTask>(`/rest/orchestration/agentic_workflow/${workflowId}/chat/`, req).pipe(
      switchMap(res => this.appService.pollForExecution(res.execution_uuid, 2))
    );
  }
}
