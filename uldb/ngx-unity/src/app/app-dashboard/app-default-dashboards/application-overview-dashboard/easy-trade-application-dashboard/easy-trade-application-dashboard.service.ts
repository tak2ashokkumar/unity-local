import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { AppUtilityService, DateRange, PlatFormMapping, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import * as echarts from 'echarts';
import moment from 'moment';
import { EChartsOption, SeriesOption } from 'echarts';
import { PCFastData } from 'src/app/app-home/infra-as-a-service/private-cloud/pc-fast.type';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { EasyTradeActiveUsersVsEvents, EasyTradeApplicationResponse, EasyTradeConversionRate, EasyTradeErrorRate, EasyTradeFailureRate, EasyTradeKPISByUSD, EasyTradeNewUsersByDateRange, EasyTradeOrdersPlaced, EasyTradeOrderSuccessRate, EasyTradePaymentGatewayLatency, EasyTradeSessionsByDateRange, EasyTradeSessionToOrders, EasyTradeUniqueCustomers } from './easy-trade-application-dashboard.type';


@Injectable()
export class EasyTradeApplicationDashboardService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  // for customer-behavier-widget
  convertDateRangeToApiParamsData(selectedDateRangeFormData: DurationDropdownType): HttpParams {
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

  getSessionToOrderFunnel(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<EasyTradeSessionToOrders>(`/apm/app_list/${appId}/funnels_easy_trade/`, { params: params });
  }

  convertToSessionToOrderFunnelChartData(graphData: EasyTradeSessionToOrders) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.FUNNEL;
    view.options = this.chartConfigSvc.getDefaultFunnelChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.FUNNEL);
    view.options.title = {
      text: 'Sessions to Orders',
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      data: ['Sum of sessions', 'Orders submitted', 'Orders executed'],
      bottom: 0
    }
    view.options.tooltip = {
      trigger: 'item',
      formatter: '{b}: {c}'
    }
    view.options.series = [{
      name: 'Funnel',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '70%',
      min: 0,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 3,
      label: {
        show: true,
        position: 'inside',
        formatter: '{c}',
        color: '#fff'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      data: [
        { value: graphData.sessions, name: 'Sum of sessions', itemStyle: { color: '#03A9F4' } },
        { value: graphData.order_submitted, name: 'Orders submitted', itemStyle: { color: '#FF9800' } },
        { value: graphData.order_executed, name: 'Orders executed', itemStyle: { color: '#3F51B5' } }
      ]
    }]
    return view;
  }

  getSessionsByDateRange(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<EasyTradeSessionsByDateRange>(`/apm/app_list/${appId}/session_easytrade/`, { params: params });
  }

  convertToSessionsByDateRangeChartData(graphData: EasyTradeSessionsByDateRange) {
    if (!graphData || !graphData.sessions || !graphData.sessions.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options.title = {
      text: `Sessions Count by ${this.utilSvc.toTitleCase(graphData.grouping)}`,
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.grid = {
      top: '15%',
      bottom: '15%',
      containLabel: true
    };
    view.options.xAxis = {
      type: "value",
      // splitLine: {
      //   show: true,
      //   lineStyle: {
      //     type: 'dotted', // Dashed or dotted
      //     color: '#ccc'
      //   }
      // },
      axisLabel: {
        formatter: '{value}',
      },
    }
    view.options.yAxis = {
      type: 'category',
      data: graphData.sessions.map(s => s.range),
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
        data: graphData.sessions.map(s => s.total),
        label: {
          show: true,
          position: 'right',
          color: '#000000', // optional: customize label text color
          fontWeight: 400,
        },
        itemStyle: {
          color: '#5D2F77' // all bars same color
        },
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

  getNewUsers(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<EasyTradeNewUsersByDateRange>(`/apm/app_list/${appId}/new_users_easytrade/`, { params: params });
  }

  convertToNewUsersChartData(graphData: EasyTradeNewUsersByDateRange) {
    if (!graphData || !graphData.new_users || !graphData.new_users.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const xAxisData: string[] = graphData.new_users.map(s => s.range);
    const yAxisData: number[] = graphData.new_users.map(s => s.total);

    view.options.title = {
      text: `New Users Count by ${this.utilSvc.toTitleCase(graphData.grouping)}`,
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.grid = {
      top: '15%',
      bottom: '15%',
      containLabel: true
    };
    view.options.xAxis = {
      type: 'category',
      data: xAxisData,
      axisLabel: { interval: 0 }
    }
    view.options.yAxis = {
      type: 'value',
      // data: Object.values(graphData),
      // axisTick: {
      //   show: true
      // },
      // axisLine: {
      //   show: true
      // },
      // axisLabel: {
      //   width: 50,
      //   overflow: 'truncate',
      //   formatter: (value: string) => {
      //     return value;
      //   }
      // },
      tooltip: {
        show: true,
      },
    }
    view.options.series = [
      {
        type: 'bar',
        barMaxWidth: 35,
        data: yAxisData,
        label: {
          show: true,
          position: 'top',
          color: '#000000', // optional: customize label text color
          fontWeight: 400,
        },
        itemStyle: {
          color: '#03A9F4' // all bars same color
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

  // for conversion-sales-funnel widget
  getOrderSuccessRate(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<EasyTradeOrderSuccessRate>(`/apm/app_list/${appId}/order_success_rate_easytrade/`, { params: params });
  }

  convertToOrderSuccessRateChartData(graphData: EasyTradeOrderSuccessRate) {
    if (!graphData || !graphData.order_success_rate || !graphData.order_success_rate.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options.title = {
      text: `Orders Success Rate`,
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.grid = {
      top: '15%',
      bottom: '15%',
      containLabel: true
    };
    view.options.xAxis = {
      type: "value",
      // splitLine: {
      //   show: true,
      //   lineStyle: {
      //     type: 'dotted', // Dashed or dotted
      //     color: '#ccc'
      //   }
      // },
      axisLabel: {
        formatter: '{value}',
      },
    }
    view.options.yAxis = {
      type: 'category',
      data: graphData.order_success_rate.map(s => s.range),
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
        data: graphData.order_success_rate.map(s => s.total),
        label: {
          show: true,
          position: 'right',
          color: '#000000', // optional: customize label text color
          fontWeight: 400,
        },
        itemStyle: {
          color: '#5D2F77' // all bars same color
        },
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

  getConversionRate(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<EasyTradeConversionRate>(`/apm/app_list/${appId}/conversion_rate_easytrade/`, { params: params });
  }

  convertToConversionRateChartData(graphData: EasyTradeConversionRate) {
    if (!graphData || !graphData.conversion_rate || !graphData.conversion_rate.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const xAxisData: string[] = graphData.conversion_rate.map(s => s.range);
    const yAxisData: number[] = graphData.conversion_rate.map(s => s.total);
    view.options.title = {
      text: 'Conversion Rate',
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
      type: 'category',
      data: xAxisData,
      axisLabel: { interval: 0 }
    }
    view.options.yAxis = {
      type: 'value',
      // data: Object.values(graphData),
      // axisTick: {
      //   show: true
      // },
      // axisLine: {
      //   show: true
      // },
      // axisLabel: {
      //   width: 50,
      //   overflow: 'truncate',
      //   formatter: (value: string) => {
      //     return value;
      //   }
      // },
      tooltip: {
        show: true,
      },
    }
    view.options.series = [
      {
        type: 'bar',
        barMaxWidth: 35,
        data: yAxisData,
        label: {
          show: true,
          position: 'top',
          color: '#000000', // optional: customize label text color
          fontWeight: 400,
          formatter: '{c}%'
        },
        itemStyle: {
          color: '#03A9F4' // all bars same color
        },
      }
    ];
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: function (params: any) {
        return `${params[0].name} : <strong>${params[0].value}%</strong>`;
      }
    }
    view.options.legend = { show: false }
    return view;
  }

  getOrderPlced(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<EasyTradeOrdersPlaced>(`/apm/app_list/${appId}/order_placed_easytrade/`, { params: params });
  }

  convertToOrderPlcedChartData(graphData: EasyTradeOrdersPlaced) {
    if (!graphData || !graphData.order_placed || !graphData.order_placed.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const xAxisData: string[] = graphData.order_placed.map(s => s.range);
    const yAxisData: number[] = graphData.order_placed.map(s => s.total);
    view.options.title = {
      text: 'Orders Placed',
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
      type: 'category',
      data: xAxisData,
      axisLabel: { interval: 0 }
    }
    view.options.yAxis = {
      type: 'value',
      // data: Object.values(graphData),
      // axisTick: {
      //   show: true
      // },
      // axisLine: {
      //   show: true
      // },
      // axisLabel: {
      //   width: 50,
      //   overflow: 'truncate',
      //   formatter: (value: string) => {
      //     return value;
      //   }
      // },
      tooltip: {
        show: true,
      },
    }
    view.options.series = [
      {
        type: 'bar',
        barMaxWidth: 35,
        data: yAxisData,
        label: {
          show: true,
          position: 'top',
          color: '#000000', // optional: customize label text color
          fontWeight: 400,
        },
        itemStyle: {
          color: '#5D2F77' // all bars same color
        },
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

  getActiveUsersVsEvents(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<EasyTradeActiveUsersVsEvents>(`/apm/app_list/${appId}/active_users_vs_events_easytrade/`, { params: params });
  }

  convertToActiveUsersVsEventsChartdata(graphData: EasyTradeActiveUsersVsEvents): UnityChartDetails {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const periods = graphData?.active_users.map(item => item.period);
    const activeUsersData = graphData?.active_users.map(item => item.sum);
    const eventsData = graphData?.events.map(item => item.sum);

    view.options = {
      title: {
        text: 'Active Users vs Events',
        left: 'center',
        top: '0%',
        textStyle: {
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 16,
          fontWeight: 400,
          color: '#000000',
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Active Users', 'Events'],
        bottom: 10
      },
      xAxis: {
        type: 'category',
        data: periods,
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Active Users',
          type: 'bar',
          stack: 'total',
          data: activeUsersData,
          barMaxWidth: 35,
          itemStyle: {
            color: '#39bdfaff'
          }
        },
        {
          name: 'Events',
          type: 'bar',
          stack: 'total',
          data: eventsData,
          barMaxWidth: 35,
          itemStyle: {
            color: '#f9b248ff'
          }
        }
      ]
    };
    return view;
  }

  // for traffic-engagement-kpis 
  getSumOfOrdersSubmittedData(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/sum_orders_submitted_easytrade/`, { params: params });
  }

  convertToSumOfOrdersSubmittedChartData(graphData: { [key: string]: string }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.title = {
      text: 'Sum of orders submitted',
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

  getSumOfOrdersExecutedByRegion(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/sum_orders_executed_region_easytrade/`, { params: params });
  }

  convertToTSumOfOrdersExecutedByRegionChartData(graphData: { [key: string]: string }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.title = {
      text: 'Sum of Orders executed by Region',
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 400,
        color: '#000000'
      }
    };
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
    return view;
  }

  getUniqueVisitors(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.convertDateRangeToApiParamsData(selectedDateRangeFormData);
    return this.http.get<EasyTradeUniqueCustomers>(`/apm/app_list/${appId}/unique_customers_easytrade/`, { params: params });
  }

  convertToUniqueVisitorsChartData(graphData: EasyTradeUniqueCustomers) {
    if (!graphData || !graphData.unique_customers || !graphData.unique_customers.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    // data.sort((a, b) => Number(a.value) - Number(b.value));

    const labels = graphData?.unique_customers?.map(d => d.range);
    const values = graphData?.unique_customers?.map(d => d.total);

    view.options = this.getCommonLineChartOptionsForUniqueVisitors(view.options, labels, values, "Users - Unique Visitors (Estimated)");
    return view;
  }

  getCommonLineChartOptionsForUniqueVisitors(options: EChartsOption, data: any[], values: any[], title?: string): EChartsOption {
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

  // for performance-reliability-kpis
  getApplicationResponseTimeChartData(appId: number, from: string, to: string): Observable<EasyTradeApplicationResponse> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'avg_response_time').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<EasyTradeApplicationResponse>(`/apm/app_list/${appId}/application_resp_easytrade/`, { params: params })
  }

  convertApplicationResponseTimeChartData(data: EasyTradeApplicationResponse): UnityChartDetails {
    if (!data || !data.application_resp || !data.application_resp.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    // data.sort((a, b) => Number(a.value) - Number(b.value));

    const labels = data.application_resp.map(d => d.range);
    const values = data.application_resp.map(d => d.total);

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

  getErrorRateData(appId: number, from: string, to: string): Observable<EasyTradeErrorRate> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'error_rate').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<EasyTradeErrorRate>(`/apm/app_list/${appId}/error_rate_easytrade/`, { params: params })
  }

  convertErrorRateChartData(data: EasyTradeErrorRate): UnityChartDetails {
    if (!data || !data.error_rate || !data.error_rate.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    // data.sort((a, b) => Number(a.value) - Number(b.value));    
    const labels = data.error_rate.map(d => d.range);
    const values = data.error_rate.map(d => d.total);

    view.options = this.getCommonLineChartOptions(view.options, labels, values, "Error Rate (% of Failed Interactions)", "Error Rate (%)")

    return view;
  }

  getPaymentFailureData(appId: number, from: string, to: string): Observable<EasyTradeFailureRate> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'payment_failure_rate').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<EasyTradeFailureRate>(`/apm/app_list/${appId}/failure_rate_easytrade/`, { params: params })
  }

  convertPyamentFailureChartData(data: EasyTradeFailureRate): UnityChartDetails {
    if (!data || !data.failure_rate || !data.failure_rate.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const labels = data.failure_rate.map(d => d.range);
    const values = data.failure_rate.map(d => d.total);

    view.options = this.getCommonLineChartOptions(view.options, labels, values, "Payment Failure Rate (%)", "Failure Rate (%)")

    return view;
  }

  getPayemntGatewayLatencyData(appId: number, from: string, to: string): Observable<EasyTradePaymentGatewayLatency> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'payment_gateway_latency').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<EasyTradePaymentGatewayLatency>(`/apm/app_list/${appId}/latency_easytrade/`, { params: params })
  }

  convertPayemntGatewayLatencyChartData(data: EasyTradePaymentGatewayLatency): UnityChartDetails {
    if (!data || !data.latency || !data.latency.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const labels = data.latency.map(d => d.range);
    const values = data.latency.map(d => d.total);

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

  // for revenue-customer-value

  getRevenueByMarketingSourceData(appId: number, from: string, to: string): Observable<{ [key: string]: string }> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/revenue_by_marketsource_easytrade/`, { params: params })
  }

  convertRevenueByMarketingSourceChartData(data: { [key: string]: string }): UnityChartDetails {
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

    console.log('gData : ', gData);
    view.options = this.getCommonPieChartOptions(view.options, data, "Revenue By Market Source", "revenue source");

    return view;
  }

  getRevenueByRegionData(appId: number, from: string, to: string): Observable<{ [key: string]: string }> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/revenue_by_region_easytrade/`, { params: params })
  }

  convertRevenueByRegionChartData(data: { [key: string]: string }): UnityChartDetails {
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
    view.options = this.getCommonPieChartOptions(view.options, data, "Revenue By Region", 'Revenue by Region');

    return view;
  }

  getCommonPieChartOptions(options: EChartsOption, data: { [key: string]: string }, title?: string, chartName?: string): EChartsOption {

    // options.series[0].name = chartName;
    // options.series[0].data = data;
    // options.series[0].radius = '40%';
    // options.series[0].center = ['50%', '48%'];

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

    options.series = [
      {
        name: chartName,
        type: 'pie',
        radius: '50%',
        center: ['50%', '45%'],
        data: Object.entries(data).map(([key, value]) => ({
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
    ]
    // options.series[0].label = {
    //   ...options.series[0].label,
    //   formatter: function (params) {
    //     return params.value + ' ms'
    //   }
    // };

    // options.tooltip = {
    //   ...options.tooltip,
    //   formatter: '{b}: ${c} ({d}%)',
    // }

    // options.grid = {
    //   top: '20%',
    //   left: '10%',
    //   right: '10%',
    //   bottom: '20%',
    //   containLabel: true
    // }

    return options;

  }

  getKPIsByUSDChartData(appId: number, from: string, to: string): Observable<EasyTradeKPISByUSD> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<EasyTradeKPISByUSD>(`/apm/app_list/${appId}/kpis_usd_easytrade/`, { params: params })
  }

  convertToKPIsByUSDChartData(data: EasyTradeKPISByUSD): UnityChartDetails {
    if (!data || !data.order_placed || !data.order_placed.length) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const periods = data.order_placed.map(item => item.range);
    const revenueUsdData = data.order_placed.map(item => item.total);

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
        // {
        //   name: 'Revenue 24h MA',
        //   type: 'line',
        //   stack: 'Total',
        //   data: revenue24hMaData,
        // }
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

  // for services overview
  getServiceOverviewData(criteria: SearchCriteria, appId: number): Observable<AppResultsResponse> {
    return this.tableService.getData<AppResultsResponse>(`/apm/monitoring/applist/?app_id=${appId}`, criteria);
  }

  convertToServiceViewData(data: AppResult[]): ServiceViewData[] {
    let viewData: ServiceViewData[] = [];
    data.map(s => {
      let a: ServiceViewData = new ServiceViewData();
      a.name = s.name;
      a.throughput = s.throughput ? s.throughput : 'N/A';
      a.parentAppAvailability = s.parent_app_availability ? s.parent_app_availability : 'N/A';
      a.parentAppStatusCode = s.parent_app_status_code;
      if (s.parent_app_status_code == "1") {
        a.icon = 'fa fa-check-circle text-success';
        a.tooltipMessage = 'Up';
      }
      else if (s.parent_app_status_code == "-1" || !s.parent_app_status_code) {
        a.icon = 'fa fa-exclamation-circle text-warning';
        a.tooltipMessage = 'Unknown';
      } else {
        a.icon = 'fa fa-triangle text-danger fa-exclamation';
        a.tooltipMessage = 'Down';
      }
      a.latency = s.latency ? s.latency : 'N/A';
      a.status = s.parent_app_status_code;

      viewData.push(a);
    });
    return viewData;
  }

  // for component overview
  getResponseTimeData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params: params });
  }

  converteDropdownsDataToApiParamsData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): HttpParams {
    let params: HttpParams = new HttpParams();
    // append app_ids

    if (selectedApps) {
      params = params.append('app_id', selectedApps.toString());
    }
    params = params.set('key', key);
    params = params.set('type', type);
    const format = new DateRange().format;
    const from = dropdownsViewData?.from;
    const to = dropdownsViewData?.to;
    if (from) {
      params = params.set('from', moment(from).format(format));
    }
    if (to) {
      params = params.set('to', moment(to).format(format));
    }
    return params;
  }

  convertToComponentDoughnutChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, type?: string) {
    if (!apps) {
      return null;
    }

    // const appData = apps.find((app: any) => app.data);  // Find the first app with data
    // if (!appData) {
    //   return null;
    // }

    const upCount = apps.find((item: any) => item.hasOwnProperty('up_count'))?.up_count || 0;
    const downCount = apps.find((item: any) => item.hasOwnProperty('down_count'))?.down_count || 0;
    const unknownCount = apps.find((item: any) => item.hasOwnProperty('unknown_count'))?.unknown_count || 0;

    // Calculate the total combined count
    const totalCount = upCount + downCount + unknownCount;

    // Return doughnut chart view data
    return this.convertToHalfDoughnutChartViewData(upCount, downCount, unknownCount, totalCount);
  }

  convertToHalfDoughnutChartViewData(upCount: number, downCount: number, unknownCount: number, totalCount: number) {
    let view: UnityChartDetails = new UnityChartDetails();

    const total = upCount + downCount + unknownCount;

    const hasData = total > 0;

    // For tooltip: skip dummy or empty slices
    const tooltipFormatter = (params: any) => {
      if (!params.name) return '';
      return `${params.name}: ${params.value} (${params.percent}%)`;
    };

    const dataSeries = hasData
      ? [
        { value: upCount, name: 'Up', itemStyle: { color: '#28a745' } },
        { value: downCount, name: 'Down', itemStyle: { color: '#007bff' } },
        { value: unknownCount, name: 'Unknown', itemStyle: { color: '#ffc107' } },
        { value: total, name: '', itemStyle: { color: 'transparent' } } // dummy slice
      ]
      : [
        { value: 1, name: '', itemStyle: { color: '#e0e0e0' } } // empty gray semicircle
      ];

    view.options = {
      title: [
        {
          text: 'Component Health',
          left: 'center',
          top: '5%',
          textStyle: { fontSize: 16, fontWeight: 'bold' },
        },
        {
          text: totalCount.toString(),
          subtext: 'Total Count',
          left: 'center',
          top: '60%',
          textStyle: { fontSize: 20, fontWeight: 'bold' },
          subtextStyle: { fontSize: 12 }
        }],
      tooltip: { trigger: 'item', formatter: tooltipFormatter },
      legend: {
        orient: 'vertical',
        left: 'right',
        top: 'middle',
        data: ['Up', 'Down', 'Unknown'],
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 14 }
      },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['50%', '70%'],
          startAngle: 180,
          avoidLabelOverlap: false,
          label: { show: false },
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
          data: dataSeries
        }
      ]
    };

    return view;
  }

  convertToComponentChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, graphName: string, type?: string) {
    if (!apps) {
      return null;
    }

    const allServices = apps.flatMap(app => app.services || []);
    if (!allServices.length) {
      return null;
    }

    // Use the first service to build X-axis (assuming ranges are consistent)
    const xAxisData: string[] = allServices[0].data.map(d => d.range);

    // Service names
    const names: string[] = allServices.map(s => s.service);

    // Color palette (rotate if more than palette size)
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);

    // Values: each service’s averages
    const values: number[][] = allServices.map(s =>
      s.data.map(d => d.average)
    );

    // Build a single chart
    if (type == 'line') {
      return this.convertToAreaChartViewData(
        xAxisData,
        yAxisLabelName,
        values,
        names,
        colors,
        true,
        graphName,
      );
    } else if (type == 'bar') {
      return this.convertToBarChartViewData(
        xAxisData,
        yAxisLabelName,
        xAxisLabelName,
        values,
        names,
        colors,
      );
    }
  }

  convertToAreaChartViewData(xAxisData: string[], yAxisLabelName: string, values: number[][], names: string[], colors: string[], smoothLines: boolean, graphName: string) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.options = this.getLineChartOptions(xAxisData);

    if (names?.length && values?.length) {
      view.options.series = names.map((name, index) => ({
        name,
        type: 'line',
        data: values[index],
        smooth: smoothLines,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: colors[index],
          shadowColor: colors[index],
          shadowBlur: 8
        },
        areaStyle: {
          color: colors[index],
          opacity: 0.35
        },
        lineStyle: {
          width: 2,
          color: colors[index]
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 12,
            shadowColor: colors[index]
          }
        }
      }));

      view.options.legend = {
        type: 'scroll',
        data: names,
        bottom: 0,
        orient: 'horizontal',
        pageIconSize: 10,
        pageTextStyle: {
          color: '#999'
        },
        textStyle: {
          fontSize: 12
        }
      };

    }

    // X-axis (same as line chart)
    view.options.xAxis = {
      type: 'category',
      data: xAxisData,
      name: 'Time',
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    };

    // Y-axis (same as line chart)
    view.options.yAxis = {
      type: 'value',
      name: yAxisLabelName,
      nameLocation: 'middle',
      nameGap: 50,
      min: 0,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    };

    // Title (same as line chart)
    view.options.title = {
      text: graphName ? graphName : (yAxisLabelName ? `${yAxisLabelName} vs Time` : ''),
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    };

    // Grid (same as line chart)
    view.options.grid = {
      left: yAxisLabelName ? 60 : 20,
      right: 20,
      bottom: names.length ? 50 : 20,
      top: 80,
      containLabel: true
    };

    return view;
  }

  convertToBarChartViewData(xAxisData: string[], yAxisLabelName: string, xAxisLabelName: string, values: number[][], names: string[], colors?: string[], max?: number) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;

    view.options = {
      title: {
        text: `${yAxisLabelName} vs Time`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: names,
        bottom: 0
      },
      grid: {
        top: 60,   // give space for title
        left: 50,
        right: 30,
        bottom: 50
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        name: xAxisLabelName,
        nameLocation: 'middle',
        nameGap: 50
      },
      yAxis: {
        type: 'value',
        name: yAxisLabelName,
        nameLocation: 'middle',
        nameGap: 50,
        min: 0,
        max: max ?? null
      },
      series: names.map((name, idx) => ({
        name,
        type: 'bar',
        data: values[idx],
        itemStyle: {
          color: colors?.[idx] ?? undefined
        },
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'top', // show above each bar
          color: '#000',   // optional: set label color
          formatter: (params: any) => params.value === 0 ? '' : params.value
        }
      }))
    };

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
        bottom: 0,
        containLabel: true
      },
      series: [],
      legend: {}
    }
  }

  getAvailabilityData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params: params });
  }

  getThroughputData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params: params });
  }

  convertToApplicationChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, graphName: string) {
    if (!apps) {
      return null;
    }

    const allServices = apps.flatMap(app => app.services || []);
    if (!allServices.length) {
      return null;
    }

    // Use the first service to build X-axis (assuming ranges are consistent)
    const xAxisData: string[] = allServices[0].data.map(d => d.range);

    // Service names
    const names: string[] = allServices.map(s => s.service);

    // Color palette (rotate if more than palette size)
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);

    // Values: each service’s averages
    const values: number[][] = allServices.map(s =>
      s.data.map(d => d.average)
    );

    // Build a single chart
    return this.convertToLineChartViewData(
      graphName,
      xAxisData,
      yAxisLabelName,
      xAxisLabelName,
      values,
      names,
      colors,
    );
  }

  convertToLineChartViewData(graphName: string, xAxisData: string[], yAxisLabelName: string, xAxisLabelName: string, values?: number[][], names?: string[], colors?: string[], smooth?: string, enableGlow?: boolean) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    // view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    view.options = this.getLineChartOptions(xAxisData);
    if (names?.length && values?.length) {
      view.options.series = [];
      let chartSeries: SeriesOption[] = [];
      names.forEach((name, index) => {
        const data: SeriesOption = {
          name: name,
          color: colors[index],
          type: 'line',
          data: values[index],
          smooth: smooth == 'smooth',
          lineStyle: { width: 2 },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            borderWidth: 0,
          },
          emphasis: enableGlow
            ? {
              scale: true,
              itemStyle: {
                shadowBlur: 15,
                shadowColor: colors[index],
                color: colors[index]
              }
            }
            : undefined,
        }
        chartSeries.push(data);
      });
      view.options.series = chartSeries;
      view.options.legend = {
        type: 'scroll',
        data: names,
        bottom: 0,
        orient: 'horizontal',
        pageIconSize: 10,
        pageTextStyle: {
          color: '#999'
        },
        textStyle: {
          fontSize: 12
        }
      };

    }
    view.options = {
      ...view.options,
      title: {
        text: graphName ? graphName : (yAxisLabelName ? `${yAxisLabelName} vs Time` : ''),
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      }
    };
    view.options.xAxis = {
      ...view.options.xAxis,
      type: 'category',
      data: xAxisData,
      name: xAxisLabelName,
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    }
    view.options.yAxis = {
      ...view.options.yAxis,
      type: 'value',
      name: yAxisLabelName,
      nameLocation: 'middle',
      nameGap: 50,
      min: 0,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    };
    view.options.grid = {
      left: yAxisLabelName ? 60 : 20,
      right: 20,
      bottom: names.length ? 50 : 20,
      top: 80,
      containLabel: true
    };
    // max && (view.options.yAxis = { ...view.options.yAxis, min: 0, max: 100 });
    return view;
  }

  getLatencyData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params: params });
  }

  getHostOverview(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsForHostData(dropdownsViewData, selectedApps, key);
    return this.http.get<any>(`apm/business_summary/graph/`, { params: params });
  }

  converteDropdownsDataToApiParamsForHostData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string): HttpParams {
    let params: HttpParams = new HttpParams();
    // append app_ids
    if (selectedApps) {
      params = params.append('app_id', selectedApps.toString());
    }
    params = params.set('graph_type', key);
    const format = new DateRange().format;
    const from = dropdownsViewData?.from;
    const to = dropdownsViewData?.to;
    if (from) {
      params = params.set('from', moment(from).format(format));
    }
    if (to) {
      params = params.set('to', moment(to).format(format));
    }
    return params;
  }

  convertToCpuUtilizationChartViewData(
    devicesArray: any[],
    yAxisLabelName: string,
    xAxisLabelName: string,
    graphName: string
  ) {
    if (!devicesArray || !devicesArray.length) {
      return null;
    }

    // Flatten devices (array of objects → one array of device objects)
    const allDevices = devicesArray.flatMap(deviceGroup =>
      Object.entries(deviceGroup).map(([name, details]) => {
        const deviceDetails = details as any;
        return {
          name,
          ...deviceDetails
        };
      })
    );

    if (!allDevices.length) {
      return null;
    }

    // Use first device to build X-axis (assuming consistent ranges)
    const xAxisData: string[] = allDevices[0].data.map(d => d.range);

    // Device names
    const names: string[] = allDevices.map(d => d.name);

    // Colors (rotating palette)
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);

    // Values: each device’s averages
    const values: number[][] = allDevices.map(d =>
      d.data.map((point: any) => point.average)
    );

    // Build area chart
    return this.convertToAreaChartViewData(
      xAxisData,
      yAxisLabelName,
      values,
      names,
      colors,
      true,
      graphName
    );
  }

  getCloudList(appId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('app_id', appId);

    // if (appIdList && appIdList.length) {
    //   appIdList.forEach(id => {

    //   });
    // }

    return this.http.get('/apm/business_summary/cloud_list/', { params });
  }

  getCloudDetails(uuid: string): Observable<any> {
    return this.http.get(`/customer/private_cloud/${uuid}/widget_data/`);
  }

  getAllCloudDetails(uuids: string[]): Observable<any[]> {
    if (!uuids || !uuids.length) {
      return of([]);
    }
    const requests = uuids.map(uuid => this.getCloudDetails(uuid));
    return forkJoin(requests); // run in parallel, emit all results together
  }

  convertToPCFastData(clouds: PrivateCLoudFast[]): PCFastData[] {
    let viewData: PCFastData[] = [];
    clouds.map((cloud: PrivateCLoudFast) => {
      if (cloud.platform_type != PlatFormMapping.CUSTOM &&
        cloud.platform_type != ServerSidePlatFormMapping.HYPER_V) {
        let a: PCFastData = new PCFastData();
        a.id = cloud.id;
        a.name = cloud.name;
        a.uuid = cloud.uuid;
        a.platfromType = cloud.platform_type;
        a.displayPlatformType = cloud.display_platform;
        a.vms = cloud.vms;
        a.datacenter = cloud.colocation_cloud;
        a.drillDownLink = `/unitycloud/pccloud/${cloud.uuid}/summary`;
        a.status = this.utilSvc.getDeviceStatus(cloud.status);
        viewData.push(a);
      }
    })
    return viewData;
  }

  // for critical-alerts
  getAlertsData(criteria: SearchCriteria, appId: number): Observable<PaginatedResult<AlertData>> {
    return this.tableService.getData<PaginatedResult<AlertData>>(`apm/business_summary/top_business_events/?app_id=${appId}`, criteria);
  }

  convertToCriticalAlertsData(data: AlertData[]): AlertViewData[] {
    let viewData: AlertViewData[] = [];
    data.map(s => {
      let a: AlertViewData = new AlertViewData();
      a.id = s.id;
      a.deviceName = s.device_name;
      a.description = s.description;
      a.source = s.source;
      a.isAck = s.is_ack ? 'Yes' : 'No';
      if (s.status == 1) {
        a.icon = 'fa fa-check-circle text-success';
        a.tooltipMessage = 'Up';
      }
      else if (s.status == -1 || !s.status) {
        a.icon = 'fa fa-exclamation-circle text-warning';
        a.tooltipMessage = 'Unknown';
      } else {
        a.icon = 'fa fa-exclamation-triangle text-danger';
        a.tooltipMessage = 'Down';
      }
      // a.status = s.status;

      viewData.push(a);
    });
    return viewData;
  }

}

