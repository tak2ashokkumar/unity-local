import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { AllDevicesService } from './all-devices.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'all-devices',
  templateUrl: './all-devices.component.html',
  styleUrls: ['./all-devices.component.scss'],
  providers: [AllDevicesService]
})
export class AllDevicesComponent implements OnInit, OnDestroy {
  pcId: string;
  private ngUnsubscribe = new Subject();
  privateCloud: PrivateCloud;
  totalDevicesCount = 0;
  podsCount = 0;
  storageCount = 0;
  macDevicesCount = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private deviceService: AllDevicesService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
  }

  ngOnInit() {
    this.getPrivateCloud();
    this.getPods();
    this.getStorageDevice();
    this.getMacDevice();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPrivateCloud() {
    this.deviceService.getPrivateCloud(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateCloud = res;
      this.totalDevicesCount += this.deviceService.totalDevicesCount(this.privateCloud);
    }, err => {

    });
  }

  getPods() {
    this.deviceService.getPods(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.podsCount = res.count;
      this.totalDevicesCount += res.count;
    }, err => {
    });
  }

  getStorageDevice() {
    this.deviceService.getStorageDevices(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.storageCount = res.count;
      this.totalDevicesCount += res.count;
    }, err => {
    });
  }

  getMacDevice() {
    this.deviceService.getMacMinis(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.macDevicesCount = res.count;
      this.totalDevicesCount += res.count;
    }, err => {
    });
  }

}
