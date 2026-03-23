import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AIOPS_SUPPRESSION_RULE, AIOPS_SUPPRESSION_RULE_BY_ID, AIOPS_SUPPRESSION_RULE_DISABLE, AIOPS_SUPPRESSION_RULE_ENABLE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AIMLSuppressionRule } from '../aiml-rules.type';

@Injectable()
export class AimlSuppressionRulesService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getRules(criteria: SearchCriteria) {
    return this.tableService.getData<AIMLSuppressionRule[]>(AIOPS_SUPPRESSION_RULE(), criteria);
  }

  convertToViewdata(rules: AIMLSuppressionRule[]): AIMLSuppressionRuleViewdata[] {
    let arr: AIMLSuppressionRuleViewdata[] = [];
    rules.forEach(rule => {
      let view = new AIMLSuppressionRuleViewdata();
      view.uuid = rule.uuid;
      view.name = rule.name;
      view.description = rule.description ? rule.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      view.user = rule.user ? rule.user : 'NA';
      view.createdAt = rule.created_at ? this.utilSvc.toUnityOneDateFormat(rule.created_at) : 'N/A';
      view.updatedAt = rule.updated_at ? this.utilSvc.toUnityOneDateFormat(rule.updated_at) : 'N/A';
      view.alertCount = rule.alert_count;
      view.active = rule.active;
      if (rule.active) {
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
    return this.http.delete(AIOPS_SUPPRESSION_RULE_BY_ID(ruleId));
  }

  enableRule(ruleId: string): Observable<any> {
    return this.http.get(AIOPS_SUPPRESSION_RULE_ENABLE(ruleId));
  }

  disableRule(ruleId: string): Observable<any> {
    return this.http.get(AIOPS_SUPPRESSION_RULE_DISABLE(ruleId));
  }
}

export class AIMLSuppressionRuleViewdata {
  constructor() { }
  uuid: string;
  name: string;
  description: string;
  user: string;
  updatedAt: string;
  createdAt: string;
  alertCount: number;
  active: boolean;
  status: string;
  statusClass: string;
}
