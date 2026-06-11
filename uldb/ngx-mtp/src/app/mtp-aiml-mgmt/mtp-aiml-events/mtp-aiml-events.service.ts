import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { MTPEventCountByDeviceType, MTPEvents, MTPEventsSummary } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DeviceMapping, UnityDeviceType } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AIOPS_DEVICE_TYPES } from '../mtp-aiml-mgmt.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';

@Injectable()
export class MtpAimlEventsService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getEventSummary(tenants: string[]) {
    let params: HttpParams = new HttpParams();
    params = params.append('last_n_days', 7);
    tenants.map(t => params = params.append('tenants', t));
    return this.http.get<MTPEventsSummary>(`customer/mtp/events/summary/`, { params: params });
  }

  getEventsCount(tenants: string[]) {
    let obj = { count_by: 'device_type', tenants: tenants };
    return this.http.post<MTPEventCountByDeviceType[]>(`/customer/mtp/events/count/`, obj);
  }

  convertToEventsCountByDeviceTypeViewdata(data: MTPEventCountByDeviceType[]): AIMLEventsCountByDeviceTypeViewData {
    let a = new AIMLEventsCountByDeviceTypeViewData();
    data.map(ad => {
      switch (ad.device_type) {
        case 'switch':
        case 'firewall':
        case 'load_balancer': a.network = a.network + ad.event_count; break;
        case 'hypervisor':
        case 'baremetal':
        case 'vm':
        case 'mac': a.compute += ad.event_count; break;
        case 'storage': a.storage += ad.event_count; break;
        default: a.others += ad.event_count; break;
      }
    })
    return a;
  }

  getDropdownData() {
    const device_types = of(AIOPS_DEVICE_TYPES);
    return forkJoin([device_types]);
  }

  buildFilterForm() {
    return this.builder.group({
      search_key: [''],
      severity: [''],
      status: [''],
      device_type: [[]],
    });
  }

  getEvents(tenants: string[], criteria: SearchCriteria, filterData: any) {
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
    return this.http.get<PaginatedResult<MTPEvents>>(`customer/mtp/events/`, { params: params });
  }

  convertDetailsToViewdata(events: MTPEvents[]) {
    let viewdata: AIMLEventsViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    events.forEach(event => {
      let view = new AIMLEventsViewData();
      view.id = event.id;
      view.uuid = event.uuid;
      view.deviceName = event.device_name;
      view.tenant = event.tenant;
      view.description = event.description;
      view.eventDatetime = event.event_datetime ? datePipe.transform(event.event_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
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
      view.isAcknowledged = event.is_acknowledged ? 'Yes' : 'No';

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
      view.duration = event.duration;

      view.deviceType = this.getDeviceTypeDisplayNames(event.device_type);
      view.deviceMapping = this.getDeviceMappingByDeviceType(event.device_type);
      view.managementIp = event.management_ip ? event.management_ip : 'NA';
      view.recoveredTime = event.recovered_time ? datePipe.transform(event.recovered_time.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      viewdata.push(view);
    });
    return viewdata;
  }

  getDeviceTypeDisplayNames(deviceType: string): string {
    switch (deviceType) {
      case 'switch': return 'Switch';
      case 'firewall': return 'Firewall';
      case 'load_balancer': return 'Load Balancer';
      case 'hypervisor': return 'Hypervisor';
      case 'bms': return 'Bare Metal';
      case 'storage': return 'Storage';
      case 'database': return 'Database';
      case 'mac_device': return 'Mac Device';
      case 'custom': return 'Custom Device';
      case 'pdu': return 'PDU';
      case 'vm': return 'VM';
      default: return 'N/A';
    }
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

  disable(eventId: string): Observable<AIMLEventDisableTriggerType> {
    return this.http.post<AIMLEventDisableTriggerType>(`/customer/mtp/events/${eventId}/disable_trigger/`, {});
  }

  resolve(eventId: string): Observable<AIMLEventResolveType> {
    return this.http.post<AIMLEventResolveType>(`/customer/mtp/events/${eventId}/resolve/`, {});
  }
}

export class AIMLEventsViewData {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  deviceMapping: DeviceMapping;
  tenant: string;
  managementIp: string;
  description: string;
  eventDatetime: string;
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

  triggerDisableBtnTooltipMsg: string;
  isSourceUnity: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
}

export class AIMLEventsCountByDeviceTypeViewData {
  constructor() { }
  compute: number = 0;
  network: number = 0;
  storage: number = 0;
  others: number = 0;
}

export class EventsFilterFormData {
  device_types: string[];
}

export interface AIMLEventDisableTriggerType {
  message: string;
  success: boolean;
}

export interface AIMLEventResolveType extends AIMLEventDisableTriggerType { }
