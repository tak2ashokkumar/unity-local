import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { REPORT_SCHDULES, TOGGLE_REPORT_SCHDULE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ReportSchedule } from './report-schedule.type';

@Injectable()
export class ReportSchedulesService {
  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getSchedules(criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<ReportSchedule>>(REPORT_SCHDULES(), criteria);
  }

  convertToViewdata(data: ReportSchedule[]): ReportScheduleViewdata[] {
    let viewData: ReportScheduleViewdata[] = [];
    data.forEach(sch => {
      let v = new ReportScheduleViewdata();
      v.uuid = sch.uuid;
      v.name = sch.name;
      v.frequency = sch.frequency;
      v.createdAt = sch.created_at ? this.utilSvc.toUnityOneDateFormat(sch.created_at) : 'NA';
      v.updatedAt = sch.updated_at ? this.utilSvc.toUnityOneDateFormat(sch.updated_at) : 'NA';

      if (sch.enable) {
        v.active = 'Yes';
        v.toggleIcon = 'fa-toggle-on';
        v.toggleTootipMsg = 'Disable';
      } else {
        v.active = 'No';
        v.toggleIcon = 'fa-toggle-off';
        v.toggleTootipMsg = 'Enable';
      }

      v.report_url = sch.report_meta.report_url;
      viewData.push(v);
    });
    return viewData;
  }

  toggle(uuid: string) {
    return this.http.request('put', TOGGLE_REPORT_SCHDULE(uuid));
  }

}
export class ReportScheduleViewdata {
  uuid: string;
  name: string;
  frequency: string;
  report_url: string;
  createdAt: string;
  updatedAt: string;
  active: string;

  toggleIcon: 'fa-toggle-on' | 'fa-toggle-off';
  toggleTootipMsg: 'Enable' | 'Disable';
}