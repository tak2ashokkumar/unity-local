import { Component, OnInit, OnDestroy } from '@angular/core';
import { UnityconnectBandwidthBillingService, BillsViewData } from './unityconnect-bandwidth-billing.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'unityconnect-bandwidth-billing',
  templateUrl: './unityconnect-bandwidth-billing.component.html',
  styleUrls: ['./unityconnect-bandwidth-billing.component.scss'],
  providers: [UnityconnectBandwidthBillingService]
})
export class UnityconnectBandwidthBillingComponent implements OnInit, OnDestroy {
  bills: BillsViewData[] = [];
  private ngUnsubscribe = new Subject();

  constructor(
    private billingService: UnityconnectBandwidthBillingService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('main');
    }, 0);
    this.getBillingInfo();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.getBillingInfo();
  }

  getBillingInfo() {
    this.billingService.getBillingInfo().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: BandwidthBillingInfo[]) => {
      this.spinnerService.stop('main');
      this.bills = this.billingService.convertToViewData(data);
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    })
  }

}
