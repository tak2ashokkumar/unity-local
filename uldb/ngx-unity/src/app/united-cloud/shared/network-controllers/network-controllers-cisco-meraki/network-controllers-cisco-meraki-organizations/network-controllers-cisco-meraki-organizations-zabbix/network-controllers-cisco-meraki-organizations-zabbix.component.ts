import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SharedMonitoringService } from 'src/app/shared/shared-monitoring.service';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { DevicesMonitoringConfigService } from 'src/app/united-cloud/shared/devices-monitoring-config/devices-monitoring-config.service';

@Component({
  selector: 'network-controllers-cisco-meraki-organizations-zabbix',
  templateUrl: './network-controllers-cisco-meraki-organizations-zabbix.component.html',
  styleUrls: ['./network-controllers-cisco-meraki-organizations-zabbix.component.scss']
})
export class NetworkControllersCiscoMerakiOrganizationsZabbixComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
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

    this.route.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceId'));

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
    this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
    // const zbxChildRoutesPathSegments: string[] = ['details', 'monitoring-graphs', 'manage-graphs', 'events', 'triggers', 'configure', 'crud', 'scripts'];
    // const sdwanDetailsUrl: string = `/unitycloud/devices/sdwans/${this.deviceId}/details`;
    // if (this.router.url == sdwanDetailsUrl || !zbxChildRoutesPathSegments.includes(this.router.url.split('/').getLast())) {
    //   this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
    // }
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('deviceid'));
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

    // if (tab.url === 'details') {
    //   const isDetailsInUrl = url.includes('details');
    //   const isAnyOtherTabPresent = tabData.some(t =>
    //     t.url !== 'details' && url.includes(t.url)
    //   );

    //   return isDetailsInUrl && !isAnyOtherTabPresent ? 'text-success' : '';
    // }

    return url.includes(tab.url) ? 'text-success' : '';
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
]


