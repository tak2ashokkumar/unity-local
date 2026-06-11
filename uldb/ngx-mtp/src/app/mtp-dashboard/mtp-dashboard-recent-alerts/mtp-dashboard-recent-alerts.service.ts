import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecentAlerts } from 'src/app/shared/SharedEntityTypes/alerts.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpDashboardRecentAlertsService {

  constructor(private http: HttpClient,
    private iconSvc: DeviceIconService) { }

  getRecentAlerts() {
    return this.http.get<RecentAlerts[]>(`/customer/mtp/alerts/top_alerts/`);
  }

  convertToViewData(alerts: RecentAlerts[]): MTPDashboardRecentAlertsViewData[] {
    let viewData: MTPDashboardRecentAlertsViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    alerts.map(al => {
      let a = new MTPDashboardRecentAlertsViewData();
      a.tenantName = al.tenant;
      a.deviceName = al.device_name ? al.device_name: 'N/A';
      a.deviveType = this.getDisplayType(al.device_type);
      a.deviceIcon = this.iconSvc.getIconByDeviceType(a.deviveType);
      a.deviceIcon = `${a.deviceIcon} ${this.getIconColorClass(al.device_type)}`;
      a.eventCount = al.event_count;
      a.alertTime = al.alert_datetime ? datePipe.transform(al.alert_datetime.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      a.severity = al.severity;
      switch (al.severity) {
        case 'Critical':
          a.severityIcon = 'fas fa-exclamation-triangle text-danger';
          break;
        case 'Warning':
          a.severityIcon = 'fas fa-exclamation-circle text-warning fa-lg';
          break
        case 'Information':
          a.severityIcon = 'fas fa-info-circle text-primary fa-lg';
          break;
      }
      a.description = al.description;
      a.status = al.status;
      if (al.status == 'Resolved') {
        a.statusTextColor = 'text-success';
      } else {
        a.statusTextColor = 'text-danger';
      }
      a.source = al.source;
      a.acknowledged = al.is_acknowledged ? 'Yes' : 'No';
      viewData.push(a);
    })
    return viewData;
  }

  getIconColorClass(type: string) {
    switch (type) {
      case 'pod': return ``;
      case 'VM': return `vms`;
      case 'cabinet': return `cabinets`;
      case 'firewall': return `firewalls`;
      case 'switch': return `switches`;
      case 'load_balancer': return `lbs`;
      case 'storage_device': return `storage`;
      case 'mac_device': return `fa-lg`;
      case 'bm_server': return `bms`;
      case 'PDU': return `pdus`;
      case 'hypervisor': return `hypervisor`;
    }
  }

  getDisplayType(type: string) {
    switch (type) {
      case 'pod': return DeviceMapping.POD;
      case 'vm': return DeviceMapping.VIRTUAL_MACHINE;
      case 'cabinet': return DeviceMapping.CABINET_VIZ;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'switch': return DeviceMapping.SWITCHES;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'storage_device': return DeviceMapping.STORAGE_DEVICES;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'bm_server': return DeviceMapping.BARE_METAL_SERVER;
      case 'pdu': return DeviceMapping.PDU;
      case 'hypervisor': return DeviceMapping.HYPERVISOR;
    }
  }
}

export class MTPDashboardRecentAlertsViewData {
  tenantName: string;
  deviceName: string;
  deviveType: string;
  deviceIcon: string;
  deviceIconClass: string;
  eventCount: number;
  alertTime: string;
  severity: string;
  severityIcon: string;
  description: string;
  status: string;
  statusTextColor: string;
  source: string;
  acknowledged: string;
}
