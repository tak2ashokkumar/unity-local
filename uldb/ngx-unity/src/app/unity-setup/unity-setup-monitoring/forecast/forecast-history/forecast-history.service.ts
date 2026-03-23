import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DisableTriggerType, EventResolveType, HistoryData } from './forecast-history.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ForecastHistoryService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getEvents(criteria: SearchCriteria, deviceId: number, itemId: number, filterData?: any) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    if (filterData) {
      Object.keys(filterData).forEach(key => {
        if (filterData[key] && filterData[key].length) {
          if (Array.isArray(filterData[key])) {
            filterData[key].forEach(d => {
              params = params.append(key, d);
            })
          } else {
            params = params.append(key, filterData[key]);
          }
        }
      });
    }
    return this.http.get<PaginatedResult<HistoryData>>(`/customer/alert_prediction/devices/${deviceId}/items/${itemId}/events/`, { params: params });
  }

  convertDetailsToViewdata(events: HistoryData[]) {
    let viewdata: HistoryViewData[] = [];
    events.forEach(event => {
      let view = new HistoryViewData();
      view.id = event.id;
      view.uuid = event.uuid;
      view.deviceName = event.device_name;
      view.description = event.description ? event.description : 'NA';
      view.eventDatetime = event.event_datetime ? this.utilSvc.toUnityOneDateFormat(event.event_datetime) : 'N/A';
      view.severity = event.severity;
      if (event.severity == 'Critical') {
        view.severityClass = 'text-danger';
        view.severityIcon = 'fa-exclamation-circle text-danger';
      } else if (event.severity == 'Warning') {
        view.severityClass = 'text-warning';
        view.severityIcon = 'fa-exclamation-circle text-warning';
      } else {
        view.severityClass = 'text-primary';
        view.severityIcon = 'fa-info-circle text-primary';
      }
      view.status = event.status;
      if (event.status == 'Resolved') {
        view.statusTextColor = 'text-success';
        view.triggerDisableBtnTooltipMsg = 'Disabled';
        view.isStatusResolved = true;
        view.resolveBtnTooltipMsg = 'Resolved';
      } else {
        view.statusTextColor = 'text-danger';
        view.triggerDisableBtnTooltipMsg = 'Disable Trigger';
        view.isStatusResolved = false;
        view.resolveBtnTooltipMsg = 'Resolve';
      }
      view.source = event.source;
      view.isSourceUnity = event.source == 'Unity';
      view.sourceAccount = event.source_account;
      view.duration = event.duration;
      view.deviceType = event.device_type ? event.device_type : 'NA';
      view.ipAddress = event.ip_address ? event.ip_address : 'NA';
      view.isAcknowledged = event.is_acknowledged;
      view.acknowledgedTime = event.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(event.acknowledged_time) : null;
      view.acknowledgedBy = event.acknowledged_by;
      view.acknowledgedComment = event.acknowledged_comment;
      view.acknowledgedTooltipMsg = `Ack by: ${view.acknowledgedBy}<br>` + `Ack Msg: ${insertLineBreaks(view.acknowledgedComment, 10, 35)}<br>` + `Ack At: ${view.acknowledgedTime}`;
      view.recoveredTime = event.recovered_time ? this.utilSvc.toUnityOneDateFormat(event.recovered_time) : 'NA';
      view.eventMetric = event.event_metric ? event.event_metric : 'NA';
      viewdata.push(view);
    });
    return viewdata;
  }

  onAcknowledge(eventId: string, formData: any): Observable<HistoryData> {
    return this.http.post<HistoryData>(`/customer/aiops/events/${eventId}/acknowledge/`, formData)
      .pipe(map(res => {
        res.acknowledged_time = res.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(res.acknowledged_time) : null;
        return res;
      }));
  }

  buildAcknowledgeForm() {
    return this.builder.group({
      'is_acknowledged': [true],
      'ack_comment': ['', [Validators.required, NoWhitespaceValidator]]
    })
  }

  resetAcknowledgeFormErrors() {
    return {
      'ack_comment': ''
    }
  }
  acknowledgeFormValidationMessages = {
    'ack_comment': {
      'required': 'Acknowledge Comment is required'
    }
  }

  disable(eventId: string): Observable<DisableTriggerType> {
    return this.http.post<DisableTriggerType>(`/customer/aiops/events/${eventId}/disable_trigger/`, {});
  }

  resolve(eventId: string): Observable<EventResolveType> {
    return this.http.post<EventResolveType>(`/customer/aiops/events/${eventId}/resolve/`, {});
  }

}

export class HistoryViewData {
  constructor() { };
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  description: string;
  eventDatetime: string;
  severity: string;
  status: string;
  isAcknowledged: boolean;
  source: string;
  sourceAccount: string;
  recoveredTime: string;
  duration: string;
  affectedComponent: string;
  affectedComponentType: string;
  affectedComponentName: string;
  environment: string;
  applicationName: string;
  eventMetric: string;
  acknowledgedBy: string;
  acknowledgedTime: string;
  acknowledgedComment: string;
  acknowledgedTooltipMsg: string;
  customData: any;
  dedupedCount: number;
  severityClass: string;
  severityIcon: string;
  statusTextColor: string;
  triggerDisableBtnTooltipMsg: string;
  isSourceUnity: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
}

export function insertLineBreaks(text: string, wordLimit: number, maxWordLength: number): string {
  if (text) {
    const words = text.split(' ');
    let result = '';
    let wordCount = 0;

    for (let word of words) {
      // Handle very long words (no spaces)
      if (word.length > maxWordLength) {
        while (word.length > maxWordLength) {
          result += word.substring(0, maxWordLength) + '<wbr>';
          word = word.substring(maxWordLength);
        }
        result += word + ' ';
      } else {
        result += word + ' ';
      }

      wordCount++;
      if (wordCount % wordLimit === 0) {
        result += '<br>';
      }
    }

    return result.trim();
  } else {
    return null;
  }
}