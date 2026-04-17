import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ALL_REPORTS_BY_FEATURE, DELETE_REPORTS, DOWNLOAD_REPORT, MULTIPLE_REPORT_SCHEDULE_DELETE, REPORT_SCHEDULE_COUNT, TOGGLE_REPORT, } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ManageReportDataType, ManageReportMetaDataType, ManageReportScheduleCountDataType, } from './report-management.type';

/**
 * Provides API access, form construction, and data mapping helpers for Report Management.
 */
@Injectable()
export class ReportManagementService {
  constructor(
    private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  /**
   * Loads or returns manage reports count for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getManageReportsCount(): Observable<ManageReportScheduleCountDataType> {
    return this.http.get<ManageReportScheduleCountDataType>(REPORT_SCHEDULE_COUNT());
  }

  /**
   * Loads or returns reports for the current workflow.
   *
   * @param feature - Report feature name used to scope API requests and routes.
   * @param criteria - Search, sort, and pagination criteria for the table request.
   * @returns The requested API observable or computed data.
   */
  getReports(feature: string, criteria: SearchCriteria): Observable<Array<ManageReportDataType>> {
    return this.tableService.getData<Array<ManageReportDataType>>(ALL_REPORTS_BY_FEATURE(feature), criteria);
  }

  /**
   * Converts to view data into the view or API format expected by the workflow.
   *
   * @param data - Source data returned by the API or child form.
   * @returns The normalized data structure expected by the caller.
   */
  convertToViewData(data: ManageReportDataType[] = []): ReportManagementViewData[] {
    // Keep backend DTOs out of templates; templates bind to display-ready view data.
    return data.map((report) => {
      const reportMeta: ManageReportMetaDataType = report.report_meta || {};
      const lv: ReportManagementViewData = new ReportManagementViewData();
      lv.uuid = report.uuid;
      lv.reportName = report.name;
      lv.featureName = report.feature;
      lv.reportType = report.default ? 'Default' : 'Custom';
      lv.reportCategory = reportMeta.category ? reportMeta.category : 'N/A';
      lv.reportUrl = reportMeta.report_url;
      lv.creationDate = report.created_at ? this.utilSvc.toUnityOneDateFormat(report.created_at) : 'NA';
      lv.lastUpdate = report.updated_at ? this.utilSvc.toUnityOneDateFormat(report.updated_at) : 'NA';
      lv.createdBy = report.created_by;
      lv.customerName = report.user;
      if (report.enable) {
        lv.active = 'Yes';
        lv.toggleIcon = 'fa-toggle-on';
        lv.toggleTootipMsg = 'Disable';
      } else {
        lv.active = 'No';
        lv.toggleIcon = 'fa-toggle-off';
        lv.toggleTootipMsg = 'Enable';
      }
      return lv;
    });
  }

  /**
   * Executes the download workflow for Report Management Service.
   *
   * @param uuid - Identifier used to target the uuid.
   * @returns The value produced by the workflow.
   */
  download(uuid: string): Observable<{ data: string }> {
    return this.http.get<{ data: string }>(DOWNLOAD_REPORT(uuid));
  }

  /**
   * Toggles  state for the current selection.
   *
   * @param uuid - Identifier used to target the uuid.
   * @returns The value produced by the workflow.
   */
  toggle(uuid: string): Observable<unknown> {
    return this.http.request('put', TOGGLE_REPORT(uuid));
  }

  /**
   * Executes the delete workflow for Report Management Service.
   *
   * @param reportId - Identifier used to target the report.
   * @returns The value produced by the workflow.
   */
  delete(reportId: string): Observable<unknown> {
    return this.http.delete(DELETE_REPORTS(reportId));
  }

  /**
   * Executes the multiple report delete workflow for Report Management Service.
   *
   * @param uuids - Uuids value used by this method.
   * @returns The value produced by the workflow.
   */
  multipleReportDelete(uuids: string[]): Observable<unknown> {
    let params: HttpParams = new HttpParams();
    uuids.forEach((uuid) => (params = params.append('uuid', uuid)));
    return this.http.get(MULTIPLE_REPORT_SCHEDULE_DELETE(), { params });
  }
}

/**
 * Represents normalized view data consumed by Unity Reports templates.
 */
export class ReportManagementViewData {
  constructor() { }
  uuid: string;
  reportName: string;
  featureName: string;
  reportType: string;
  cloudName: ManageReportCloudNameData[] = [];
  reportUrl: string;
  reportCategory: string;
  creationDate: string;
  lastUpdate: string;
  createdBy: number;
  customerName: string;
  isSelected: boolean = false;
  selectionIconClass: 'fa-check-square' | 'fa-square' = 'fa-square';
  active: string;

  toggleIcon: 'fa-toggle-on' | 'fa-toggle-off';
  toggleTootipMsg: 'Enable' | 'Disable';
}

/**
 * Represents the Manage Report Cloud Name Data contract used by the Unity Reports module.
 */
export class ManageReportCloudNameData {
  platformType: string;
  name: string;
  uuid: string;
}

/**
 * Dropdown data related classes used by the legacy datacenter helper contract.
 */
export class ManageReportDatacenterView {
  uuid: string;
  id: string;
  name: string;
  cabinets: ManageReportDatacenterCabinetView[];
  constructor() { }
}

/**
 * Represents normalized view data consumed by Unity Reports templates.
 */
export class ManageReportDatacenterCabinetView {
  uuid: string;
  name: string;
  constructor() { }
}
