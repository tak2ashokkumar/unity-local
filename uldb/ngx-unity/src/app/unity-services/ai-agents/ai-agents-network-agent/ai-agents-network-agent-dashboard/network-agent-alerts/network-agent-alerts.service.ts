import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AIMLAlerts, AIMLAlertsSummary, AIMLSuppressedDisableTriggerType, AIMLSuppressedEvents, AIMLSuppressedResolveType } from './network-agent-alerts.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AppLevelService } from 'src/app/app-level.service';
import { FormBuilder, Validators } from '@angular/forms';
import { GET_AIOPS_ALERTS, GET_AIOPS_ALERTS_SUMMARY, GET_AIOPS_SUPPRESSED_ALERTS } from 'src/app/shared/api-endpoint.const';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { map, switchMap, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class NetworkAgentAlertsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private builder: FormBuilder) { }

  getAlertsSummary() {
    let params: HttpParams = new HttpParams();
    params = params.append('last_n_days', 7);
    return this.http.get<any>(`/customer/aiops/alerts/summary_network_agent/`, { params: params });
  }

  buildFilterForm() {
    return this.builder.group({
      'search_key': [''],
      'severity': [''],
      'status': ['']
    });
  }

  getAlerts(criteria: SearchCriteria, filterData: any) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
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
    const deviceTypes = ['switch', 'firewall', 'load_balancer'];

    deviceTypes.forEach((type: string) => {
      params = params.append('device_type', type);
    });
    return this.http.get<PaginatedResult<AIMLAlerts>>(GET_AIOPS_ALERTS(), { params: params });
  }

  convertToViewdata(alerts: AIMLAlerts[]) {
    let viewdata: AIMLAlertsViewdata[] = [];
    alerts.forEach(al => {
      let view = new AIMLAlertsViewdata();
      view.id = al.id;
      view.uuid = al.uuid;
      view.deviceName = al.device_name;
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

      view.description = al.description ? al.description : 'NA';
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
      view.deviceType = al.device_type ? this.utilSvc.toUpperCase(al.device_type) : 'N/A';
      view.deviceMapping = this.getDeviceMappingByDeviceType(al.device_type);
      view.managementIp = al.management_ip ? al.management_ip : 'N/A';
      view.eventMetric = al.event_metric ? al.event_metric : 'NA';
      viewdata.push(view);
    });
    return viewdata;
  }

  getDeviceMappingByDeviceType(devicetype: string): DeviceMapping {
    switch (devicetype) {
      case 'switch': return DeviceMapping.SWITCHES;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'hypervisor': return DeviceMapping.HYPERVISOR;
      case 'bms': return DeviceMapping.BARE_METAL_SERVER;
      case 'storage': return DeviceMapping.STORAGE_DEVICES;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'database': return DeviceMapping.DB_SERVER;
      case 'custom': return DeviceMapping.OTHER_DEVICES;
      case 'pdu': return DeviceMapping.PDU;
      case 'vm': return DeviceMapping.VIRTUAL_MACHINE;
      default: return DeviceMapping.OTHER_DEVICES;
    }
  }

  getSuppressedEvents(criteria: SearchCriteria, filterData: any) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
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
    return this.http.get<PaginatedResult<AIMLSuppressedEvents>>(GET_AIOPS_SUPPRESSED_ALERTS(), { params: params });
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

  onAcknowledge(alertId: string, formData: any, isSuppressed: boolean) {
    let url: string;
    if (isSuppressed) {
      url = `/customer/aiops/events/${alertId}/acknowledge/`;
    } else {
      url = `/customer/aiops/alerts/${alertId}/acknowledge/`;
    }
    return this.http.post<AIMLAlerts | AIMLSuppressedEvents>(url, formData)
      .pipe(map(res => {
        res.acknowledged_time = res.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(res.acknowledged_time) : null;
        return res;
      }));
  }

  resolveAlert(alertId: string) {
    return this.http.post<CeleryTask>(`/customer/aiops/alerts/${alertId}/resolve/`, {})
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  disable(eventId: string): Observable<AIMLSuppressedDisableTriggerType> {
    return this.http.post<AIMLSuppressedDisableTriggerType>(`/customer/aiops/events/${eventId}/disable_trigger/`, {});
  }

  resolveSuppressed(eventId: string): Observable<AIMLSuppressedResolveType> {
    return this.http.post<AIMLSuppressedResolveType>(`/customer/aiops/events/${eventId}/resolve/`, {});
  }
}

export class AIMLAlertsViewdata {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  deviceMapping: DeviceMapping;
  eventCount: number;
  alertTime: string;
  managementIp: string;
  description: string;
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
  suppressionRules: string[]; // only for suppressed alerts
  eventMetric: string;
  resolveInProgress: boolean;
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