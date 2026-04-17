import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ALL_SCHDULES_BY_FEATURE, DELETE_SCHEDULE, MULTIPLE_DELETE_SCHEDULE, REPORT_SCHEDULE_COUNT, } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ManageReportScheduleCountDataType } from '../report-management/report-management.type';

/**
 * Provides API access and view-model mapping helpers for Manage Schedule.
 */
@Injectable()
export class ManageScheduleService {
  constructor(
    private http: HttpClient,
    private tableService: TableApiServiceService) { }

  /**
   * Loads schedule counts grouped by report feature.
   *
   * @returns Observable containing report and schedule summary counts.
   */
  getManageSchedulesCount(): Observable<ManageReportScheduleCountDataType> {
    return this.http.get<ManageReportScheduleCountDataType>(REPORT_SCHEDULE_COUNT());
  }

  /**
   * Loads schedules for the selected feature using the shared table API.
   *
   * @param feature - Report feature name used to scope the request.
   * @param criteria - Search, sort, and pagination criteria for the table request.
   * @returns Observable containing the matching schedules.
   */
  getSchedules(feature: string, criteria: SearchCriteria): Observable<ManageScheduleDataType[]> {
    return this.tableService.getData<ManageScheduleDataType[]>(ALL_SCHDULES_BY_FEATURE(feature), criteria);
  }

  /**
   * Converts backend schedule data into the table view model consumed by the template.
   *
   * @param data - Schedules returned by the API.
   * @returns Normalized schedule view rows.
   */
  convertToViewData(data: ManageScheduleDataType[] = []): ManageScheduleViewData[] {
    return data.map((schedule) => {
      const recipients = schedule.recipient_emails || [];
      const viewData = new ManageScheduleViewData();

      viewData.uuid = schedule.uuid;
      viewData.scheduleName = schedule.name;
      viewData.scheduleType = schedule.schedule_type;
      viewData.recurrencePattern = schedule.recurrence_pattern;
      viewData.reportName = schedule.report;
      viewData.recipients = recipients;
      viewData.recipientsText = recipients.join(',');

      return viewData;
    });
  }

  /**
   * Deletes a schedule by identifier.
   *
   * @param scheduleId - Identifier of the schedule to delete.
   * @returns Observable for the delete request.
   */
  delete(scheduleId: string): Observable<unknown> {
    return this.http.get(DELETE_SCHEDULE(scheduleId));
  }

  /**
   * Deletes multiple schedules by identifier.
   *
   * @param uuids - Schedule identifiers selected for bulk delete.
   * @returns Observable for the bulk delete request.
   */
  multipleScheduleDelete(uuids: string[]): Observable<unknown> {
    let params = new HttpParams();
    uuids.forEach((uuid) => {
      params = params.append('uuid', uuid);
    });

    return this.http.get(MULTIPLE_DELETE_SCHEDULE(), { params });
  }
}

/**
 * Represents normalized schedule data consumed by the Manage Schedule template.
 */
export class ManageScheduleViewData {
  uuid: string;
  scheduleName: string;
  scheduleType: string;
  recurrencePattern: string;
  reportName: string;
  recipients: string[];
  recipientsText: string;
  isSelected = false;
  selectionIconClass = 'fa-square';
}

/**
 * Describes the schedule list API contract.
 */
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
  recipient_emails: string[];
  additional_emails: string[];
}

/**
 * Describes the report metadata returned with a schedule.
 */
export interface ManageScheduleDatacenterCloudDataType {
  category: string;
  cabinets: string[];
  feature: string;
  report_url: string;
  reportType: string;
  datacenters: string[];
}
