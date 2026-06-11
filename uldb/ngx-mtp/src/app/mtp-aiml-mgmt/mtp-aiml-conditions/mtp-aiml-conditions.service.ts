import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AIMLConditionAlertDetail, AIMLConditionAlertEventDetail, AIMLConditionAlerts, AIMLConditionDetails, AIMLConditions, MTPAIMLSummary } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpAimlConditionsService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private util: AppUtilityService,
    private iconService: DeviceIconService,
    private appService: AppLevelService,
    private tableService: TableApiServiceService) { }

  getConditionsSummary(tenants: string[]) {
    let params: HttpParams = new HttpParams();
    tenants.map(t => params = params.append('tenants', t));
    params = params.append('last_n_days', 7);
    return this.http.get<MTPAIMLSummary>(`customer/mtp/conditions/summary/`, { params: params });
  }

  getConditions(tenants: string[], criteria: SearchCriteria) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.delete('search');
    tenants.map(t => params = params.append('tenants', t));
    if (criteria.searchValue) {
      params = params.set('search_key', criteria.searchValue.trim());
    }
    return this.http.get<PaginatedResult<AIMLConditions>>(`customer/mtp/conditions/`, { params: params, });
  }

  convertToViewdata(conditions: AIMLConditions[]) {
    let viewdata: AIMLConditionsViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    conditions.forEach((cd) => {
      let view = new AIMLConditionsViewData();
      view.id = cd.id;
      view.uuid = cd.uuid;
      view.ruleName = cd.rule_name;
      view.description = cd.description;
      view.alertCount = cd.alert_count;
      view.tenant = cd.tenant;
      view.conditionSeverity = cd.condition_severity;
      view.severityBg = cd.condition_severity == 'Critical' ? 'bg-danger' : cd.condition_severity == 'Warning' ? 'bg-warning' : 'bg-primary';
      view.severityTextColor = cd.condition_severity == 'Critical' ? 'text-danger' : cd.condition_severity == 'Warning' ? 'text-warning' : 'text-primary';
      view.conditionDatetime = cd.condition_datetime ? datePipe.transform(cd.condition_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      view.conditionDuration = cd.condition_duration;
      view.conditionStatus = cd.condition_status;
      if (cd.condition_status == 'Resolved') {
        view.statusTextColor = 'text-success';
        view.isStatusResolved = true;
        view.resolveBtnTooltipMsg = 'Resolved';
      } else {
        view.statusTextColor = 'text-danger';
        view.isStatusResolved = false;
        view.resolveBtnTooltipMsg = 'Resolve';
      }

      view.hosts = Array.from(new Set(cd.hosts));
      let hostsLength = 0;
      for (let i = 0; i < view.hosts.length; i++) {
        if (hostsLength >= 30) {
          view.conditionHostsRemaining = view.hosts.length - i;
          break;
        }
        hostsLength = hostsLength + view.hosts[i].length;
      }

      view.conditionSource = cd.condition_source;
      // let sourceLength = 0;
      // for (let i = 0; i < view.conditionSource.length; i++) {
      //   if (sourceLength >= 30) {
      //     view.conditionSourceRemaining = view.conditionSource.length - i;
      //     break;
      //   }
      //   sourceLength = sourceLength + view.conditionSource[i].length;
      // }

      view.correlator = cd.correlator;
      view.correlationWindow = cd.correlation_window;
      view.firstAlertDateTime = cd.first_alert_datetime ? datePipe.transform(cd.first_alert_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      view.lastAlertDateTime = cd.last_alert_datetime ? datePipe.transform(cd.last_alert_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      view.totalTimeBetweenEvents = new Date(cd.last_alert_datetime).getTime() - new Date(cd.first_alert_datetime).getTime();
      view.recoveredDateTime = cd.recovered_datetime ? datePipe.transform(cd.recovered_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      view.isAcknowledged = cd.is_acknowledged ? 'Yes' : 'No';
      viewdata.push(view);
    });
    return viewdata;
  }

  getConditionDetails(conditionId: string) {
    return this.http.get<AIMLConditionDetails>(`customer/mtp/conditions/${conditionId}/`);
  }

  getAlerts(conditionId: string, criteria: SearchCriteria): Observable<PaginatedResult<AIMLConditionAlerts>> {
    return this.tableService.getData<PaginatedResult<AIMLConditionAlerts>>(`customer/mtp/conditions/${conditionId}/alerts/`, criteria);
  }

  convertToAlertsViewdata(alerts: AIMLConditionAlerts[]) {
    let viewdata: AIMLConditionAlertsViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    alerts.forEach((al) => {
      let view = new AIMLConditionAlertsViewData();
      view.id = al.id;
      view.uuid = al.uuid;
      view.deviceName = al.device_name;
      view.deviceType = al.device_type;
      view.deviceIcon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(al.device_type));
      view.eventCount = al.event_count;
      view.alertTime = al.alert_datetime ? datePipe.transform(al.alert_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
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
      if (al.status == 'Resolved') {
        view.statusTextColor = 'text-success';
        view.isStatusResolved = true;
        view.resolveBtnTooltipMsg = 'Resolved';
      } else {
        view.statusTextColor = 'text-danger';
        view.isStatusResolved = false;
        view.resolveBtnTooltipMsg = 'Resolve';
      }

      view.source = al.source;
      view.isAcknowledged = al.is_acknowledged ? 'Yes' : 'No';

      view.firstEventDateTime = al.first_event_datetime ? datePipe.transform(al.first_event_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      view.lastEventDateTime = al.last_event_datetime ? datePipe.transform(al.last_event_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      view.totalTimeBetweenEvents = new Date(al.last_event_datetime).getTime() - new Date(al.first_event_datetime).getTime();

      view.recoveredDateTime = al.recovered_time ? datePipe.transform(al.recovered_time.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      view.managementIp = al.management_ip ? al.management_ip : 'NA';
      // view.events = this.convertToAlertEventsTimelineViewData(al);
      viewdata.push(view);
    });
    return viewdata;
  }

  convertToAlertEventsTimelineViewData(alert: AIMLConditionAlerts): AIMLAlertEventTimelineViewData[] {
    let viewData: AIMLAlertEventTimelineViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    let lastEventTime = new Date(alert.last_event_datetime).getTime();
    let firstEventTime = new Date(alert.first_event_datetime).getTime();
    let totalTime = lastEventTime - firstEventTime;
    let lengthFor1MS = 220 / totalTime;
    alert.event_timeline.map((ev, index) => {
      let a = new AIMLAlertEventTimelineViewData();
      a.uuid = ev.uuid; a.eventDatetime = ev.event_datetime ? datePipe.transform(ev.event_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
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
    });
    return viewData;
  }

  convertToHostBasedEvents(conditionDetails: AIMLConditionDetails): AIMLHostBasedEvents[] {
    if (!conditionDetails || !conditionDetails.timeline) {
      return [];
    }
    let keys: string[] = Object.keys(conditionDetails.timeline);
    let viewData: AIMLHostBasedEvents[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    keys.map((k) => {
      let d: AIMLHostBasedEvents = new AIMLHostBasedEvents();
      let obj = conditionDetails.timeline[k];
      if (obj && obj.device && obj.events && obj.events.length) {
        d.deviceName = obj.device.name;
        d.deviceType = obj.device.type;
        d.deviceIcon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(obj.device.type));

        obj.events.map((evn) => {
          let ev: AIMLHostBasedEventsData = new AIMLHostBasedEventsData();
          ev.eventId = evn.uuid;
          ev.eventTime = evn.event_datetime ? datePipe.transform(evn.event_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : evn.event_datetime;
          ev.severity = evn.severity;
          ev.status = evn.status;
          ev.recoveredTime = evn.recovered_datetime ? datePipe.transform(evn.recovered_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : evn.recovered_datetime;
          ev.firstEventTime = conditionDetails.first_alert_datetime ? datePipe.transform(conditionDetails.first_alert_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : conditionDetails.first_alert_datetime;
          ev.lastEventTime = conditionDetails.last_alert_datetime ? datePipe.transform(conditionDetails.last_alert_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : conditionDetails.last_alert_datetime;
          ev.isFirst = new Date(evn.event_datetime).getTime() == new Date(conditionDetails.first_alert_datetime).getTime();
          ev.isLast = new Date(evn.event_datetime).getTime() == new Date(conditionDetails.last_alert_datetime).getTime();
          ev.diffBwfirstAndCurrentEventTime = ev.isFirst ? 0 : new Date(evn.event_datetime).getTime() - new Date(conditionDetails.first_alert_datetime).getTime();
          ev.diffBwCurrentAndLastEventTime = ev.isLast ? 0 : new Date(conditionDetails.last_alert_datetime).getTime() - new Date(evn.event_datetime).getTime();
          ev.tooltipMessage = ev.eventTime;

          if (ev.status == 'Resolved') {
            ev.severityTextClass = 'text-success';
            ev.severityPointerBGClass = 'bg-success';
            ev.severityPointerHookClass = 'border border-success';
            ev.activeTimelineClass = 'border border-success';
          } else {
            if (ev.severity == 'Critical') {
              ev.severityTextClass = 'text-danger';
              ev.severityPointerBGClass = 'bg-danger';
              ev.severityPointerHookClass = 'border border-danger';
              ev.activeTimelineClass = 'border border-danger';
            } else if (ev.severity == 'Warning') {
              ev.severityTextClass = 'text-warning';
              ev.severityPointerBGClass = 'bg-warning';
              ev.severityPointerHookClass = 'border border-warning';
              ev.activeTimelineClass = 'border border-warning';
            } else {
              ev.severityTextClass = 'text-primary';
              ev.severityPointerBGClass = 'bg-primary';
              ev.severityPointerHookClass = 'border border-primary';
              ev.activeTimelineClass = 'border border-primary';
            }
          }
          d.events.push(ev);
        });
        viewData.push(d);
      }
    });

    let events: AIMLHostBasedEventsData[] = [];
    viewData.map((vd) => {
      vd.events.map((ev) => {
        events.push(ev);
      });
    });
    events.sort((a, b) => a.diffBwfirstAndCurrentEventTime - b.diffBwfirstAndCurrentEventTime);
    viewData.map((vd) => {
      vd.events.map((ev) => {
        ev.eventNumber =
          events.findIndex((evn) => evn.eventId == ev.eventId) + 1;
      });
    });

    return viewData;
  }

  getAlertDetails(alertId: string) {
    return this.http.get<AIMLConditionAlertDetail>(`/customer/mtp/alerts/${alertId}/`);
  }

  getEventDetails(eventId: string) {
    return this.http.get<AIMLConditionAlertEventDetail>(`/customer/mtp/events/${eventId}/`);
  }

  convertToEventDetailsViewdata(event: AIMLConditionAlertEventDetail) {
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    let view = new AIMLConditionAlertEventViewData();
    view.id = event.id;
    view.uuid = event.uuid;
    view.deviceName = event.device_name;
    view.deviceType = event.device_type;
    view.managementIp = event.management_ip ? event.management_ip : 'NA';
    view.deviceIcon = this.iconService.getIconByDeviceType(this.util.getDeviceMappingByDeviceType(event.device_type));
    view.eventDateTime = event.event_datetime ? datePipe.transform(event.event_datetime.replace(/\s/g, 'T'), environment.unityDateFormat) : 'NA';
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
    view.category = event.category ? event.category : 'NA';
    view.privateCloud = event.private_cloud ? event.private_cloud : 'NA';
    view.datacenter = event.datacenter ? event.datacenter : 'NA';
    view.triggerName = 'NA';
    view.tags = event.tags;
    view.cabinet = event.cabinet ? event.cabinet : 'NA';
    view.service = 'NA';
    view.domain = 'NA';
    view.isAcknowledged = event.is_acknowledged ? 'Yes' : 'No';
    view.recoveredDateTime = event.recovered_time ? datePipe.transform(event.recovered_time.replace(/\s/g, 'T'), environment.unityDateFormat) : 'NA';

    return view;
  }

  resolveCondition(conditionId: string) {
    return this.http.post<CeleryTask>(`/customer/mtp/conditions/${conditionId}/resolve/`, {})
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  resolveAlert(alertId: string) {
    return this.http.post<CeleryTask>(`/customer/mtp/alerts/${alertId}/resolve/`, {})
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }
}

export class AIMLConditionsViewData {
  constructor() { }
  id: number;
  uuid: string;
  ruleName: string;
  description: string;
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
  tenant: string;

  firstAlertDateTime: string;
  lastAlertDateTime: string;
  totalTimeBetweenEvents: number;
  recoveredDateTime: string;
  isAcknowledged: string;
  alerts: AIMLConditionAlertsViewData[] = [];
  hostBasedEvents: AIMLHostBasedEvents[] = [];
  viewType: string = 'list';
  ticketId: string;
  ticketUuid: string;
  accountId: string;

  resolveInProgress: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
}

export class AIMLHostBasedEvents {
  constructor() { }
  deviceName: string;
  deviceType: string;
  deviceIcon: string;
  events: AIMLHostBasedEventsData[] = [];
}

export class AIMLHostBasedEventsData {
  constructor() { }
  eventId: string;
  eventNumber: number = 0;
  eventTime: string;
  recoveredTime: string;
  status: string;
  firstEventTime: string;
  lastEventTime: string;
  isFirst: boolean;
  isLast: boolean;
  diffBwfirstAndCurrentEventTime: number = 0;
  diffBwCurrentAndLastEventTime: number = 0;
  severity: string;
  severityTextClass: string;
  severityPointerBGClass: string;
  severityPointerHookClass: string;

  totalTimelineLength: number = 0;
  activeTimelineLength: number = 0;
  activeTimelineClass: string;
  inActiveTimelineLength: number = 0;
  inActiveTimelineClass: string = 'border border-secondary';
  tooltipMessage: string;
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

  events: AIMLAlertEventTimelineViewData[];

  resolveInProgress: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
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

export class AIMLConditionAlertEventViewData {
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
  eventDateTime: string;
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
  alert: AIMLConditionAlertsViewData;
}
