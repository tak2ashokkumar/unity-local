import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AIMLAlertDetails, AIMLAlertEventTimeline } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpAimlAlertDetailsService {
  private alertDetailsSource = new Subject<string>();
  alertDetailsAnnounced$ = this.alertDetailsSource.asObservable();

  constructor(private http: HttpClient,
    private util: AppUtilityService,
    private iconService: DeviceIconService) { }

  showAlertDetails(alertId: string) {
    this.alertDetailsSource.next(alertId);
  }

  getAlertDetails(alertId: string) {
    return this.http.get<AIMLAlertDetails>(`/customer/mtp/alerts/${alertId}/`);
  }

  convertToAlertDetailsViewData(al: AIMLAlertDetails) {
    let view: AIMLAlertDetailsViewData = new AIMLAlertDetailsViewData();
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    view.id = al.id;
    view.uuid = al.uuid;
    view.deviceName = al.device_name;
    view.deviceType = al.device_type;
    view.deviceIcon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(al.device_type));
    view.eventCount = al.event_count;
    view.alertTime = al.alert_datetime ? datePipe.transform(al.alert_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
    view.severity = al.severity;
    if (al.severity == 'Critical') {
      view.severityClass = 'text-danger';
      view.severityIcon = 'fa-exclamation-circle text-danger';
    } else if (al.severity == 'Warning') {
      view.severityClass = 'text-warning';
      view.severityIcon = 'fa-exclamation-circle text-warning';
    } else {
      view.severityClass = 'text-primary';
      view.severityIcon = 'fa-info-circle text-primary';
    }
    view.description = al.description;
    view.status = al.status;
    view.statusTextColor = al.status == 'Resolved' ? 'text-success' : 'text-danger';

    view.source = al.source;
    view.isAcknowledged = al.is_acknowledged ? 'Yes' : 'No';

    view.firstEventDateTime = al.first_event_datetime ? datePipe.transform(al.first_event_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
    view.lastEventDateTime = al.last_event_datetime ? datePipe.transform(al.last_event_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
    view.totalTimeBetweenEvents = new Date(al.last_event_datetime).getTime() - new Date(al.first_event_datetime).getTime();

    view.recoveredDateTime = al.recovered_time ? datePipe.transform(al.recovered_time.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
    view.managementIp = al.management_ip ? al.management_ip : 'NA';
    view.category = al.category ? al.category : 'NA';
    view.privateCloud = al.private_cloud ? al.private_cloud : 'NA';
    view.datacenter = al.datacenter ? al.datacenter : 'NA';
    view.triggerName = 'NA';
    view.tags = al.tags;

    view.cabinet = al.cabinet ? al.cabinet : 'NA';
    view.service = 'NA';
    view.domain = 'NA';
    // view.events = this.convertToAlertEventsTimelineViewData(al);
    return view;
  }

  getAlertsTimeline(alertId: string): Observable<AIMLAlertEventTimeline[]> {
    return this.http.get<AIMLAlertEventTimeline[]>(`customer/mtp/alerts/${alertId}/events_timeline/`, { params: new HttpParams().set('page_size', '0') });
  }

  convertToAlertEventsTimelineViewData(eventTimeline: AIMLAlertEventTimeline[], firstEventDateTime: string): AIMLAlertEventTimelineViewData[] {
    let viewData: AIMLAlertEventTimelineViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    let firstEventTime = new Date(firstEventDateTime).getTime();
    eventTimeline.map(ev => {
      let a = new AIMLAlertEventTimelineViewData();
      a.uuid = ev.uuid;
      a.eventDatetime = ev.event_datetime ? datePipe.transform(ev.event_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';;
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
      viewData.push(a);
    })
    return viewData;
  }

}

export class AIMLAlertDetailsViewData {
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
  isAcknowledged: string;

  firstEventDateTime: string;
  lastEventDateTime: string;
  totalTimeBetweenEvents: number;
  recoveredDateTime: string;
  managementIp: string;
  category: string;
  privateCloud: string;
  datacenter: string;
  triggerName: string;
  tags: string[];
  cabinet: string;
  service: string;
  domain: string;

  events: AIMLAlertEventTimelineViewData[];
}

export class AIMLAlertEventTimelineViewData {
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

