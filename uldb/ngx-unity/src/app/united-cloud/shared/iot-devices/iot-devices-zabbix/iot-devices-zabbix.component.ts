import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { TabData } from 'src/app/shared/tabdata';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { DevicesMonitoringConfigService } from '../../devices-monitoring-config/devices-monitoring-config.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping, DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SharedMonitoringService } from 'src/app/shared/shared-monitoring.service';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'iot-devices-zabbix',
  templateUrl: './iot-devices-zabbix.component.html',
  styleUrls: ['./iot-devices-zabbix.component.scss'],
})
export class IotDevicesZabbixComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  isInfrastructurePage: boolean = false;
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  deviceStatusIcon: string = null;
  isIotDevicesPage: boolean = false;
  from: string;

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
    this.route.queryParamMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => this.from = params.get('from'));
  }

  ngOnInit(): void {
    if (this.from == 'infrastructure') {
      this.isInfrastructurePage = true;
    } else if (this.from == 'iot-devices') {
      this.isIotDevicesPage = true;
    }
    this.loadTabs();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      if (this.device) {
        this.device.uuid = params.get('deviceid');
      }
    });

    this.tabData = _clone(tabData);
    if (this.device.deviceType == DeviceMapping.SENSOR) {
      const overviewTabData = {
        name: 'Overview',
        url: 'sensor-overview',
        alwaysEnable: true
      }
      this.tabData.unshift(overviewTabData);
    }
    if (this.device.deviceType == DeviceMapping.SMART_PDU) {
      let configureTab = this.tabData.find(tab => tab.name == 'Configuration');
      if (configureTab) {
        configureTab.alwaysEnable = true;
      }
    }
    this.addDetailsTabData();
    this.tabData.forEach(tab => {
      if (!tab.alwaysEnable && !this.device?.configured) {
        tab.enabled = false;
      } else {
        tab.enabled = true;
      }
    });
    if (this.device.deviceType == DeviceMapping.SMART_PDU) {
      this.getDeviceStatus();
    }
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

  addDetailsTabData() {
    switch (this.device.deviceType) {
      case DeviceMapping.SENSOR:
        this.tabData.splice(1, 0, detailsTabData[0]);
        break;
      case DeviceMapping.SMART_PDU:
        this.tabData.unshift(detailsTabData[1]);
        break;
      case DeviceMapping.RFID_READER:
        this.tabData.unshift(detailsTabData[2]);
        break;
      default:
        break;
    }
  }

  goBack() {
    if (this.isInfrastructurePage) {
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

}

const tabData: TabData[] = [
  // {
  //   name: 'Overview',
  //   url: 'overview',
  //   alwaysEnable: true
  // },
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
  }
]

const detailsTabData = [
  {
    name: 'Details',
    url: 'sensor-details',
    alwaysEnable: true
  },
  {
    name: 'Details',
    url: 'smart-pdu-details',
    alwaysEnable: true
  },
  {
    name: 'Details',
    url: 'rfid-reader-details',
    alwaysEnable: true
  }
]