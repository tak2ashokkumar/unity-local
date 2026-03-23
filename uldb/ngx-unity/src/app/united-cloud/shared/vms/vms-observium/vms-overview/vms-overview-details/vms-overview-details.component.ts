import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { VmsOverviewService } from '../vms-overview.service';
import { takeUntil } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'vms-overview-details',
  templateUrl: './vms-overview-details.component.html',
  styleUrls: ['./vms-overview-details.component.scss']
})
export class VmsOverviewDetailsComponent implements OnInit, OnDestroy {
  @Input() deviceId: string;
  @Input() deviceType: DeviceMapping;
  data: Device_data = null;
  private ngUnsubscribe = new Subject();
  constructor(private spinnerService: AppSpinnerService,
    private overviewService: VmsOverviewService,
    private refreshService: DataRefreshBtnService) {
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getDeviceData();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.getDeviceData();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceData() {
    this.spinnerService.start('vmsdetails');
    this.overviewService.getDeviceData(this.deviceId, this.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceData) => {
      this.spinnerService.stop('vmsdetails');
      this.data = res.device_data;
      this.data.last_rebooted = this.data.last_rebooted.concat('000');
    }, err => {
      this.spinnerService.stop('vmsdetails');
    });
  }

}