// custom-behaviour-insights-widget type
export class SessionToOrderFunnelWidgetViewData {
  loader: string = 'sessionToOrderFunnelWidgetLoader';
  chartData: UnityChartDetails;
}

export class ReturningCustomerCategoryWidgetViewData {
  loader: string = 'returningCustomerCategoryWidgetLoader';
  chartData: UnityChartDetails;
}

export class NewCustomersWidgetViewData {
  loader: string = 'newCustomersWidgetLoader';
  chartData: UnityChartDetails;
}

export interface DurationDropdownType {
  period: string;
  from: string;
  to: string;
}

// conversion-sales-funnel widget type
export class CheckoutAbondanRateWidgetViewData {
  loader: string = 'checkoutAbondanRateWidgetLoader';
  chartData: UnityChartDetails;
}

export class ConversionRateWidgetViewData {
  loader: string = 'conversionRateWidgetLoader';
  chartData: UnityChartDetails;
}

export class OrderPlcedWidgetViewData {
  loader: string = 'orderPlcedWidgetLoader';
  chartData: UnityChartDetails;
}

export class NewVsReturningCustomersWidgetViewData {
  loader: string = 'newVsReturningCustomersWidgetLoader';
  chartData: UnityChartDetails;
}

// traffic-engagement-kpis types
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

