import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class ServicesOverviewWidgetService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getServiceOverviewData(criteria: SearchCriteria, appId: number): Observable<AppResultsResponse> {
    return this.tableService.getData<AppResultsResponse>(`/apm/monitoring/applist/?app_id=${appId}`, criteria);
  }

  convertToServiceViewData(data: AppResult[]): ServiceViewData[] {
    let viewData: ServiceViewData[] = [];
    data.map(s => {
      let a: ServiceViewData = new ServiceViewData();
      a.name = s.name;
      a.throughput = s.throughput ? s.throughput : 'N/A';
      a.parentAppAvailability = s.parent_app_availability ?  s.parent_app_availability : 'N/A';
      a.parentAppStatusCode = s.parent_app_status_code;
      if(s.parent_app_status_code =="1") {
        a.icon = 'fa fa-check-circle text-success';
        a.tooltipMessage = 'Up';
      }
      else if (s.parent_app_status_code =="-1" || !s.parent_app_status_code){
        a.icon = 'fa fa-exclamation-circle text-warning';
        a.tooltipMessage = 'Unknown';
      }else{
        a.icon = 'fa fa-triangle text-danger fa-exclamation';
        a.tooltipMessage = 'Down';
      }
      a.latency = s.latency ? s.latency : 'N/A';
      a.status = s.parent_app_status_code;
      
      viewData.push(a);
    });
    return viewData;
  }
}

export interface AppResult {
  id: number;
  name: string;
  uuid: string;
  hostname: string;
  latency: string;
  throughput: string;
  device_id: number;
  content_type: number;
  parent_app: number;
  customer: number;
  type_of_app: string;
  parent_app_availability: string | null;
  parent_app_status_code: string;
}

export interface AppResultsResponse {
  count: number;
  next: string;
  previous: string;
  results: AppResult[];
  avg_throughput: string;
  avg_latency: string;
  avg_availability: string;
}

export class ServiceViewData {
  constructor() { };
  id: number;
  name: string;
  uuid: string;
  hostname: string;
  latency: string;
  throughput: string;
  deviceId: number;
  contentType: number;
  parentApp: number;
  customer: number;
  typeOfApp: string;
  parentAppAvailability: string | null;
  parentAppStatusCode: string;
  icon: string;
  tooltipMessage: string;
  status: string;
}
