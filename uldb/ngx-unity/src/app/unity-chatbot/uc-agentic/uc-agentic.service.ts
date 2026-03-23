import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

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
    return this.http.get<OnchatWorkflow>(url);
  }

  getExecutionId(req, workflowId): Observable<any> {
    return this.http.post<ExecutionTask>(`/rest/orchestration/agentic_workflow/${workflowId}/chat/`, req).pipe(
      switchMap(res => this.appService.pollForExecution(res.execution_uuid, 2))
    );
  }
}



export interface OnchatWorkflow {
  session_id: string;
  name: string;
  welcome_message?: string;
  query?: string;
  message?: string;
}

export interface ChatHistoryData {
  sender: 'user' | 'bot';
  message?: string;
  status?: 'Running' | 'Success' | 'Failed';
}

export interface ExecutionTask {
  execution_uuid: string;
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