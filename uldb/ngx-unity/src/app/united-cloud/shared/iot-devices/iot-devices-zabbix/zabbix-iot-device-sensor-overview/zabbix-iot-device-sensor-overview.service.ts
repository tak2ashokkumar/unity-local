import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { VisualMapComponent } from 'echarts/components';
import moment from 'moment';
import { Observable } from 'rxjs';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { AppUtilityService, DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { cloneDeep as _clone } from 'lodash-es';

@Injectable()
export class ZabbixIotDeviceSensorOverviewService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService) { }

  getTemperatureData(from: string, to: string, deviceId: string): Observable<TemperatureWidgetType> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<TemperatureWidgetType>(`/customer/sensors/${deviceId}/temperature/`, { params: params });
  }

  getHumidityData(from: string, to: string, deviceId: string): Observable<HumidityWidgetType> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<HumidityWidgetType>(`/customer/sensors/${deviceId}/humidity/`, { params: params });
  }

  getAirflowData(from: string, to: string, deviceId: string): Observable<AirflowWidgetType> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<AirflowWidgetType>(`/customer/sensors/${deviceId}/airflow/`, { params: params });
  }

  getThresholdBreachSummaryData(from: string, to: string, deviceId: string): Observable<ThresholdBreachSummaryWidgetType> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<ThresholdBreachSummaryWidgetType>(`/customer/sensors/${deviceId}/threshold_summary/`, { params: params });
  }

  getRecentEvents(deviceId: string): Observable<RecentEventType[]> {
    return this.http.get<RecentEventType[]>(`/customer/sensors/${deviceId}/recent_events/`);
  }

  convertToTemperatureWidgetSummaryViewData(data: SummaryType): TemperatureSummaryViewData {
    let view: TemperatureSummaryViewData = new TemperatureSummaryViewData();
    view.average = data.average;
    view.max = data.maximum;
    view.min = data.minimum;
    return view;
  }

  convertToTemperatureWidgetChartViewData(dropdownData: DurationDropdownType, data: TrendDataType[]) {
    let diff = this.utilSvc.getTimeDifference(dropdownData.to, dropdownData.from);
    let isLastTwentyFourHours: boolean = false;
    if (diff?.asSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.getLineChartOptions(data, 'temperature', isLastTwentyFourHours);
    view.extensions = [VisualMapComponent, ...this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE)];
    return view;
  }

  convertToHumiditySummaryViewData(data: SummaryType): HumiditySummaryViewData {
    let view: HumiditySummaryViewData = new HumiditySummaryViewData();
    view.average = data.average;
    view.max = data.maximum;
    view.min = data.minimum;
    return view;
  }

  convertToHumidityWidgetViewData(dropdownData: DurationDropdownType, data: TrendDataType[]) {
    let diff = this.utilSvc.getTimeDifference(dropdownData.to, dropdownData.from);
    let isLastTwentyFourHours: boolean = false;
    if (diff?.asSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.getLineChartOptions(data, 'humidity', isLastTwentyFourHours);
    view.extensions = [VisualMapComponent, ...this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE)];
    return view;
  }

  convertToAirflowSummaryViewData(data: SummaryType): AirflowSummaryViewData {
    let view: AirflowSummaryViewData = new AirflowSummaryViewData();
    view.average = data.average;
    view.max = data.maximum;
    view.min = data.minimum;
    return view;
  }

  convertToAirflowWidgetViewData(dropdownData: DurationDropdownType, data: TrendDataType[]) {
    let diff = this.utilSvc.getTimeDifference(dropdownData.to, dropdownData.from);
    let isLastTwentyFourHours: boolean = false;
    if (diff?.asSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.getLineChartOptions(data, 'airflow', isLastTwentyFourHours);
    view.extensions = [VisualMapComponent, ...this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE)];
    return view;
  }

  getLineChartOptions(trendData: TrendDataType[], widgetType: string, isLastTwentyFourHours: boolean): EChartsOption {
    let byWidgetTypePiecesArr = [];
    if (widgetType == 'temperature') {
      byWidgetTypePiecesArr = [
        { lt: 40, color: '#2ecc71' },
        { gte: 40, lte: 60, color: '#f1c40f' },
        { gt: 60, color: '#f44336' }
      ]
    } else if (widgetType == 'humidity') {
      byWidgetTypePiecesArr = [
        { lt: 30, color: '#2ecc71' },
        { gte: 31, lte: 40, color: '#f1c40f' },
        { gt: 41, color: '#f44336' }
      ]
    } else {
      byWidgetTypePiecesArr = [
        { lt: 500, color: '#2ecc71' },
        { gte: 501, lte: 600, color: '#f1c40f' },
        { gt: 601, color: '#f44336' }
      ]
    }
    let options: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          const time = echarts.time.format(item.axisValue, isLastTwentyFourHours ? '{HH}:{mm}' : '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
          return `${time}<br/>Value: ${item.data[1]}`;
        }
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 10,
          fontWeight: 500,
          color: UNITY_TEXT_DEFAULT_COLOR(),
          rotate: 45,
          formatter: (value: number) => {
            return echarts.time.format(value, isLastTwentyFourHours ? ' {HH}:{mm}' : '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
          }
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0, 0, 0, 0.1)',
            width: 1
          }
        }
      },
      visualMap: {
        show: false,
        dimension: 1,
        pieces: byWidgetTypePiecesArr
      },
      series: [
        {
          data: trendData.map(d => [d.recorded_at, d.value]),
          type: 'line',
          symbol: 'none',
          smooth: 0.3,
          lineStyle: {
            width: 3
          },
        }
      ],
    };
    if (trendData.length < 2) {
      options.series[0].symbol = 'circle';
    }
    return options;
  }

  convertoThresholdBreachSummary(data: ThresholdBreachSummaryWidgetType) {
    const viewData: thresholdBreachSummaryChartType[] = [];
    Object.keys(data).forEach(d => {
      let view: thresholdBreachSummaryChartType = new thresholdBreachSummaryChartType();
      view.label = d;
      const order = ['normal', 'moderate', 'critical'];
      view.percentageValues = order.map(key => data[d][key]?.percentage ?? 0);
      view.chart = this.getThresholdBreachSummaryChartData(data[d]);
      viewData.push(view);
    })
    return viewData;
  }

  getThresholdBreachSummaryChartData(data: TemperatureType | HumidityType | AirflowType) {
    let colors = [
      { name: 'Normal', color: '#009688' },
      { name: 'Moderate', color: '#ff9800' },
      { name: 'Critical', color: '#f44336' },
    ]
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.getDefaultDonutChartWithGapBetweenSlicesOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let chartData: UnityChartDataType[] = [];
    colors.forEach(col => {
      Object.keys(data).forEach(key => {
        if (data[key.toLowerCase()].count != 0 && col.name.toLowerCase() === key.toLowerCase()) {
          chartData.push({ name: col.name, value: data[key.toLowerCase()].count, color: col.color });
        }
      })
    })
    view.options.series[0].data = chartData.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    return view;
  }

  getDefaultDonutChartWithGapBetweenSlicesOptions(): EChartsOption {
    return {
      tooltip: {
        show: false
      },
      series: [
        {
          type: 'pie',
          name: '',
          radius: ['35%', '75%'],
          label: { show: false },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          },
          data: []
        }
      ]
    };
  }

  convertToRecentEventsViewData(data: RecentEventType[]): RecentEventViewData[] {
    let viewData: RecentEventViewData[] = [];
    data.forEach(d => {
      let view: RecentEventViewData = new RecentEventViewData();
      view.eventId = d.uuid;
      view.deviceName = d.device_name;
      view.deviceType = d.device_type;
      view.ipAddress = d.ip_address;
      view.datacenter = d.datacenter ? d.datacenter : 'N/A';
      view.cabinet = d.cabinet ? d.cabinet.name : 'N/A';
      view.category = d.device_type ? d.device_type : 'N/A';
      view.eventDatetime = d.event_datetime ? this.utilSvc.toUnityOneDateFormat(d.event_datetime) : 'N/A';
      view.description = d.description ? d.datacenter : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

}

export class TemperatureViewData {
  constructor() { }
  loader: string = 'temperatureWidgetLoader';
  dropdownOptions: CustomDateRangeType[] = _clone(dropdownOptions);
  defaultSelected: string = 'last_24_hours';
  dateRangeformData: DurationDropdownType;
  summary: TemperatureSummaryViewData;
  chart: UnityChartDetails;
}

export class TemperatureSummaryViewData {
  constructor() { }
  average: number = 0;
  max: number = 0;
  min: number = 0;
}

export class HumidityViewData {
  constructor() { }
  loader: string = 'humidityWidgetLoader';
  dropdownOptions: CustomDateRangeType[] = _clone(dropdownOptions);
  defaultSelected: string = 'last_24_hours';
  dateRangeformData: DurationDropdownType;
  summary: HumiditySummaryViewData;
  chart: UnityChartDetails;
}

export class HumiditySummaryViewData extends TemperatureSummaryViewData { }

export class AirflowViewData {
  constructor() { }
  loader: string = 'airflowWidgetLoader';
  dropdownOptions: CustomDateRangeType[] = _clone(dropdownOptions);
  defaultSelected: string = 'last_24_hours';
  dateRangeformData: DurationDropdownType;
  summary: HumiditySummaryViewData;
  chart: UnityChartDetails;
}

export class AirflowSummaryViewData extends TemperatureSummaryViewData { }

export class thresholdBreachSummary {
  constructor() { }
  dropdownOptions: CustomDateRangeType[] = _clone(dropdownOptions);
  defaultSelected: string = 'last_24_hours';
  dateRangeformData: DurationDropdownType;
  charts: thresholdBreachSummaryChartType[] = [];
}

export class thresholdBreachSummaryChartType {
  label: string;
  percentageValues: number[];
  chart: UnityChartDetails;
}

export class RecentEventViewData {
  constructor() { }
  id: number;
  eventId: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  description: string;
  category: string;
  eventDatetime: string;
  severity: string;
  status: string;
  source: string;
  sourceAccount: string;
  recoveredTime: string;
  cabinet: string;
  datacenter: string;
}

export interface RecentEventType {
  id: number;
  uuid: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  description: string;
  event_datetime: string;
  severity: string;
  status: string;
  source: string;
  source_account: string;
  recovered_time: string;
  cabinet: CabinetType;
  datacenter: string;
}
export interface CabinetType {
  uuid: string;
  name: string;
}

export interface ThresholdBreachSummaryWidgetType {
  temperature: TemperatureType;
  humidity: HumidityType;
  airflow: AirflowType;
}

export interface TemperatureType {
  critical: TemperatureCriticalType;
  moderate: TemperatureModerateType;
  normal: TemperatureNormalType;
}

export interface TemperatureCriticalType {
  total: number;
  count: number;
  percentage: number;
}

export interface TemperatureModerateType extends TemperatureCriticalType { }

export interface TemperatureNormalType extends TemperatureCriticalType { }

export interface HumidityType extends TemperatureType { }

export interface AirflowType extends TemperatureType { }

export interface TemperatureWidgetType {
  summary: SummaryType;
  trend_data: TrendDataType[];
}

export interface SummaryType {
  average: number;
  maximum: number;
  minimum: number;
}

export interface TrendDataType {
  unit: string;
  value: number;
  recorded_at: string;
}

export interface HumidityWidgetType extends TemperatureWidgetType { }

export interface AirflowWidgetType extends TemperatureWidgetType { }

export interface DurationDropdownType {
  period: string;
  from: string;
  to: string;
}

export const dropdownOptions: CustomDateRangeType[] = [
  { label: 'Last 1 Hr', value: 'last_1_hour' },
  { label: 'Last 24 Hrs', value: 'last_24_hours' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 60 Days', value: 'last_60_days' },
  { label: 'Last 90 Days', value: 'last_90_days' },
];