// for revenue-customer-value-kpis
export interface OperationalAnomalyType {
  grouping: string;
  revenue_usd: RevenueItem[];
  revenue_24h_ma: RevenueItem[];
}
interface RevenueItem {
  sum: number;
  period: string;
}

// services-overview widget types

export interface AppResult {
  id: number;
  name: string;
  uuid: string;
  hostname: string;
  latency: string;
  throughput: string;
  device_id: number;
  content_type: number;
  parent_app: number;
  customer: number;
  type_of_app: string;
  parent_app_availability: string | null;
  parent_app_status_code: string;
}

export interface AppResultsResponse {
  count: number;
  next: string;
  previous: string;
  results: AppResult[];
  avg_throughput: string;
  avg_latency: string;
  avg_availability: string;
}

export class ServiceViewData {
  constructor() { };
  id: number;
  name: string;
  uuid: string;
  hostname: string;
  latency: string;
  throughput: string;
  deviceId: number;
  contentType: number;
  parentApp: number;
  customer: number;
  typeOfApp: string;
  parentAppAvailability: string | null;
  parentAppStatusCode: string;
  icon: string;
  tooltipMessage: string;
  status: string;
}

// components-overview-widget types
export class ComponentsOverviewViewData {
  constructor() { }
  healthLoader: string = 'componentsOverviewThroughputLoader';
  durationLoader: string = 'componentsOverviewDurationLoader';
  responseTimeLoader: string = 'componentsOverviewResponseTimeLoader';
  healthAvg: string;
  durationAvg: string;
  responseTimeAvg: string;
  healthChartData: UnityChartDetails;
  durationChartData: UnityChartDetails;
  responseTimeChartData: UnityChartDetails;
}

