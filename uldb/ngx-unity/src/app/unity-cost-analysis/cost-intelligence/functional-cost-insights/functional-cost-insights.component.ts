import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'functional-cost-insights',
  templateUrl: './functional-cost-insights.component.html',
  styleUrls: ['./functional-cost-insights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionalCostInsightsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
