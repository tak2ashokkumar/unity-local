import { Component, OnInit, OnDestroy } from '@angular/core';
import { AzureCostAnalysisService, CloudCostAccountData } from './azure-cost-analysis.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'azure-cost-analysis',
  templateUrl: './azure-cost-analysis.component.html',
  styleUrls: ['./azure-cost-analysis.component.scss'],
  providers: [PublicCloudCostAnalysisService, AzureCostAnalysisService]
})
export class AzureCostAnalysisComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  accountId: string;

  accounts: CloudCostAccountData[] = [];
  selectedAccount: CloudCostAccountData = new CloudCostAccountData();
  constructor(private azureCostService: AzureCostAnalysisService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.queryParamMap.subscribe((params: ParamMap) => this.accountId = params.get('accountId'));
  }

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
    this.azureCostService.getAcccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accounts = this.azureCostService.convertToAccountViewData(data);
      if (this.accounts.length) {
        let acc = this.accounts.find(a => a.uuid == this.accountId);
        console.log('acc : ', acc);
        if (acc) {
          this.selectedAccount = acc;
        } else {
          this.selectedAccount = this.accounts[0];
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
    this.azureCostService.getCloudData(this.selectedAccount.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedAccount.cloudAssets = this.azureCostService.updateAccountWithCloudAssets(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get assets related data. Tryagain later'));
    })
  }

  getTotalCost() {
    this.azureCostService.getTotalCost(this.selectedAccount.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedAccount.totalCostData = this.azureCostService.updateAccountWithTotalCost(data);
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
