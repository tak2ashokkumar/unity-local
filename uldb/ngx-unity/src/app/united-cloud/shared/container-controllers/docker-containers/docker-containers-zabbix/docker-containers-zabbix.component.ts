import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { TabData } from 'src/app/shared/tabdata';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SharedMonitoringService } from 'src/app/shared/shared-monitoring.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'docker-containers-zabbix',
  templateUrl: './docker-containers-zabbix.component.html',
  styleUrls: ['./docker-containers-zabbix.component.scss']
})
export class DockerContainersZabbixComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  deviceStatusIcon: string = null;
  deviceStatusTooltip: string;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private monitoringSvc: SharedMonitoringService,
    private utilSvc: AppUtilityService) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
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
    this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('deviceid'));
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
      this.deviceStatusTooltip = res.device_data.status ? this.utilSvc.toUpperCase(res.device_data.status) : null;
      this.deviceStatusIcon = res.device_data.status ? this.getStatusIcon(res.device_data.status) : null;
    })
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case "paused":
        return 'fa-exclamation-circle text-warning';
      case "dead":
        return 'fa-circle text-danger';
      case "exited":
        return 'fa-circle text-danger';
      case "removing":
      case "restarting":
        return 'fa-circle text-dark';
      default:
        return 'fa-circle text-success';
    }
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
  }
]
