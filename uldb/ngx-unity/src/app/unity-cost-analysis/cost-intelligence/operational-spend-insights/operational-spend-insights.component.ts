import { Component, OnInit } from '@angular/core';
import { OperationalSpendInsightsService } from './operational-spend-insights.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'operational-spend-insights',
  templateUrl: './operational-spend-insights.component.html',
  styleUrls: ['./operational-spend-insights.component.scss'],
  providers: [OperationalSpendInsightsService]
})
export class OperationalSpendInsightsComponent implements OnInit {
  infraCostChartViewData: UnityChartDetails;

  constructor(private svc: OperationalSpendInsightsService,
      private notification: AppNotificationService,
      private spinner: AppSpinnerService,
      private router: Router,
      private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getSpendByComponentType();
  }

  getSpendByComponentType() {
    this.infraCostChartViewData = this.svc.convertToInfraCostChartData();
  }

}
