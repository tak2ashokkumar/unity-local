import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class PerformanceReportPreviewService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private builder: FormBuilder,
    private utilService: AppUtilityService,) { }

  getReportData(uuid: string, criteria: SearchCriteria): Observable<PaginatedResult<PreformanceReportResult>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<PreformanceReportResult>>(MANAGE_REPORT_PREVIEW(uuid), { params: params });
    // return this.tableService.getData<PaginatedResult<any>>((MANAGE_REPORT_PREVIEW(uuid)), criteria);
  }

  convertToViewData(data: PreformanceReportResult[]) {
    let viewData: PreformanceReportResultViewData[] = [];
    data.map(d => {
      let a = new PreformanceReportResultViewData();
      a.deviceName = d.device_name;
      a.deviceType = this.utilService.toUpperCase(d.device_type);
      a.deviceIP = d.device_ip;
      a.deviceStatus = this.utilService.getDeviceStatus(d.device_status);
      a.metric = d.metric;
      a.metricValue = d.value;
      viewData.push(a);
    })
    return viewData;
  }
}

export interface PreformanceReportResult {
  device_name: string;
  device_type: string;
  device_ip: string;
  device_status: number;
  metric: string;
  value: number;
}

export class PreformanceReportResultViewData {
  deviceName: string;
  deviceType: string;
  deviceIP: string;
  deviceStatus: string;
  metric: string;
  metricValue: number;
}
