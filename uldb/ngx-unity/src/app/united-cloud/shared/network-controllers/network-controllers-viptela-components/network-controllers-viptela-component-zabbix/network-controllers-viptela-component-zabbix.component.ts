import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { TabData } from 'src/app/shared/tabdata';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { DevicesMonitoringConfigService } from '../../../devices-monitoring-config/devices-monitoring-config.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SharedMonitoringService } from 'src/app/shared/shared-monitoring.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'network-controllers-viptela-component-zabbix',
  templateUrl: './network-controllers-viptela-component-zabbix.component.html',
  styleUrls: ['./network-controllers-viptela-component-zabbix.component.scss']
})
export class NetworkControllersViptelaComponentZabbixComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  deviceStatusIcon: string = null;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private configSvc: DevicesMonitoringConfigService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private monitoringSvc: SharedMonitoringService) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });

    this.configSvc.monitoringAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.loadTabs();
    });
  }

  ngOnInit(): void {
    this.loadTabs();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      if (this.device) {
        this.device.uuid = params.get('deviceid');
      }
    });
    this.tabData.forEach(tab => {
      if (!tab.alwaysEnable && !this.device?.configured) {
        tab.enabled = false;
      } else {
        tab.enabled = true;
      }
    });
    this.getDeviceStatus();
  }

  getDeviceStatus() {
    this.monitoringSvc.getZabbixDeviceData(this.device?.deviceType, this.device?.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const deviceStatus = this.utilService.getDeviceStatus(res?.device_data?.status);
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
  }
]