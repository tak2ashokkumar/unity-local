import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SharedMonitoringService } from 'src/app/shared/shared-monitoring.service';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { DevicesMonitoringConfigService } from 'src/app/united-cloud/shared/devices-monitoring-config/devices-monitoring-config.service';
import { ApplicationDiscoveryMetadataService } from './application-discovery-metadata.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'application-discovery-metadata',
  templateUrl: './application-discovery-metadata.component.html',
  styleUrls: ['./application-discovery-metadata.component.scss'],
  providers: [ApplicationDiscoveryMetadataService]
})
export class ApplicationDiscoveryMetadataComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  deviceId: string;
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  deviceStatusIcon: string = null;
  dropdownOptions: CustomDateRangeType[];

  constructor(private svc: ApplicationDiscoveryMetadataService,
    private router: Router,
    private route: ActivatedRoute,
    private configSvc: DevicesMonitoringConfigService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private monitoringSvc: SharedMonitoringService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceId');
    });
  }

  ngOnInit(): void {
    this.loadTabs();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    // this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('deviceid'));
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
    this.svc.getDeviceStatus(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if(res.app_status == 200){
        this.deviceStatusIcon = 'text-success fa-long-arrow-alt-up'
      }else{
        this.deviceStatusIcon = 'text-success fa-long-arrow-alt-down'
      }
    })
  }


  // getDeviceStatus() {
  //   this.monitoringSvc.getZabbixDeviceData(this.device.deviceType, this.device.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     const deviceStatus = this.utilService.getDeviceStatus(res.device_data.status);
  //     switch (deviceStatus) {
  //       case DeviceStatusMapping.UP: this.deviceStatusIcon = 'fa-long-arrow-alt-up text-success'; break;
  //       case DeviceStatusMapping.DOWN: this.deviceStatusIcon = 'fa-long-arrow-alt-down text-danger'; break;
  //       default: this.deviceStatusIcon = null;
  //     }
  //   })
  // }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
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
  // {
  //   name: 'Triggers',
  //   url: 'triggers'
  // },
  // {
  //   name: 'Polling Metrics',
  //   url: 'polling-metrics'
  // },
  {
    name: 'Log',
    url: 'application-log',
  },
  {
    name: 'Traces',
    url: 'application-traces',
  },
  {
    name: 'Events',
    url: 'application-events',
  },
]