import { Component, OnInit, OnDestroy } from '@angular/core';
import { VmsOverviewService } from './vms-overview.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceStatus } from '../../../entities/device-status.type';
import { APIDeviceSensor, DeviceSensors } from '../../../entities/device-sensor.type';

@Component({
  selector: 'vms-overview',
  templateUrl: './vms-overview.component.html',
  styleUrls: ['./vms-overview.component.scss']
})
export class VmsOverviewComponent implements OnInit, OnDestroy {

  deviceId: string;
  deviceType: DeviceMapping;
  deviceStatus: DeviceStatus;
  sensors: DeviceSensors[];
  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private overviewService: VmsOverviewService,
    private utilService: AppUtilityService,
    private storage: StorageService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.deviceType = this.storage.getByKey('device', StorageType.SESSIONSTORAGE)['deviceType'];
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getDeviceSensors();
      this.getDeviceStatus();
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
    this.overviewService.getDeviceStatus(this.deviceId, this.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceStatus) => {
      this.deviceStatus = res;
    }, err => {

    });
  }

  getDeviceSensors() {
    this.overviewService.getDeviceSensors(this.deviceId, this.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: APIDeviceSensor) => {
      this.sensors = this.utilService.convertToDeviceSensor(res);
    }, err => {

    });
  }
}
