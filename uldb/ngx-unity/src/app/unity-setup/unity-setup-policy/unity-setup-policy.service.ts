import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PolicyDataItem } from './unity-setup-policy.type';

@Injectable()
export class UnitySetupPolicyService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getPolicy(criteria: SearchCriteria): Observable<PaginatedResult<PolicyDataItem>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<PolicyDataItem>>(`/rest/policy/policies/`, { params: params });
  }

  toggleStatus(uuid: string) {
    return this.http.get(`/rest/policy/policies/${uuid}/toggle/`);
  }

  deleteBudget(uuid: string) {
    return this.http.delete(`/rest/policy/policies/${uuid}`);
  }


  convertToPolicyViewData(data: PolicyDataItem[]): PolicyDataItemViewData[] {
    const viewData: PolicyDataItemViewData[] = [];

    data.forEach(item => {
      const viewItem = new PolicyDataItemViewData();
      viewItem.uuid = item.uuid;
      viewItem.name = item.name;
      viewItem.policyType = item.policy_type;
      viewItem.scope = item.scope;
      viewItem.scopeIdentifier = item.scope_name ? item.scope_name : '';
      viewItem.notificationEnabled = item.notification_enabled ? 'Yes' : 'No';
      viewItem.isEnabled = item.is_enabled;
      viewData.push(viewItem);
    });

    return viewData;
  }

}


export class PolicyDataItemViewData {
  constructor() { }

  uuid: string;
  name: string;
  policyType: string;
  scope: string;
  scopeIdentifier: string;
  notificationEnabled: string;
  isEnabled: boolean;
}



