import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { CostByCloudType } from '../unified-cost-intelligence-hub/unified-cost-intelligence-hub.type';

@Injectable()
export class FixedSpendInsightsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
    private appService: AppLevelService,) { }

  getCostBycloudTypeChartData(criteria: SearchCriteria): Observable<CostByCloudType[]> {
    return this.tableService.getData<CostByCloudType[]>('/customer/cloud_cost_summary/cost_by_cloud_type/', criteria)
  }

  convertToInfraCostChartData(): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;

    const categories = [
      'Rack\nCabinets',
      'UPS\nSystems',
      'Surveillance\nCameras',
      'HVAC\nSystems',
      'Power\nDistribution\nUnit'
    ];

    const barData = [380, 340, 550, 300, 150];

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

  convertToCostBycloudChartData(graphData: CostByCloudType[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    graphData?.map(d => {
      if (d.total_cost > 0) {
        data.push({ name: d.cloud_type, value: d.total_cost });
      }
    });
    view.options.series[0].name = 'Cost';
    view.options.series[0].data = data;
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name) {
        // let val = data.filter(i => i.name == name);
        return `${name}`
      }
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params) {
        return params.percent + '%\n($' + params.value + ')'
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} ${c} ({d}%)',
    };

    return view;
  }

  convertToHourlyLineChartData(): UnityChartDetails {
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        top: 'bottom',
        data: ['Shared Allocation Efficiency', 'Optimization Tip','Overbudget Alert']
      },
      color: ['#4caf50', '#fdd835', '#ff0000'], // Green and Yellow and Red
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: Array.from({ length: 25 }, (_, i) =>
          i.toString().padStart(2, '0') + ':00'
        ),
        axisLabel: {
          rotate: 45
        },
        axisTick: { show: false },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 10,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Shared Allocation Efficiency',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: Array.from({ length: 25 }, () =>
            Math.floor(Math.random() * 30 + 60) // random 60–90
          )
        },
        {
          name: 'Optimization Tip',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: Array.from({ length: 25 }, () =>
            Math.floor(Math.random() * 40 + 30) // random 30–70
          )
        },
        {
          name: 'Overbudget Alert',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: Array.from({ length: 25 }, () =>
            Math.floor(Math.random() * 40 + 30) // random 30–70
          )
        }
      ]
    };

    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    return view;
  }

}
