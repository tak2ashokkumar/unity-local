import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationServiceType } from 'src/app/shared/SharedEntityTypes/application.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class ApplicationDiscoveryServicesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getServices(criteria: SearchCriteria): Observable<PaginatedResult<ApplicationServiceType[]>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<ApplicationServiceType[]>>(`/apm/monitoring/applist/`, { params: params });
  }

  convertToViewData(data: ApplicationServiceType[]): ApplicationServiceViewData[] {
    let viewData: ApplicationServiceViewData[] = [];
    data.map(s => {
      let view: ApplicationServiceViewData = new ApplicationServiceViewData();
      view.id = s.id;
      view.uuid = s.uuid;
      view.name = s.name ? s.name : 'N/A';
      view.hostname = s.hostname ? s.hostname : 'N/A';
      view.appType = s.type_of_app ? s.type_of_app : 'N/A';
      view.latency = s.latency ? s.latency : 'N/A';
      view.throughput = s.throughput ? s.throughput : 'N/A';
      view.deviceId = s.device_id ? s.device_id : 'N/A';
      view.contentType = s.content_type ? s.content_type : 'N/A';

      viewData.push(view);
    })
    return viewData;
  }
}

export class ApplicationServiceViewData {
  constructor() { };
  id: number;
  uuid: string;
  name: string;
  hostname: string;
  appType: string;
  latency: string;
  throughput: string;
  deviceId: string;
  contentType: string;
}
