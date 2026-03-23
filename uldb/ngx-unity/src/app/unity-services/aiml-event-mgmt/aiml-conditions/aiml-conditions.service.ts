import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { GET_AIOPS_ALERT_BY_ID, GET_AIOPS_CONDITIONS, GET_AIOPS_CONDITIONS_SUMMARY, GET_AIOPS_CONDITION_BY_ID, GET_AIOPS_EVENT_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AIMLAnalysisData, AIMLConditionActivityDetail, AIMLConditionAlertDetail, AIMLConditionAlertEventDetail, AIMLConditionAlerts, AIMLConditionDetails, AIMLConditionDeviceEventTimeline, AIMLConditions, AIMLConditionsSummary } from './aiml-conditions.type';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';

@Injectable()
export class AimlConditionsService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private iconService: DeviceIconService,
    private appService: AppLevelService,
    private tableService: TableApiServiceService) { }

  getConditionsSummary() {
    let params: HttpParams = new HttpParams();
    params = params.append('last_n_days', 7);
    return this.http.get<AIMLConditionsSummary>(GET_AIOPS_CONDITIONS_SUMMARY(), { params: params });
  }

  // getConditions(criteria: SearchCriteria) {
  //   let params = new HttpParams();
  //   if (criteria.searchValue) {
  //     params = params.set('search_key', criteria.searchValue);
  //   }
  //   params = params.set('page_size', '0');
  //   return this.http.get<AIMLConditions[]>(GET_AIOPS_CONDITIONS(), { params: params });
  // }

  getConditions(criteria: SearchCriteria): Observable<PaginatedResult<AIMLConditions>> {
    // let params = new HttpParams();
    // if (criteria.searchValue) {
    //   params = params.set('search_key', criteria.searchValue);
    // }
    // params = params.set('page_size', criteria.pageSize);
    return this.tableService.getData<PaginatedResult<AIMLConditions>>(GET_AIOPS_CONDITIONS(), criteria);
  }


  convertToViewdata(conditions: AIMLConditions[]) {
    let viewdata: AIMLConditionsViewData[] = [];
    conditions.forEach((cd) => {
      let view = new AIMLConditionsViewData();
      view.id = cd.id;
      view.uuid = cd.uuid;
      view.ruleName = cd.rule_name;
      view.description = cd.description;
      view.alertCount = cd.alert_count;
      view.conditionSeverity = cd.condition_severity;
      view.severityBg = cd.condition_severity == 'Critical' ? 'bg-danger' : cd.condition_severity == 'Warning' ? 'bg-warning' : 'bg-primary';
      view.severityTextColor = cd.condition_severity == 'Critical' ? 'text-danger' : cd.condition_severity == 'Warning' ? 'text-warning' : 'text-primary';
      view.conditionDatetime = cd.condition_datetime ? this.utilSvc.toUnityOneDateFormat(cd.condition_datetime) : 'N/A';
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
        if (view.hosts[i]) {
          hostsLength = hostsLength + view.hosts[i].length;
        }
      }

      // view.conditionSource = Array.from(new Set(cd.condition_source_account));
      view.conditionSource = cd.condition_source_account;

      // let sourceLength = 0;
      // for (let i = 0; i < view.conditionSource.length; i++) {
      //   if (sourceLength >= 30) {
      //     view.conditionSourceRemaining = view.conditionSource.length - i;
      //     break;
      //   }
      //   if (view.conditionSource[i]) {
      //     sourceLength = sourceLength + view.conditionSource[i].length;
      //   }
      // }

      view.correlator = cd.correlators ? cd.correlators : [];
      view.correlationWindow = cd.correlation_window;
      view.firstAlertDateTime = cd.first_alert_datetime ? this.utilSvc.toUnityOneDateFormat(cd.first_alert_datetime) : 'N/A';
      view.lastAlertDateTime = cd.last_alert_datetime ? this.utilSvc.toUnityOneDateFormat(cd.last_alert_datetime) : 'N/A';
      view.totalTimeBetweenEvents = new Date(cd.last_alert_datetime).getTime() - new Date(cd.first_alert_datetime).getTime();
      view.recoveredDateTime = cd.recovered_datetime ? this.utilSvc.toUnityOneDateFormat(cd.recovered_datetime) : 'N/A';
      view.isAcknowledged = cd.is_acknowledged;
      view.acknowledgedTime = cd.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(cd.acknowledged_time) : null;;
      view.acknowledgedBy = cd.acknowledged_by;
      view.acknowledgedComment = cd.acknowledged_comment;
      view.acknowledgedTooltipMsg = `Ack by: ${view.acknowledgedBy}<br>` + `Ack Msg: ${insertLineBreaks(view.acknowledgedComment, 10, 35)}<br>` + `Ack At: ${view.acknowledgedTime}`;
      view.rootCauseAlert = cd.root_cause_alert;
      viewdata.push(view);
    });
    return viewdata;
  }

  getConditionDetails(conditionId: string) {
    return this.http.get<AIMLConditionDetails>(GET_AIOPS_CONDITION_BY_ID(conditionId));
  }

  getAlerts(conditionId: string, criteria: SearchCriteria): Observable<PaginatedResult<AIMLConditionAlerts>> {
    return this.tableService.getData<PaginatedResult<AIMLConditionAlerts>>(`customer/aiops/conditions/${conditionId}/alerts/`, criteria);
  }

  getAlertsStack(conditionId: string): Observable<AIMLConditionDeviceEventTimeline> {
    return this.http.get<AIMLConditionDeviceEventTimeline>(`customer/aiops/conditions/${conditionId}/alerts_timeline/`);
  }

  getOverviewDetails(conditionId: string, criteria: SearchCriteria): Observable<PaginatedResult<AIMLConditionActivityDetail>> {
    return this.tableService.getData<PaginatedResult<AIMLConditionActivityDetail>>(`customer/aiops/conditions/${conditionId}/activities/`, criteria);
  }

  getAnalysisDetails(conditionId: string) {
    let params: HttpParams = new HttpParams();
    params = params.append('condition_uuid', conditionId);
    return this.http.get<AIMLAnalysisData>(`/chatbot/generate_condition_rca/`, { params: params });
  }

  convertToAlertsViewdata(alerts: AIMLConditionAlerts[]) {
    let viewdata: AIMLConditionAlertsViewData[] = [];
    alerts.forEach((al) => {
      let view = new AIMLConditionAlertsViewData();
      view.id = al.id;
      view.uuid = al.uuid;
      view.deviceName = al.device_name;
      view.deviceType = al.device_type;
      view.deviceIcon = this.iconService.getIconByDeviceType(this.utilSvc.getDeviceMappingByDeviceType(al.device_type));
      view.eventCount = al.event_count;
      view.alertTime = al.alert_datetime ? this.utilSvc.toUnityOneDateFormat(al.alert_datetime) : 'N/A';
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
      view.sourceAccount = al.source_account_name;
      view.isAcknowledged = al.is_acknowledged;
      view.acknowledgedTime = al.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(al.acknowledged_time) : null;;
      view.acknowledgedBy = al.acknowledged_by;
      view.acknowledgedComment = al.acknowledged_comment;
      view.acknowledgedTooltipMsg = `Ack by: ${view.acknowledgedBy}<br>` + `Ack Msg: ${insertLineBreaks(view.acknowledgedComment, 10, 35)}<br>` + `Ack At: ${view.acknowledgedTime}`;

      view.firstEventDateTime = al.first_event_datetime ? this.utilSvc.toUnityOneDateFormat(al.first_event_datetime) : 'N/A';
      view.lastEventDateTime = al.last_event_datetime ? this.utilSvc.toUnityOneDateFormat(al.last_event_datetime) : 'N/A';
      view.totalTimeBetweenEvents = new Date(al.last_event_datetime).getTime() - new Date(al.first_event_datetime).getTime();

      view.recoveredDateTime = al.recovered_time ? this.utilSvc.toUnityOneDateFormat(al.recovered_time) : 'N/A';
      view.managementIp = al.management_ip ? al.management_ip : 'NA';
      // view.events = this.convertToAlertEventsTimelineViewData(al);
      view.eventMetric = al.event_metric ? al.event_metric : 'NA';
      viewdata.push(view);
    });
    return viewdata;
  }

  convertToAlertEventsTimelineViewData(alert: AIMLConditionAlerts): AIMLAlertEventTimelineViewData[] {
    let viewData: AIMLAlertEventTimelineViewData[] = [];
    let lastEventTime = new Date(alert.last_event_datetime).getTime();
    let firstEventTime = new Date(alert.first_event_datetime).getTime();
    let totalTime = lastEventTime - firstEventTime;
    let lengthFor1MS = 220 / totalTime;
    alert.event_timeline.map((ev, index) => {
      let a = new AIMLAlertEventTimelineViewData();
      a.uuid = ev.uuid;
      a.eventDatetime = ev.event_datetime ? this.utilSvc.toUnityOneDateFormat(ev.event_datetime) : 'N/A';
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

  convertToAnalysisData(analysisData: any): AIMLAnalysisViewData {
    const viewData = new AIMLAnalysisViewData();

    viewData.success = analysisData.success
    if (!viewData.success) {
      viewData.failureReason = analysisData.query_metadata.failure_reason
    } else {
      const summary = analysisData?.response?.rca_report?.incident_summary;
      viewData.title = summary?.title || '';
      viewData.description = summary?.description || '';
      viewData.severity = summary?.severity || '';
      viewData.afftectedDevices = (summary?.device || []).join(', ');
      viewData.afftectedInterfaces = (summary?.interface || []).join(', ');
      viewData.sourceAccount = summary?.source_account || '';
      viewData.rootCause = analysisData.response.rca_report.root_cause_analysis.root_cause || '';
      viewData.contributingFactors = analysisData.response.rca_report.contributing_factors || [];

      viewData.timelineOfEvents = (analysisData.response.rca_report.timeline_of_events || []).map(item => ({
        event: item.event,
        time: moment(item.time).format('HH:mm:ss'),
        date: moment(item.time).format('MMM DD, YYYY')
      }));

      viewData.remediationRecommendations = analysisData.response.rca_report.remediation_recommendations || [];
      viewData.whyItHappened = analysisData.response.rca_report.why_it_happened || [];
      viewData.howItHappened = analysisData.response.rca_report.how_it_happened || [];
      viewData.resultAccuracyPercentage = analysisData.response.result_accuracy_percentage || '';
    }

    return viewData;

  }

  convertToHostBasedAlerts(conditionDetails: AIMLConditionDetails, timeline: AIMLConditionDeviceEventTimeline): AIMLHostBasedAlerts[] {
    if (!conditionDetails || !timeline) {
      return [];
    }
    let keys: string[] = Object.keys(timeline);
    let viewData: AIMLHostBasedAlerts[] = [];
    keys.map((k) => {
      let d: AIMLHostBasedAlerts = new AIMLHostBasedAlerts();
      let obj = timeline[k];
      if (obj && obj.device && obj.alerts && obj.alerts.length) {
        d.deviceName = obj.device.name;
        d.deviceType = obj.device.type;
        d.deviceIcon = this.iconService.getIconByDeviceType(this.utilSvc.getDeviceMappingByDeviceType(obj.device.type));

        obj.alerts.map((evn) => {
          let ev: AIMLHostBasedAlertsData = new AIMLHostBasedAlertsData();
          ev.alertId = evn.uuid;
          ev.alertTime = evn.alert_datetime ? this.utilSvc.toUnityOneDateFormat(evn.alert_datetime) : evn.alert_datetime;
          ev.severity = evn.severity;
          ev.status = evn.status;
          ev.recoveredTime = evn.recovered_datetime ? this.utilSvc.toUnityOneDateFormat(evn.recovered_datetime) : evn.recovered_datetime;
          ev.firstAlertTime = conditionDetails.first_alert_datetime ? this.utilSvc.toUnityOneDateFormat(conditionDetails.first_alert_datetime) : conditionDetails.first_alert_datetime;
          ev.lastAlertTime = conditionDetails.last_alert_datetime ? this.utilSvc.toUnityOneDateFormat(conditionDetails.last_alert_datetime) : conditionDetails.last_alert_datetime;
          ev.isFirst = new Date(evn.alert_datetime).getTime() == new Date(conditionDetails.first_alert_datetime).getTime();
          ev.isLast = new Date(evn.alert_datetime).getTime() == new Date(conditionDetails.last_alert_datetime).getTime();
          ev.diffBwfirstAndCurrentAlertTime = ev.isFirst ? 0 : new Date(evn.alert_datetime).getTime() - new Date(conditionDetails.first_alert_datetime).getTime();
          ev.diffBwCurrentAndLastAlertTime = ev.isLast ? 0 : new Date(conditionDetails.last_alert_datetime).getTime() - new Date(evn.alert_datetime).getTime();
          ev.tooltipMessage = ev.alertTime;

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
          d.alerts.push(ev);
        });
        viewData.push(d);
      }
    });

    let events: AIMLHostBasedAlertsData[] = [];
    viewData.map((vd) => {
      vd.alerts.map((ev) => {
        events.push(ev);
      });
    });
    events.sort((a, b) => a.diffBwfirstAndCurrentAlertTime - b.diffBwfirstAndCurrentAlertTime);
    viewData.map((vd) => {
      vd.alerts.map((ev) => {
        ev.alertNumber = events.findIndex((evn) => evn.alertId == ev.alertId) + 1;
      });
    });

    return viewData;
  }


  // convertToHostBasedEvents(conditionDetails: AIMLConditionDetails): AIMLHostBasedEvents[] {
  //   if (!conditionDetails || !conditionDetails.timeline) {
  //     return [];
  //   }
  //   let keys: string[] = Object.keys(conditionDetails.timeline);
  //   let viewData: AIMLHostBasedEvents[] = [];
  //   keys.map((k) => {
  //     let d: AIMLHostBasedEvents = new AIMLHostBasedEvents();
  //     let obj = conditionDetails.timeline[k];
  //     if (obj && obj.device && obj.events && obj.events.length) {
  //       d.deviceName = obj.device.name;
  //       d.deviceType = obj.device.type;
  //       d.deviceIcon = this.iconService.getIconByDeviceType(this.utilSvc.getDeviceMappingByDeviceType(obj.device.type));

  //       obj.events.map((evn) => {
  //         let ev: AIMLHostBasedEventsData = new AIMLHostBasedEventsData();
  //         ev.eventId = evn.uuid;
  //         ev.eventTime = evn.event_datetime ? this.utilSvc.toUnityOneDateFormat(evn.event_datetime) : evn.event_datetime;
  //         ev.severity = evn.severity;
  //         ev.status = evn.status;
  //         ev.recoveredTime = evn.recovered_datetime ? this.utilSvc.toUnityOneDateFormat(evn.recovered_datetime) : evn.recovered_datetime;
  //         ev.firstEventTime = conditionDetails.first_alert_datetime ? this.utilSvc.toUnityOneDateFormat(conditionDetails.first_alert_datetime) : conditionDetails.first_alert_datetime;
  //         ev.lastEventTime = conditionDetails.last_alert_datetime ? this.utilSvc.toUnityOneDateFormat(conditionDetails.last_alert_datetime) : conditionDetails.last_alert_datetime;
  //         ev.isFirst = new Date(evn.event_datetime).getTime() == new Date(conditionDetails.first_alert_datetime).getTime();
  //         ev.isLast = new Date(evn.event_datetime).getTime() == new Date(conditionDetails.last_alert_datetime).getTime();
  //         ev.diffBwfirstAndCurrentEventTime = ev.isFirst ? 0 : new Date(evn.event_datetime).getTime() - new Date(conditionDetails.first_alert_datetime).getTime();
  //         ev.diffBwCurrentAndLastEventTime = ev.isLast ? 0 : new Date(conditionDetails.last_alert_datetime).getTime() - new Date(evn.event_datetime).getTime();
  //         ev.tooltipMessage = ev.eventTime;

  //         if (ev.status == 'Resolved') {
  //           ev.severityTextClass = 'text-success';
  //           ev.severityPointerBGClass = 'bg-success';
  //           ev.severityPointerHookClass = 'border border-success';
  //           ev.activeTimelineClass = 'border border-success';
  //         } else {
  //           if (ev.severity == 'Critical') {
  //             ev.severityTextClass = 'text-danger';
  //             ev.severityPointerBGClass = 'bg-danger';
  //             ev.severityPointerHookClass = 'border border-danger';
  //             ev.activeTimelineClass = 'border border-danger';
  //           } else if (ev.severity == 'Warning') {
  //             ev.severityTextClass = 'text-warning';
  //             ev.severityPointerBGClass = 'bg-warning';
  //             ev.severityPointerHookClass = 'border border-warning';
  //             ev.activeTimelineClass = 'border border-warning';
  //           } else {
  //             ev.severityTextClass = 'text-primary';
  //             ev.severityPointerBGClass = 'bg-primary';
  //             ev.severityPointerHookClass = 'border border-primary';
  //             ev.activeTimelineClass = 'border border-primary';
  //           }
  //         }
  //         d.events.push(ev);
  //       });
  //       viewData.push(d);
  //     }
  //   });

  //   let events: AIMLHostBasedEventsData[] = [];
  //   viewData.map((vd) => {
  //     vd.events.map((ev) => {
  //       events.push(ev);
  //     });
  //   });
  //   events.sort((a, b) => a.diffBwfirstAndCurrentEventTime - b.diffBwfirstAndCurrentEventTime);
  //   viewData.map((vd) => {
  //     vd.events.map((ev) => {
  //       ev.eventNumber = events.findIndex((evn) => evn.eventId == ev.eventId) + 1;
  //     });
  //   });

  //   return viewData;
  // }

  convertToActivityWizardViewData(activityData: AIMLConditionActivityDetail[]) {
    let viewdata: AIMLConditionActivityDetailViewData[] = [];
    activityData.forEach((ad) => {
      let view = new AIMLConditionActivityDetailViewData();
      view.id = ad.id;
      view.description = ad.description;
      view.action = ad.action;
      view.actionDisplay = ad.action_display;
      view.createdDatetime = ad.created_datetime ? this.utilSvc.toUnityOneDateFormat(ad.created_datetime) : 'NA';
      viewdata.push(view);
    })
    return viewdata;
  }

  getAlertDetails(alertId: string) {
    return this.http.get<AIMLConditionAlertDetail>(GET_AIOPS_ALERT_BY_ID(alertId));
  }

  getEventDetails(eventId: string) {
    return this.http.get<AIMLConditionAlertEventDetail>(GET_AIOPS_EVENT_BY_ID(eventId));
  }

  convertToEventDetailsViewdata(event: AIMLConditionAlertEventDetail) {
    let view = new AIMLConditionAlertEventViewData();
    view.id = event.id;
    view.uuid = event.uuid;
    view.deviceName = event.device_name;
    view.deviceType = event.device_type;
    view.managementIp = event.management_ip ? event.management_ip : 'NA';
    view.deviceIcon = this.iconService.getIconByDeviceType(this.utilSvc.getDeviceMappingByDeviceType(event.device_type));
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
    view.statusTextColor =
      event.status == 'Resolved' ? 'text-success' : 'text-danger';

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
    view.recoveredDateTime = event.recovered_time ? this.utilSvc.toUnityOneDateFormat(event.recovered_time) : 'NA';
    return view;
  }

  createTicket(conditionId: string) {
    return this.http.post(`/customer/aiops/conditions/${conditionId}/create_ticket/`, null);
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

  onConditionAcknowledge(conditionId: string, formData: any) {
    return this.http.post<AIMLConditionDetails>(`/customer/aiops/conditions/${conditionId}/acknowledge/`, formData)
      .pipe(map(res => {
        res.acknowledged_time = res.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(res.acknowledged_time) : null;
        return res;
      }));
  }

  onAlertAcknowledge(alertId: string, formData: any) {
    return this.http.post<AIMLConditionAlerts>(`/customer/aiops/alerts/${alertId}/acknowledge/`, formData)
      .pipe(map(res => {
        res.acknowledged_time = res.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(res.acknowledged_time) : null;
        return res;
      }));
  }

  resolveCondition(conditionId: string) {
    return this.http.post<CeleryTask>(`/customer/aiops/conditions/${conditionId}/resolve/`, {})
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  resolveAlert(alertId: string) {
    return this.http.post<CeleryTask>(`/customer/aiops/alerts/${alertId}/resolve/`, {})
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
  conditionSource: string;
  conditionSourceRemaining: number;
  correlator: string[];
  correlationWindow: string;
  firstAlertDateTime: string;
  lastAlertDateTime: string;
  totalTimeBetweenEvents: number;
  recoveredDateTime: string;
  isAcknowledged: boolean;
  acknowledgedBy: string;
  acknowledgedTime: string;
  acknowledgedComment: string;
  acknowledgedTooltipMsg: string;
  loaded: boolean = false;
  alerts: AIMLConditionAlertsViewData[] = [];
  hostBasedAlerts: AIMLHostBasedAlerts[] = [];
  viewType: string = 'list';
  ticketingSystem: string;
  accountId: string;
  projectId?: string;
  ticketUuid: string;
  ticketId: string;
  ticketType: string;
  rootCauseAlert: number;
  resolveInProgress: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
}

export class AIMLHostBasedAlerts {
  constructor() { }
  deviceName: string;
  deviceType: string;
  deviceIcon: string;
  alerts: AIMLHostBasedAlertsData[] = [];
}

export class AIMLHostBasedAlertsData {
  constructor() { }
  alertId: string;
  alertNumber: number = 0;
  alertTime: string;
  recoveredTime: string;
  status: string;
  firstAlertTime: string;
  lastAlertTime: string;
  isFirst: boolean;
  isLast: boolean;
  diffBwfirstAndCurrentAlertTime: number = 0;
  diffBwCurrentAndLastAlertTime: number = 0;
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
  sourceAccount: string;
  isAcknowledged: boolean;
  acknowledgedBy: string;
  acknowledgedTime: string;
  acknowledgedComment: string;
  acknowledgedTooltipMsg: string;
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
  eventMetric: string;
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

export class AIMLConditionActivityDetailViewData {
  constructor() { }
  id: number;
  description: string;
  createdDatetime: string;
  eventId: number;
  alertId: number;
  ConditionId: number;
  action: number;
  actionDisplay: string;
}

export class AIMLAnalysisViewData {
  constructor() { }

  title: string;
  description: string;
  severity: string;
  afftectedDevices: string;
  afftectedInterfaces: string;
  sourceAccount: string;
  rootCause: string;
  contributingFactors: string[];
  whyItHappened: string[];
  howItHappened: string[];
  timelineOfEvents: { event: string; time: string; date: string }[];
  remediationRecommendations: string[];
  resultAccuracyPercentage: string;
  success: string;
  failureReason: string;
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