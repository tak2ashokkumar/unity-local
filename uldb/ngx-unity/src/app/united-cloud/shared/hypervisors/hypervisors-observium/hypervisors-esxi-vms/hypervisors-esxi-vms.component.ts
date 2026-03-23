import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'hypervisors-esxi-vms',
  templateUrl: './hypervisors-esxi-vms.component.html',
  styleUrls: ['./hypervisors-esxi-vms.component.scss']
})
export class HypervisorsEsxiVmsComponent implements OnInit, OnDestroy {
  currentRouteUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: DeviceMapping.ESXI };
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
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}