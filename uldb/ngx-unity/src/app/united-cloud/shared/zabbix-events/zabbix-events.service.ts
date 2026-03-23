import { Injectable } from '@angular/core';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ZabbixDisableTriggerType, ZabbixEventResolveType, ZabbixMonitoringAlerts } from './zabbix-events.type';
import { ZabbixMonitoringEvents } from '../entities/zabbix-events.type';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class ZabbixEventsService {
  constructor(private utilSvc: AppUtilityService,
    private http: HttpClient,
    private builder: FormBuilder) { }

  convertToViewData(alerts: ZabbixMonitoringAlerts[]): ZabbixMonitoringAlertsViewdata[] {
    let viewData: ZabbixMonitoringAlertsViewdata[] = [];
    alerts.map(a => {
      let av: ZabbixMonitoringAlertsViewdata = new ZabbixMonitoringAlertsViewdata();
      av.alertId = a.alert_id;
      av.alertDesc = a.description.replace(/\n/g, '<br>');
      av.severity = a.severity;
      av.alertTime = a.date_time ? this.utilSvc.toUnityOneDateFormat(a.date_time) : 'N/A';
      av.deviceName = a.device_name;
      switch (a.severity) {
        case 'Critical': av.colorClass = 'bg-danger'; break;
        case 'Warning': av.colorClass = 'bg-warning'; break;
        default: av.colorClass = 'bg-primary';
      }
      viewData.push(av);
    })
    return viewData;
  }

  convertEventDetailsToViewdata(events: ZabbixMonitoringEvents[]): ZabbixMonitoringEventsViewdata[] {
    let viewdata: ZabbixMonitoringEventsViewdata[] = [];
    events.forEach(event => {
      let view = new ZabbixMonitoringEventsViewdata();
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
      // view.sourceAccount = event.source_account;
      view.duration = event.duration;
      view.deviceType = event.device_type ? event.device_type : 'NA';
      // view.deviceMapping = this.getDeviceMappingByDeviceType(event.device_type);
      view.ipAddress = event.ip_address ? event.ip_address : 'NA';
      view.isAcknowledged = event.is_acknowledged;
      view.acknowledgedTime = event.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(event.acknowledged_time) : null;
      view.acknowledgedBy = event.acknowledged_by;
      view.acknowledgedComment = event.acknowledged_comment;
      view.acknowledgedTooltipMsg = `Acknowledged by ${view.acknowledgedBy} at ${view.acknowledgedTime}`;
      view.recoveredTime = event.recovered_time ? this.utilSvc.toUnityOneDateFormat(event.recovered_time) : 'NA';
      view.eventMetric = event.event_metric ? event.event_metric : 'NA';
      viewdata.push(view);
    });
    return viewdata;
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

  onAcknowledge(eventId: string, formData: any): Observable<ZabbixMonitoringEvents> {
    return this.http.post<ZabbixMonitoringEvents>(`/customer/aiops/events/${eventId}/acknowledge/`, formData)
      .pipe(map(res => {
        res.acknowledged_time = res.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(res.acknowledged_time) : null;
        return res;
      }));
  }

  disable(eventId: string): Observable<ZabbixDisableTriggerType> {
    return this.http.post<ZabbixDisableTriggerType>(`/customer/aiops/events/${eventId}/disable_trigger/`, {});
  }

  resolve(eventId: string): Observable<ZabbixEventResolveType> {
    return this.http.post<ZabbixEventResolveType>(`/customer/aiops/events/${eventId}/resolve/`, {});
  }

}

export class ZabbixMonitoringEventsViewdata {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  // deviceMapping: DeviceMapping;
  ipAddress: string;
  description: string;
  eventDatetime: string;
  severity: string;
  status: string;
  isAcknowledged: boolean;
  acknowledgedBy: string;
  acknowledgedTime: string;
  acknowledgedComment: string;
  acknowledgedTooltipMsg: string;
  source: string;
  sourceAccount: string;
  recoveredTime: string;
  duration: string;
  dedupedCount: number;
  severityClass: string;
  severityIcon: string;
  statusTextColor: string;
  eventMetric: string;
  triggerDisableBtnTooltipMsg: string;
  isSourceUnity: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
}

export class ZabbixMonitoringAlertsViewdata {
  alertId: number;
  alertDesc: string;
  deviceName: string;
  severity: string;
  colorClass: string;
  alertTime: string;
  constructor() { }
}