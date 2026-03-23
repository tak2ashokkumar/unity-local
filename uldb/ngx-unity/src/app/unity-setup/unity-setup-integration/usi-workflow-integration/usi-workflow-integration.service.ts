import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { workflowIntegration } from './usi-workflow-integration.type';

@Injectable()
export class UsiWorkflowIntegrationService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private userService: UserInfoService,
    private appService: AppLevelService,
    private builder: FormBuilder) { }

  getWorkflowIntegrations(criteria: SearchCriteria): Observable<PaginatedResult<any>> {
    return this.tableService.getData<PaginatedResult<any>>('customer/workflow/integration/', criteria);
  }

  deleteWorkflowIntegration(connectionId: string) {
    return this.http.delete(`customer/workflow/integration/${connectionId}/`);
  }

  toggleStatus(wfId: string){
    return this.http.get(`customer/workflow/integration/${wfId}/toggle/`);
  }

  convertToViewData(data: workflowIntegration[]): workflowIntegrationViewData[] {
    let viewData: any[] = [];
    data.map(s => {
      let a: workflowIntegrationViewData = new workflowIntegrationViewData();
      a.uuid = s.uuid;
      a.name = s.name;
      a.category = s.category;
      a.taskType = s.task_type;
      // if(s.task_type == "TASK"){
      //   a.task = s.task;
      // }else{
      //   a.workflow = s.workflow;
      // }
      a.workflow = s.workflow;
      a.webhookUrl = s.webhook_url;
      a.enabled = s.enabled;
      a.task = s.task;
      viewData.push(a);
    });
    return viewData;
  }
}

export class workflowIntegrationViewData {
  constructor() { }
  uuid: string;
  name: string;
  category: string;
  taskType: string;
  enabled: boolean;
  task: string;
  workflow: any;
  webhookUrl: string;
}