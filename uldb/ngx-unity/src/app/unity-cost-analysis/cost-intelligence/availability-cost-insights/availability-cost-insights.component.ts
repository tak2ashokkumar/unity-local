import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { AvailabilityCostInsightsService } from './availability-cost-insights.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'availability-cost-insights',
  templateUrl: './availability-cost-insights.component.html',
  styleUrls: ['./availability-cost-insights.component.scss'],
  providers: [AvailabilityCostInsightsService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilityCostInsightsComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  currentCriteria: SearchCriteria;
  costBycloudChartViewData: UnityChartDetails;
  hourlyLineChartViewData: UnityChartDetails;
  costVsBudgetChartViewData: UnityChartDetails;

  constructor(private svc: AvailabilityCostInsightsService,
    private notificationSvc: AppNotificationService,
    private spinnerSvc: AppSpinnerService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getCostBycloudChartData();
    this.getAvailabilityMetricsTrend();
    this.getCostAnomalityOverview();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

  getAvailabilityMetricsTrend(): void {
    this.hourlyLineChartViewData = this.svc.convertToHourlyLineChartData();
  }

  getCostAnomalityOverview(): void {
    this.costVsBudgetChartViewData = this.svc.convertToCostVsBudgetChartData();
  }

  private stopLoader(loader: string): void {
    this.spinnerSvc.stop(loader);
    this.cdr.markForCheck();
  }
}
