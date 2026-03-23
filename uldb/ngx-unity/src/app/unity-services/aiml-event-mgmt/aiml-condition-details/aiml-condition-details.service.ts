import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GET_AIOPS_CONDITION_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { AIMLConditionDetails } from './aiml-condition-details.type';

@Injectable()
export class AimlConditionDetailsService {
  private conditionDetailsSource = new Subject<string>();
  conditionDetailsAnnounced$ = this.conditionDetailsSource.asObservable();

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private iconService: DeviceIconService) { }

  showConditionDetails(conditionId: string) {
    this.conditionDetailsSource.next(conditionId);
  }

  getConditionDetails(conditionId: string) {
    return this.http.get<AIMLConditionDetails>(GET_AIOPS_CONDITION_BY_ID(conditionId));
  }

  convertToViewdata(cd: AIMLConditionDetails) {
    let view = new AIMLConditionDetailsViewData();

    view.id = cd.id;
    view.uuid = cd.uuid;
    view.ruleName = cd.rule_name;
    view.alertCount = cd.alert_count;
    view.eventCount = cd.event_count;
    view.conditionSeverity = cd.condition_severity;
    view.severityBg = cd.condition_severity == 'Critical' ? 'bg-danger' : cd.condition_severity == 'Warning' ? 'bg-warning' : 'bg-primary';
    view.severityTextColor = cd.condition_severity == 'Critical' ? 'text-danger' : cd.condition_severity == 'Warning' ? 'text-warning' : 'text-primary';
    view.conditionDatetime = cd.condition_datetime ? this.utilSvc.toUnityOneDateFormat(cd.condition_datetime) : 'NA';
    view.conditionDuration = cd.condition_duration;
    view.conditionStatus = cd.condition_status;
    view.statusTextColor = cd.condition_status == 'Resolved' ? 'text-success' : 'text-danger';
    view.hosts = Array.from(new Set(cd.hosts));
    view.conditionSource = Array.from(new Set(cd.condition_source));
    view.correlator = cd.correlator ? cd.correlator : 'NA';
    view.correlationWindow = cd.correlation_window;
    view.firstAlertDateTime = cd.first_alert_datetime ? this.utilSvc.toUnityOneDateFormat(cd.first_alert_datetime) : 'NA';
    view.lastAlertDateTime = cd.last_alert_datetime ? this.utilSvc.toUnityOneDateFormat(cd.last_alert_datetime) : 'NA';
    view.recoveredDateTime = cd.recovered_datetime ? this.utilSvc.toUnityOneDateFormat(cd.recovered_datetime) : 'NA';
    view.isAcknowledged = cd.is_acknowledged ? 'Yes' : 'No';

    cd.alerts.map(al => {
      let a: AIMLConditionAlertsViewData = new AIMLConditionAlertsViewData();
      a.id = al.id;
      a.uuid = al.uuid;
      a.deviceName = al.device_name;
      a.deviceType = al.device_type;
      a.deviceIcon = this.iconService.getIconByDeviceType(this.utilSvc.getDeviceMappingByDeviceType(al.device_type));
      a.eventCount = al.event_count;
      a.alertTime = al.alert_datetime ? this.utilSvc.toUnityOneDateFormat(al.alert_datetime) : 'NA';
      a.severity = al.severity;
      if (al.severity == 'Critical') {
        a.severityClass = 'text-danger';
        a.severityIcon = 'fa-exclamation-circle text-danger';
      } else if (al.severity == 'Warning') {
        a.severityClass = 'text-warning';
        a.severityIcon = 'fa-exclamation-circle text-warning';
      } else {
        a.severityClass = 'text-primary';
        a.severityIcon = 'fa-info-circle text-primary';
      }
      a.description = al.description;
      a.status = al.status;
      a.statusTextColor = al.status == 'Resolved' ? 'text-success' : 'text-danger';

      a.source = al.source;
      a.isAcknowledged = al.is_acknowledged ? 'Yes' : 'No';

      a.firstEventDateTime = al.first_event_datetime ? this.utilSvc.toUnityOneDateFormat(al.first_event_datetime) : 'NA';
      a.lastEventDateTime = al.last_event_datetime ? this.utilSvc.toUnityOneDateFormat(al.last_event_datetime) : 'NA';
      a.totalTimeBetweenEvents = new Date(al.last_event_datetime).getTime() - new Date(al.first_event_datetime).getTime();

      a.recoveredDateTime = al.recovered_time ? this.utilSvc.toUnityOneDateFormat(al.recovered_time) : 'NA';
      a.managementIp = al.management_ip ? al.management_ip : 'NA';

      let firstEventTime = new Date(al.first_event_datetime).getTime();
      al.event_timeline.map(ev => {
        let e = new AIMLAlertEventTimelineViewData();
        e.uuid = ev.uuid;
        e.eventDatetime = ev.event_datetime ? this.utilSvc.toUnityOneDateFormat(ev.event_datetime) : 'NA';;
        e.severity = ev.severity;
        a.status = ev.status;
        if (ev.status == 'Resolved') {
          e.severityPointerBGClass = 'bg-success';
          e.severityBorderClass = 'border border-success';
          e.severityPointerHookBorder = '2px solid green';
        } else {
          if (ev.severity == 'Critical') {
            e.severityPointerBGClass = 'bg-danger';
            e.severityBorderClass = 'border border-danger';
            e.severityPointerHookBorder = '2px solid red';
          } else if (ev.severity == 'Warning') {
            e.severityPointerBGClass = 'bg-warning';
            e.severityBorderClass = 'border border-warning';
            e.severityPointerHookBorder = '2px solid yellow';
          } else {
            e.severityPointerBGClass = 'bg-primary';
            e.severityBorderClass = 'border border-primary';
            e.severityPointerHookBorder = '2px solid blue';
          }
        }
        e.diffBwfirstAndCurrentEventTime = new Date(ev.event_datetime).getTime() - firstEventTime;
        a.events.push(e);
      })
      view.alerts.push(a);
    })
    return view;
  }
}

export class AIMLConditionDetailsViewData {
  constructor() { }
  id: number;
  uuid: string;
  ruleName: string;
  alertCount: number;
  eventCount: number;
  conditionDatetime: string;
  conditionDuration: string;
  conditionStatus: string;
  statusTextColor: string;
  conditionSeverity: string;
  severityBg: string;
  severityTextColor: string;
  hosts: string[];
  conditionHostsRemaining: number;
  conditionSource: string[];
  conditionSourceRemaining: number;
  correlator: string;
  correlationWindow: string;

  firstAlertDateTime: string;
  lastAlertDateTime: string;
  recoveredDateTime: string;
  isAcknowledged: string;
  loaded: boolean = false;
  alerts: AIMLConditionAlertsViewData[] = [];
}

export class AIMLConditionAlertsViewData {
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

  events: AIMLAlertEventTimelineViewData[] = [];
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
