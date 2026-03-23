import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AdvancedDiscoverySummaryViewService, DeviceDiscoverySummaryViewdata } from './advanced-discovery-summary-view.service';

@Component({
  selector: 'advanced-discovery-summary-view',
  templateUrl: './advanced-discovery-summary-view.component.html',
  styleUrls: ['./advanced-discovery-summary-view.component.scss'],
  providers: [AdvancedDiscoverySummaryViewService]
})
export class AdvancedDiscoverySummaryViewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: DeviceDiscoverySummaryViewdata;
  DeviceMapping = DeviceMapping;
  FaIconMapping = FaIconMapping;

  constructor(private summaryViewSvc: AdvancedDiscoverySummaryViewService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getDeviceSummary();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceSummary() {
    this.summaryViewSvc.getDeviceSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.summaryViewSvc.convertToViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

}
