import { Component, OnInit, OnDestroy } from '@angular/core';
import { GcpCostAnalysisService, CloudCostAccountData } from './gcp-cost-analysis.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';

@Component({
  selector: 'gcp-cost-analysis',
  templateUrl: './gcp-cost-analysis.component.html',
  styleUrls: ['./gcp-cost-analysis.component.scss'],
  providers: [PublicCloudCostAnalysisService, GcpCostAnalysisService]
})
export class GcpCostAnalysisComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  accounts: CloudCostAccountData[] = [];
  selectedAccount: CloudCostAccountData = new CloudCostAccountData();

  constructor(private gcpCostService: GcpCostAnalysisService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getAccounts();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAccounts() {
    this.gcpCostService.getAcccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accounts = this.gcpCostService.convertToAccountViewData(data);
      if (this.accounts.length) {
        let fa = this.accounts.filter(ac => ac.billingEnabled);
        if (fa.length) {
          this.selectedAccount = fa[0];
        } else {
          this.notification.error(new Notification('No accounts have billing enabled. Please contact Administrator (support@unityonecloud.com)'));
          this.spinner.stop('main');
          return;
        }
        this.getAccountAssets();
        this.getTotalCost();
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Account related data. Try again later'));
    })
  }

  getAccountAssets() {
    this.gcpCostService.getCloudData(this.selectedAccount.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedAccount.cloudAssets = this.gcpCostService.updateAccountWithCloudAssets(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get assets related data. Tryagain later'));
    })
  }

  getTotalCost() {
    this.gcpCostService.getTotalCost(this.selectedAccount.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedAccount.totalCostData = this.gcpCostService.updateAccountWithTotalCost(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get cost related data. Tryagain later'));
    })
  }

  changeAccount(account: CloudCostAccountData) {
    this.selectedAccount = account;
    this.getAccountAssets();
    this.getTotalCost();
  }

}
