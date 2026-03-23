import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AIOPS_CORRELATION_RULES, AIOPS_CORRELATION_RULE_BY_ID, AIOPS_CORRELATION_RULE_DISABLE, AIOPS_CORRELATION_RULE_ENABLE, AIOPS_CORRELATION_RULE_UPDATE_PRIORITY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AIMLCorrelationRule } from '../aiml-rules.type';

@Injectable()
export class AimlCorrelationRulesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getRules(criteria: SearchCriteria) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get(AIOPS_CORRELATION_RULES(),{ params: params });
  }

  convertToViewdata(rules: AIMLCorrelationRule[]): AIMLCorrelationRuleViewdata[] {
    let arr: AIMLCorrelationRuleViewdata[] = [];
    rules.forEach(rule => {
      let view = new AIMLCorrelationRuleViewdata();
      view.uuid = rule.uuid;
      view.name = rule.name;
      view.createdBy = rule.user;
      view.conditionCount = rule.condition_count;
      view.creationDate = rule.created_datetime ? this.utilSvc.toUnityOneDateFormat(rule.created_datetime) : 'N/A';
      view.lastUpdated = rule.updated_datetime ? this.utilSvc.toUnityOneDateFormat(rule.updated_datetime) : 'N/A';
      view.correlators = rule.correlators ? rule.correlators : [];
      view.description = rule.description ? rule.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      view.active = rule.is_active;
      view.order = rule.order;
      view.priority = rule.priority;
      view.specificity = rule.specificity;
      view.relevance = rule.relevance;
      if (rule.is_active) {
        view.status = 'Enabled';
        view.statusClass = 'text-success';
      } else {
        view.status = 'Disabled';
        view.statusClass = 'text-warning'
      }
      arr.push(view);
    });
    return arr;
  }

  deleteRule(ruleId: string): Observable<any> {
    return this.http.delete(AIOPS_CORRELATION_RULE_BY_ID(ruleId));
  }

  enableRule(ruleId: string): Observable<any> {
    return this.http.get(AIOPS_CORRELATION_RULE_ENABLE(ruleId));
  }

  disableRule(ruleId: string): Observable<any> {
    return this.http.get(AIOPS_CORRELATION_RULE_DISABLE(ruleId));
  }

  updatePriority(uuid: string, data: {priority: number}) {
    return this.http.patch(AIOPS_CORRELATION_RULE_UPDATE_PRIORITY(uuid), data);
  }
}

export class AIMLCorrelationRuleViewdata {
  constructor() { }
  uuid: string;
  name: string;
  conditionCount: number;
  createdBy: string;
  creationDate: string;
  lastUpdated: string;
  description: string;
  active: boolean;
  status: string;
  statusClass: string;
  correlators: string[];
  orderChangeFlag: boolean;
  priority: number;
  specificity: number;
  relevance: number;
  order: number;
}
