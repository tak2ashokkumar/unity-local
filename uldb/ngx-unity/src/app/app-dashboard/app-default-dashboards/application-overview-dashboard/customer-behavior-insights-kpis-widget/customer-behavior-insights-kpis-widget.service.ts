import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { DateRange } from '../../iot-devices-summary-dashboard/iot-devices-summary-dashboard.service';
import moment from 'moment';

@Injectable()
export class CustomerBehaviorInsightsKpisWidgetService {

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

  getSessionToOrderFunnel(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: number }>(`/apm/app_list/${appId}/funnels/`, { params: params });
  }

  getReturningCustomerCategory(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: number }>(`/apm/app_list/${appId}/returning_customers/`, { params: params });
  }

  getNewCustomers(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: number }>(`/apm/app_list/${appId}/new_customers_monthly/`, { params: params });
  }

  convertToSessionToOrderFunnelChartData(graphData: { [key: string]: number }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.FUNNEL;
    view.options = this.chartConfigSvc.getDefaultFunnelChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.FUNNEL);
    view.options.title = {
      text: 'Session to Order Funnel',
      left: 'center',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.legend = {
      data: ['Sum of sessions', 'Sum of carts', 'Sum of orders'],
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
        { value: graphData.carts, name: 'Sum of carts', itemStyle: { color: '#FF9800' } },
        { value: graphData.orders, name: 'Sum of orders', itemStyle: { color: '#3F51B5' } }
      ]
    }]
    return view;
  }

  convertToReturningCustomerCategoryChartData(graphData: { [key: string]: number }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options.title = {
      text: 'Returning Customers Category Wise',
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
      data: Object.keys(graphData),
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
        data: Object.values(graphData),
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

  convertToNewCustomersChartData(graphData: { [key: string]: any }) {
    if (graphData?.new_customers?.length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const xxisData: string[] = [];
    const yxisData: number[] = [];
    graphData?.new_customers?.forEach(d => xxisData.push(d.range));
    graphData?.new_customers?.forEach(d => yxisData.push(d.total));

    view.options.title = {
      text: 'New Customers',
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
      data: xxisData,
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
        data: yxisData,
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

}

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