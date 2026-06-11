import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FixedSpendInsightsService } from './fixed-spend-insights.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'fixed-spend-insights',
  templateUrl: './fixed-spend-insights.component.html',
  styleUrls: ['./fixed-spend-insights.component.scss'],
  providers: [FixedSpendInsightsService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FixedSpendInsightsComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  infraCostChartViewData: UnityChartDetails;
  currentCriteria: SearchCriteria;
  costBycloudChartViewData: UnityChartDetails;
  hourlyLineChartViewData: UnityChartDetails;

  constructor(private svc: FixedSpendInsightsService,
    private notificationSvc: AppNotificationService,
    private spinnerSvc: AppSpinnerService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getFixedCostBreakdownByComponentType();
    this.getCostBycloudChartData();
    this.getAlertsAndRecommendationPanel();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getFixedCostBreakdownByComponentType(): void {
    this.infraCostChartViewData = this.svc.convertToInfraCostChartData();
  }

  getCostBycloudChartData(): void {
    this.spinnerSvc.start('CostByCloudTypeChartLoader');
    this.svc.getCostBycloudTypeChartData(this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('CostByCloudTypeChartLoader')))
      .subscribe(res => {
        this.costBycloudChartViewData = this.svc.convertToCostBycloudChartData(res);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to get cost by cloud type data'));
      });
  }

  getAlertsAndRecommendationPanel(): void {
    this.hourlyLineChartViewData = this.svc.convertToHourlyLineChartData();
  }

  private stopLoader(loader: string): void {
    this.spinnerSvc.stop(loader);
    this.cdr.markForCheck();
  }
}
