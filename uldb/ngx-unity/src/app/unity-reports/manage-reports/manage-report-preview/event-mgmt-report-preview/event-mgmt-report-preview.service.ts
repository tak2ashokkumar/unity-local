import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_REPORT_BY_ID, MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ManageReportDataType } from '../../manage-reports.type';
import { ManageReportAlertsDataType, ManageReportCorelationDataType, ManageReportEventsDataType, ManageReportSuppressionDataType } from './event-mgmt-report-preview.type';

@Injectable()
export class EventMgmtReportPreviewService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService,) { }

  getReportById(uuid: string) {
    return this.http.get<ManageReportDataType>(GET_REPORT_BY_ID(uuid));
  }

  getReportPreviewById(uuid: string, criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<ManageReportEventsDataType | ManageReportAlertsDataType | ManageReportSuppressionDataType | ManageReportCorelationDataType>>(MANAGE_REPORT_PREVIEW(uuid), criteria);
  }

  convertEventDataToViewdata(events: ManageReportEventsDataType[]): ManageReportEventsViewData[] {
    let viewData: ManageReportEventsViewData[] = [];
    events.forEach(event => {
      let view = new ManageReportEventsViewData();
      view.id = event.id;
      view.uuid = event.uuid;
      view.deviceName = event.device_name;
      view.description = event.description;
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
      view.isAcknowledged = event.is_acknowledged ? 'Yes' : 'No';
      view.status = event.status;
      if (event.status == 'Resolved') {
        view.statusTextColor = 'text-success';
      } else {
        view.statusTextColor = 'text-danger';
      }
      view.source = event.source;
      view.duration = event.duration;
      view.deviceType = this.getDeviceTypeDisplayNames(event.device_type);
      view.managementIp = event.management_ip ? event.management_ip : 'NA';
      view.recoveredTime = event.recovered_time ? event.recovered_time : 'NA';
      viewData.push(view);
    });
    return viewData;
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

  convertAlertDataToViewdata(alerts: ManageReportAlertsDataType[]): ManageReportAlertsViewdata[] {
    let viewData: ManageReportAlertsViewdata[] = [];
    alerts.forEach(al => {
      let view = new ManageReportAlertsViewdata();
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
      view.description = al.description;
      view.status = al.status;
      if (al.status == 'Resolved') {
        view.statusTextColor = 'text-success';
      } else {
        view.statusTextColor = 'text-danger';
      }
      view.source = al.source;
      view.isAcknowledged = al.is_acknowledged ? 'Yes' : 'No';
      view.deviceType = this.utilSvc.toUpperCase(al.device_type);
      view.managementIp = al.management_ip ? al.management_ip : 'NA';

      viewData.push(view);
    });
    return viewData;
  }

  convertSuppressionDataToViewdata(rules: ManageReportSuppressionDataType[]): ManageReportSuppressionViewdata[] {
    let viewData: ManageReportSuppressionViewdata[] = [];
    rules.forEach(rule => {
      let view = new ManageReportSuppressionViewdata();
      view.uuid = rule.uuid;
      view.name = rule.name;
      view.description = rule.description ? rule.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      view.user = rule.user ? rule.user : 'NA';
      view.createdAt = rule.created_at ? this.utilSvc.toUnityOneDateFormat(rule.created_at) : 'NA';
      view.updatedAt = rule.updated_at ? this.utilSvc.toUnityOneDateFormat(rule.created_at) : 'NA';
      view.alertCount = rule.alert_count;
      view.active = rule.active;
      if (rule.active) {
        view.status = 'Enabled';
        view.statusClass = 'text-success';
      } else {
        view.status = 'Disabled';
        view.statusClass = 'text-warning'
      }
      viewData.push(view);
    });
    return viewData;
  }

  convertCorrelationDataToViewdata(rules: ManageReportCorelationDataType[]): ManageReportCorelationViewdata[] {
    let viewData: ManageReportCorelationViewdata[] = [];
    rules.forEach(rule => {
      let view = new ManageReportCorelationViewdata();
      view.uuid = rule.uuid;
      view.name = rule.name;
      view.createdBy = rule.user;
      view.conditionCount = rule.condition_count;
      view.creationDate = rule.created_datetime ? this.utilSvc.toUnityOneDateFormat(rule.created_datetime) : 'NA';
      view.lastUpdated = rule.updated_datetime ? this.utilSvc.toUnityOneDateFormat(rule.updated_datetime) : 'NA';
      view.correlator = rule.correlator ? this.utilSvc.toUpperCase(rule.correlator) : rule.correlator;
      view.description = rule.description ? rule.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      view.active = rule.is_active;
      if (rule.is_active) {
        view.status = 'Enabled';
        view.statusClass = 'text-success';
      } else {
        view.status = 'Disabled';
        view.statusClass = 'text-warning'
      }
      viewData.push(view);
    });
    return viewData;
  }
}

export class ManageReportEventsViewData {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
  managementIp: string;
  description: string;
  eventDatetime: string;
  severity: string;
  status: string;
  isAcknowledged: string;
  source: string;
  recoveredTime: string;
  duration: string;
  severityClass: string;
  severityIcon: string;
  statusTextColor: string;
}

export class ManageReportAlertsViewdata {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  deviceType: string;
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
  severityClass: string;
  severityIcon: string;
  statusTextColor: string;
}

export class ManageReportSuppressionViewdata {
  constructor() { }
  uuid: string;
  name: string;
  description: string;
  user: string;
  updatedAt: string;
  createdAt: string;
  alertCount: number;
  active: boolean;
  status: string;
  statusClass: string;
}

export class ManageReportCorelationViewdata {
  constructor() { }
  uuid: string;
  name: string;
  conditionCount: number;
  createdBy: string;
  creationDate: string;
  lastUpdated: string;
  correlator: string;
  description: string;
  active: boolean;
  status: string;
  statusClass: string;
}