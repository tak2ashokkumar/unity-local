import { Component, OnInit, OnDestroy } from '@angular/core';
import { BmServersOverviewService } from './bm-servers-overview.service';
import { DeviceStatus } from '../../../entities/device-status.type';
import { DeviceSensors, APIDeviceSensor } from '../../../entities/device-sensor.type';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'bm-servers-overview',
  templateUrl: './bm-servers-overview.component.html',
  styleUrls: ['./bm-servers-overview.component.scss']
})
export class BmServersOverviewComponent implements OnInit, OnDestroy {
  deviceId: string;
  deviceStatus: DeviceStatus;
  sensors: DeviceSensors[];
  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private overviewService: BmServersOverviewService,
    private utilService: AppUtilityService,
    private refreshService: DataRefreshBtnService) {
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
