import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { MacminiOverviewService } from '../macmini-overview.service';

@Component({
  selector: 'macmini-overview-details',
  templateUrl: './macmini-overview-details.component.html',
  styleUrls: ['./macmini-overview-details.component.scss']
})
export class MacminiOverviewDetailsComponent implements OnInit, OnDestroy {
  @Input() deviceId: string;
  data: Device_data = null;
  private ngUnsubscribe = new Subject();
  constructor(private spinnerService: AppSpinnerService,
    private overviewService: MacminiOverviewService,
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
    this.spinnerService.start('mmdetails');
    this.overviewService.getDeviceData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceData) => {
      this.spinnerService.stop('mmdetails');
      this.data = res.device_data;
      this.data.last_rebooted = this.data.last_rebooted.concat('000');
    }, err => {
      this.spinnerService.stop('mmdetails');
    });
  }

}
