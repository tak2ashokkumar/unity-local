import { Injectable } from '@angular/core';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';

@Injectable()
export class AdcPreviewService {

  constructor(private chartConfigSvc: UnityChartConfigService) { }

  convertToVerticalBarChartViewData(responseData: any[]): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const categories = responseData.map(d => d.name);
    const data = responseData.map(d => d.count);

    view.options.xAxis = {
      type: 'category',
      data: categories,
      axisLabel: { fontSize: 12 }
    };

    view.options.yAxis = {
      type: 'value',
      name: 'Count',
      nameLocation: 'middle',
      nameGap: 40,
      axisLabel: { fontSize: 12 }
    };

    view.options.series = [
      {
        name: 'Count',
        type: 'bar',
        data,
        barWidth: '20%',
      }
    ];

    view.options.grid = {
      top: '10%',
      bottom: '15%',
      left: '5%',
      right: '5%'
    };

    return view;
  }

  convertToHorizontalBarChartViewData(responseData: any[]): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();

    const categories = responseData.map(d => d.name);
    const data = responseData.map(d => d.count);

    view.options.yAxis = { type: 'category', data: categories };
    view.options.xAxis = { type: 'value' };

    view.options.series = [
      { type: 'bar', data, barWidth: '20%' }
    ];

    return view;
  }
}

export const ChartTypes = [
  { name: 'Vertical Bar', key: 'vertical_bar', iconClass: 'fas fa-chart-bar', isSelected: false },
  { name: 'Horizontal Bar', key: 'horizontal_bar', iconClass: 'fas fa-chart-bar', isSelected: false },
  { name: 'Pie', key: 'pie', iconClass: 'fas fa-chart-pie', isSelected: false },
  { name: 'Donut', key: 'donut', iconClass: 'fas fa-dot-circle', isSelected: false },
  { name: 'Nightingale', key: 'nightingale', iconClass: 'fas fa-chart-pie', isSelected: false }
]