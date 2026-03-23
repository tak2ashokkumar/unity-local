import { Component, OnInit, OnDestroy } from '@angular/core';
import { AwsCostAnalysisService, CloudCostAccountData } from './aws-cost-analysis.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'aws-cost-analysis',
  templateUrl: './aws-cost-analysis.component.html',
  styleUrls: ['./aws-cost-analysis.component.scss'],
  providers: [PublicCloudCostAnalysisService, AwsCostAnalysisService]

})
export class AwsCostAnalysisComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  accountId: string;

  accounts: CloudCostAccountData[] = [];
  selectedAccount: CloudCostAccountData = new CloudCostAccountData();
  constructor(private awsService: AwsCostAnalysisService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.queryParamMap.subscribe((params: ParamMap) => this.accountId = params.get('accountId'));
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getAWSAccounts();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAWSAccounts() {
    this.awsService.getAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accounts = this.awsService.convertToAccountViewData(data);
      if (this.accounts.length) {
        let acc = this.accounts.find(a => a.uuid == this.accountId);
        if (acc) {
          this.selectedAccount = acc;
        } else {
          this.selectedAccount = this.accounts[0];
        }
        this.getAssets();
        this.getTotalCost();
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Account related data. Tryagain later'));
    })
  }

  getAssets() {
    this.awsService.getAssets(this.selectedAccount.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedAccount.cloudAssets = this.awsService.updateAWSAccountWithCloudAssets(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get assets related data. Tryagain later'));
    })
  }

  getTotalCost() {
    this.awsService.getTotalCost(this.selectedAccount.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.selectedAccount.totalCostData = this.awsService.updateAWSAccountWithTotalCost(data);
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
