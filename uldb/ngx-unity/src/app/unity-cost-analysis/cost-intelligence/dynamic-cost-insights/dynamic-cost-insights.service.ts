import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { CostBySubscription } from '../unified-cost-intelligence-hub/unified-cost-intelligence-hub.type';
import { Observable } from 'rxjs';

@Injectable()
export class DynamicCostInsightsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
    private appService: AppLevelService,) { }

  getCostBySubscriptionChartData(criteria: SearchCriteria): Observable<CostBySubscription[]> {
    return this.tableService.getData<CostBySubscription[]>('/customer/cloud_cost_summary/cost_by_subscription/', criteria);
  }

  convertToInfraCostChartData(): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;

    const categories = [
      'AWS\nEC2\nWebVM',
      'GCP\nKubernetes\nNode',
      'AWS\nLambda\nAPI Handler',
      'OCI',
    ];

    const barData = [68.50, 77.50, 10.5, 54];

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
        name: '',
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

  convertToCostBySubscriptionChartData(graphData: CostBySubscription[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    graphData?.map(d => {
      if (d.cost > 0) {
        data.push({ name: d.account_name, value: d.cost });
      }
    })
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
}
