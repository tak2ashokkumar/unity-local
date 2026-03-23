import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService, DeviceStatusMapping, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { DevicesMonitoringConfigService } from '../devices-monitoring-config/devices-monitoring-config.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { SharedMonitoringService } from 'src/app/shared/shared-monitoring.service';
import { Subject } from 'rxjs';
import { ZabbixAzureMonitoringConfigService } from './zabbix-azure-monitoring-config/zabbix-azure-monitoring-config.service';

@Component({
  selector: 'azure-zabbix',
  templateUrl: './azure-zabbix.component.html',
  styleUrls: ['./azure-zabbix.component.scss']
})
export class AzureZabbixComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  deviceStatusIcon: string = null;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private configSvc: ZabbixAzureMonitoringConfigService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private monitoringSvc: SharedMonitoringService,
    private deviceMonitoringConfig: DevicesMonitoringConfigService,) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });

    this.configSvc.monitoringAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.loadTabs();
    });
    this.deviceMonitoringConfig.monitoringAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.loadTabs();
    });
  }

  ngOnInit() {
    this.loadTabs();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('deviceId'));
    if (this.device.deviceType == DeviceMapping.AZURE_ACCOUNTS) {
      this.tabData = [...tabData, ...[{
        name: 'Configuration', url: 'configure', alwaysEnable: true
      }]];
    } else if (this.device.deviceType == DeviceMapping.AZURE_VIRTUAL_MACHINE) {
      this.tabData = [...tabData, ...[{
        name: 'Configuration', url: 'configureAzure', alwaysEnable: true
      }]];
    }
    this.tabData.forEach(tab => {
      if (!tab.alwaysEnable && !this.device.configured) {
        tab.enabled = false;
      } else {
        tab.enabled = true;
      }
    });
    // this.getDeviceStatus();
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
    this.router.navigate(['../../'], { relativeTo: this.route });
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
}

const tabData: TabData[] = [
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
]
