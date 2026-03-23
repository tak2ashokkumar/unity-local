import { Component, OnInit, OnDestroy } from '@angular/core';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';
import { OciCostAnalysisService, CloudCostAccountData } from './oci-cost-analysis.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'oci-cost-analysis',
  templateUrl: './oci-cost-analysis.component.html',
  styleUrls: ['./oci-cost-analysis.component.scss'],
  providers: [PublicCloudCostAnalysisService, OciCostAnalysisService]
})
export class OciCostAnalysisComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  accounts: CloudCostAccountData[] = [];
  selectedAccount: CloudCostAccountData = new CloudCostAccountData();
  constructor(private ociCostService: OciCostAnalysisService,
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
    this.ociCostService.getAcccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accounts = this.ociCostService.convertToAccountViewData(data);
      if (this.accounts.length) {
        this.selectedAccount = this.accounts[0];
        this.getAssets();
        this.getTotalCost();
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Account related data. Try again later'));
    })
  }

  getAssets() {
    this.ociCostService.getCloudData(this.selectedAccount.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedAccount.cloudAssets = this.ociCostService.updateAccountWithCloudAssets(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get assets related data. Tryagain later'));
    })
  }

  getTotalCost() {
    this.ociCostService.getTotalCost(this.selectedAccount.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedAccount.totalCostData = this.ociCostService.updateAccountWithTotalCost(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get cost related data. Tryagain later'));
    })
  }

  changeAccount(account: CloudCostAccountData) {
    this.selectedAccount = account;
    this.getAssets();
    this.getTotalCost();
  }

}
