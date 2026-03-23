import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { APIDeviceSensor, DeviceSensors } from '../../../entities/device-sensor.type';
import { DeviceStatus } from '../../../entities/device-status.type';
import { HypervisorOverviewService } from './hypervisor-overview.service';

@Component({
  selector: 'hypervisor-overview',
  templateUrl: './hypervisor-overview.component.html',
  styleUrls: ['./hypervisor-overview.component.scss']
})
export class HypervisorOverviewComponent implements OnInit, OnDestroy {
  deviceId: string;
  deviceStatus: DeviceStatus;
  sensors: DeviceSensors[];
  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private overviewService: HypervisorOverviewService,
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
