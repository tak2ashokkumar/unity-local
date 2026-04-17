import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

/**
 * Provides API access, form construction, and data mapping helpers for Report Management Performance Report Preview.
 */
@Injectable()
export class ReportManagementPerformanceReportPreviewService {
  constructor(
    private tableService: TableApiServiceService,
    private http: HttpClient,
    private builder: FormBuilder,
    private utilService: AppUtilityService
  ) {}

  /**
   * Loads or returns report data for the current workflow.
   *
   * @param uuid - Identifier used to target the uuid.
   * @param criteria - Search, sort, and pagination criteria for the table request.
   * @returns The requested API observable or computed data.
   */
  getReportData(
    uuid: string,
    criteria: SearchCriteria
  ): Observable<PaginatedResult<PreformanceReportResult>> {
    // Performance preview has a dedicated endpoint because its result model differs from generic reports.
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<PreformanceReportResult>>(
      MANAGE_REPORT_PREVIEW(uuid),
      { params: params }
    );
    // return this.tableService.getData<PaginatedResult<any>>((MANAGE_REPORT_PREVIEW(uuid)), criteria);
  }

  /**
   * Converts to view data into the view or API format expected by the workflow.
   *
   * @param data - Source data returned by the API or child form.
   * @returns The normalized data structure expected by the caller.
   */
  convertToViewData(data: PreformanceReportResult[]) {
    // Add UI status formatting while keeping API result objects untouched.
    let viewData: PreformanceReportResultViewData[] = [];
    data.map((d) => {
      let a = new PreformanceReportResultViewData();
      a.deviceName = d.device_name;
      a.deviceType = this.utilService.toUpperCase(d.device_type);
      a.deviceIP = d.device_ip;
      a.deviceStatus = this.utilService.getDeviceStatus(d.device_status);
      a.metric = d.metric;
      a.metricValue = d.value;
      viewData.push(a);
    });
    return viewData;
  }
}

/**
 * Describes the Preformance Report Result data contract used by Unity Reports.
 */
export interface PreformanceReportResult {
  /**
   * Describes the device name value in the Preformance Report Result contract.
   */
  device_name: string;
  /**
   * Describes the device type value in the Preformance Report Result contract.
   */
  device_type: string;
  /**
   * Describes the device ip value in the Preformance Report Result contract.
   */
  device_ip: string;
  /**
   * Describes the device status value in the Preformance Report Result contract.
   */
  device_status: number;
  /**
   * Describes the metric value in the Preformance Report Result contract.
   */
  metric: string;
  /**
   * Describes the value value in the Preformance Report Result contract.
   */
  value: number;
}

/**
 * Represents normalized view data consumed by Unity Reports templates.
 */
export class PreformanceReportResultViewData {
  /**
   * Stores the device name value used by Preformance Report Result View Data.
   */
  deviceName: string;
  /**
   * Stores the device type value used by Preformance Report Result View Data.
   */
  deviceType: string;
  /**
   * Stores the device ip value used by Preformance Report Result View Data.
   */
  deviceIP: string;
  /**
   * Stores the device status value used by Preformance Report Result View Data.
   */
  deviceStatus: string;
  /**
   * Stores the metric value used by Preformance Report Result View Data.
   */
  metric: string;
  /**
   * Stores the metric value value used by Preformance Report Result View Data.
   */
  metricValue: number;
}
