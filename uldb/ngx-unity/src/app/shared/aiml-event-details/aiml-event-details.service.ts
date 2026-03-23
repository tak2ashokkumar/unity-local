import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GET_AIOPS_ALERT_BY_ID, GET_AIOPS_EVENT_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { AIMLAlertDetails, AIMLAlertEventTimeline } from '../aiml-alert-details/aiml-alert-details.type';
import { AIMLEventDetails } from './aiml-event-details.type';

@Injectable({
  providedIn: 'root'
})
export class AimlEventDetailsService {
  private eventDetailsSource = new Subject<{ eventId: string, alertId?: string, isSubDetails?: boolean }>();
  eventDetailsAnnounced$ = this.eventDetailsSource.asObservable();

  private closeEventDetailsSource = new Subject();
  closeEventDetailsAnnounced$ = this.closeEventDetailsSource.asObservable();

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private iconService: DeviceIconService) { }

  closeEventDetails() {
    this.closeEventDetailsSource.next();
  }

  showEventDetails(eventId: string, alertId?: string, isSubDetails?: boolean) {
    this.eventDetailsSource.next({ eventId: eventId, alertId: alertId, isSubDetails: isSubDetails ? isSubDetails : false });
  }

  getEventDetails(eventId: string) {
    return this.http.get<AIMLEventDetails>(GET_AIOPS_EVENT_BY_ID(eventId));
  }

  convertToEventDetailsViewdata(event: AIMLEventDetails) {
    let view = new AIMLEventDetailsViewData();
    view.id = event.id;
    view.uuid = event.uuid;
    view.deviceName = event.device_name;
    view.deviceType = event.device_type;
    view.ipAddress = event.ip_address ? event.ip_address : 'NA';
    view.deviceIcon = this.iconService.getIconByDeviceType(this.utilSvc.getDeviceMappingByDeviceType(event.device_type ?? ''));
    view.eventDateTime = event.event_datetime ? this.utilSvc.toUnityOneDateFormat(event.event_datetime) : 'NA';
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
    view.description = event.description;
    view.status = event.status;
    view.statusTextColor = event.status == 'Resolved' ? 'text-success' : 'text-danger';

    view.source = event.source;
    view.sourceAccount = event.source_account;
    view.category = event.category ? event.category : 'NA';
    view.privateCloud = event.private_cloud ? event.private_cloud : 'NA';
    view.datacenter = event.datacenter ? event.datacenter : 'NA';
    view.triggerName = 'NA';
    view.tags = event.tags;
    view.cabinet = event.cabinet ? event.cabinet : 'NA';
    view.service = 'NA';
    view.domain = 'NA';
    view.isAcknowledged = event.is_acknowledged;
    view.acknowledgedTime = event.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(event.acknowledged_time) : null;;
    view.acknowledgedBy = event.acknowledged_by;
    view.acknowledgedComment = event.acknowledged_comment;
    view.recoveredDateTime = event.recovered_time ? this.utilSvc.toUnityOneDateFormat(event.recovered_time) : 'NA';
    view.cloudType = event.cloud_type ? event.cloud_type : 'NA';
    view.cloudName = event.cloud_name ? event.cloud_name : 'NA';
    view.eventMetric = event.event_metric ? event.event_metric : 'NA';
    view.customData = event.custom_data;
    return view;
  }

  getAlertDetails(alertId: string) {
    return this.http.get<AIMLAlertDetails>(GET_AIOPS_ALERT_BY_ID(alertId));
  }

  getAlertsTimeline(alertId: string): Observable<AIMLAlertEventTimeline[]> {
    return this.http.get<AIMLAlertEventTimeline[]>(`customer/aiops/alerts/${alertId}/events_timeline/`, { params: new HttpParams().set('page_size', '0') });
  }

  convertToAlertDetailsViewData(al: AIMLAlertDetails, timeline?: AIMLAlertEventTimeline[]) {
    let view: AIMLEventDetailsAlertViewData = new AIMLEventDetailsAlertViewData();
    view.totalTimeBetweenEvents = new Date(al.last_event_datetime).getTime() - new Date(al.first_event_datetime).getTime();
    return view;
  }

  convertToAlertsTimelineViewData(timeline: AIMLAlertEventTimeline[], firstEventDateTime: string) {
    let firstEventTime = new Date(firstEventDateTime).getTime();
    let view: AIMLEventDetailsAlertEventTimelineViewData[] = [];
    timeline.map(ev => {
      let a = new AIMLEventDetailsAlertEventTimelineViewData();
      a.uuid = ev.uuid;
      a.eventDatetime = ev.event_datetime ? this.utilSvc.toUnityOneDateFormat(ev.event_datetime) : 'N/A';;
      a.severity = ev.severity;
      a.status = ev.status;
      if (ev.status == 'Resolved') {
        a.severityPointerBGClass = 'bg-success';
        a.severityBorderClass = 'border border-success';
        a.severityPointerHookBorder = '2px solid green';
      } else {
        if (ev.severity == 'Critical') {
          a.severityPointerBGClass = 'bg-danger';
          a.severityBorderClass = 'border border-danger';
          a.severityPointerHookBorder = '2px solid red';
        } else if (ev.severity == 'Warning') {
          a.severityPointerBGClass = 'bg-warning';
          a.severityBorderClass = 'border border-warning';
          a.severityPointerHookBorder = '2px solid yellow';
        } else {
          a.severityPointerBGClass = 'bg-primary';
          a.severityBorderClass = 'border border-primary';
          a.severityPointerHookBorder = '2px solid blue';
        }
      }
      a.diffBwfirstAndCurrentEventTime = new Date(ev.event_datetime).getTime() - firstEventTime;
      view.push(a);
    })
    return view;
  }
}

export class AIMLEventDetailsViewData {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  deviceIcon: string;
  eventCount: number;
  alertTime: string;
  severity: string;
  severityClass: string;
  severityIcon: string;
  description: string;
  status: string;
  statusTextColor: string;
  source: string;
  sourceAccount: string;
  isAcknowledged: boolean;
  acknowledgedBy: string;
  acknowledgedTime: string;
  acknowledgedComment: string;
  eventDateTime: string;
  recoveredDateTime: string;
  ipAddress: string;
  category: string;
  privateCloud: string;
  datacenter: string;
  triggerName: string;
  tags: string[];
  cabinet: string;
  service: string;
  domain: string;
  alert: AIMLEventDetailsAlertViewData;
  cloudType: string;
  cloudName: string;
  eventMetric: string;
  customData: {} | null;
}


export class AIMLEventDetailsAlertViewData {
  totalTimeBetweenEvents: number;
  events: AIMLEventDetailsAlertEventTimelineViewData[] = [];
}

export class AIMLEventDetailsAlertEventTimelineViewData {
  constructor() { }
  uuid: string;
  eventDatetime: string;
  diffBwfirstAndCurrentEventTime: number;
  severity: string;
  severityPointerBGClass: string;
  severityPointerHookBorder: string;
  severityBorderClass: string;
  severityBorderLength: number;
  status: string;
}
