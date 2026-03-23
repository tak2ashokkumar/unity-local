import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ManageReportItsmDataType } from './itsm-report-preview.type';

@Injectable()
export class ItsmReportPreviewService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getReportPreviewById(uuid: string, criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<ManageReportItsmDataType>>(MANAGE_REPORT_PREVIEW(uuid), criteria);
  }

  convertToviewData(reportData: ManageReportItsmDataType[]): ManageReportItsmReportViewData[] {
    let lv: ManageReportItsmReportViewData[] = [];
    reportData.map(data => {
      let view: ManageReportItsmReportViewData = new ManageReportItsmReportViewData();
      view.ticketNumber = data.ticket_number;
      view.ticketType = data.ticket_type;
      view.title = data.title;
      view.status = data.status;
      view.statusReason = data.status_reason;
      view.priority = data.priority;
      view.openedAt = data.created_on ? this.utilSvc.toUnityOneDateFormat(data.created_on) : 'NA';
      view.updatedOn = data.modified_on ? this.utilSvc.toUnityOneDateFormat(data.modified_on) : 'NA';
      lv.push(view);
    });
    return lv;
  }
}

export class ManageReportItsmReportViewData {
  constructor() { }
  ticketNumber: string;
  ticketType: string;
  title: string;
  status: string;
  statusReason: string;
  priority: string = null;
  openedAt: string;
  updatedOn: string;
}