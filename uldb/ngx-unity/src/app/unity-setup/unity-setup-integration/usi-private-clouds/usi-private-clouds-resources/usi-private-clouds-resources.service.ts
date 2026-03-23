import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { AzureAccountResource } from 'src/app/shared/SharedEntityTypes/azure.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UsiPrivateCloudsResourcesService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getResources(instanceId: string, criteria: SearchCriteria, cloudName: string) {
    return this.tableService.getData<PaginatedResult<PrivateCloudsDataModel>>(`/customer/integration/${cloudName}/accounts/${instanceId}/resources/`, criteria);
  }

  convertToViewData(data: PrivateCloudsDataModel[]): PrivateCloudsViewData[] {
    let viewData: PrivateCloudsViewData[] = [];
    data.map(d => {
      let a = new PrivateCloudsViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.managementIp = d.mgmt_ip_address ? d.mgmt_ip_address : 'N/A';
      a.osName = d.os_name ? d.os_name : 'N/A';
      a.type = d.is_template ? 'Template' : 'VM';
      viewData.push(a);
    })
    return viewData;
  }
}

export class PrivateCloudsViewData {
  constructor() { }
  uuid: string;
  name: string;
  type: string;
  osName: string;
  managementIp: string;
}

export interface PrivateCloudsDataModel {
  uuid: string;
  name: string;
  is_template: string;
  os_name: string;
  mgmt_ip_address: string;
}


