import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';

@Injectable()
export class OperationalSpendInsightsService {

  constructor(private http: HttpClient,
      private tableService: TableApiServiceService,
      private utilSvc: AppUtilityService,
      private chartConfigSvc: UnityChartConfigService,
      private appService: AppLevelService,) { }

  convertToInfraCostChartData(): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;

    const categories = [
      'Monitoring',
      'Patching',
      'Provisioning',
      'Logging',
      'Security',
      'Backup'
    ];

    const barData = [68.50, 77.50, 10.5, 54, 66, 36];

    view.options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function (params: any) {
          const item = params[0];
          return `${item.name.replace(/\n/g, ' ')}<br/>$${item.value}`;
        }
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          interval: 0,
          fontSize: 11,
          lineHeight: 14,
          margin: 10
        }
      },
      yAxis: {
        type: 'value',
        name: 'Cost',
        axisLabel: {
          formatter: '${value}'
        },
        splitLine: {
          lineStyle: { type: 'dashed' }
        }
      },
      grid: {
        left: '8%',
        right: '8%',
        bottom: '14%',
        top: '10%'
      },
      series: [
        {
          name: 'Monthly Cost',
          type: 'bar',
          data: barData,
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            formatter: '${@[0]}'
          },
          itemStyle: {
            color: '#294680',
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };

    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    return view;
  }
}
