import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ConnectionConfigType } from './unity-setup-connections-crud/unity-setup-connections.type';

@Injectable()
export class UnitySetupConnectionsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private userService: UserInfoService,
    private appService: AppLevelService,
    private builder: FormBuilder) { }

  getConnections(criteria: SearchCriteria): Observable<PaginatedResult<ConnectionConfigType>> {
    return this.tableService.getData<PaginatedResult<ConnectionConfigType>>('/orchestration/connection/', criteria);
  }

  deleteConnection(connectionId: string){
    return this.http.delete(`/orchestration/connection/${connectionId}/`);
  }

  convertToViewData(data: ConnectionConfigType[]): ConnectionConfigViewData[] {
    let viewData: ConnectionConfigViewData[] = [];
    data.map(s=>{
      let a : ConnectionConfigViewData = new ConnectionConfigViewData();
      a.uuid = s.uuid;
      a.name = s.name;
      a.baseUrl = s.base_url;
      a.authType = s.auth_type;
      viewData.push(a);
    });
    return viewData;
  }

}

export class ConnectionConfigViewData {
  constructor() {};
  uuid: string;
  name: string;
  baseUrl: string;
  authType: string;
  oauth2Grant?: string;
  username?: string;
  password?: string;
  apiKey?: string | null;
  apiKeyField?: string | null;
  apiKeyMethod?: string | null;
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  status?: number;
}