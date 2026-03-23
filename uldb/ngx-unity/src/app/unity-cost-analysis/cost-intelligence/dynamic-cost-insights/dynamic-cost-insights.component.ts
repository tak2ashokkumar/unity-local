import { Component, OnInit } from '@angular/core';
import { DynamicCostInsightsService } from './dynamic-cost-insights.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'dynamic-cost-insights',
  templateUrl: './dynamic-cost-insights.component.html',
  styleUrls: ['./dynamic-cost-insights.component.scss'],
  providers: [DynamicCostInsightsService]
})
export class DynamicCostInsightsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  infraCostChartViewData: UnityChartDetails;
  costBySubscriptionChartViewData: UnityChartDetails;
  currentCriteria: SearchCriteria;

  constructor(private svc: DynamicCostInsightsService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute) {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE};
  }

  ngOnInit(): void {
    this.getAnomalyInsights();
    this.getCostBySubscriptionChartData();
  }

  getAnomalyInsights() {
    this.infraCostChartViewData = this.svc.convertToInfraCostChartData();
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

}
