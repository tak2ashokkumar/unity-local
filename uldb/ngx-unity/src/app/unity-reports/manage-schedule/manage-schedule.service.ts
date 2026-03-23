import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ALL_SCHDULES_BY_FEATURE, DELETE_SCHEDULE, MULTIPLE_DELETE_SCHEDULE, REPORT_SCHEDULE_COUNT } from 'src/app/shared/api-endpoint.const';
import { ManageReportScheduleCountDataType } from '../manage-reports/manage-reports.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Injectable()
export class ManageScheduleService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getManageSchedulesCount(): Observable<ManageReportScheduleCountDataType> {
    return this.http.get<ManageReportScheduleCountDataType>(REPORT_SCHEDULE_COUNT());
  }

  getSchedules(feature: string, criteria: SearchCriteria): Observable<Array<ManageScheduleDataType>> {
    return this.tableService.getData<Array<ManageScheduleDataType>>(ALL_SCHDULES_BY_FEATURE(feature), criteria);
  }

  convertToViewData(data: ManageScheduleDataType[]): ManageScheduleViewData[] {
    let viewData: ManageScheduleViewData[] = [];
    data.forEach(data => {
      let lv: ManageScheduleViewData = new ManageScheduleViewData();
      lv.uuid = data.uuid;
      lv.scheduleName = data.name;
      lv.scheduleType = data.schedule_type;
      lv.recurrencePattren = data.recurrence_pattern;
      lv.reportName = data.report;
      lv.recipients = data.recipient_emails;
      viewData.push(lv);
    })
    return viewData;
  }

  delete(scheduleId: string) {
    return this.http.get(DELETE_SCHEDULE(scheduleId));
  }

  multipleScheduleDelete(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuid', uuid));
    return this.http.get(MULTIPLE_DELETE_SCHEDULE(), { params: params });
  }
}

export class ManageScheduleViewData {
  constructor() { }
  uuid: string;
  scheduleName: string;
  scheduleType: string;
  recurrencePattren: string;
  reportName: string;
  recipients: string[];
  isSelected: boolean = false;
}

export interface ManageScheduleDataType {
  uuid: string;
  name: string;
  schedule_type: string;
  recurrence_pattern: string;
  report_name: string;
  report_meta: ManageScheduleDatacenterCloudDataType;
  enable: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  user: string;
  report: string;
  scheduled_day: string;
  recipient_emails: string[];
  additional_emails: string[];
}

export interface ManageScheduleDatacenterCloudDataType {
  category: string;
  cabinets: string[];
  feature: string;
  report_url: string;
  reportType: string;
  datacenters: string[];
}