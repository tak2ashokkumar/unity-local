import { Component, Input, OnInit } from '@angular/core';
import { UcChartsService } from './uc-charts.service';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'uc-charts',
  templateUrl: './uc-charts.component.html',
  styleUrls: ['./uc-charts.component.scss'],
  providers: [UcChartsService]
})
export class UcChartsComponent implements OnInit {

  @Input() chartResponse: UnityChartDetails;

  constructor(private chartService: UcChartsService) { }

  ngOnInit(): void {
  }
}
