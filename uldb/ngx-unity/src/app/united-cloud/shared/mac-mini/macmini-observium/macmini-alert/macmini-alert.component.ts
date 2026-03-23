import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { Alerts } from 'src/app/shared/SharedEntityTypes/alert-response.type';
import { UnitedCloudSharedService } from '../../../united-cloud-shared.service';

@Component({
  selector: 'macmini-alert',
  templateUrl: './macmini-alert.component.html',
  styleUrls: ['./macmini-alert.component.scss']
})
export class MacminiAlertComponent implements OnInit, OnDestroy {
  alerts: Alerts;
  deviceId: string;
  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private cloudSharedService: UnitedCloudSharedService,
    private spinner: AppSpinnerService,
    public sanitizer: DomSanitizer,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getAlerts();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.getAlerts();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAlerts() {
    this.spinner.start('mmalerts');
    this.cloudSharedService.getAlertsByDeviceTypeAndDeviceId(DeviceMapping.MAC_MINI, this.deviceId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('mmalerts');
        this.alerts = res;
      }, err => {
        this.spinner.stop('mmalerts');
      });
  }

}
