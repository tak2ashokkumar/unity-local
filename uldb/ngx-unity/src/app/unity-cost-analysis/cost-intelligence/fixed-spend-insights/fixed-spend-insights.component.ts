import { Component, OnInit } from '@angular/core';
import { FixedSpendInsightsService } from './fixed-spend-insights.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'fixed-spend-insights',
  templateUrl: './fixed-spend-insights.component.html',
  styleUrls: ['./fixed-spend-insights.component.scss'],
  providers: [FixedSpendInsightsService]
})
export class FixedSpendInsightsComponent implements OnInit {
  infraCostChartViewData: UnityChartDetails;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  costBycloudChartViewData: UnityChartDetails;
  hourlyLineChartViewData: UnityChartDetails;


  constructor(private svc: FixedSpendInsightsService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute) {
      this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.getFixedCostBreakdownByComponentType();
    this.getCostBycloudChartData();
    this.getAlertsAndRecommendationPanel();
  }

  getFixedCostBreakdownByComponentType() {
    this.infraCostChartViewData = this.svc.convertToInfraCostChartData();
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

  getAlertsAndRecommendationPanel(){
    this.hourlyLineChartViewData = this.svc.convertToHourlyLineChartData();
  }

}
