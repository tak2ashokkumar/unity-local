import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ECHARTCOLORS, UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { DurationDropdownType, VectorDbGenerationByApplicationType, VectorDbGenerationByEnvironmentType, VectorDbGenerationByOperationType, VectorDbGenerationBySystemType, VectorDbListType, VectorDbSummaryType } from './ai-observability-vector-db-summary.type';
import { Observable } from 'rxjs';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { DateRange } from 'src/app/shared/app-utility/app-utility.service';
import moment from 'moment';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';

@Injectable()
export class AiObservabilityVectorDbSummaryService {

  constructor(private chartConfigSvc: UnityChartConfigService,
    private http: HttpClient) { }

  getServiceNamesByTypeVectorDb(): Observable<VectorDbListType[]> {
    return this.http.get<VectorDbListType[]>(`customer/observability/service_names/?service_type=vector_db`);
  }

  getDateDropdownOptions(): DurationDropdownViewData {
    let view = new DurationDropdownViewData();
    view.dropdownOptions = [
      { label: 'Last 24 Hours', value: 'last_24_hours' },
      { label: 'Last 7 Days', value: 'last_7_days' },
      { label: 'Last 30 Days', value: 'last_30_days' },
      { label: 'Last 60 Days', value: 'last_60_days' },
      { label: 'Last 90 Days', value: 'last_90_days' },
    ];
    view.defaultSelected = 'last_24_hours';
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
    if (dropdownsViewData?.selectedVectorDbValue) {
      dropdownsViewData?.selectedVectorDbValue.forEach(val => {
        params = params.append('uuid', val);
      })
    }
    return params;
  }

