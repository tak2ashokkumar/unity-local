import { Injectable } from '@angular/core';
import { CostByCloudType } from '../unified-cost-intelligence-hub/unified-cost-intelligence-hub.type';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { HttpClient } from '@angular/common/http';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppLevelService } from 'src/app/app-level.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';

@Injectable()
export class AvailabilityCostInsightsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
    private appService: AppLevelService,) { }

  getCostBycloudTypeChartData(criteria: SearchCriteria): Observable<CostByCloudType[]> {
    return this.tableService.getData<CostByCloudType[]>('/customer/cloud_cost_summary/cost_by_cloud_type/', criteria)
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
        return params.percent + '%'
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
        data: ['Threshold Value', 'Target Rate']
      },
      color: ['#4caf50', '#fdd835'], // Green and Yellow
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
          name: 'Threshold Value',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: Array.from({ length: 25 }, () =>
            Math.floor(Math.random() * 30 + 60) // random 60–90
          )
        },
        {
          name: 'Target Rate',
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

  convertToCostVsBudgetChartData(): UnityChartDetails {
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
  
    const categories = ['Microservices', 'Container\nRegistry', 'Campaign\nHosting', 'Core'];
    const barData = [140.5, 133.58, 85, 74];
    const lineData = [72.5, 71.8, 70.9, 73.2];
  
    view.options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const bar = params.find((p: any) => p.seriesName === 'Monthly Cost');
          const line = params.find((p: any) => p.seriesName === 'Budget');
          return `
            <strong>${bar.name}</strong><br/>
            Monthly Cost: $${bar.value}<br/>
            Budget: $${line.value}
          `;
        }
      },
      legend: {
        top: 'bottom',
        data: ['Monthly Cost', 'Budget']
      },
      color: ['#294680', '#000000'], // Deep Blue and Black
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
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
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'Budget',
          type: 'line',
          data: lineData,
          symbol: 'none',
          symbolSize: 8,
          lineStyle: {
            width: 2
          },
          label: {
            show: false
          }
        }
      ]
    };
  
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    return view;
  }
  
  
}
