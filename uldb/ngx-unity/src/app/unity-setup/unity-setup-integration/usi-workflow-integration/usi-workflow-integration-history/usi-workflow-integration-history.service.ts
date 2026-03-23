import { Injectable } from '@angular/core';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { WorkflowIntegratonHistory } from './usi-workflow-integration-history.type';

@Injectable()
export class UsiWorkflowIntegrationHistoryService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getHistoryTableData(criteria: SearchCriteria, wfId: string) {
    return this.tableService.getData<PaginatedResult<WorkflowIntegratonHistory>>(`customer/workflow/integration/${wfId}/transactions/`, criteria);
  }

  convertToViewData(data: WorkflowIntegratonHistory[]): WorkflowIntegratonHistoryViewData[] {
    let viewData: WorkflowIntegratonHistoryViewData[] = [];
    data.forEach(v => {
      let view: WorkflowIntegratonHistoryViewData = new WorkflowIntegratonHistoryViewData();
      view.uuid = v.uuid;
      view.requestId = v.unity_id;
      view.externalRequestId = v.external_id;
      view.requestedOn = v.requested_on ? this.utilSvc.toUnityOneDateFormat(v.requested_on) : 'N/A';
      view.startedOn = v.started_on ? this.utilSvc.toUnityOneDateFormat(v.started_on) : 'N/A';
      view.completedOn = v.completed_on ? this.utilSvc.toUnityOneDateFormat(v.completed_on) : 'N/A';
      view.status = v.status;
      view.payload = v.payload;
      if (view.status == 'Success') {
        view.statusIcon = "fa fa-check-circle text-success";
        view.tooltipMessage = "Success"
      } else if (v.status == 'Failed') {
        view.statusIcon = "fa fa-exclamation-circle text-danger";
        view.tooltipMessage = "Failed"
      } else if (v.status == 'In Progress') {
        view.statusIcon = "fa fa-spinner fa-spin fa-info-circle text-primary";
        view.tooltipMessage = "Running"
      } else {
        view.status = 'N/A';
        view.statusIcon = '';
        view.tooltipMessage = '';
      }
      viewData.push(view);
    });
    return viewData;
  }
}

export class WorkflowIntegratonHistoryViewData {
  constructor() { }
  uuid: string;
  requestId: string;
  externalRequestId: string;
  requestedOn: string;
  startedOn: string;
  completedOn: string;
  status: string;
  statusIcon: string;
  tooltipMessage: string;
  payload: any;
}