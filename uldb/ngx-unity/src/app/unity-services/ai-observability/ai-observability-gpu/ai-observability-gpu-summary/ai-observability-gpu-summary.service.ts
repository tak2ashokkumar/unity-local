import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUtilityService, DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { AvgFanSpeedType, AvgMemoryType, AvgPowerType, AvgTemperatureType, AvgUtilizationPerType, DurationDropdownType, GpuListType, GpuSummaryType } from './ai-observability-gpu-summary.type';
import { EChartsOption, SeriesOption } from 'echarts';
import { Observable } from 'rxjs';
import moment from 'moment';

@Injectable()
export class AiObservabilityGpuSummaryService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService) { }

  getDurationDropdownViewData(): DurationDropdownViewData {
    let view: DurationDropdownViewData = new DurationDropdownViewData();
    view.dropdownOptions = [
      { label: 'Last 24 Hours', value: 'last_24_hours' },
      { label: 'Last 7 Days', value: 'last_7_days' },
      { label: 'Last 30 Days', value: 'last_30_days' },
      { label: 'Last 60 Days', value: 'last_60_days' },
      { label: 'Last 90 Days', value: 'last_90_days' },
    ];
    view.defaultSelected = 'last_7_days';
    return view;
  }

  converteDropdownsDataToApiParamsData(dropdownsViewData: DropDownsViewData): HttpParams {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    const from = dropdownsViewData?.selectedDateRangeFormData?.from;
    const to = dropdownsViewData?.selectedDateRangeFormData?.to;
    if (from) {
      params = params.set('from', moment(from).format(format));
    }
    if (to) {
      params = params.set('to', moment(to).format(format));
    }
    if (dropdownsViewData?.selectedGpuValue) {
      dropdownsViewData?.selectedGpuValue.forEach(val => {
        params = params.append('uuid', val);
      })
    }
    return params;
  }

  getChartDateFormate(dropdownsViewData: DropDownsViewData) {
    const diffInSeconds: number = (new Date(dropdownsViewData?.selectedDateRangeFormData?.to).getTime() - new Date(dropdownsViewData?.selectedDateRangeFormData?.from).getTime()) / 1000;
    let isLastTwentyFourHours: boolean = false;
    if (diffInSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    return isLastTwentyFourHours;
  }

  getGpuList(): Observable<GpuListType[]> {
    let params: HttpParams = new HttpParams().set('service_type', 'gpu');
    return this.http.get<GpuListType[]>(`customer/observability/service_names/`, { params: params });
  }

  getGpuSummary(dropdownsViewData: DropDownsViewData): Observable<GpuSummaryType> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<GpuSummaryType>(`customer/observability/gpu/summary`, { params: params });
  }

  getAvgUtilization(dropdownsViewData: DropDownsViewData): Observable<AvgUtilizationPerType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<AvgUtilizationPerType[]>(`customer/observability/gpu/avg_utilization`, { params: params });
  }

  getAvgTemperatureUsage(dropdownsViewData: DropDownsViewData): Observable<AvgTemperatureType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<AvgTemperatureType[]>(`customer/observability/gpu/temperature_usage`, { params: params });
  }

  getAvgMemoryUsage(dropdownsViewData: DropDownsViewData): Observable<AvgMemoryType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<AvgMemoryType[]>(`customer/observability/gpu/memory_usage`, { params: params });
  }

  getAvgPowerUsage(dropdownsViewData: DropDownsViewData): Observable<AvgPowerType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<AvgPowerType[]>(`customer/observability/gpu/power_usage`, { params: params });
  }

  getAvgFanSpeedUsage(dropdownsViewData: DropDownsViewData): Observable<AvgFanSpeedType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<AvgFanSpeedType[]>(`customer/observability/gpu/fan_speed_usage`, { params: params });
  }

  convertToGpuSummaryViewData(data: GpuSummaryType): GpuSummaryWidgetViewData {
    let viewData: GpuSummaryWidgetViewData = new GpuSummaryWidgetViewData();
    viewData.avgUtilizationPercentage = `${data.avg_gpu_utilization.value}${data.avg_gpu_utilization.unit}`;
    viewData.avgTemperature = `${data.avg_gpu_temperature.value}${data.avg_gpu_temperature.unit}`;
    viewData.avgPowerDraw = `${data.avg_gpu_power_draw.value}${data.avg_gpu_power_draw.unit}`;
    viewData.avgMemoryUsed = `${data.avg_gpu_memory_used.value}${data.avg_gpu_memory_used.unit}`;
    return viewData;
  }

  convertToLineChartViewData(xAxisData: string[], values?: number[][], names?: string[], colors?: string[], max?: number) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    view.options = this.getLineChartOptions(xAxisData);
    if (names?.length && values?.length) {
      view.options.series = [];
      let chartSeries: SeriesOption[] = [];
      names.forEach((name, index) => {
        const data: SeriesOption = {
          name: name,
          type: 'line',
          data: values[index],
          smooth: true,
          lineStyle: { color: colors[index] },
        }
        chartSeries.push(data);
      });
      view.options.series = chartSeries;
      view.options.legend = {
        data: names,
        bottom: 0
      }
    }
    max && (view.options.yAxis = { ...view.options.yAxis, min: 0, max: 100 });
    return view;
  }

  getLineChartOptions(xAxisData: string[]): EChartsOption {
    return {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          rotate: 35
        }
      },
      yAxis: {
        type: 'value',
        // max: 100,
        // min: 0,
        // axisLabel: {
        //   formatter: '{value}%'
        // }
      },
      grid: {
        left: '10%',
        right: '3%',
        top: '5%',
        bottom: '10%',
        containLabel: true
      },
      series: [],
      legend: {}
    }
  }

  converToAvgUtilizationPercentageChartViewData(graphData: AvgUtilizationPerType[], dropdownsViewData: DropDownsViewData) {
    if (!graphData || !graphData.length) {
      return;
    }
    const names = ["Utilization", "Encoder Utilization", "Decoder Utilization"];
    const xAxisData: string[] = [];
    const values: number[][] = [[], [], []];
    const colors: string[] = ['#376DF7', '#53B997', '#F8C541']
    const isLastTwentyFourHours = this.getChartDateFormate(dropdownsViewData);
    graphData.forEach(data => {
      xAxisData.push(this.utilSvc.toUnityOneDateFormat(data.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      values[0].push(data.gpu_utilization?.value);
      values[2].push(data.gpu_enc_utilization?.value);
      values[1].push(data.gpu_dec_utilization?.value);
    });
    return this.convertToLineChartViewData(xAxisData, values, names, colors, 100);
  }

  converToAvgTemperatureChartViewData(graphData: AvgTemperatureType[], dropdownsViewData: DropDownsViewData) {
    if (!graphData || !graphData.length) {
      return;
    }
    const names = ["Temperature"];
    const xAxisData: string[] = [];
    const values: number[][] = [[]];
    const colors: string[] = ['#376DF7']
    const isLastTwentyFourHours = this.getChartDateFormate(dropdownsViewData);
    graphData.forEach(data => {
      xAxisData.push(this.utilSvc.toUnityOneDateFormat(data.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      values[0].push(data.gpu_temperature?.value);
    });
    return this.convertToLineChartViewData(xAxisData, values, names, colors);
  }

  converToAvgMemoryChartViewData(graphData: AvgMemoryType[], dropdownsViewData: DropDownsViewData) {
    if (!graphData || !graphData.length) {
      return;
    }
    const names = ["Total", "Used", "Free"];
    const xAxisData: string[] = [];
    const values: number[][] = [[], [], []];
    const colors: string[] = ['#376DF7', '#53B997', '#F8C541'];
    const isLastTwentyFourHours = this.getChartDateFormate(dropdownsViewData);
    graphData.forEach(data => {
      xAxisData.push(this.utilSvc.toUnityOneDateFormat(data.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      values[0].push(data.gpu_memory_total?.value);
      values[1].push(data.gpu_memory_used?.value);
      values[2].push(data.gpu_memory_free?.value);
    });
    return this.convertToLineChartViewData(xAxisData, values, names, colors);
  }

  converToAvgPowerChartViewData(graphData: AvgPowerType[], dropdownsViewData: DropDownsViewData) {
    if (!graphData || !graphData.length) {
      return;
    }
    const names = ["Power Limit", "Power Draw"];
    const xAxisData: string[] = [];
    const values: number[][] = [[], []];
    const colors: string[] = ['#376DF7', '#53B997'];
    const isLastTwentyFourHours = this.getChartDateFormate(dropdownsViewData);
    graphData.forEach(data => {
      xAxisData.push(this.utilSvc.toUnityOneDateFormat(data.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      values[0].push(data.gpu_power_limit?.value);
      values[1].push(data.gpu_power_draw?.value);
    });
    return this.convertToLineChartViewData(xAxisData, values, names, colors);
  }

  converToAvgFanSpeedChartViewData(graphData: AvgFanSpeedType[], dropdownsViewData: DropDownsViewData) {
    if (!graphData || !graphData.length) {
      return;
    }
    const names = ["Speed"];
    const xAxisData: string[] = [];
    const values: number[][] = [[]];
    const colors: string[] = ['#376DF7'];
    const isLastTwentyFourHours = this.getChartDateFormate(dropdownsViewData);
    graphData.forEach(data => {
      xAxisData.push(this.utilSvc.toUnityOneDateFormat(data.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      values[0].push(data.gpu_fan_speed?.value);
    });
    return this.convertToLineChartViewData(xAxisData, values, names, colors);
  }

}

export class DurationDropdownViewData {
  constructor() { }
  dropdownOptions: CustomDateRangeType[];
  defaultSelected: string;
}

export class DropDownsViewData {
  constructor() { }
  selectedDateRangeFormData: DurationDropdownType;
  selectedGpuValue: string[] = [];
}

export class GpuSummaryWidgetViewData {
  constructor() { }
  avgUtilizationPerLoader: string = 'avgUtilizationPerWidgetLoader';
  avgTemperatureLoader: string = 'avgTemperatureWidgetLoader';
  avgPowerDrawLoader: string = 'avgPowerDrawWidgetLoader';
  avgMemoryUsedLoader: string = 'avgMemoryUsedWidgetLoader';
  avgUtilizationPercentage: string = '0%';
  avgTemperature: string = '0°C';
  avgPowerDraw: string = '0W';
  avgMemoryUsed: string = '0MB';
}

export class AvgUtilizationWidgetViewData {
  constructor() { }
  loader: string = 'avgUtilizationWidgetLoader';
  chartData: UnityChartDetails;
}

export class AvgMemoryUsageWidgetViewData {
  constructor() { }
  loader: string = 'avgMemoryUsageWidgetLoader';
  chartData: UnityChartDetails;
}

export class AvgTemperatureUsageWidgetViewData {
  constructor() { }
  loader: string = 'avgTemperatureUsageWidgetLoader';
  chartData: UnityChartDetails;
}

export class AvgPowerUsageWidgetViewData {
  constructor() { }
  loader: string = 'avgPowerUsageWidgetLoader';
  chartData: UnityChartDetails;
}

export class AvgFanSpeedUsageWidgetViewData {
  constructor() { }
  loader: string = 'avgFanSpeedUsageWidgetLoader';
  chartData: UnityChartDetails;
}