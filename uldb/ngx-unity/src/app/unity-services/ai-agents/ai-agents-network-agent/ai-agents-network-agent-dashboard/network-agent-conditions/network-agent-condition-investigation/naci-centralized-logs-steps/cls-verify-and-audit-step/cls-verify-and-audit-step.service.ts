import { Injectable } from '@angular/core';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class ClsVerifyAndAuditStepService {

  constructor(private utilSvc: AppUtilityService) { }

  convertToCentralizedLogsViewData(data: any): CentralizedLogsViewData {
    let viewData: CentralizedLogsViewData = new CentralizedLogsViewData();
    viewData.alerts = this.convertToAlertsViewData(data.alerts);
    viewData.events = this.convertToEventsViewData(data.events);
    return viewData;
  }

  convertToAlertsViewData(alerts: any[]): AlertsViewData[] {
    let viewData: AlertsViewData[] = [];

    alerts.forEach(alert => {
      let view: AlertsViewData = new AlertsViewData();
      view.id = alert.id;
      view.deviceName = alert.device_name;
      view.deviceType = alert.device_type;
      view.deviceTypeMapping = this.getDeviceMappingByDeviceType(alert.device_type);
      view.timestamp = alert.timestamp ? this.utilSvc.toUnityOneDateFormat(alert.timestamp) : 'N/A';
      view.severity = alert.severity;
      if (alert.severity == 'Critical') {
        view.severityIcon = 'fa-exclamation-circle text-danger';
      } else if (alert.severity == 'Warning') {
        view.severityIcon = 'fa-exclamation-circle text-warning';
      } else {
        view.severityIcon = 'fa-info-circle text-primary';
      }
      view.description = alert.description;
      view.status = alert.status;
      if (alert.status == 'Resolved') {
        view.statusTextColor = 'text-success';
      } else {
        view.statusTextColor = 'text-danger';
      }
      view.host = alert.host;
      view.type = alert.type;
      viewData.push(view);
    })
    return viewData;
  }

  convertToEventsViewData(events: any[]): EVentsViewData[] {
    let viewData: EVentsViewData[] = [];
    events.forEach(event => {
      let view: EVentsViewData = new EVentsViewData();
      view.id = event.id;
      view.deviceName = event.device_name;
      view.deviceType = event.device_type;
      view.deviceTypeMapping = this.getDeviceMappingByDeviceType(event.device_type);
      view.timestamp = event.timestamp ? this.utilSvc.toUnityOneDateFormat(event.timestamp) : 'N/A';
      view.severity = event.severity;
      if (event.severity == 'Critical') {
        view.severityIcon = 'fa-exclamation-circle text-danger';
      } else if (event.severity == 'Warning') {
        view.severityIcon = 'fa-exclamation-circle text-warning';
      } else {
        view.severityIcon = 'fa-info-circle text-primary';
      }
      view.description = event.description;
      view.status = event.status;
      if (event.status == 'Resolved') {
        view.statusTextColor = 'text-success';
      } else {
        view.statusTextColor = 'text-danger';
      }
      view.host = event.host;
      view.type = event.type;
      viewData.push(view);
    })
    return viewData;
  }

  getDeviceMappingByDeviceType(devicetype: string): DeviceMapping {
    switch (devicetype) {
      case 'switch': return DeviceMapping.SWITCHES;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
    }
  }
}

export class CentralizedLogsViewData {
  constructor() { }
  alerts: AlertsViewData[] = []
  events: EVentsViewData[] = [];
}

export class AlertsViewData {
  constructor() { }
  timestamp: string;
  type: string;
  description: string;
  severity: string;
  severityIcon: string;
  id: number;
  deviceType: string;
  deviceTypeMapping: string;
  deviceName: string;
  status: string;
  statusTextColor: string;
  host: string;
}

export class EVentsViewData {
  constructor() { }
  timestamp: string;
  type: string;
  description: string;
  severity: string;
  severityIcon: string;
  id: number;
  deviceType: string;
  deviceTypeMapping: string;
  deviceName: string;
  status: string;
  statusTextColor: string;
  host: string;
}