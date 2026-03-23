import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ApplicationType } from 'src/app/shared/SharedEntityTypes/application.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UnityApplicationsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getApplicationList(criteria: SearchCriteria): Observable<PaginatedResult<ApplicationType[]>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<ApplicationType[]>>(`/apm/monitoring/parent_app_list/`, { params: params });
  }

  convertToViewData(data: ApplicationType[]): ApplicationViewData[] {
    let viewData: ApplicationViewData[] = [];
    data.map(d => {
      let view: ApplicationViewData = new ApplicationViewData();
      view.id = d.id;
      view.customerId = d.customer;
      view.name = d.name ? d.name : 'N/A';
      view.type = d.type ? d.type : 'N/A';
      view.latency = d.latency ? d.latency : 'N/A';
      view.throughput = d.throughput ? d.throughput : 'N/A';
      view.status = d.status_code ? this.utilSvc.getDeviceStatus(d.status_code) : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }
}


export class ApplicationViewData {
  constructor() { };
  id: number;
  customerId: number;
  name: string;
  type: string;
  latency: string;
  throughput: string;
  status: string;
}