import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatacenterPdusOverviewService } from './datacenter-pdus-overview.service';
import { DeviceStatus } from 'src/app/united-cloud/shared/entities/device-status.type';
import { DeviceSensors, APIDeviceSensor } from 'src/app/united-cloud/shared/entities/device-sensor.type';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'datacenter-pdus-overview',
  templateUrl: './datacenter-pdus-overview.component.html',
  styleUrls: ['./datacenter-pdus-overview.component.scss']
})
export class DatacenterPdusOverviewComponent implements OnInit, OnDestroy {

  deviceId: string;
  deviceStatus: DeviceStatus;
  sensors: DeviceSensors[];
  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private overviewService: DatacenterPdusOverviewService,
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
