import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { AvailabilityCostInsightsService } from './availability-cost-insights.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'availability-cost-insights',
  templateUrl: './availability-cost-insights.component.html',
  styleUrls: ['./availability-cost-insights.component.scss'],
  providers: [AvailabilityCostInsightsService]
})
export class AvailabilityCostInsightsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  costBycloudChartViewData: UnityChartDetails;
  hourlyLineChartViewData: UnityChartDetails;
  costVsBudgetChartViewData: UnityChartDetails;

  constructor(private svc: AvailabilityCostInsightsService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute) {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.getCostBycloudChartData();
    this.getAvailabilityMetricsTrend();
    this.getCostAnomalityOverview();
  }

  getCostBycloudChartData() {
    this.spinner.start('CostByCloudTypeChartLoader');
    this.svc.getCostBycloudTypeChartData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costBycloudChartViewData = this.svc.convertToCostBycloudChartData(res);
      console.log(this.costBycloudChartViewData, 'costBycloudChartViewData');
      this.spinner.stop('CostByCloudTypeChartLoader');
    }, err => {
      this.spinner.stop('CostByCloudTypeChartLoader');
      this.notification.error(new Notification('Failed to get cost by cloud type data'));
    });
  }

  getAvailabilityMetricsTrend(){
    this.hourlyLineChartViewData = this.svc.convertToHourlyLineChartData();
  }

  getCostAnomalityOverview(){
    this.costVsBudgetChartViewData = this.svc.convertToCostVsBudgetChartData();
  }

}
