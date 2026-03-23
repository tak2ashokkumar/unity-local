import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ListSummaryResModel, OrchestrationHistoryDataType, WorkflowType } from './orchestration-workflows.type';
// import { ListSummaryViewModel } from '../orchestration-tasks/orchestration-tasks.service';

@Injectable()
export class OrchestrationWorkflowsService {
  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService,) { }

  getSummary() {
    return this.http.get(`orchestration/workflows/list_summary/`);
  }

  convertToSummaryViewData(data: ListSummaryResModel): ListSummaryViewModel {
    let summary: ListSummaryViewModel = new ListSummaryViewModel();
    let res = data.results;

    let status: Status[] = [];
    res.status.map(item => {
      let statusItem = new Status();
      statusItem.count = item.count;
      statusItem.name = item.name;
      statusItem.workflowStatus = item.workflow_status;
      status.push(statusItem);
    });

    let categories: Categories[] = [];
    res.categories.forEach((item, index) => {
      let categoryItem = new Categories();
      categoryItem.count = item.count;
      categoryItem.categoryName = item.category;
      categories.push(categoryItem);
    });

    let executionStatus: ExecutionStatus[] = [];
    res.execution_status.map(item => {
      let executionStatusItem = new ExecutionStatus();
      executionStatusItem.count = item.count;
      executionStatusItem.name = item.name;
      if (item.name == 'Success') {
        executionStatusItem.statusIcon = "fa fa-check-circle text-success";
        executionStatusItem.tooltipMessage = "Success"
      } else if (item.name == 'Failed') {
        executionStatusItem.statusIcon = "fa fa-exclamation-circle text-danger";
        executionStatusItem.tooltipMessage = "Failed"
      } else {
        executionStatusItem.statusIcon = "fas fa-spinner fa-spin fa-info-circle text-primary";
        executionStatusItem.tooltipMessage = "In Progress"
      }
      executionStatus.push(executionStatusItem);
    });
    executionStatus.sort((a, b) => {
      const order = ['Success', 'Failed', 'In Progress'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

    summary.totalWorkflow = res.total;
    summary.status = status;
    summary.categories = categories;
    // listSummaryViewData.remainingCategories = remainingCategories;
    summary.executionStatus = executionStatus;

    return summary;
  }

  getWorkflowList(criteria: SearchCriteria): Observable<PaginatedResult<WorkflowType>> {
    return this.tableService.getData<PaginatedResult<WorkflowType>>(`/rest/orchestration/agentic_workflow/`, criteria);
  }

  convertToViewData(data: WorkflowType[]): WorkflowViewData[] {
    let viewData: WorkflowViewData[] = [];
    data.forEach(a => {
      let td: WorkflowViewData = new WorkflowViewData();
      td.uuid = a.uuid;
      td.name = a.w_name;
      td.categoryName = a.w_category;
      td.totalTask = a.w_total_task;
      td.description = a.w_description;
      td.workflowStatus = a.w_status;
      td.status = a.status;
      td.lastExecutedTime = a.last_executed !== 'N/A' ? this.utilSvc.toUnityOneDateFormat(a.last_executed) : 'N/A';
      td.createdAt = a.w_created_at !== 'N/A' ? this.utilSvc.toUnityOneDateFormat(a.w_created_at) : 'N/A';
      td.updatedAt = a.w_updated_at;
      td.editedBy = a.edited_by;
      td.createdBy = a.w_created_by;
      td.targetType = a.target_type;
      td.isCreated = a.w_is_created;
      td.isAdvanced = a.w_is_advanced;
      td.is_agentic = a.w_is_agentic;
      td.trigger_type = a.w_trigger_type;
      viewData.push(td);
    });
    return viewData;
  }

  pollByTaskId(taskId: string): Observable<TaskStatus> {
    return this.appService.pollForTask(taskId, 2, 100)
      .pipe(switchMap(res => this.appService.pollForTask(taskId, 2, 100).pipe(take(1))), take(1));
  }

  toggleStatus(uuid: string, agentic_flag: boolean) {
    if (agentic_flag) {
      return this.http.get(`rest/orchestration/agentic_workflow/${uuid}/toggle/`);
    } else {
      return this.http.get(`/orchestration/workflows/${uuid}/toggle/`);
    }
  }

  deleteWorkflow(uuid: string, agentic_flag: boolean) {
    if (agentic_flag) {
      return this.http.delete(`rest/orchestration/agentic_workflow/${uuid}/`);
    } else {
      return this.http.delete(`/orchestration/workflows/${uuid}/`);
    }
  }

  postProcessWorkflow(data: string): Observable<CeleryTask> {
    return this.http.post<CeleryTask>('/orchestration/workflows/', data);
  }

  updateProcessWorkflow(workflowId: string, data: string): Observable<CeleryTask> {
    return this.http.patch<CeleryTask>(`/orchestration/workflows/${workflowId}/`, data);
  }

  getHistoryData(uuid: string, agentic_flag: boolean) {
    if (agentic_flag) {
      return this.http.get<OrchestrationHistoryDataType[]>(`rest/orchestration/agentic_workflow/${uuid}/history/`, { params: new HttpParams().set('page_size', 0) });
    } else {
      return this.http.get<OrchestrationHistoryDataType[]>(`/orchestration/workflows/${uuid}/get_execution_history/`, { params: new HttpParams().set('page_size', 0) });
    }
  }

  convertToHistoryViewData(data: OrchestrationHistoryDataType[]): HistoryViewData[] {
    let viewHistoryData: HistoryViewData[] = [];
    data.map(a => {
      let hd: HistoryViewData = new HistoryViewData();
      hd.executionId = a.run_id ? a.run_id : 'NA';
      hd.executionStartTime = a.start_time ? this.utilSvc.toUnityOneDateFormat(a.start_time) : 'N/A';
      hd.executionEndTime = a.end_time ? this.utilSvc.toUnityOneDateFormat(a.end_time) : 'N/A';
      hd.executionDuration = a.duration ? a.duration : 'NA';
      hd.executionStatus = a.execution_status;
      if (a.execution_status == 'Completed' || a.execution_status == 'Success') {
        hd.statusIcon = "fa-check-circle text-success";
      } else if (a.execution_status == 'Failed') {
        hd.statusIcon = "fa-exclamation-circle text-danger";
      } else {
        hd.statusIcon = "fas fa-spinner fa-spin fa-info-circle text-primary";
      }
      hd.executionStatus = a.execution_status;
      hd.executionUser = a.user;
      viewHistoryData.push(hd);
    });
    return viewHistoryData;
  }
}

export class WorkflowViewData {
  constructor() { }
  uuid: string;
  name: string;
  categoryName: string;
  totalTask: number;
  description: string;
  workflowStatus: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  editedBy: null;
  createdBy: number;
  lastExecutedTime: string;
  lastExecutedDate: string;
  targetType: string;
  isCreated: boolean;
  taskId: string = null;
  isAdvanced: boolean;
  is_agentic: boolean;
  trigger_type: string;
}

export class HistoryViewData {
  constructor() { }
  executionId: string;
  executionStartTime: string;
  executionEndTime: string;
  executionDuration: string;
  executionStatus: string;
  executionUser: string;
  statusIcon: string;
  hostName: string;
}

export class ListSummaryViewModel {
  constructor() { }
  totalWorkflow: number;
  executionStatus: ExecutionStatus[];
  status: Status[];
  categories: Categories[];
  remainingCategories: Categories[];
}

export class Status {
  count: number;
  name: string;
  workflowStatus: string;
}

export class Categories {
  count: number;
  categoryName: string;
  name: string;
}

export class ExecutionStatus {
  count: number;
  name: string;
  statusIcon: string;
  tooltipMessage: string;
}
