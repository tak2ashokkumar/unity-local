import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { HypervisorOverviewService } from '../hypervisor-overview.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { UnitedCloudSharedService } from '../../../../united-cloud-shared.service';
import { ServerCpuMemoryStorage } from '../../../../entities/server-cpu-memory-storage.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'hypervisor-overview-details',
  templateUrl: './hypervisor-overview-details.component.html',
  styleUrls: ['./hypervisor-overview-details.component.scss']
})
export class HypervisorOverviewDetailsComponent implements OnInit, OnDestroy {
  @Input() deviceId: string;
  data: Device_data = null;
  serverData: ServerCpuMemoryStorage;
  private ngUnsubscribe = new Subject();
  constructor(private spinnerService: AppSpinnerService,
    private overviewService: HypervisorOverviewService,
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
    this.spinnerService.stop('hydetails');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceData() {
    this.spinnerService.start('hydetails');
    this.overviewService.getDeviceData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceData) => {
      this.spinnerService.stop('hydetails');
      this.data = res.device_data;
      this.data.last_rebooted = this.data.last_rebooted.concat('000');
    }, err => {
      this.spinnerService.stop('hydetails');
    });
  }

  getCpuMemoryStorageData() {
    this.sharedSvc.getCpuMemoryStorageData(this.deviceId, DeviceMapping.HYPERVISOR).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: ServerCpuMemoryStorage) => {
      this.spinnerService.stop('bmsdetails');
      this.serverData = res;
    }, err => {
      this.spinnerService.stop('bmsdetails');
    });
  }
}
