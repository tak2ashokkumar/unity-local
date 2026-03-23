import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { DevicesMonitoringConfigService } from '../../../devices-monitoring-config/devices-monitoring-config.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SharedMonitoringService } from 'src/app/shared/shared-monitoring.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'sdwan-details-zabbix',
  templateUrl: './sdwan-details-zabbix.component.html',
  styleUrls: ['./sdwan-details-zabbix.component.scss']
})
export class SdwanDetailsZabbixComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  sdwanId: string;
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  isCabinetViewDeviceStats: boolean = false;
  deviceStatusIcon: string = null;
  ncmStatusView: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private configSvc: DevicesMonitoringConfigService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private monitoringSvc: SharedMonitoringService) {
    // this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
    //   urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    // });
    // this.route.url.subscribe((urlPath: UrlSegment[]) => {
    //   urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    // });
    // this.route.paramMap.forEach(param => {
    //   if (param.get('cabinetId')) {
    //     this.isCabinetViewDeviceStats = true;
    //   }
    // });

    this.route.paramMap.subscribe((params: ParamMap) => this.sdwanId = params.get('sdwanId'));

    this.configSvc.monitoringAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.loadTabs();
    });
  }

  ngOnInit() {
    // if (this.currentRouteUrl.includes('infrastructure')) {
    //   this.isCabinetViewDeviceStats = true;
    // }
    // if (this.currentRouteUrl.includes('network-configuration')) {
    //   this.ncmStatusView = true;
    // }
    this.loadTabs();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    const zbxChildRoutesPathSegments: string[] = ['details', 'monitoring-graphs', 'manage-graphs', 'events', 'triggers', 'configure', 'crud', 'scripts'];
    const sdwanDetailsUrl: string = `/unitycloud/devices/sdwans/${this.sdwanId}/details`;
    if (this.router.url == sdwanDetailsUrl || !zbxChildRoutesPathSegments.includes(this.router.url.split('/').getLast())) {
      this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
    }
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('deviceid'));
    if (!this.device.configured) {
      this.tabData.forEach(tab => {
        tab.enabled = tab.url === 'details';
      });
    } else {
      this.tabData.forEach(tab => tab.enabled = true);
    }
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
    if (this.isCabinetViewDeviceStats || this.ncmStatusView) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }

  goTo(url: string) {
    this.router.navigate([url], { relativeTo: this.route });
  }

  isActive(tab: TabData): string {
    const url = this.router.url;

    if (tab.url === 'details') {
      const isDetailsInUrl = url.includes('details');
      const isAnyOtherTabPresent = tabData.some(t =>
        t.url !== 'details' && url.includes(t.url)
      );

      return isDetailsInUrl && !isAnyOtherTabPresent ? 'text-success' : '';
    }

    return url.includes(tab.url) ? 'text-success' : '';
  }

}

const tabData: TabData[] = [
  {
    name: 'Details',
    url: 'details',
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
]

