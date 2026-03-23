import { Component, OnInit, OnDestroy } from '@angular/core';
import { Alerts } from 'src/app/shared/SharedEntityTypes/alert-response.type';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UnitedCloudSharedService } from '../../../united-cloud-shared.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'bm-servers-alerts',
  templateUrl: './bm-servers-alert.component.html',
  styleUrls: ['./bm-servers-alert.component.scss']
})
export class BmServersAlertsComponent implements OnInit, OnDestroy {
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
    console.log(this.deviceId);
    this.spinner.start('bmsalerts');
    this.cloudSharedService.getAlertsByDeviceTypeAndDeviceId(DeviceMapping.BARE_METAL_SERVER, this.deviceId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('bmsalerts');
        this.alerts = res;
      }, err => {
        this.spinner.stop('bmsalerts');
      });
  }

}
