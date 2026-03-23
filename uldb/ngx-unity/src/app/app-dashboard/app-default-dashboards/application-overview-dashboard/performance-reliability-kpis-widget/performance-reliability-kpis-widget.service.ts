import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import * as echarts from 'echarts';
import moment from 'moment';
import { DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { EChartsOption } from 'echarts';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';


@Injectable()
export class PerformanceReliabilityKpisWidgetService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService) { }

  getApplicationResponseTimeChartData(appId: number, from: string, to: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'avg_response_time').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any[]>(`/apm/app_list/${appId}/metric_timeseries/`, { params: params })
  }

  convertApplicationResponseTimeChartData(data: any[]): UnityChartDetails {
    if (!data || !data.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    // data.sort((a, b) => Number(a.value) - Number(b.value));

    const labels = data.map(d => d.range);
    const values = data.map(d => d.sum);

    view.options = this.getCommonLineChartOptions(view.options, labels, values, "Application Response Time (ms)", "Response Time (ms)");

    return view;
  }

  getCommonLineChartOptions(options: EChartsOption, data: any[], values: any[], title?: string, yAxisName?: string): EChartsOption {
    return {
      ...options,
      title: {
        text: title,
        left: 'center',
        top: '0%',
        textStyle: {
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 12,
          fontWeight: 500,
          color: UNITY_TEXT_DEFAULT_COLOR()
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#000' },
        trigger: 'axis',
        // formatter: '{b} : {c}',
        // formatter: function (params: any) {
        //   return `${params[0].name} : ${params[0].value}`;
        // }
      },
      grid: {
        top: '20%',
        left: '5%',
        right: '3%',
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
        name: yAxisName,
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: [0],
          height: 15,
          width: '80%',
          right: '8%',
          handleSize: '100%',
          showDataShadow: true,
          filterMode: 'empty',
          realtime: false,
        },
      ],
      series: [
        {
          name: 'Response Time',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#5B8FF9' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(91,143,249,0.4)' },
              { offset: 1, color: 'rgba(91,143,249,0.1)' },
            ]),
          },
          data: values,
        },
      ],
    };
  }


  getErrorRateData(appId: number, from: string, to: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'error_rate').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any[]>(`/apm/app_list/${appId}/metric_timeseries/`, { params: params })
  }

  convertErrorRateChartData(data: any[]): UnityChartDetails {
    if (!data || !data.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    // data.sort((a, b) => Number(a.value) - Number(b.value));    
    const labels = data.map(d => d.range);
    const values = data.map(d => d.sum);

    view.options = this.getCommonLineChartOptions(view.options, labels, values, "Error Rate (% of Failed Interactions)", "Error Rate (%)")

    return view;
  }


  getPaymentFailureData(appId: number, from: string, to: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'payment_failure_rate').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any[]>(`/apm/app_list/${appId}/metric_timeseries/`, { params: params })
  }

  convertPyamentFailureChartData(data: any[]): UnityChartDetails {
    if (!data || !data.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const labels = data.map(d => d.range);
    const values = data.map(d => d.sum);

    view.options = this.getCommonLineChartOptions(view.options, labels, values, "Payment Failure Rate (%)", "Failure Rate (%)")

    return view;
  }


  getPayemntGatewayLatencyData(appId: number, from: string, to: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'payment_gateway_latency').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any[]>(`/apm/app_list/${appId}/metric_timeseries/`, { params: params })
  }

  convertPayemntGatewayLatencyChartData(data: any[]): UnityChartDetails {
    if (!data || !data.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const labels = data.map(d => d.range);
    const values = data.map(d => d.sum);

    view.options = {
      ...view.options,
      title: {
        text: 'Payment Gateway Latency (ms)',
        left: 'center',
        top: '0%',
        textStyle: {
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 12,
          fontWeight: 500,
          color: UNITY_TEXT_DEFAULT_COLOR()
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        top: '20%',
        left: '5%',
        right: '5%',
        bottom: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        name: 'Date',
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        name: 'Latency (ms)',
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: [0],
          height: 15,
          width: '80%',
          right: '10%',
          handleSize: '100%',
          showDataShadow: true,
          filterMode: 'empty',
          realtime: false,
        },
      ],
      series: [
        {
          name: 'Latency',
          type: 'bar',
          barWidth: '50%',
          data: values,
          itemStyle: {
            color: '#106C77',
          },
        },
      ],
    };

    return view;
  }

}
