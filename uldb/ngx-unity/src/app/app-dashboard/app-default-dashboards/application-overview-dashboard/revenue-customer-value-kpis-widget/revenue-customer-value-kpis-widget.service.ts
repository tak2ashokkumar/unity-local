import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import * as echarts from 'echarts';
import moment from 'moment';
import { EChartsOption } from 'echarts';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';

@Injectable()
export class RevenueCustomerValueKpisWidgetService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService) { }

  getRevenueByCategoryChartData(appId: number, from: string, to: string): Observable<{ [key: string]: string }> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/revenue_by_top_category/`, { params: params })
  }

  convertRevenueByCategoryChartData(data: { [key: string]: string }): UnityChartDetails {
    if (Object.keys(data).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    let gData = [];
    Object.keys(data).forEach((k) => {
      gData.push({ 'name': k, 'value': data[k] })
    })

    view.options = this.getCommonPieChartOptions(view.options, gData, "Revenue By Category", "revenue category");

    return view;
  }

  getRevenueByTrafficSourceChartData(appId: number, from: string, to: string): Observable<{ [key: string]: string }> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/revenue_by_traffic_source/`, { params: params })
  }

  convertRevenueByTrafficSourceChartData(data: { [key: string]: string }): UnityChartDetails {
    if (Object.keys(data).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    let gData = [];
    Object.keys(data).forEach((k) => {
      gData.push({ 'name': k, 'value': data[k] })
    })
    view.options = this.getCommonPieChartOptions(view.options, gData, "Revenue By Traffic Source", 'Revenue by traffic');

    return view;
  }

  getCommonPieChartOptions(options: EChartsOption, data: any[], title?: string, chartName?: string): EChartsOption {

    options.series[0].name = chartName;
    options.series[0].data = data;
    options.series[0].radius = '40%';
    options.series[0].center = ['50%', '48%'];

    options.title = {
      text: title,
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 12,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    options.legend = {
      ...options.legend,
      bottom: '0',
      left: 'center',
      type: "scroll",
      orient: 'horizontal',
      formatter: function (name) {
        return `${name}`
      },
    }
    options.series[0].label = {
      ...options.series[0].label,
      formatter: function (params) {
        return params.value + ' ms'
      }
    };

    options.tooltip = {
      ...options.tooltip,
      formatter: '{b}: ${c} ({d}%)',
    }

    options.grid = {
      top: '20%',
      left: '10%',
      right: '10%',
      bottom: '20%',
      containLabel: true
    }

    return options;

  }

  getOperationalAnomalyDetectionKPIsChartData(appId: number, from: string, to: string): Observable<OperationalAnomalyType> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<OperationalAnomalyType>(`/apm/app_list/${appId}/operational_anomaly_kpis/`, { params: params })
  }

  convertOperationalAnomalyDetectionChartData(data: OperationalAnomalyType): UnityChartDetails {
    if (!data?.revenue_usd?.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const periods = data.revenue_usd.map(item => item.period);
    const revenueUsdData = data.revenue_usd.map(item => item.sum);
    const revenue24hMaData = data.revenue_24h_ma.map(item => item.sum);

    // Assign chart options
    view.options = {
      ...view.options,
      xAxis: {
        ...view.options.xAxis,
        type: 'category',
        boundaryGap: false,
        data: periods,
      },
      yAxis: {
        type: 'value',
        name: 'Revenue Spike & Drop ($)',
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: [0],
          height: 15,
          width: '82%',
          right: '5%',
          handleSize: '100%',
          showDataShadow: true,
          filterMode: 'empty',
          realtime: false,
        },
      ],
      series: [
        {
          name: 'Revenue USD',
          type: 'line',
          stack: 'Total',
          data: revenueUsdData,
        },
        {
          name: 'Revenue 24h MA',
          type: 'line',
          stack: 'Total',
          data: revenue24hMaData,
        }
      ],
      grid: {
        top: '10%',
        left: '6%',
        right: '5%',
        bottom: '20%',
        containLabel: true
      },
      legend: {
        top: '0%',
        right: '6%',
        orient: 'horizontal',
      }
    }

    return view;
  }
}

export interface OperationalAnomalyType {
  grouping: string;
  revenue_usd: RevenueItem[];
  revenue_24h_ma: RevenueItem[];
}
interface RevenueItem {
  sum: number;
  period: string;
}