import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OperationalSpendInsightsService } from './operational-spend-insights.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'operational-spend-insights',
  templateUrl: './operational-spend-insights.component.html',
  styleUrls: ['./operational-spend-insights.component.scss'],
  providers: [OperationalSpendInsightsService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationalSpendInsightsComponent implements OnInit {
  infraCostChartViewData: UnityChartDetails;

  constructor(private svc: OperationalSpendInsightsService) { }

  ngOnInit(): void {
    this.getSpendByComponentType();
  }

  getSpendByComponentType(): void {
    this.infraCostChartViewData = this.svc.convertToInfraCostChartData();
  }
}
