import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GET_AIOPS_EVENTS, GET_AIOPS_EVENT_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AIOPS_DEVICE_TYPES } from '../../aiml/aiml.component';
import { TableColumnMapping } from '../../green-it/green-it-usage/green-it-usage.service';
import { AIMLEventDisableTriggerType, AIMLEventResolveType, AIMLEvents, AIMLEventsSummary } from './aiml-events.type';

@Injectable()
export class AimlEventsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getEventSummary() {
    let params: HttpParams = new HttpParams();
    params = params.append('last_n_days', 7);
    return this.http.get<AIMLEventsSummary>(GET_AIOPS_EVENT_SUMMARY(), { params: params });
  }

  buildFilterForm() {
    return this.builder.group({
      search_key: [''],
      severity: [''],
      status: [''],
      device_type: [[]],
    });
  }

  getEvents(criteria: SearchCriteria, filterData: any) {
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
    return this.http.get<PaginatedResult<AIMLEvents>>(GET_AIOPS_EVENTS(), { params: params });
  }

  getDropdownData() {
    const device_types = of(AIOPS_DEVICE_TYPES);
    return forkJoin([device_types]);
  }

  convertDetailsToViewdata(events: AIMLEvents[]) {
    let viewdata: AIMLEventsViewData[] = [];
    events.forEach(event => {
      let view = new AIMLEventsViewData();
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
      view.deviceMapping = this.getDeviceMappingByDeviceType(event.device_type);
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
      case 'azure_vm': return 'VM';
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

  onAcknowledge(eventId: string, formData: any): Observable<AIMLEvents> {
    return this.http.post<AIMLEvents>(`/customer/aiops/events/${eventId}/acknowledge/`, formData)
      .pipe(map(res => {
        res.acknowledged_time = res.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(res.acknowledged_time) : null;
        return res;
      }));
  }

  disable(eventId: string): Observable<AIMLEventDisableTriggerType> {
    return this.http.post<AIMLEventDisableTriggerType>(`/customer/aiops/events/${eventId}/disable_trigger/`, {});
  }

  resolve(eventId: string): Observable<AIMLEventResolveType> {
    return this.http.post<AIMLEventResolveType>(`/customer/aiops/events/${eventId}/resolve/`, {});
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }
}

export class AIMLEventsViewData {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  deviceMapping: DeviceMapping;
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

export class EventsFilterFormData {
  device_types: string[];
}

export const aimlEventsColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Device Type',
    'key': 'deviceType',
    'default': true,
    'mandatory': true,
  },
  {
    'name': 'IP Address',
    'key': 'ipAddress',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'Description',
    'key': 'description',
    'default': true,
    'mandatory': true,
  },
  {
    'name': 'Event Metric',
    'key': 'eventMetric',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Event Time',
    'key': 'eventDatetime',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'Severity',
    'key': 'severity',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'Status',
    'key': 'status',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'source',
    'key': 'source',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Source Account',
    'key': 'sourceAccount',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'Duration',
    'key': 'duration',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Recovery Time',
    'key': 'recoveredTime',
    'default': false,
    'mandatory': false
  },
];

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