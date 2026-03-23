import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SharedMonitoringService } from 'src/app/shared/shared-monitoring.service';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { DevicesMonitoringConfigService } from '../../devices-monitoring-config/devices-monitoring-config.service';
import { ZabbixBmsDetailsService } from './zabbix-bms-details/zabbix-bms-details.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'bm-servers-zabbix',
  templateUrl: './bm-servers-zabbix.component.html',
  styleUrls: ['./bm-servers-zabbix.component.scss'],
  providers: [ZabbixBmsDetailsService]
})
export class BmServersZabbixComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  isCabinetViewDeviceStats: boolean = false;
  deviceStatusIcon: string = null;
  syncInProgress: boolean = false;

  constructor(private detailsSvc: ZabbixBmsDetailsService,
    private configSvc: DevicesMonitoringConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private monitoringSvc: SharedMonitoringService,
    private notification: AppNotificationService,) {
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
      this.isCabinetViewDeviceStats = true;
    }
    this.loadTabs();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('deviceid'));
    //To check for OverView Tab
    this.tabData = tabData.filter(tab => {
      if (tab.name === 'Overview') {
        return this.device.redfish === true;
      }
      return true;
    });
    this.tabData.forEach(tab => {
      if (!tab.alwaysEnable && !this.device.configured) {
        tab.enabled = false;
      } else {
        tab.enabled = true;
      }
    });
    this.getDeviceStatus();
  }

  getDeviceStatus() {
    this.monitoringSvc.getZabbixDeviceData(this.device.deviceType, this.device.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const deviceStatus = this.utilService.getDeviceStatus(res.device_data.status);
      switch (deviceStatus) {
        case DeviceStatusMapping.UP: this.deviceStatusIcon = 'fa-long-arrow-alt-up text-success'; break;
        case DeviceStatusMapping.DOWN: this.deviceStatusIcon = 'fa-long-arrow-alt-down text-danger'; break;
        default: this.deviceStatusIcon = null;
      }
    })
  }

  goBack() {
    if (this.isCabinetViewDeviceStats) {
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

  // For Advanced Discovery
  discoverDeviceDetails() {
    this.syncInProgress = true;
    this.detailsSvc.discoverDeviceDetails(this.device.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.syncInProgress = false;
      this.loadTabs();
    }, err => {
      this.syncInProgress = false;
      this.notification.error(new Notification(err.error.detail));
    });
  }
}

const tabData: TabData[] = [
  {
    name: 'Overview',
    url: 'overview',
    alwaysEnable: true
  },
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
