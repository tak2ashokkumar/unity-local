import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { AppUtilityService, DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { ECHARTCOLORS, UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { Observable } from 'rxjs';
import { AvgTokensSummaryType, CostByApplicationType, CostByEnvironmentType, DurationDropdownType, GenerationByCategoryType, GenerationByProviderType, LlmListType, LlmSummaryType, ModelsByTimeType, RequestsByTimeType, TokensUsageType, TopAIModelsType } from './ai-observability-llm-summary.type';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Injectable()
export class AiObservabilityLlmSummaryService {

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
    if (dropdownsViewData?.selectedLlmValue) {
      dropdownsViewData?.selectedLlmValue.forEach(val => {
        params = params.append('uuid', val);
      })
    }
    return params;
  }

  getLlmsList(): Observable<LlmListType[]> {
    let params: HttpParams = new HttpParams().set('service_type', 'llm');
    return this.http.get<LlmListType[]>(`customer/observability/service_names/`, { params: params });
  }

  getLlmSummary(dropdownsViewData: DropDownsViewData): Observable<LlmSummaryType> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<LlmSummaryType>(`customer/observability/llm/summary`, { params: params });
  }

  getRequestsByTime(dropdownsViewData: DropDownsViewData): Observable<RequestsByTimeType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<RequestsByTimeType[]>(`customer/observability/llm/requests_per_time`, { params: params });
  }

  getGenerationByCategory(dropdownsViewData: DropDownsViewData): Observable<GenerationByCategoryType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<GenerationByCategoryType[]>(`/customer/observability/llm/generation_by_category/`, { params: params });
  }

  getGenerationByProvider(dropdownsViewData: DropDownsViewData): Observable<GenerationByProviderType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<GenerationByProviderType[]>(`/customer/observability/llm/generation_by_provider/`, { params: params });
  }

  getCostByEnvironment(dropdownsViewData: DropDownsViewData): Observable<CostByEnvironmentType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<CostByEnvironmentType[]>(`/customer/observability/llm/cost_by_environment/`, { params: params });
  }

  getCostByApplication(dropdownsViewData: DropDownsViewData): Observable<CostByApplicationType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<CostByApplicationType[]>(`/customer/observability/llm/cost_by_application/`, { params: params });
  }

  getAvgTokensSummary(dropdownsViewData: DropDownsViewData): Observable<AvgTokensSummaryType> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<AvgTokensSummaryType>(`/customer/observability/llm/avg_tokens_summary/`, { params: params });
  }

  getTokensUsage(dropdownsViewData: DropDownsViewData): Observable<TokensUsageType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<TokensUsageType[]>(`customer/observability/llm/tokens_usage`, { params: params });
  }

  getTopAIModels(dropdownsViewData: DropDownsViewData): Observable<TopAIModelsType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<TopAIModelsType[]>(`/customer/observability/llm/top_models/`, { params: params });
  }

  getModelsByTime(dropdownsViewData: DropDownsViewData): Observable<ModelsByTimeType[]> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData);
    return this.http.get<ModelsByTimeType[]>(`/customer/observability/llm/models_by_time/`, { params: params });
  }

  getChartDateFormate(dropdownsViewData: DropDownsViewData) {
    const diffInSeconds: number = (new Date(dropdownsViewData?.selectedDateRangeFormData?.to).getTime() - new Date(dropdownsViewData?.selectedDateRangeFormData?.from).getTime()) / 1000;
    let isLastTwentyFourHours: boolean = false;
    if (diffInSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    return isLastTwentyFourHours;
  }

  convertToLlmSummaryViewData(data: LlmSummaryType): LlmSummaryWidgetViewData {
    let viewData: LlmSummaryWidgetViewData = new LlmSummaryWidgetViewData();
    if (data.requests) {
      viewData.totalRequest = new LlmSummaryWidgetTotalViewData();
      viewData.totalRequest.currentTotal = data.requests.current_total;
      viewData.totalRequest.changePercent = `${Math.abs(data.requests.change_percent)}%`;
      if (data.requests.change_percent) {
        viewData.totalRequest.changePercentIconClass = data.requests.change_percent > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.totalRequest.changePercentTextClass = data.requests.change_percent > 0 ? 'text-success' : 'text-danger';
      } else {
        viewData.totalRequest.changePercentIconClass = 'fa-caret-up';
        viewData.totalRequest.changePercentTextClass = 'text-success';
      }
    }
    if (data.avg_duration) {
      viewData.avgRequestDuration = new LlmSummaryWidgetAverageViewData();
      viewData.avgRequestDuration.currentAverage = data.avg_duration.current_avg;
      viewData.avgRequestDuration.changePercent = `${Math.abs(data.avg_duration.change_percent)}%`;
      if (data.avg_duration.change_percent) {
        viewData.avgRequestDuration.changePercentIconClass = data.avg_duration.change_percent > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.avgRequestDuration.changePercentTextClass = data.avg_duration.change_percent > 0 ? 'text-success' : 'text-danger';
      } else {
        viewData.avgRequestDuration.changePercentIconClass = 'fa-caret-up';
        viewData.avgRequestDuration.changePercentTextClass = 'text-success';
      }
    }
    if (data.avg_client_tokens) {
      viewData.avgTokensPerRequest = new LlmSummaryWidgetAverageViewData();
      viewData.avgTokensPerRequest.currentAverage = data.avg_client_tokens.current_avg;
      viewData.avgTokensPerRequest.changePercent = `${Math.abs(data.avg_client_tokens.change_percent)}%`;
      if (data.avg_client_tokens.change_percent) {
        viewData.avgTokensPerRequest.changePercentIconClass = data.avg_client_tokens.change_percent > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.avgTokensPerRequest.changePercentTextClass = data.avg_client_tokens.change_percent > 0 ? 'text-success' : 'text-danger';
      } else {
        viewData.avgTokensPerRequest.changePercentIconClass = 'fa-caret-up';
        viewData.avgTokensPerRequest.changePercentTextClass = 'text-success';
      }
    }
    if (data.cost) {
      viewData.totalCost = new LlmSummaryWidgetTotalViewData();
      viewData.totalCost.currentTotal = data.cost.current_total;
      viewData.totalCost.changePercent = `${Math.abs(data.cost.change_percent)}%`;
      if (data.cost.change_percent) {
        viewData.totalCost.changePercentIconClass = data.cost.change_percent > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.totalCost.changePercentTextClass = data.cost.change_percent > 0 ? 'text-success' : 'text-danger';
      } else {
        viewData.totalCost.changePercentIconClass = 'fa-caret-up';
        viewData.totalCost.changePercentTextClass = 'text-success';
      }
    }
    if (data.avg_cost) {
      viewData.avgCostPerRequest = new LlmSummaryWidgetAverageViewData();
      viewData.avgCostPerRequest.currentAverage = data.avg_cost.current_avg;
      viewData.avgCostPerRequest.changePercent = `${Math.abs(data.avg_cost.change_percent)}%`;
      if (data.avg_cost.change_percent) {
        viewData.avgCostPerRequest.changePercentIconClass = data.avg_cost.change_percent > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.avgCostPerRequest.changePercentTextClass = data.avg_cost.change_percent > 0 ? 'text-success' : 'text-danger';
      } else {
        viewData.avgCostPerRequest.changePercentIconClass = 'fa-caret-up';
        viewData.avgCostPerRequest.changePercentTextClass = 'text-success';
      }
    }
    return viewData;
  }

  convertToRequestsByTimeChartData(graphData: RequestsByTimeType[], dropdownsViewData: DropDownsViewData): UnityChartDetails {
    if (!graphData || !graphData.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const xAxisData = [];
    const seriesData = [];
    const isLastTwentyFourHours = this.getChartDateFormate(dropdownsViewData);
    graphData.forEach(d => {
      xAxisData.push(this.utilSvc.toUnityOneDateFormat(d.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      seriesData.push(d.value);
    });
    view.options = {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          rotate: 35
        },
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '30%'],
        minInterval: 1,
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        }
      },
      grid: {
        left: "6%",
        right: "3%",
        bottom: "0%",
        top: "15%",
        containLabel: true
      },
      series: [
        {
          type: 'line',
          smooth: true,
          // markLine: {
          //   symbol: ['none', 'none'],
          //   label: { show: false },
          //   data: [{ xAxis: 1 }]
          // },
          data: seriesData
        }
      ]
    };
    view.options.title = {
      text: 'Requests by Time',
      left: 'left',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.tooltip = {
      trigger: 'axis',
    }
    return view;
  }

  convertToGenerationByCategoryChartData(graphData: GenerationByCategoryType[]): UnityChartDetails {
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
      text: 'Generation By Category',
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

  convertToGenerationByProviderChartData(graphData: CostByApplicationType[]): UnityChartDetails {
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
      text: 'Generation By Provider',
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

  convertToCostByEnvironmentChartData(graphData: CostByEnvironmentType[]): UnityChartDetails {
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
      text: 'Cost By Environment',
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

  convertToCostByApplicationChartData(graphData: CostByApplicationType[]): UnityChartDetails {
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
      text: 'Cost By Application',
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

  convertToAvgTokensSummaryViewData(data: AvgTokensSummaryType): AvgTokensSummaryViewData {
    let viewData: AvgTokensSummaryViewData = new AvgTokensSummaryViewData();
    viewData.AvgPromptTokens = data.avg_prompt_tokens;
    viewData.AvgCompletionTokens = data.avg_completion_tokens;
    return viewData;
  }

  convertToTokensUsageChartData(graphData: TokensUsageType[], dropdownsViewData: DropDownsViewData): UnityChartDetails {
    if (!graphData || !graphData.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    const isLastTwentyFourHours = this.getChartDateFormate(dropdownsViewData);
    const xAxisData: string[] = [];
    const promptTokenSeriesData = [];
    const completionTokensSeriesData = [];
    graphData.forEach(d => {
      xAxisData.push(this.utilSvc.toUnityOneDateFormat(d.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      promptTokenSeriesData.push(d.prompt_tokens);
      completionTokensSeriesData.push(d.completion_tokens);
    });
    view.options = {
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            rotate: 35
          },
          data: xAxisData
        }
      ],
      yAxis: [
        {
          type: 'value',
          minInterval: 1,
          axisLine: {
            show: true
          },
          axisTick: {
            show: true
          }
        }
      ],
      grid: {
        left: "7%",
        right: "3%",
        bottom: "5%",
        top: "15%",
        containLabel: true
      },
      series: [
        {
          name: 'Prompt Tokens',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: promptTokenSeriesData
        },
        {
          name: 'Completion Tokens',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: completionTokensSeriesData
        },
      ]
    };
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    view.options.title = {
      text: 'Tokens Usage',
      left: 'center',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.tooltip = {
      trigger: 'axis',
    };
    return view;
  }

  convertToTopAIModelsChartData(graphData: TopAIModelsType[]): UnityChartDetails {
    if (!graphData || !graphData.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;  // Define chart type as Bar
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const yAxisData: string[] = [];
    const seriesData: number[] = [];
    graphData.forEach(data => {
      yAxisData.push(data.model);
      seriesData.push(data.count);
    })
    view.options = {
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
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
              return graphData[params.dataIndex].model;
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
      text: 'Top Models',
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

  convertToModelsByTimeChartData(graphData: ModelsByTimeType[], dropdownsViewData: DropDownsViewData): UnityChartDetails {
    if (!graphData || !graphData.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    const isLastTwentyFourHours = this.getChartDateFormate(dropdownsViewData);
    const xAxisData: string[] = [];
    const seriesData = [];
    graphData.forEach(data => {
      xAxisData.push(this.utilSvc.toUnityOneDateFormat(data.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));
      const modelStr = data.models.map(m => `${m.model}(${m.count})`).join(',');
      seriesData.push({ value: data.total_models_count, models: modelStr });
    })

    view.options = {
      xAxis: {
        type: 'category',
        axisLabel: {
          rotate: 35
        },
        data: xAxisData
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        }
      },
      grid: {
        left: "9%",
        right: "3%",
        bottom: "0%",
        top: "15%",
        containLabel: true
      },
      series: [
        {
          data: seriesData,
          type: 'bar'
        }
      ]
    }
    view.options.title = {
      text: 'Models by Time',
      left: 'center',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      trigger: 'axis',
      axisPointer: {
        type: "shadow"
      },
      formatter: function (params: any) {
        const modelsList = params[0]?.data?.models?.split(',')?.join('<br/>');
        return `${params[0].name}<br/>Models: ${modelsList}<br/>value: <strong>${params[0].value}</strong>`;
      }
    }
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
  selectedLlmValue: string[] = [];
}

export class LlmSummaryWidgetViewData {
  constructor() { }
  totalRequestLoader: string = 'totalRequestsWidgetLoader';
  avgRequestDurationLoader: string = 'avgRequestDurationsWidgetLoader';
  avgTokensPerRequestLoader: string = 'avgTokensPerRequestsWidgetLoader';
  totalCostLoader: string = 'totalCostsWidgetLoader';
  avgCostPerRequestLoader: string = 'avgCostPerRequestsWidgetLoader';
  totalRequest: LlmSummaryWidgetTotalViewData;
  avgRequestDuration: LlmSummaryWidgetAverageViewData;
  avgTokensPerRequest: LlmSummaryWidgetAverageViewData;
  totalCost: LlmSummaryWidgetTotalViewData;
  avgCostPerRequest: LlmSummaryWidgetAverageViewData;
}

export class LlmSummaryWidgetTotalViewData {
  constructor() { }
  currentTotal: number = 0;
  changePercent: string;
  changePercentIconClass: string;
  changePercentTextClass: string;
}

export class LlmSummaryWidgetAverageViewData {
  constructor() { }
  currentAverage: number = 0;
  changePercent: string;
  changePercentIconClass: string;
  changePercentTextClass: string;
}

export class GenerationByCategoryWidgetViewData {
  loader: string = 'generationByCategoryWidgetLoader';
  chartData: UnityChartDetails;
}

export class GenerationByProviderWidgetViewData {
  loader: string = 'generationByProviderWidgetLoader';
  chartData: UnityChartDetails;
}

export class CostByEnvironmentWidgetViewData {
  loader: string = 'costByEnvironmentWidgetLoader';
  chartData: UnityChartDetails;
}

export class CostByApplicationWidgetViewData {
  loader: string = 'costByApplicationWidgetLoader';
  chartData: UnityChartDetails;
}

export class GenerationByTopAIModelsWidgetViewData {
  loader: string = 'generationByAIModelWidgetLoader';
  chartData: UnityChartDetails;
}

export class AvgPromptTokensWidgetViewData {
  loader: string = 'avgPromptTokensWidgetLoader';
  AvgPromptTokens: number;
}

export class AvgCompletionTokensWidgetViewData {
  loader: string = 'avgCompletionTokensWidgetLoader';
  AvgCompletionTokens: number;
}

export class AvgTokensSummaryViewData {
  AvgPromptTokensLoader: string = 'avgPromptTokensWidgetLoader';
  AvgCompletionTokensLoader: string = 'avgCompletionTokensWidgetLoader';
  AvgPromptTokens: number;
  AvgCompletionTokens: number;
}

export class TokensUsageWidgetViewData {
  loader: string = 'tokensUsagesWidgetLoader';
  chartData: UnityChartDetails;
}

export class RequestsByTimeWidgetData {
  loader: string = 'requestsByTimeWidgetLoader';
  chartData: UnityChartDetails;
}

export class ModelsByTimeWidgetData {
  loader: string = 'modelsbyTimesWidgetLoader';
  chartData: UnityChartDetails;
}