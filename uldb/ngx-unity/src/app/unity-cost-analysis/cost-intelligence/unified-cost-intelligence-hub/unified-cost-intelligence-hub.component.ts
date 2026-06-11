import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CostByServicesItemViewData, UnifiedCostIntelligenceHubService } from './unified-cost-intelligence-hub.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'unified-cost-intelligence-hub',
  templateUrl: './unified-cost-intelligence-hub.component.html',
  styleUrls: ['./unified-cost-intelligence-hub.component.scss'],
  providers: [UnifiedCostIntelligenceHubService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnifiedCostIntelligenceHubComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  currentCriteria: SearchCriteria;
  currentServiceCriteria: SearchCriteria;
  costByServicesFilter = 'All';
  costBycloudChartViewData: UnityChartDetails;
  costBySubscriptionChartViewData: UnityChartDetails;
  costByServiceViewData: CostByServicesItemViewData[] = [];

  constructor(private svc: UnifiedCostIntelligenceHubService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ cloud: '', month: '' }], multiValueParam: { region: [], cloud_type: [] } };
    this.currentServiceCriteria = { multiValueParam: { cloud_type: [] } };
    this.getCostBycloudChartData();
    this.getCostBySubscriptionChartData();
    this.getCostByService();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onServiceFilterChange(): void {
    this.getCostByService();
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

  getCostByService(): void {
    this.spinnerSvc.start('CostByServicesTableLoader');
    this.svc.getCostByService(this.costByServicesFilter)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('CostByServicesTableLoader')))
      .subscribe(data => {
        this.costByServiceViewData = this.svc.convertToCostByServicesViewData(data);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to get cost by cloud services data'));
      });
  }

  openRow(view: CostByServicesItemViewData): void {
    view.isOpen = !view.isOpen;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private stopLoader(loader: string): void {
    this.spinnerSvc.stop(loader);
    this.cdr.markForCheck();
  }
}
