import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ZABBIX_ALERT_HISTORY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityViewAlert } from '../unity-alerts.type';

@Injectable()
export class UnityAlertsHistoryService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService, ) { }

  getAlertsByFilters(formData: any, criteria: SearchCriteria): Observable<Array<UnityViewAlert>> {
    return this.tableService.postData<Array<UnityViewAlert>>(ZABBIX_ALERT_HISTORY(), formData, criteria);
  }

  getTime(timestamp: number) {
    if (!timestamp) {
      return '';
    }
    const isToday = moment(timestamp * 1000).isSame(Date.now(), 'day');
    if (isToday) {
      return this.utilSvc.toUnityOneDateFormat(timestamp * 1000, 'H:mm:ss');
    } else {
      return this.utilSvc.toUnityOneDateFormat((timestamp * 1000));
    }
  }

  getDuration(alertTime: number, recoveryTime: number) {
    if (!alertTime) {
      return '';
    }
    let diff: number;
    if (recoveryTime) {
      diff = moment(recoveryTime * 1000).diff(moment(alertTime * 1000));
    } else {
      diff = moment().diff(moment(alertTime * 1000));
    }
    const duration = moment.duration(diff);
    if (duration.years()) {
      return `${Math.floor(duration.asDays())}d ${duration.hours()}h ${duration.minutes()}m`;
    } else if (duration.months()) {
      return `${Math.floor(duration.asDays())}d ${duration.hours()}h ${duration.minutes()}m`;
    } else if (duration.days()) {
      return `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m`;
    } else if (duration.hours()) {
      return `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
    } else {
      return `${duration.minutes()}m ${duration.seconds()}s `;
    }
  }

  convertToViewData(data: UnityViewAlert[]): UnityViewAlertHistoryViewData {
    let viewData: UnityViewAlertHistoryViewData = new UnityViewAlertHistoryViewData();
    data.map(d => {
      let a: UnityViewAlertHistoryData = new UnityViewAlertHistoryData();
      a.id = d.id;
      a.deviceId = d.device_uuid;
      a.deviceName = d.device_name;
      a.deviceType = this.getDeviceTypeDisplayNames(d.device_type);
      a.deviceCloud = d.device_cloud;
      a.managementIp = d.management_ip ? d.management_ip : 'N/A';;
      a.isShared = d.is_shared;

      a.alert = d.alert;
      a.alertTime = d.alert_time;
      a.recoveryTime = d.recovery_time;
      a.duration = d.duration;

      a.host = d.host;
      a.hostIP = d.host_ip;

      a.status = d.status.toLowerCase();
      a.statusTextColor = d.status == 'PROBLEM' ? 'text-danger' : 'text-success';

      a.severity = d.severity;
      a.eventId = d.event_id;

      if (a.severity == 'Critical') {
        a.severityBg = 'bg-danger';
        a.severityClass = 'text-danger';
        viewData.criticalAlerts.push(a);
      } else if (a.severity == 'Warning') {
        a.severityBg = 'bg-warning';
        a.severityClass = 'text-warning';
        viewData.warningAlerts.push(a);
      } else {
        a.severityBg = 'bg-primary';
        a.severityClass = 'text-primary';
        viewData.infoAlerts.push(a);
      }
      viewData.totalAlerts.push(a);
    })
    return viewData;
  }

  getDeviceTypeDisplayNames(deviceType: string): string {
    switch (deviceType) {
      case 'switch': return 'Switch';
      case 'firewall': return 'Firewall';
      case 'load_balancer': return 'Load Balancer';
      case 'hypervisor': return 'Hypervisor';
      case 'bm_server': return 'Bare Metal';
      case 'vm': return 'VM';
      case 'storage_device': return 'Storage';
      case 'mac_device': return 'Mac Device';
      case 'custom': return 'Custom Device';
      case 'pdu': return 'PDU';
      default: return 'N/A';
    }
  }
  resetFilterFormErrors(): any {
    let formErrors = {
      'device_type': '',
      'duration': '',
      'start_date': '',
      'end_date': '',
    };
    return formErrors;
  }

  filterFormValidationMessages = {
    'device_type': {
      'required': 'Device Type is required'
    },
    'duration': {
      'required': 'Duration is required'
    },
    'start_date': {
      'required': 'Start date is required'
    },
    'end_date': {
      'required': 'End date is required'
    }
  };

  buildFilterForm(dateRange: DateRange): FormGroup {
    this.resetFilterFormErrors();
    return this.builder.group({
      'duration': [Duration.LAST_24_HOURS, [Validators.required]],
      'start_date': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'end_date': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'search': [''],
      'device_type': [[], [Validators.required]]
    }, { validators: this.utilSvc.dateRangeValidator('start_date', 'end_date') });
  }

  getDateRangeByPeriod(graphRange: Duration): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case Duration.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case Duration.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case Duration.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case Duration.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case Duration.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }
}

export class UnityViewAlertHistoryData {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  deviceCloud: string[];
  managementIp: string;
  isShared: boolean;

  alert: string;
  alertTime: string;
  recoveryTime: string;
  duration: string;

  host: any;
  hostIP: string;

  severity: string;
  severityBg: 'bg-warning' | 'bg-danger' | 'bg-primary';
  severityClass: 'text-warning' | 'text-danger' | 'text-primary';

  status: string;
  statusTextColor: 'text-success' | 'text-danger';

  eventId: number;

  constructor() { }
}

export class UnityViewAlertHistoryViewData {
  totalAlerts: UnityViewAlertHistoryData[] = [];
  criticalAlerts: UnityViewAlertHistoryData[] = [];
  warningAlerts: UnityViewAlertHistoryData[] = [];
  infoAlerts: UnityViewAlertHistoryData[] = [];
}

export enum Duration {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export const alertStatus: Array<{ displayName: string, name: string }> = [
  {
    "displayName": "Problem",
    "name": "problem"
  },
  {
    "displayName": "Resolved",
    "name": "resolved"
  },
];

export const deviceTypesInAlerts: Array<{ name: string, displayName: string, mapping: DeviceMapping }> = [
  {
    name: "switch",
    displayName: "Switch",
    mapping: DeviceMapping.SWITCHES
  },
  {
    name: "firewall",
    displayName: "Firewall",
    mapping: DeviceMapping.FIREWALL
  },
  {
    name: "load_balancer",
    displayName: "Load Balancer",
    mapping: DeviceMapping.LOAD_BALANCER
  },
  {
    name: "hypervisor",
    displayName: "Hypervisor",
    mapping: DeviceMapping.HYPERVISOR
  },
  {
    name: "bm_server",
    displayName: "Bare Metal Server",
    mapping: DeviceMapping.BARE_METAL_SERVER
  },
  {
    name: "vm",
    displayName: "Virtual Machine",
    mapping: DeviceMapping.VIRTUAL_MACHINE
  },
  {
    name: "mac_device",
    displayName: "Mac Device",
    mapping: DeviceMapping.MAC_MINI
  },
  {
    name: "pdu",
    displayName: "PDU",
    mapping: DeviceMapping.PDU
  },
  {
    name: "custom",
    displayName: "Other devices",
    mapping: DeviceMapping.OTHER_DEVICES
  },
];