import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { DevicesMonitoringConfigService } from '../../devices-monitoring-config/devices-monitoring-config.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ZabbixVmsDetailsService } from './zabbix-vms-details/zabbix-vms-details.service';

@Component({
  selector: 'vms-zabbix',
  templateUrl: './vms-zabbix.component.html',
  styleUrls: ['./vms-zabbix.component.scss'],
  providers: [ZabbixVmsDetailsService]
})
export class VmsZabbixComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = [];
  isCabinetViewDeviceStats: boolean = false;
  isInfrastructureDeviceStats: boolean = false;

  deviceId: string;
  vmWareVm: string = DeviceMapping.VMWARE_VIRTUAL_MACHINE;
  syncInProgress: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private configSvc: DevicesMonitoringConfigService,
    private storageService: StorageService,
    private vmsDetailsService: ZabbixVmsDetailsService,
    private notification: AppNotificationService,
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.paramMap.forEach(param => {
      if (param.get('cabinetId')) {
        this.isCabinetViewDeviceStats = true;
      }
    });
    this.configSvc.monitoringAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.loadTabs();
    });
  }

  ngOnInit() {
    if (this.currentRouteUrl.includes('infrastructure')) {
      this.isInfrastructureDeviceStats = true;
    }
    this.loadTabs();
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    let tabs = tabData;
    switch (this.device.deviceType) {
      case DeviceMapping.VCLOUD:
      case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE:
      case DeviceMapping.G3_KVM:
      case DeviceMapping.PROXMOX: tabs.shift(); break;
    }
    this.tabData = tabs;
    this.tabData.forEach(tab => {
      if (!tab.alwaysEnable && !this.device.configured) {
        tab.enabled = false;
      } else {
        tab.enabled = true;
      }
    });
    console.log("device type, ", this.deviceId, this.device)
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  // For Advanced Discovery
  syncVmwareVmsForAdvancedDiscovery() {
    this.syncInProgress = true;
    this.vmsDetailsService.discoverDeviceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.syncInProgress = false;
      this.loadTabs();
    }, err => {
      this.syncInProgress = false;
      this.notification.error(new Notification(err.error.detail));
    });
  }

  goBack() {
    if (this.currentRouteUrl.includes('infrastructure')) {
      this.router.navigate(['../../../../'], { relativeTo: this.route });
    } else if (this.isCabinetViewDeviceStats) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }

  goTo(url: string) {
    this.router.navigate([url], { relativeTo: this.route });
  }

  isActive(tab: TabData) {
    if (this.router.url.match(this.currentRouteUrl.concat(tab.url))) {
      return 'text-success';
    }
    return '';
  }

  addClass() {
    if (this.currentRouteUrl.includes('infrastructure')) {
      return 'px-4';
    }
    return '';
  }
}

const tabData: TabData[] = [
  {
    name: 'Details',
    url: 'details',
    alwaysEnable: true
  },
  {
    name: 'Graphs',
    url: 'monitoring-graphs',
  },
  {
    name: 'Create Graph',
    url: 'manage-graphs',
  },
  {
    name: 'Events',
    url: 'events',
  },
  {
    name: 'Triggers',
    url: 'triggers'
  },
  {
    name: 'Configuration',
    url: 'configure',
    alwaysEnable: true
  }
]
