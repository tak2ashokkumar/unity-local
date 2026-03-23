import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceDiscoverySummaryService, DeviceDiscoverySummaryServiceViewdata } from './device-discovery-summary.service';
import { FaIconMapping, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'device-discovery-summary',
  templateUrl: './device-discovery-summary.component.html',
  styleUrls: ['./device-discovery-summary.component.scss'],
  providers: [DeviceDiscoverySummaryService]
})
export class DeviceDiscoverySummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  FaIconMapping = FaIconMapping;
  DeviceMapping = DeviceMapping;

  viewData: DeviceDiscoverySummaryServiceViewdata;
  constructor(private summarySvc: DeviceDiscoverySummaryService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.getSummary();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSummary() {
    this.spinner.start('main');
    this.summarySvc.getSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.summarySvc.convertToViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

}
