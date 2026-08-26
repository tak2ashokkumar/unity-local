import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { nodeTypes } from 'src/app/unity-services/orchestration/orchestration-workflows/wf-dynamic-container/wf-dynamic-container.type';

@Injectable({
  providedIn: 'root'
})
export class UcAgenticService {

  constructor(
    private http: HttpClient,
    private appService: AppLevelService,
    private tableService: TableApiServiceService
  ) { }

  getWorkflowList(): Observable<Array<WorkflowType>> {
    return this.http.get<Array<WorkflowType>>(`/rest/orchestration/agentic_workflow/chat_workflows/`);
  }

  getStartingChat(url: string): Observable<OnchatWorkflow> {
    return this.http.get<OnchatWorkflow>(url, {
      params: { node_type: nodeTypes.OnChatMessageTrigger }
    });
  }

  getExecutionId(req, workflowId): Observable<any> {
    return this.http.post<ExecutionTask>(`api/orchestration/v1/dynamic_workflows/${workflowId}/execute/`, req, {
      params: { node_type: nodeTypes.OnChatMessageTrigger }
    }).pipe(
      switchMap(res => this.appService.pollForExecution(res.execution_id, 2))
    );
  }
}


export interface OnchatWorkflow {
  session_id: string;
  name: string;
  config?: { welcome_message?: string };
  query?: string;
  message?: string;
}

export interface ChatHistoryData {
  sender: 'user' | 'bot';
  message?: string;
  status?: 'Running' | 'Success' | 'Failed';
}

export interface ExecutionTask {
  execution_uuid?: string;
  execution_id?: string;
}

export interface PollingRes {
  output: string;
  status: "Running" | "Success" | "Failed";
}

export interface WorkflowType {
  name: string;
  uuid: string;
  active_version__nodes__node_type: string;
}