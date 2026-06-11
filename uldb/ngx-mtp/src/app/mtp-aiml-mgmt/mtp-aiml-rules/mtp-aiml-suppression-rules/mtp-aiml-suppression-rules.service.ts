import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AIMLSuppressionRule } from 'src/app/shared/SharedEntityTypes/aiml-rules.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpAimlSuppressionRulesService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private tableService: TableApiServiceService) { }

  getRules(criteria: SearchCriteria) {
    return this.tableService.getData<AIMLSuppressionRule[]>(`/customer/mtp/srules/`, criteria);
  }

  convertToViewdata(rules: AIMLSuppressionRule[]): AIMLSuppressionRuleViewdata[] {
    let arr: AIMLSuppressionRuleViewdata[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    rules.forEach(rule => {
      let view = new AIMLSuppressionRuleViewdata();
      view.uuid = rule.uuid;
      view.name = rule.name;
      view.description = rule.description ? rule.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      view.user = rule.user ? rule.user : 'NA';
      view.createdAt = rule.created_at ? datePipe.transform(rule.created_at.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      view.updatedAt = rule.updated_at ? datePipe.transform(rule.updated_at.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
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
    return this.http.delete(`/customer/mtp/srules/${ruleId}/`);
  }

  enableRule(ruleId: string): Observable<any> {
    return this.http.get(`/customer/mtp/srules/${ruleId}/enable/`);
  }

  disableRule(ruleId: string): Observable<any> {
    return this.http.get(`/customer/mtp/srules/${ruleId}/disable/`);
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
