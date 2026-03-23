import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageOverviewService } from '../storage-overview.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import { ServerCpuMemoryStorage } from '../../../../entities/server-cpu-memory-storage.type';
import { UnitedCloudSharedService } from '../../../../united-cloud-shared.service';

@Component({
  selector: 'storage-overview-details',
  templateUrl: './storage-overview-details.component.html',
  styleUrls: ['./storage-overview-details.component.scss']
})
export class StorageOverviewDetailsComponent implements OnInit {

  @Input() deviceId: string;
  data: Device_data = null;
  serverData: ServerCpuMemoryStorage;

  private ngUnsubscribe = new Subject();

  constructor(private spinnerService: AppSpinnerService,
    private overviewService: StorageOverviewService,
    private sharedSvc: UnitedCloudSharedService,
    private refreshService: DataRefreshBtnService) {
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getDeviceData();
      this.getCpuMemoryStorageData();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.getDeviceData();
      this.getCpuMemoryStorageData();
    }, 0);
  }

  ngOnDestroy() {
    this.spinnerService.stop('storagedetails');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceData() {
    this.spinnerService.start('storagedetails');
    this.overviewService.getDeviceData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceData) => {
      this.spinnerService.stop('storagedetails');
      this.data = res.device_data;
      this.data.last_rebooted = this.data.last_rebooted.concat('000');
    }, err => {
      this.spinnerService.stop('storagedetails');
    });
  }

  getCpuMemoryStorageData() {
    this.overviewService.getCpuMemoryStorageData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: ServerCpuMemoryStorage) => {
      this.spinnerService.stop('bmsdetails');
      this.serverData = res;
    }, err => {
      this.spinnerService.stop('bmsdetails');
    });
  }
}
