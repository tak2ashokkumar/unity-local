import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AIMLAlerts, AIMLAlertsSummary, AIMLSuppressedAlerts, MTPAlertCountByDeviceType } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpAimlAlertsService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private builder: FormBuilder) { }

  getAlertsSummary(tenants: string[]) {
    let params: HttpParams = new HttpParams();
    tenants.map(t => params = params.append('tenants', t));
    params = params.append('last_n_days', 7);
    return this.http.get<AIMLAlertsSummary>(`customer/mtp/alerts/summary/`, { params: params });
  }

  getAlertsCountByDeviceType(tenants: string[]) {
    return this.http.post<MTPAlertCountByDeviceType[]>(`customer/mtp/alerts/count/`, { tenants: tenants });
  }

  convertToAlertsCountViewdata(alertData: MTPAlertCountByDeviceType[]): AIMLAlertsCountByDeviceTypeViewData {
    let a: AIMLAlertsCountByDeviceTypeViewData = new AIMLAlertsCountByDeviceTypeViewData();
    alertData.map(ad => {
      switch (ad.device_type) {
        case 'switch':
        case 'firewall':
        case 'load_balancer': a.network = a.network + ad.alert_count; break;
        case 'hypervisor':
        case 'baremetal':
        case 'vm':
        case 'mac': a.compute += ad.alert_count; break;
        case 'storage': a.storage += ad.alert_count; break;
        default: a.others += ad.alert_count; break;
      }
    })
    return a;
  }

  buildFilterForm() {
    return this.builder.group({
      'search_key': [''],
      'severity': [''],
      'status': ['']
    });
  }

  getAlerts(tenants: string[], criteria: SearchCriteria, filterData: any) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    tenants.map(t => params = params.append('tenants', t));
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
    return this.http.get<PaginatedResult<AIMLAlerts>>(`customer/mtp/alerts/`, { params: params });
  }

  convertToViewdata(alerts: AIMLAlerts[]) {
    let viewdata: AIMLAlertsViewdata[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    alerts.forEach(al => {
      let view = new AIMLAlertsViewdata();
      view.id = al.id;
      view.uuid = al.uuid;
      view.deviceName = al.device_name;
      view.tenant = al.tenant;
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
      view.deviceType = al.device_type ? this.utilSvc.toUpperCase(al.device_type) : 'NA';
      view.deviceMapping = this.getDeviceMappingByDeviceType(al.device_type);
      view.managementIp = al.management_ip ? al.management_ip : 'NA';

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

  getSuppressedAlerts(tenants: string[], criteria: SearchCriteria, filterData: any) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    tenants.map(t => params = params.append('tenants', t));
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
    return this.http.get<PaginatedResult<AIMLSuppressedAlerts>>('/customer/mtp/supressed/', { params: params });
  }

  convertToSuppressedAlertsViewdata(alerts: AIMLSuppressedAlerts[]) {
    let viewdata: AIMLAlertsViewdata[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    alerts.map(al => {
      let view = new AIMLAlertsViewdata();
      view.id = al.id;
      view.uuid = al.uuid;
      view.deviceName = al.device_name;
      view.deviceType = al.device_type ? this.utilSvc.toUpperCase(al.device_type) : 'NA';
      view.deviceMapping = this.getDeviceMappingByDeviceType(al.device_type);
      view.managementIp = al.management_ip ? al.management_ip : 'NA';
      view.description = al.description;

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

      view.status = al.status;
      if (al.status == 'Resolved') {
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
      view.alertTime = al.event_datetime ? datePipe.transform(al.event_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      // view.source = al.source;
      view.isSourceUnity = al.source == 'Unity';
      view.isAcknowledged = al.is_acknowledged ? 'Yes' : 'No';
      view.suppressionRules = al.supression_rules;
      viewdata.push(view);
    })
    return viewdata;
  }

  resolveAlert(alertId: string) {
    return this.http.post<CeleryTask>(`/customer/mtp/alerts/${alertId}/resolve/`, {})
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  disable(eventId: string): Observable<AIMLSuppressedDisableTriggerType> {
    return this.http.post<AIMLSuppressedDisableTriggerType>(`/customer/mtp/events/${eventId}/disable_trigger/`, {});
  }

  resolveSuppressed(eventId: string): Observable<AIMLSuppressedResolveType> {
    return this.http.post<AIMLSuppressedResolveType>(`/customer/mtp/events/${eventId}/resolve/`, {});
  }
}

export class AIMLAlertsCountByDeviceTypeViewData {
  constructor() { }
  compute: number = 0;
  network: number = 0;
  storage: number = 0;
  others: number = 0;
}

export class AIMLAlertsViewdata {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  tenant: string;
  deviceMapping: DeviceMapping;
  eventCount: number;
  alertTime: string;

  managementIp: string;
  description: string;
  severity: string;
  status: string;
  isAcknowledged: string;
  source: string;
  recoveredTime: string;
  duration: string;
  dedupedCount: number;

  severityClass: string;
  severityIcon: string;
  statusTextColor: string;

  suppressionRules: string[]; // only for suppressed alerts

  resolveInProgress: boolean;
  triggerDisableBtnTooltipMsg: string;
  isSourceUnity: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
}

export interface AIMLSuppressedDisableTriggerType {
  message: string;
  success: boolean;
}

export interface AIMLSuppressedResolveType extends AIMLSuppressedDisableTriggerType { }
