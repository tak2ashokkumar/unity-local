import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BudgetDetailsViewData, UnitySetupBudgetDetailsService } from './unity-setup-budget-details.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'unity-setup-budget-details',
  templateUrl: './unity-setup-budget-details.component.html',
  styleUrls: ['./unity-setup-budget-details.component.scss'],
  providers: [UnitySetupBudgetDetailsService]
})
export class UnitySetupBudgetDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  budgetId: string;
  budgetViewData: BudgetDetailsViewData = new BudgetDetailsViewData();

  constructor(private route: ActivatedRoute,
    private budgetDetailsService: UnitySetupBudgetDetailsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.budgetId = params.get('budgetId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getBudgetDetails();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getBudgetDetails() {
    this.budgetViewData.chartData = null;
    this.budgetDetailsService.getBudgetDetail(this.budgetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.budgetViewData = this.budgetDetailsService.convertToViewData(data);
      if (data.budget_amount_detail?.length > 0) {
        this.budgetViewData.chartData = this.budgetDetailsService.convertToBudgetAmountDetailChartData(data);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Budget Details'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
