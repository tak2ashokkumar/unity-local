import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ALL_REPORTS_BY_FEATURE, DELETE_REPORTS, DOWNLOAD_REPORT, MULTIPLE_REPORT_SCHEDULE_DELETE, REPORT_SCHEDULE_COUNT, TOGGLE_REPORT } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ManageReportDataType, ManageReportScheduleCountDataType } from './manage-reports.type';

@Injectable({
  providedIn: 'root'
})
export class ManageReportsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getManageReportsCount(): Observable<ManageReportScheduleCountDataType> {
    return this.http.get<ManageReportScheduleCountDataType>(REPORT_SCHEDULE_COUNT());
  }

  getReports(feature: string, criteria: SearchCriteria): Observable<Array<ManageReportDataType>> {
    return this.tableService.getData<Array<ManageReportDataType>>(ALL_REPORTS_BY_FEATURE(feature), criteria);
  }

  convertToViewData(data: ManageReportDataType[]): ManageReportViewData[] {
    let viewData: ManageReportViewData[] = [];
    data.forEach(data => {
      let lv: ManageReportViewData = new ManageReportViewData();
      lv.uuid = data.uuid;
      lv.reportName = data.name;
      lv.featureName = data.feature;
      lv.reportType = data.default ? 'Default' : 'Custom';
      lv.reportCategory = data.report_meta.category ? data.report_meta.category : 'N/A';
      lv.reportUrl = data.report_meta.report_url;
      lv.creationDate = data.created_at ? this.utilSvc.toUnityOneDateFormat(data.created_at) : 'NA';
      lv.lastUpdate = data.updated_at ? this.utilSvc.toUnityOneDateFormat(data.updated_at) : 'NA';
      lv.createdBy = data.created_by;
      lv.customerName = data.user;
      if (data.enable) {
        lv.active = 'Yes';
        lv.toggleIcon = 'fa-toggle-on';
        lv.toggleTootipMsg = 'Disable';
      } else {
        lv.active = 'No';
        lv.toggleIcon = 'fa-toggle-off';
        lv.toggleTootipMsg = 'Enable';
      }
      //lv.newReport = (data.feature == 'Cloud Inventory' || data.feature == 'DC Inventory' || data.feature == 'Cost Analysis' || data.feature == 'sustainability') ? true : false;
      viewData.push(lv);
    })
    return viewData;
  }

  download(uuid: string) {
    return this.http.get<{ data: string }>(DOWNLOAD_REPORT(uuid));
  }

  toggle(uuid: string) {
    return this.http.request('put', TOGGLE_REPORT(uuid));
  }

  delete(reportId: string) {
    return this.http.delete(DELETE_REPORTS(reportId));
  }

  multipleReportDelete(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuid', uuid));
    return this.http.get(MULTIPLE_REPORT_SCHEDULE_DELETE(), { params: params });
  }
}

export class ManageReportViewData {
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
  active: string;

  toggleIcon: 'fa-toggle-on' | 'fa-toggle-off';
  toggleTootipMsg: 'Enable' | 'Disable';

  //newReport?: boolean;
}

export class ManageReportCloudNameData {
  platformType: string;
  name: string;
  uuid: string;
}