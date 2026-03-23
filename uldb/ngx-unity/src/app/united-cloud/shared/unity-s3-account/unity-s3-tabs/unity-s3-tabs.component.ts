import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'unity-s3-tabs',
  templateUrl: './unity-s3-tabs.component.html',
  styleUrls: ['./unity-s3-tabs.component.scss']
})
export class UnityS3TabsComponent implements OnInit, OnDestroy {
  currentRouteUrl: string = '';
  graphUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  isCabinetViewDeviceStats: boolean = false;
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
    this.router.navigate(['../'], { relativeTo: this.route });
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

const tabData: TabData[] = [
  {
    name: 'S3',
    url: 's3',
  }
]

