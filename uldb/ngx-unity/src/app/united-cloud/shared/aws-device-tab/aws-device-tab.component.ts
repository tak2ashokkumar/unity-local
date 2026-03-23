import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceTabData } from '../device-tab/device-tab.component';

@Component({
  selector: 'aws-device-tab',
  templateUrl: './aws-device-tab.component.html',
  styleUrls: ['./aws-device-tab.component.scss']
})
export class AwsDeviceTabComponent implements OnInit, OnDestroy {
  currentRouteUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
  }

  ngOnInit() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
  }

  ngOnDestroy() {
    this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  goBack() {
    const currentUrl: string = window.location.href;
    if (currentUrl.includes("devices")) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }

  goTo(url: string) {
    this.router.navigate([url], { relativeTo: this.route });
  }

  isActive(tabName: string) {
    if (this.router.url.match(this.currentRouteUrl.concat(tabName))) {
      return 'text-success';
    }
    return '';
  }
}