import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BmServersOverviewService } from '../bm-servers-overview.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { ServerCpuMemoryStorage } from '../../../../entities/server-cpu-memory-storage.type';
import { UnitedCloudSharedService } from '../../../../united-cloud-shared.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'bm-server-overview-details',
  templateUrl: './bm-server-overview-details.component.html',
  styleUrls: ['./bm-server-overview-details.component.scss'],
})
export class BmServerOverviewDetailsComponent implements OnInit, OnDestroy {
  @Input() deviceId: string;
  data: Device_data = null;
  serverData: ServerCpuMemoryStorage;
  private ngUnsubscribe = new Subject();
  constructor(private spinnerService: AppSpinnerService,
    private overviewService: BmServersOverviewService,
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
    this.spinnerService.stop('bmsdetails');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceData() {
    this.spinnerService.start('bmsdetails');
    this.overviewService.getDeviceData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceData) => {
      this.spinnerService.stop('bmsdetails');
      this.data = res.device_data;
      this.data.last_rebooted = this.data.last_rebooted.concat('000');
    }, err => {
      this.spinnerService.stop('bmsdetails');
    });
  }

  getCpuMemoryStorageData() {
    this.sharedSvc.getCpuMemoryStorageData(this.deviceId, DeviceMapping.BARE_METAL_SERVER).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: ServerCpuMemoryStorage) => {
      this.spinnerService.stop('bmsdetails');
      this.serverData = res;
    }, err => {
      this.spinnerService.stop('bmsdetails');
    });
  }

}
