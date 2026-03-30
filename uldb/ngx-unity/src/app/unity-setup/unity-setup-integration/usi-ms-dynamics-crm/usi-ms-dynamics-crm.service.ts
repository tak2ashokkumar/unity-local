import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DYNAMICCRM_CLIENTS } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class UsiMsDynamicsCRMService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient) { }

  getMSDynamicsClients(criteria: SearchCriteria): Observable<MSDynamicsCRMType[]> {
    return this.tableService.getData<MSDynamicsCRMType[]>(DYNAMICCRM_CLIENTS(), criteria);
  }
}

export interface MSDynamicsCRMType {
  id: number;
  name: string;
  uuid: string;
  crm_url: string;
  client_id: string;
  tenant_id: string;
  // username: string;
  client_secret: string;
  is_default: boolean;
  user: number;
  access_type: string;
  crm_account_uuid: string;
}

export interface MSDynamicsCRMClientType {
  id: number;
  crm_instance: string;
  crm_account_id: string;
  uuid: string;
  org: number;
}


