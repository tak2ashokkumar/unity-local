import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MTPAssetStats, MTPTotalAssetCounts } from 'src/app/shared/SharedEntityTypes/asset-stats.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';

@Injectable()
export class MtpDashboardAssetsService {

  constructor(private http: HttpClient,
    private iconSvc: DeviceIconService) { }

  getTotalAssetStats(): Observable<MTPTotalAssetCounts> {
    return this.http.get<MTPTotalAssetCounts>(`/customer/mtp/tenant_assets/get_total_assets/`);
  }

  convertToAssetCountsViewdata(d: MTPTotalAssetCounts): DashboardAssetCountsViewData {
    let a = new DashboardAssetCountsViewData();
    a.total = d.total_assets;
    a.up = d.total_active_assets;
    a.down = d.total_inactive_assets;
    a.unknown = d.total_assets - d.total_active_assets - d.total_inactive_assets;
    return a;
  }

  getAssetStatsByDeviceType(): Observable<MTPAssetStats[]> {
    return this.http.get<MTPAssetStats[]>(`/customer/mtp/tenant_assets/get_total_assets_stat/`);
  }

  convertToAssetStatsByTypeViewData(data: MTPAssetStats[]): DashboardAssetStatsByDeviceTypeViewData[] {
    let viewData: DashboardAssetStatsByDeviceTypeViewData[] = [];
    data.map(d => {
      let a = new DashboardAssetStatsByDeviceTypeViewData();
      a.type = d.name;
      a.displayType = this.getDisplayType(d.name);
      a.iconClass = this.iconSvc.getIconByDeviceType(a.displayType);
      a.iconClass = `${a.iconClass} ${this.getIconColorClass(a.type)}`;
      a.total = d.count;
      a.up = d.active_count;
      a.down = d.inactive_count;
      a.unknown = d.unknown;
      viewData.push(a);
    })
    viewData.sort((a, b) => (a.displayType > b.displayType) ? 1 : -1);
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
      case 'Hypervisor': return `hypervisor`;
      case 'PDU': return `pdus`;
    }
  }

  getDisplayType(type: string) {
    switch (type) {
      case 'pod': return DeviceMapping.POD;
      case 'VM': return DeviceMapping.VIRTUAL_MACHINE;
      case 'cabinet': return DeviceMapping.CABINET_VIZ;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'switch': return DeviceMapping.SWITCHES;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'storage_device': return DeviceMapping.STORAGE_DEVICES;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'bm_server': return DeviceMapping.BARE_METAL_SERVER;
      case 'Hypervisor': return DeviceMapping.HYPERVISOR;
      case 'PDU': return DeviceMapping.PDU;
    }
  }
}

export class DashboardAssetCountsViewData {
  total: number = 0;
  up: number = 0;
  down: number = 0;
  unknown: number = 0;
}

export class DashboardAssetStatsByDeviceTypeViewData {
  type: string;
  displayType: string;
  iconClass: string;
  total: number = 0;
  up: number = 0;
  down: number = 0;
  unknown: number = 0;
}
