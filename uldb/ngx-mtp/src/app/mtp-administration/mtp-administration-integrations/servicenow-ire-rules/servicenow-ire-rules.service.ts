import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ServiceNowResourceType } from '../servicenow-crud/servicenow-crud.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { IREIdentifierRule, IREReconciliationRule, IRERefreshRule, IRERuleEntryAttribute } from './servicenow-ire-rules.type';
import { map } from 'rxjs/operators';

@Injectable()
export class ServicenowIreRulesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getSnResourceList(id: string): Observable<ServiceNowResourceType[]> {
    const params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<ServiceNowResourceType[]>(`/customer/mtp/cmdb-resources/?uuid=${id}`, { params: params });
  }

  getRules(criteria: SearchCriteria) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<IREIdentifierRule>>(`/customer/mtp/cmdb_indentifier_rules/`, { params: params });
  }

  getRuleData(instanceId: string, rule: IREIdentifierRule) {
    let params: HttpParams = new HttpParams().set('uuid', instanceId).set('resource', rule.applies_to);
    return this.http.get<PaginatedResult<IREIdentifierRule>>(`/customer/mtp/cmdb_indentifier_rules/`, { params: params })
      .pipe(
        map((res: PaginatedResult<IREIdentifierRule>) => {
          if (rule.applies_to && res && res.results.length) {
            let obj = res.results.getFirst();
            rule.entry_attributes = obj.entry_attributes;
            rule.reconciliation_rules = obj.reconciliation_rules;
            rule.refresh_rules = obj.refresh_rules;
            rule.target = 'entry_attributes';
            rule.applies_label = obj.applies_label;
            obj.reconciliation_rules.forEach((r, index) => {
              r.reconciliation_definitions.forEach(rd => {
                if (r.discoverySourcePriority) {
                  r.discoverySourcePriority = r.discoverySourcePriority.concat(`, ${rd.discovery_source}[${rd.priority}]`);
                } else {
                  r.discoverySourcePriority = `${rd.discovery_source}[${rd.priority}]`;
                }
              })
            })
          }
          rule.details = true;
          return rule;
        })
      );
  }

  updateIdentifierRule(instanceId: string, view: IREIdentifierRule) {
    return this.http.put(`/customer/mtp/servicenow/${instanceId}/update_identifier_rule/?sys_id=${view.sys_id}`, view);
  }

  updateEntryAttributes(instanceId: string, view: IRERuleEntryAttribute) {
    return this.http.put(`/customer/mtp/servicenow/${instanceId}/update_entry_attribute/?sys_id=${view.sys_id}`, view);
  }

  updateReconciliationRule(instanceId: string, view: IREReconciliationRule) {
    return this.http.put(`/customer/mtp/servicenow/${instanceId}/update_reconciliation_rule/?mapped_tile=${view.mapped_tile}`, view);
  }

  updateRefreshRule(instanceId: string, view: IRERefreshRule) {
    return this.http.put(`/customer/mtp/servicenow/${instanceId}/update_data_refresh_rule/?sys_id=${view.sys_id}`, view);
  }
}