export class DropDownsViewData {
  constructor() { }
  selectedDateRangeFormData: DurationDropdownType;
}

export class ProcessOverviewViewData {
  constructor() { }
  throughputLoader: string = 'processOverviewThroughputLoader';
  availabilityLoader: string = 'processOverviewAvailabilityLoader';
  responseTimeLoader: string = 'processOverviewResponseTimeLoader';
  throughputAvg: string;
  availabilityAvg: string;
  responseTimeAvg: string;
  throughputChartData: UnityChartDetails;
  availabilityChartData: UnityChartDetails;
  responseTimeChartData: UnityChartDetails;
}

export class DatabaseOverviewViewData {
  constructor() { }
  latencyLoader: string = 'databaseOverviewLatencyLoader';
  latencyAvg: string;
  latencyChartData: UnityChartDetails;
  responseTimeLoader: string = 'databaseOverviewResponseTimeLoader';
  responseTimeAvg: string;
  responseTimeChartData: UnityChartDetails;
  availabilityLoader: string = 'databaseOverviewAvailabilityLoader';
  availabilityAvg: string;
  availabilityChartData: UnityChartDetails;
}

export class HostOverviewViewData {
  constructor() { }
  cpuUtilizationLoader: string = 'databaseOverviewcpuUtilizationLoader';
  memoryUsageLoader: string = 'databaseOverviewmemoryUsageLoader';
  diskInputOutputTimeLoader: string = 'databaseOverviewdiskInputOutputTimeLoader';
  systemLoadTimeLoader: string = 'databaseOverviewsystemLoadTimeLoader';
  cpuUtilizationAvg: string;
  memoryUsageAvg: string;
  diskInputOutputTimeAvg: string;
  systemLoadTimeAvg: string;
  cpuUtilizationChartData: UnityChartDetails;
  memoryUsageChartData: UnityChartDetails;
  diskInputOutputTimeChartData: UnityChartDetails;
  systemLoadTimeChartData: UnityChartDetails;
}

