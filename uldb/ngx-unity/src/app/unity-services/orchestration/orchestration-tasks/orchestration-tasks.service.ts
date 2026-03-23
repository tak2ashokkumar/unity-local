import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { ORCHESTRATION_CATEGORY, ORCHESTRATION_CLONE_TASK, ORCHESTRATION_DELETE_TASK, ORCHESTRATION_GET_TASK, ORCHESTRATION_LIST_SUMMARY, ORCHESTRATION_STATUS_TOGGLE, ORCHESTRATION_VIEW_HISTORY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';
import { CategoryDataType, OrchestrationCategoryDataType, OrchestrationHistoryDataType, OrchestrationTaskDataType } from './orchestration-task.type';

@Injectable()
export class OrchestrationTasksService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService) { }

  convertToViewData(data: OrchestrationTaskDataType[]): TaskViewData[] {
    let viewData: TaskViewData[] = [];
    data.forEach(a => {
      let td: TaskViewData = new TaskViewData();
      td.uuid = a.uuid;
      td.taskName = a.name;
      td.category = a.category;
      td.playbookType = a.script_type;
      td.description = a.description;
      td.source = a.source;
      td.sourceName = a.source_name ? a.source_name : 'NA';
      td.playbook = a.playbook;
      td.user = a.user || "UL Customer";
      td.parameters = a.parameters;
      td.outputType = a.output_type;
      td.targetType = a.target_type;
      td.image = `${environment.assetsUrl + a.script_image}`;
      td.taskStatus = a.enabled;
      td.isCreated = a.is_created;
      td.editedBy = a.edited_by;
      td.tooltipMessage = a.script_type;

      viewData.push(td);
    });
    return viewData;
  }

  convertToCategoryViewData(categories: CategoryDataType[]): CategoryViewData[] {
    let viewData: CategoryViewData[] = [];
    categories.forEach(a => {
      let cd: CategoryViewData = new CategoryViewData();
      cd.category = a.category;
      cd.count = a.count;
      cd.uuid = a.uuid
      cd.enableActions = false;
      viewData.push(cd);
    });
    return viewData;
  }

  convertToHistoryViewData(data: OrchestrationHistoryDataType[]): HistoryViewData[] {
    let viewHistoryData: HistoryViewData[] = [];
    data.map(a => {
      let hd: HistoryViewData = new HistoryViewData();
      hd.runId = a.run_id;
      hd.executionStartTime = a.start_time ? this.utilSvc.toUnityOneDateFormat(a.start_time) : 'N/A';
      hd.executionEndTime = a.end_time ? this.utilSvc.toUnityOneDateFormat(a.end_time) : 'N/A';
      hd.executionDuration = a.duration;
      hd.executionStatus = a.execution_status;
      if (a.execution_status == 'Success' || a.execution_status == 'Completed') {
        hd.statusIcon = "fa-check-circle text-success";
      } else if (a.execution_status == 'Failed' || a.execution_status == 'Cancelled') {
        hd.statusIcon = "fa-exclamation-circle text-danger";
      } else {
        hd.statusIcon = "fas fa-spinner fa-spin fa-info-circle text-primary";
      }
      hd.executionStatus = a.execution_status;
      hd.executionUser = a.user;
      hd.hostName = a.host_name;
      viewHistoryData.push(hd);
    });
    return viewHistoryData;
  }

  convertToListSummaryViewData(data: ListSummaryResModel): ListSummaryViewModel {
    let listSummaryViewData: ListSummaryViewModel = new ListSummaryViewModel();
    let res = data.results;
    let modifiedType: TypeModel[] = [];
    res.type.map(val => {
      let t: TypeModel = new TypeModel();
      t.count = val.count;
      t.image = `${environment.assetsUrl + val.image}`;
      t.name = val.name;
      t.tooltipMessage = val.name;

      modifiedType.push(t);
    });
    listSummaryViewData.totalTask = res.total;
    listSummaryViewData.byType = modifiedType;
    listSummaryViewData.targetType = res.target_type;
    listSummaryViewData.status = res.status;
    return listSummaryViewData;
  }

  createCategoryForm(uuid?: string, category?: string): FormGroup {
    if (uuid) {
      return this.builder.group({
        'name': [category, [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }

  resetCategoryFormErrors() {
    return {
      'name': '',
    }
  }

  categoryValidationMessages = {
    'name': {
      'required': 'Name is mandatory'
    },
  }

  getListSummary() {
    return this.http.get(ORCHESTRATION_LIST_SUMMARY());
  }

  getCategoryData() {
    return this.http.get<OrchestrationCategoryDataType>(ORCHESTRATION_CATEGORY());
  }

  createCategory(obj: CategoryViewData): Observable<CategoryViewData> {
    return this.http.post<CategoryViewData>(ORCHESTRATION_CATEGORY(), obj);
  }

  updateCategory(uuid: string, obj: { name: string }): Observable<CategoryViewData> {
    return this.http.put<CategoryViewData>(ORCHESTRATION_CATEGORY(uuid), obj);
  }

  deleteCategory(uuid: string) {
    return this.http.delete(ORCHESTRATION_CATEGORY(uuid));
  }

  getData(criteria: SearchCriteria): Observable<PaginatedResult<OrchestrationTaskDataType>> {
    return this.tableService.getData<PaginatedResult<OrchestrationTaskDataType>>(ORCHESTRATION_GET_TASK(), criteria);
  }

  getHistoryData(uuid: string) {
    return this.http.get<OrchestrationHistoryDataType[]>(ORCHESTRATION_VIEW_HISTORY(uuid), { params: new HttpParams().set('page_size', 0) });
  }

  deleteTask(uuid: string) {
    return this.http.delete(ORCHESTRATION_DELETE_TASK(uuid));
  }

  cloneData(uuid: string, taskName: string) {
    const req = {
      name: taskName
    };
    return this.http.post(ORCHESTRATION_CLONE_TASK(uuid), req);
  }

  toggleStatus(uuid: string) {
    return this.http.get(ORCHESTRATION_STATUS_TOGGLE(uuid));
  }

  pollingResult(celeryTaskId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(`/task/${celeryTaskId}/`).pipe(switchMap(res => this.appService.pollForTask(celeryTaskId, 3, 1000).pipe(take(1))), take(1));
  }
}

export class TaskViewData {
  constructor() { }
  uuid: string;
  taskName: string;
  category: string;
  playbookType: string;
  description: string;
  source: string;
  sourceName: string;
  playbook: string;
  user: string;
  parameters: TaskParams[];
  outputType: string;
  targetType: string;
  image: string;
  taskStatus: boolean;
  tooltipMessage: string;
  isCreated: boolean;
  editedBy: string;
}

export class TaskParams {
  constructor() { }
  param_name: string;
  param_type: string;
  default_value: string;
}

export class CategoryViewData {
  constructor() { }
  category: string;
  count: string;
  uuid: string;
  enableActions: boolean;
}

export class HistoryViewData {
  constructor() { }
  runId?: string;
  executionStartTime: string;
  executionStartDate?: string;
  executionEndTime: string;
  executionEndDate?: string;
  executionDuration: string;
  executionStatus: string;
  executionUser: string;
  statusIcon: string;
  hostName: string;
  // isCreated: boolean;
}

export enum playbookTypes {
  AnsibleBook = 'Ansible Playbook',
  TerraformScript = 'Terraform Script',
  BashScript = 'Bash Script',
  PythonScript = 'Python Script',
  PowershellScript = 'Powershell Script',
  RestApi = 'Rest API'
}

export class ListSummaryViewModel {
  constructor() { }
  totalTask: number;
  byType: TypeModel[];
  status: StatusModel;
  targetType: TargetTypeModel;
}

export interface ListSummaryResModel {
  results: ResultsModel;
}

interface ResultsModel {
  status: StatusModel;
  total: number;
  type: TypeModel[];
  target_type: TargetTypeModel;
}

class TypeModel {
  count: number;
  image: string;
  name: string;
  tooltipMessage: string;
}

interface StatusModel {
  Enabled: number;
  Disabled: number;
}

interface TargetTypeModel {
  Cloud: string;
  Host: string;
}

export const SCRIPT_CHOICES = [
  { label: 'Ansible Playbook', value: 'Ansible Playbook' },
  { label: 'Terraform Script', value: 'Terraform Script' },
  { label: 'Bash Script', value: 'Bash Script' },
  { label: 'Python Script', value: 'Python Script' },
  { label: 'Powershell Script', value: 'Powershell Script' },
  { label: 'Rest API', value: 'Rest API' },
];