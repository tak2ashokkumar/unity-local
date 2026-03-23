import { Component, OnInit } from '@angular/core';
import { CostByServicesItemViewData, UnifiedCostIntelligenceHubService } from './unified-cost-intelligence-hub.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'unified-cost-intelligence-hub',
  templateUrl: './unified-cost-intelligence-hub.component.html',
  styleUrls: ['./unified-cost-intelligence-hub.component.scss'],
  providers: [UnifiedCostIntelligenceHubService]
})
export class UnifiedCostIntelligenceHubComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  currentServiceCriteria: SearchCriteria;
  costByServicesFilter: string = 'All';
  costBycloudChartViewData: UnityChartDetails;
  costBySubscriptionChartViewData: UnityChartDetails;
  costByServiceViewData: CostByServicesItemViewData[] = [];

  constructor(private svc: UnifiedCostIntelligenceHubService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private storageService: StorageService,
    private route: ActivatedRoute) {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ cloud: '', month: '' }], multiValueParam: { region: [], cloud_type: [] } };
    this.currentServiceCriteria = { multiValueParam: { cloud_type: [] } };
  }

  ngOnInit(): void {
    // this.getCostSummary();
    this.getSummaryData();
    this.getCostBycloudChartData();
    this.getCostBySubscriptionChartData();
    this.getCostByService();
    // this.getTrailingTwelveMonthData();
    // this.getCostByCloudTypeSummaryData();
  }

  onServiceFilterChange() {
    this.getCostByService();
  }

  getSummaryData() {

  }

  getCostBycloudChartData() {
    this.spinner.start('CostByCloudTypeChartLoader');
    this.svc.getCostBycloudTypeChartData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costBycloudChartViewData = this.svc.convertToCostBycloudChartData(res);
      this.spinner.stop('CostByCloudTypeChartLoader');
    }, err => {
      this.spinner.stop('CostByCloudTypeChartLoader');
      this.notification.error(new Notification('Failed to get cost by cloud type data'));
    });
  }

  getCostBySubscriptionChartData() {
    this.spinner.start('CostBySubscriptionChartLoader');
    this.svc.getCostBySubscriptionChartData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costBySubscriptionChartViewData = this.svc.convertToCostBySubscriptionChartData(res);
      this.spinner.stop('CostBySubscriptionChartLoader');
    }, err => {
      this.spinner.stop('CostBySubscriptionChartLoader');
      this.notification.error(new Notification('Failed to get cost by cloud subscription data'));
    });
  }

  getCostByService() {
    this.spinner.start('CostByServicesTableLoader');
    this.svc.getCostByService(this.costByServicesFilter).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.costByServiceViewData = this.svc.convertToCostByServicesViewData(data);
      this.spinner.stop('CostByServicesTableLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('CostByServicesTableLoader');
      this.notification.error(new Notification('Failed to get cost by cloud services data'));
    });
  };

  openRow(view: CostByServicesItemViewData) {
    view.isOpen = !view.isOpen;
  }

}
