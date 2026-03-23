import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { DevicesMonitoringConfigService } from '../devices-monitoring-config/devices-monitoring-config.service';

@Component({
  selector: 'device-tab',
  templateUrl: './device-tab.component.html',
  styleUrls: ['./device-tab.component.scss']
})
export class DeviceTabComponent implements OnInit, OnDestroy {
  currentRouteUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = [];
  isCabinetViewDeviceStats: boolean = false;
  private ngUnsubscribe = new Subject();

  constructor(private router: Router,
    private route: ActivatedRoute,
    private configSvc: DevicesMonitoringConfigService,
    private storageService: StorageService) {
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
    this.loadTabs();
  }

  ngOnDestroy() {
    this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  private isZabbixIntegrated() {
    return this.device.deviceType == DeviceMapping.SWITCHES
      || this.device.deviceType == DeviceMapping.FIREWALL
      || this.device.deviceType == DeviceMapping.LOAD_BALANCER
      || this.device.deviceType == DeviceMapping.HYPERVISOR
      || this.device.deviceType == DeviceMapping.BARE_METAL_SERVER
      || this.device.deviceType == DeviceMapping.STORAGE_DEVICES
      || this.device.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE
      || this.device.deviceType == DeviceMapping.VCLOUD
      || this.device.deviceType == DeviceMapping.ESXI
      || this.device.deviceType == DeviceMapping.HYPER_V
      || this.device.deviceType == DeviceMapping.OPENSTACK_VIRTUAL_MACHINE
      || this.device.deviceType == DeviceMapping.PDU
      || this.device.deviceType == DeviceMapping.MAC_MINI
      || this.device.deviceType == DeviceMapping.CUSTOM_VIRTUAL_MACHINE
      || this.device.deviceType == DeviceMapping.SDWAN_DEVICES;
  }

  loadTabs() {
    this.tabData = [...tabData];
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    if (this.isZabbixIntegrated()) {
      this.tabData.push({
        name: 'Configuration',
        url: 'configure',
        alwaysEnable: true
      });
    }
    this.tabData.forEach(tab => {
      //KEEP ADDING DEVICE TYPE WITH `OR` 
      if (this.isZabbixIntegrated()) {
        /**
         * Only this if needs to kept after all the devices are integrated with Zabbix.
         * 
         * REMOVE THE OUTER IF-ELSE
         */
        if (!tab.alwaysEnable && !this.device.configured) {
          tab.enabled = false;
        } else {
          tab.enabled = true;
        }
      } else {
        tab.enabled = true;
      }
      if (tab.name == 'Graphs') {
        if (this.device.deviceType == DeviceMapping.STORAGE_DEVICES) {
          tab.url = 'graphs/system';
        } else {
          tab.url = 'graphs/netstats';
        }
      }
    });
  }

  goBack() {
    if (this.isZabbixIntegrated()) {
      if (this.isCabinetViewDeviceStats) {
        this.router.navigate(['../../../'], { relativeTo: this.route });
      } else {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    } else {
      if (this.isCabinetViewDeviceStats) {
        this.router.navigate(['../../'], { relativeTo: this.route });
      } else {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
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
}

export interface DeviceTabData {
  name: string;
  deviceType: DeviceMapping;
  configured?: boolean;
  monitoringEnabled?: boolean;
  uuid?: string;
  os?: string;
  ssr_os?: string;
  isCluster?: boolean;
  hasPureOs?: boolean;
  state?: string;
  redfish?: boolean;
}

const tabData: TabData[] = [
  {
    name: 'Overview',
    url: 'overview'
  },
  {
    name: 'Graphs',
    url: 'overview'
  },
  {
    name: 'Health',
    url: 'health/overview'
  },
  {
    name: 'Ports',
    url: 'ports'
  },
  {
    name: 'Alerts',
    url: 'alerts'
  }
]