import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DatacenterPdusOverviewService } from '../datacenter-pdus-overview.service';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'datacenter-pdus-overview-details',
  templateUrl: './datacenter-pdus-overview-details.component.html',
  styleUrls: ['./datacenter-pdus-overview-details.component.scss']
})
export class DatacenterPdusOverviewDetailsComponent implements OnInit, OnDestroy {
  @Input() deviceId: string;
  data: Device_data = null;
  private ngUnsubscribe = new Subject();
  constructor(private spinnerService: AppSpinnerService,
    private overviewService: DatacenterPdusOverviewService,
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
    this.spinnerService.start('pdudetails');
    this.overviewService.getDeviceData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceData) => {
      this.spinnerService.stop('pdudetails');
      this.data = res.device_data;
      this.data.last_rebooted = this.data.last_rebooted.concat('000');
    }, err => {
      this.spinnerService.stop('pdudetails');
    });
  }

}
