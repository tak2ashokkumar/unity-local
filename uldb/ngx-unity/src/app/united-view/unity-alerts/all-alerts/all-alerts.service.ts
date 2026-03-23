import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ObserviumAlertsService } from '../device-alerts/observium-alerts/observium-alerts.service';
import { ZabbixAlertsService } from '../device-alerts/zabbix-alerts/zabbix-alerts.service';

@Injectable()
export class AllDeviceAlertsService {

  constructor(private http: HttpClient,
    private obsAlerts: ObserviumAlertsService,
    private zbxAlerts: ZabbixAlertsService) { }

  getObsAllDeviceAlerts(device: string): Observable<FailedAlertsViewData[]> {
    return this.obsAlerts.getAllDeviceAlerts(device).pipe(map(res => this.obsAlerts.convertToViewData(res, device)));
  }

  getZbxAllDeviceAlerts(device: string): Observable<FailedAlertsViewData[]> {
    return this.zbxAlerts.getAlerts(device).pipe(map(res => this.zbxAlerts.convertToViewData(res, device)));
  }

}

export class FailedAlertsViewData {
  alertDesc: string;
  deviceName: string;
  deviceType: string;
  severity: string;
  alertTime: string;
  colorClass: string;
  constructor() { }
}

export const ALL_DEVICES = [
  DeviceMapping.SWITCHES, DeviceMapping.FIREWALL, DeviceMapping.LOAD_BALANCER,
  DeviceMapping.BARE_METAL_SERVER, DeviceMapping.MAC_MINI,
  DeviceMapping.STORAGE_DEVICES, DeviceMapping.PDU, DeviceMapping.HYPERVISOR
];

export const VM_DEVICES = [
  DeviceMapping.AWS_VIRTUAL_MACHINE,
  DeviceMapping.VMWARE_VIRTUAL_MACHINE, DeviceMapping.OPENSTACK_VIRTUAL_MACHINE,
  DeviceMapping.CUSTOM_VIRTUAL_MACHINE, DeviceMapping.VCLOUD,
  DeviceMapping.PROXMOX, DeviceMapping.G3_KVM
]
