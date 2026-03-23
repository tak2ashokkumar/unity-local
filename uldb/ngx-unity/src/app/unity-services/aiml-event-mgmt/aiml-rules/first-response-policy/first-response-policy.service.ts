import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AIOPS_SUPPRESSION_RULE, AIOPS_SUPPRESSION_RULE_BY_ID, AIOPS_SUPPRESSION_RULE_DISABLE, AIOPS_SUPPRESSION_RULE_ENABLE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FirstResponsePolicy } from '../first-response-policy.type';

@Injectable()
export class FirstResponsePolicyService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getTenants() {
    return this.http.get<TenantDataType[]>(`/customer/firstresponsepolicy/tenants/`);
  }

  getPolicyList(criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<FirstResponsePolicy>>(AIOPS_SUPPRESSION_RULE(), criteria);
  }

  convertToViewdata(policy: FirstResponsePolicy[]): FirstResponsePolicyViewdata[] {
    let arrayList: FirstResponsePolicyViewdata[] = [];
    policy.forEach(policy => {
      let view = new FirstResponsePolicyViewdata();
      view.uuid = policy.uuid;
      view.name = policy.name;
      view.createdDate = policy.created_at ? this.utilSvc.toUnityOneDateFormat(policy.created_at) : 'N/A';
      view.createdBy = policy.user;
      view.active = policy.active;
      view.status = policy.active ? 'Enabled' : 'Disabled';
      view.statusClass = policy.active ? 'text-success' : 'text-warning';
      arrayList.push(view);
    });
    return arrayList;
  }

  deletePolicy(policyId: string): Observable<any> {
    return this.http.delete(AIOPS_SUPPRESSION_RULE_BY_ID(policyId));
  }

  enablePolicy(policyId: string): Observable<any> {
    return this.http.get(AIOPS_SUPPRESSION_RULE_ENABLE(policyId));
  }

  disablePolicy(policyId: string): Observable<any> {
    return this.http.get(AIOPS_SUPPRESSION_RULE_DISABLE(policyId));
  }

}

export class FirstResponsePolicyViewdata {
  constructor() { }
  uuid: string;
  name: string;
  createdDate: string;
  createdBy: string;
  status: string;
  active: boolean;
  statusClass: string;
}

export interface TenantDataType {
  uuid: string;
  name: string;
  tenant_uuid: string;
  parent_account: number;
  account_uuid: string;
  id: number;
}