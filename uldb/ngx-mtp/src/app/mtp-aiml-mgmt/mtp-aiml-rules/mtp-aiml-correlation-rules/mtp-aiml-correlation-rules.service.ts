import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AIMLCorrelationRule } from 'src/app/shared/SharedEntityTypes/aiml-rules.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpAimlCorrelationRulesService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getRules(criteria: SearchCriteria) {
    return this.tableService.getData<AIMLCorrelationRule[]>(`/customer/mtp/correlation_rules/`, criteria);
  }

  convertToViewdata(rules: AIMLCorrelationRule[]): AIMLCorrelationRuleViewdata[] {
    let arr: AIMLCorrelationRuleViewdata[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    rules.forEach(rule => {
      let view = new AIMLCorrelationRuleViewdata();
      view.uuid = rule.uuid;
      view.name = rule.name;
      view.createdBy = rule.user;
      view.conditionCount = rule.condition_count;
      view.creationDate = rule.created_datetime ? datePipe.transform(rule.created_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      view.lastUpdated = rule.updated_datetime ? datePipe.transform(rule.updated_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      view.correlator = rule.correlator ? this.utilSvc.toUpperCase(rule.correlator) : rule.correlator;
      view.description = rule.description ? rule.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      view.active = rule.is_active;
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
    return this.http.delete(`/customer/mtp/correlation_rules/${ruleId}/`);
  }

  enableRule(ruleId: string): Observable<any> {
    return this.http.get(`/customer/mtp/correlation_rules/${ruleId}/enable/`);
  }

  disableRule(ruleId: string): Observable<any> {
    return this.http.get(`/customer/mtp/correlation_rules/${ruleId}/disable/`);
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
  correlator: string;
  description: string;
  active: boolean;
  status: string;
  statusClass: string;
}
