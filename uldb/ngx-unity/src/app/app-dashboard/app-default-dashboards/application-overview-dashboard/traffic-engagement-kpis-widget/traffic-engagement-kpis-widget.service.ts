import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { DateRange } from '../../iot-devices-summary-dashboard/iot-devices-summary-dashboard.service';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';

@Injectable()
export class TrafficEngagementKpisWidgetService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService) { }
  converteDropdownsDataToApiParamsData(selectedDateRangeFormData: DurationDropdownType): HttpParams {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    const from = selectedDateRangeFormData?.from;
    const to = selectedDateRangeFormData?.to;
    if (from) {
      params = params.set('from', moment(from).format(format));
    }
    if (to) {
      params = params.set('to', moment(to).format(format));
    }
    return params;
  }

  getCategoriesViewedWidgetViewData(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: number }>(`/apm/app_list/${appId}/top_categories_by_product_views/`, { params: params });
  }

  getTrafficSourceOverGivenPeriod(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/traffic_source_row_percentage/`, { params: params });
  }

  getUniqueVisitors(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: number }>(`/apm/app_list/${appId}/new_customers_monthly/`, { params: params });
  }

  convertToCategoriesViewedWidgetViewDataChartData(graphData: { [key: string]: number }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const yAxisData = Object.keys(graphData);
    const xAxisData = Object.values(graphData);
    view.options.title = {
      text: 'Categories Viewed',
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 400,
        color: '#000000'
      }
    };
    view.options.grid = {
      top: '15%',
      bottom: '15%',
      containLabel: true
    };
    view.options.xAxis = {
      type: "value",
      min: 0,
      axisLabel: {
        formatter: '{value}'
      }
    }
    view.options.yAxis = {
      type: 'category',
      data: yAxisData,
      axisTick: {
        show: true
      },
      axisLine: {
        show: true
      },
      axisLabel: {
        width: 50,
        overflow: 'truncate',
        formatter: (value: string) => {
          return value;
        }
      },
      tooltip: {
        show: true,
      },
    }
    view.options.series = [
      {
        name: 'Category',
        type: 'bar',
        barMaxWidth: 35,
        data: xAxisData,
        label: {
          show: false,
          position: 'right',
          color: '#000000',
          fontWeight: 400,
          formatter: '{c}',
        },
        itemStyle: {
          color: '#297380ff',
        },
        barCategoryGap: '40%'
      }
    ];
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: function (params: any) {
        return `${params[0].name} : <strong>${params[0].value}</strong>`;
      }
    }
    view.options.legend = { show: false }
    return view;
  }

  convertToTrafficSourceOverGivenPeriodChartData(graphData: { [key: string]: string }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.title = {
      text: 'Traffic Source Over Given Period',
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 400,
        color: '#000000'
      }
    };
    // view.options.grid = {
    //   top: '15%',
    //   bottom: '15%',
    //   containLabel: true
    // };
    view.options.tooltip = {
      trigger: 'item',
      formatter: '{b}: {c}%'
    }
    view.options.legend = {
      left: 'center',
      bottom: 0,
    }
    view.options.series = [
      {
        type: 'pie',
        radius: '50%',
        center: ['50%', '45%'],
        data: Object.entries(graphData).map(([key, value]) => ({
          name: key,
          value: parseFloat(value)
        })),
        label: {
          show: true,
          formatter: '{b}: {c}%', // name + percentage inside
          // fontSize: 12
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ];
    // view.options.tooltip = {
    //   ...view.options.tooltip,
    //   formatter: function (params: any) {
    //     return `${params[0].name} : <strong>${params[0].value}</strong>`;
    //   }
    // }
    // view.options.legend = { show: false }
    return view;
  }

  convertToUniqueVisitorsChartData(graphData: { [key: string]: any }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    // data.sort((a, b) => Number(a.value) - Number(b.value));

    const labels = graphData?.new_customers?.map(d => d.range);
    const values = graphData?.new_customers?.map(d => d.total);

    view.options = this.getCommonLineChartOptions(view.options, labels, values, "Users - Unique Visitors (Estimated)");
    return view;
  }

  getCommonLineChartOptions(options: EChartsOption, data: any[], values: any[], title?: string): EChartsOption {
    return {
      ...options,
      title: {
        text: title,
        left: 'center',
        top: '0%',
        textStyle: {
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 16,
          fontWeight: 400,
          color: '#000000'
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#000' },
      },
      grid: {
        top: '20%',
        left: '10%',
        right: '5%',
        bottom: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data,
        axisLabel: {
          hideOverlap: true,
          // formatter: (value: string) => echarts.time.format(value, '{MMM} {dd}, {yyyy}', false),
          formatter: (value: string) => value,
        },
      },
      yAxis: {
        type: 'value',
        // name: 'Response Time (ms)',
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: [0],
          height: 15,
          width: '60%',
          left: 'center',
          handleSize: '100%',
          showDataShadow: true,
          filterMode: 'empty',
          realtime: false,
        },
      ],
      series: [
        {
          // name: 'Response Time',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#fff',
            borderColor: '#78b8f8ff',
            borderWidth: 2
          },
          lineStyle: {
            color: '#78b8f8ff', // your desired line color
            width: 3
          },
          // lineStyle: { width: 3 },
          areaStyle: {
            color: '#cfe3f9ff'
          },
          data: values,
        },
      ],
    };
  }

}

export class CategoriesViewedWidgetViewData {
  loader: string = 'categoriesViewedWidgetLoader';
  chartData: UnityChartDetails;
}

export class TrafficSourceOverGivenPeriodWidgetViewData {
  loader: string = 'trafficSourceOverGivenPeriodWidgetLoader';
  chartData: UnityChartDetails;
}

export class UniqueVisitorsWidgetViewData {
  loader: string = 'uniqueVisitorsWidgetLoader';
  chartData: UnityChartDetails;
}

export interface DurationDropdownType {
  period: string;
  from: string;
  to: string;
}