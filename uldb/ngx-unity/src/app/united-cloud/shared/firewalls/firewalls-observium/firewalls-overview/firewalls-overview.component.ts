import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DeviceStatus } from '../../../entities/device-status.type';
import { Subject } from 'rxjs';
import { DeviceSensors, APIDeviceSensor } from '../../../entities/device-sensor.type';
import { FirewallsOverviewService } from './firewalls-overview.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'firewalls-overview',
  templateUrl: './firewalls-overview.component.html',
  styleUrls: ['./firewalls-overview.component.scss']
})
export class FirewallsOverviewComponent implements OnInit, OnDestroy {

  deviceId: string;
  deviceStatus: DeviceStatus;
  sensors: DeviceSensors[];
  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private overviewService: FirewallsOverviewService,
    private utilService: AppUtilityService,
    private refreshService: DataRefreshBtnService) {
    /**
     * This is to get parameters from parent route
     */
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getDeviceStatus();
      this.getDeviceSensors();
    });
  }

  ngOnInit() {
    this.getDeviceStatus();
    this.getDeviceSensors();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceStatus() {
    this.overviewService.getDeviceStatus(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceStatus) => {
      this.deviceStatus = res;
    }, err => {

    });
  }

  getDeviceSensors() {
    this.overviewService.getDeviceSensors(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: APIDeviceSensor) => {
      this.sensors = this.utilService.convertToDeviceSensor(res);
    }, err => {

    });
  }

}
