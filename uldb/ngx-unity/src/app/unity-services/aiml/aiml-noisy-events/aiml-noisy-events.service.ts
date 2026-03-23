import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AIMLNoisyEvents } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AnalyticsFilterFormData } from '../aiml-analytics/aiml-analytics.service';

@Injectable()
export class AimlNoisyEventsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getNoisyEvents(formData: AnalyticsFilterFormData, criteria: SearchCriteria): Observable<AIMLNoisyEvents[]> {
    if (criteria.pageSize) {
      formData.count = criteria.pageSize;
    }
    // if (criteria.searchValue && criteria.searchValue != '') {
    //   console.log(criteria.searchValue,'what the hell')
    // }
    formData.search = criteria.searchValue;
    return this.http.post<AIMLNoisyEvents[]>('/customer/aiops/events/noisy/', formData);
  }

  convertToNoisyEventsViewData(events: AIMLNoisyEvents[]): AIMLNoisyEventsViewData[] {
    let viewData: AIMLNoisyEventsViewData[] = [];
    events.map(e => {
      let a = new AIMLNoisyEventsViewData();
      a.event = e.description;
      a.count = e.event_count;
      a.eventTime = e.last_reported ? this.utilSvc.toUnityOneDateFormat(e.last_reported) : 'N/A';
      a.severity = e.severity;
      switch (e.severity) {
        case 'Critical':
          a.severityClass = 'fas fa-exclamation-triangle text-danger';
          break;
        case 'Warning':
          a.severityClass = 'fas fa-exclamation-circle text-warning';
          break
        case 'Information':
          a.severityClass = 'fas fa-info-circle text-primary';
          break;
      }
      a.status = e.status;
      a.statusClass = e.status == 'Resolved' ? 'text-success' : 'text-danger';
      a.source = e.source;
      a.acknowledged = e.is_acknowledged ? 'Yes' : 'No';
      viewData.push(a);
    })
    return viewData;
  }
}

export class AIMLNoisyEventsViewData {
  constructor() { }
  event: string;
  count: number;
  eventTime: string;
  severity: string;
  severityClass: string;
  description: string;
  status: string;
  statusClass: string;
  source: string;
  acknowledged: string;
}