  getVectorDbSummary(dropdownsViewData: DropDownsViewData): Observable<VectorDbSummaryType> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<VectorDbSummaryType>(`/customer/observability/vector_db/summary/`, { params: params });
  }

  getVectorDbGenerationByOperation(dropdownsViewData: DropDownsViewData): Observable<VectorDbGenerationByOperationType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<VectorDbGenerationByOperationType[]>(`/customer/observability/vector_db/generation_by_operation/`, { params: params });
  }

  getVectorDbGenerationBySystem(dropdownsViewData: DropDownsViewData): Observable<VectorDbGenerationBySystemType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<VectorDbGenerationBySystemType[]>(`/customer/observability/vector_db/generation_by_system/`, { params: params });
  }

  getVectorDbGenerationByApplication(dropdownsViewData: DropDownsViewData): Observable<VectorDbGenerationByApplicationType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<VectorDbGenerationByApplicationType[]>(`/customer/observability/vector_db/generation_by_application/`, { params: params });
  }

  getVectorDbGenerationByEnvironment(dropdownsViewData: DropDownsViewData): Observable<VectorDbGenerationByEnvironmentType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<VectorDbGenerationByEnvironmentType[]>(`/customer/observability/vector_db/generation_by_environment/`, { params: params });
  }

  convertToVectorDbSummaryWidgetViewData(data: VectorDbSummaryType): VectorDbSummaryWidgetViewData {
    let viewData = new VectorDbSummaryWidgetViewData();
    if (data.total_requests) {
      viewData.totalRequest = new VectorDbSummaryTotalRequestWidgetViewData();
      viewData.totalRequest.total = data.total_requests.total;
      viewData.totalRequest.changePercent = `${Math.abs(data.total_requests.change_percent)}%`;
      if (data.total_requests.change_percent) {
        viewData.totalRequest.changePercentIconClass = data.total_requests.change_percent > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.totalRequest.changePercentTextClass = data.total_requests.change_percent > 0 ? 'text-success' : 'text-danger';
      } else {
        viewData.totalRequest.changePercentIconClass = 'fa-caret-up';
        viewData.totalRequest.changePercentTextClass = 'text-success';
      }
    }
    if (data.average_request_duration) {
      viewData.avgRequestDuration = new VectorDbSummaryAvgRequestDurationWidgetViewData();
      viewData.avgRequestDuration.average = data.average_request_duration.average;
      viewData.avgRequestDuration.changePercent = `${Math.abs(data.average_request_duration.change_percent)}%`;
      if (data.average_request_duration.change_percent) {
        viewData.avgRequestDuration.changePercentIconClass = data.average_request_duration.change_percent > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.avgRequestDuration.changePercentTextClass = data.average_request_duration.change_percent > 0 ? 'text-success' : 'text-danger';
      } else {
        viewData.avgRequestDuration.changePercentIconClass = 'fa-caret-up';
        viewData.avgRequestDuration.changePercentTextClass = 'text-success';
      }
    }
    return viewData;
  }

  convertToGenerationByOperationChartData(graphData: VectorDbGenerationByOperationType[]): UnityChartDetails {
    if (!graphData || !graphData.length) {
      return;
    }
    const xAxisData: string[] = [];
    const seriesData: number[] = [];
    graphData.forEach(data => {
      xAxisData.push(data.name);
      seriesData.push(data.total);
    })
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;  // Define chart type as Bar
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options = {
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        data: xAxisData,
        show: false
      },
      series: [
        {
          type: 'bar',
          data: seriesData,
          itemStyle: {
            color: '#62a7e9',
            borderRadius: [0, 10, 10, 0] // Rounded corners
          },
          label: {
            show: true,
            position: 'insideLeft', // Show day names inside the bar on the left
            color: '#fff',
            formatter: function (params) {
              return graphData[params.dataIndex].name;
            }
          }
        },
        {
          type: 'bar',
          data: seriesData,
          barGap: '-100%', // Overlap with the actual bars
          itemStyle: {
            color: 'transparent' // Make bars invisible
          },
          label: {
            show: true,
            position: 'right', // Show values outside the bars
            color: '#000',
            formatter: '{c}'
          }
        }
      ]
    };

    view.options.title = {
      text: 'Generation By Operation',
      left: '0%',  // Align title to the left
      textAlign: 'left',  // Ensure text is left-aligned
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 15,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };

    view.options.grid = {
      left: '0%',   // Push chart to the left
      right: '10%', // Keep enough space for labels
      top: '15%',   // Adjust title spacing
      bottom: '5%'
    };

    return view;
  }

  convertToGenerationBySystemTypeChartData(graphData: VectorDbGenerationBySystemType[]): UnityChartDetails {
    if (!graphData || !graphData.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    graphData?.forEach((d, index) => {
      if (d.total !== 0) {
        data.push({ name: d.name, value: d.total, color: ECHARTCOLORS[index] });
      }
    });
    data.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.title = {
      text: 'Generation By System',
      left: 'center',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name) {
        return `${name}`
      },
      selectedMode: true,
      textStyle: {
        padding: [0, 0, 0, 0],
        overflow: "truncate",
        width: 100,
      },
      tooltip: {
        show: true,
        formatter: function (params) {
          return params.name;
        },
        confine: false,
      },
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    view.options.series[0].center = ['50%', '48%'];
    if (data.length > 9) {
      view.options.legend.type = "scroll";
    } else {
      view.options.series[0].center = ['50%', '45%'];
    }
    return view;
  }

  convertToGenerationByApplicationTypeChartData(graphData: VectorDbGenerationByApplicationType[]): UnityChartDetails {
    if (!graphData || !graphData.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    graphData?.forEach((d, index) => {
      if (d.total !== 0) {
        data.push({ name: d.name, value: d.total, color: ECHARTCOLORS[index] });
      }
    });
    data.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.title = {
      text: 'Generation By Application',
      left: 'center',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name) {
        return `${name}`
      },
      selectedMode: true,
      textStyle: {
        padding: [0, 0, 0, 0],
        overflow: "truncate",
        width: 100,
      },
      tooltip: {
        show: true,
        formatter: function (params) {
          return params.name;
        },
        confine: false,
      },
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.series[0].center = ['50%', '48%'];
    if (data.length > 9) {
      view.options.legend.type = "scroll";
    } else {
      view.options.series[0].center = ['50%', '45%'];
    }
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  convertToGenerationByEnvironmentTypeChartData(graphData: VectorDbGenerationByEnvironmentType[]): UnityChartDetails {
    if (!graphData || !graphData.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    graphData?.forEach((d, index) => {
      if (d.total !== 0) {
        data.push({ name: d.name, value: d.total, color: ECHARTCOLORS[index] });
      }
    });
    data.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.title = {
      text: 'Generation By Environment',
      left: 'center',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      ...view.options.legend,
      formatter: function (name) {
        return `${name}`
      },
      selectedMode: true,
      textStyle: {
        padding: [0, 0, 0, 0],
        overflow: "truncate",
        width: 100,
      },
      tooltip: {
        show: true,
        formatter: function (params) {
          return params.name;
        },
        confine: false,
      },
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.series[0].center = ['50%', '48%'];
    if (data.length > 9) {
      view.options.legend.type = "scroll";
    } else {
      view.options.series[0].center = ['50%', '45%'];
    }
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
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
  selectedVectorDbValue: string[] = [];
}

export class VectorDBWidgetViewData {
  loader: string = 'vectorDbWidgetLoader';
  count: number = 0;
  bySystemTypeChartData: UnityChartDetails;
  byApplicationTypeChartData: UnityChartDetails;
  byEnvironmentTypeChartData: UnityChartDetails;
  byDayChartData: UnityChartDetails;
}

export class VectorDbSummaryWidgetViewData {
  constructor() { }
  totalRequestLoader: string = 'totalRequestWidgetLoader';
  avgRequestDurationLoader: string = 'avgRequestDurationLoader';
  totalRequest: VectorDbSummaryTotalRequestWidgetViewData;
  avgRequestDuration: VectorDbSummaryAvgRequestDurationWidgetViewData;
}

export class VectorDbSummaryTotalRequestWidgetViewData {
  constructor() { }
  total: number = 0;
  changePercent: string;
  changePercentIconClass: string;
  changePercentTextClass: string;
}

export class VectorDbSummaryAvgRequestDurationWidgetViewData {
  constructor() { }
  average: number = 0;
  changePercent: string;
  changePercentIconClass: string;
  changePercentTextClass: string;
}

export class VectorDbGenerationByOperationWidgetViewData {
  constructor() { }
  loader: string = 'vectorDbGenerationByOperationWidgetLoader';
  chartData: UnityChartDetails;
}

export class VectorDbGenerationBySystemWidgetViewData {
  constructor() { }
  loader: string = 'vectorDbGenerationBySystemWidgetLoader';
  chartData: UnityChartDetails;
}

export class VectorDbGenerationByApplicationWidgetViewData {
  constructor() { }
  loader: string = 'vectorDbGenerationByApplicationWidgetLoader';
  chartData: UnityChartDetails;
}

export class VectorDbGenerationByEnvironmentWidgetViewData {
  constructor() { }
  loader: string = 'vectorDbGenerationByEnvironmentWidgetLoader';
  chartData: UnityChartDetails;
}