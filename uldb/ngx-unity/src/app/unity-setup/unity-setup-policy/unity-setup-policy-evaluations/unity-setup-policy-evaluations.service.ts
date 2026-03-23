import { Injectable } from '@angular/core';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PolicyDataItem, PolicyEvaluationsItem } from '../unity-setup-policy.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class UnitySetupPolicyEvaluationsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService, private http: HttpClient,) { }

  getEvaluationTableData(criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<PolicyEvaluationsItem>>(`/rest/policy/evaluations/`, criteria);
  }

  getPolicy(): Observable<PaginatedResult<PolicyDataItem>> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<PaginatedResult<PolicyDataItem>>(`/rest/policy/policies/`, { params: params });
  }

  convertToViewData(data: PolicyEvaluationsItem[]): PolicyEvaluationsItemViewData[] {
    let viewData: PolicyEvaluationsItemViewData[] = [];
    data.forEach(v => {
      let view: PolicyEvaluationsItemViewData = new PolicyEvaluationsItemViewData();
      view.policyName = v.policy_name;
      view.policyType = v.policy_type;
      view.scope = v.scope;
      view.scopeIdentifier = v.scope_identifier ? v.scope_identifier : [];

      view.scopeIdentify = v.scope_identifier.length ? v.scope_identifier.getFirst() : '';
      view.extraScopeIdentifier = v.scope_identifier.length ? v.scope_identifier.slice(1) : [];
      view.scopeIdentifierBadgeCount = v.scope_identifier.length ? v.scope_identifier.length - 1 : 0;

      view.source = v.source;
      view.message = v.message;
      view.executedAt = this.utilSvc.toUnityOneDateFormat(v.executed_at);
      view.result = v.result;
      view.resultIcon = this.getIcon(v.result);
      view.details = Array.isArray(v.details) ? this.convertToTableData(v.details) : null;
      view.inputs = v.inputs;
      viewData.push(view);
    });
    return viewData;
  }

  convertToTableData(input) {
    return input.map(entry => {
      const rows = entry.data;
      if (!rows || rows.length === 0) return null;

      // Get dynamic headers from keys of first row
      // const keys = Object.keys(rows[0]);

      // Convert keys to title case for headers
      const headers = entry.headers.map(key =>
        key
          .replace(/_/g, ' ')
          .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1))
      );

      // Convert rows into 2D array
      // const tableRows = rows.map(row => keys.map(k => row[k]));

      return {
        scope: entry.scope,
        headers: headers,
        rows: entry.data
      };
    }).filter(Boolean);
  }

  //   Compliant
  // Violation
  // Approval Pending
  // Approved
  // Rejected
  // Error

  getIcon(type: string) {
    switch (type) {
      case 'Violation': return 'fa-ban text-danger';
      case 'Approval Pending': return 'fa-clock text-warning';
      case 'Approved': return 'fa-thumbs-up text-success';
      case 'Compliant': return 'text-success fa-check ';
      case 'Error': return 'fa-exclamation-triangle text-danger';
      case 'Rejected': return 'fa-thumbs-down text-danger';
      default: return '';
    }
  }
}

export class PolicyEvaluationsItemViewData {
  constructor() { }
  policyName: string;
  policyType: string;
  source: string;
  scope: string;
  scopeIdentifier: string[];
  message: string;
  resultIcon: string;
  executedAt: string;
  result: string;
  details: string[] | string;
  inputs: {};
  scopeIdentify: string;
  extraScopeIdentifier: string[];
  scopeIdentifierBadgeCount: number;
}