// critical-alert-widgets types
interface AlertData {
  event_type: string;
  affected_component: string | null;
  is_ack: boolean;
  device_type: string;
  ack_by: string | null;
  source_account_name: string;
  recovered_datetime: string | null;
  supressRule: any[]; // Array of rules, type can be refined if needed
  id: number;
  event_datetime: string;
  category: string;
  ack_time: string | null;
  uuid: string;
  source: number;
  event_id: string;
  affected_component_type: string | null;
  executed_at: string | null;
  environment: string | null;
  application: number;
  ack_comment: string | null;
  device_id: number;
  anomaly: boolean;
  status: number;
  description: string;
  event_metric: any | null;
  trigger_id: string | null;
  operational_data: any | null;
  supress: boolean;
  content_type: number;
  ip_address: string;
  severity: number;
  customer: number;
  affected_component_name: string | null;
  device_name: string;
  category_meta: any | null;
  custom_data: any | null;
  application_name: string;
}

export class AlertViewData {
  constructor() { };
  eventType: string;
  affectedComponent: string | null;
  isAck: string;
  deviceType: string;
  ackBy: string | null;
  sourceAccountName: string;
  recoveredDatetime: string | null;
  supressRule: any[]; // Array of rules, you can replace `any` with a more specific type if needed
  id: number;
  eventDatetime: string;
  category: string;
  ackTime: string | null;
  uuid: string;
  source: number;
  eventId: string;
  affectedComponentType: string | null;
  executedAt: string | null;
  environment: string | null;
  application: number;
  ackComment: string | null;
  deviceId: number;
  anomaly: boolean;
  status: number;
  description: string;
  eventMetric: any | null; // Replace with a more specific type if needed
  triggerId: string | null;
  operationalData: any | null; // Replace with a more specific type if needed
  supress: boolean;
  contentType: number;
  ipAddress: string;
  severity: number;
  customer: number;
  affectedComponentName: string | null;
  deviceName: string;
  categoryMeta: any | null; // Replace with a more specific type if needed
  customData: any | null; // Replace with a more specific type if needed
  applicationName: string;
  icon: string;
  tooltipMessage: string;
}

