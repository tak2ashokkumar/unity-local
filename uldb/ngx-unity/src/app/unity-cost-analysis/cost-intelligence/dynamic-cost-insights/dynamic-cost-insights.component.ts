import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicCostInsightsService } from './dynamic-cost-insights.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'dynamic-cost-insights',
  templateUrl: './dynamic-cost-insights.component.html',
  styleUrls: ['./dynamic-cost-insights.component.scss'],
  providers: [DynamicCostInsightsService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicCostInsightsComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  infraCostChartViewData: UnityChartDetails;
  costBySubscriptionChartViewData: UnityChartDetails;
  currentCriteria: SearchCriteria;

  constructor(private svc: DynamicCostInsightsService,
    private notificationSvc: AppNotificationService,
    private spinnerSvc: AppSpinnerService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getAnomalyInsights();
    this.getCostBySubscriptionChartData();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAnomalyInsights(): void {
    this.infraCostChartViewData = this.svc.convertToInfraCostChartData();
  }

  getCostBySubscriptionChartData(): void {
    this.spinnerSvc.start('CostBySubscriptionChartLoader');
    this.svc.getCostBySubscriptionChartData(this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('CostBySubscriptionChartLoader')))
      .subscribe(res => {
        this.costBySubscriptionChartViewData = this.svc.convertToCostBySubscriptionChartData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to get cost by cloud subscription data'));
      });
  }

  private stopLoader(loader: string): void {
    this.spinnerSvc.stop(loader);
    this.cdr.markForCheck();
  }
}
