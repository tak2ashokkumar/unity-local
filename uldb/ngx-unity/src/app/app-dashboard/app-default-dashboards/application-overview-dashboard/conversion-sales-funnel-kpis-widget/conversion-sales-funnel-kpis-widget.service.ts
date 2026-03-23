import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { DateRange } from '../../iot-devices-summary-dashboard/iot-devices-summary-dashboard.service';
import moment from 'moment';
import { UNITY_FONT_FAMILY } from 'src/app/app-constants';
import { of } from 'rxjs';

@Injectable()
export class ConversionSalesFunnelKpisWidgetService {

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

  getCheckoutAbondanRate(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/checkout_abandon_rate/`, { params: params });
  }

  getConversionRate(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<any>(`/apm/app_list/${appId}/conversion_rate_monthly/`, { params: params });
  }

  getOrderPlced(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<any>(`/apm/app_list/${appId}/orders_placed_by_month/`, { params: params });
  }

  getNewVsReturningCustomers(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<any>(`/apm/app_list/${appId}/new_vs_returning_customers/`, { params: params });
  }

  convertToCheckoutAbondanRateChartData(graphData: { [key: string]: string }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const yAxisData = Object.keys(graphData);
    const xAxisData = Object.values(graphData).map(val => parseFloat(val));
    view.options.title = {
      text: 'Checkout Abondan Rate',
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
      min: 0,        // start from 0
      max: 100,      // end at 100
      axisLabel: {
        formatter: '{value}%' // show % on x-axis labels
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
          show: true,
          position: 'right',
          color: '#000000', // optional: customize label text color
          fontWeight: 400,
          formatter: '{c}%',
        },
        itemStyle: {
          color: '#0f5359ff',
        },
        barCategoryGap: '40%'
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

  convertToConversionRateChartData(graphData: { [key: string]: string }) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const xAxisData = Object.keys(graphData);
    const yAxisData = Object.values(graphData).map(val => parseFloat(val));
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

  convertToOrderPlcedChartData(graphData: any) {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
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
      data: Object.keys(graphData),
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
        data: Object.values(graphData),
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

  convertToNewVsReturningCustomersChartdata(graphData: any): UnityChartDetails {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const periods = graphData?.returning_customers.map(item => item.period);
    const newCustomersData = graphData?.new_customers.map(item => item.sum);
    const returningCustomersData = graphData?.returning_customers.map(item => item.sum);

    view.options = {
      // title: {
      //   text: `New Vs Returning Customers`,
      //   left: 'center'
      // },
      title: {
        text: 'New vs Returning Customers',
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
        data: ['New Customers', 'Returning Customers'],
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
          name: 'New Customers',
          type: 'bar',
          stack: 'total',
          data: newCustomersData,
          barMaxWidth: 35,
          itemStyle: {
            color: '#39bdfaff'
          }
        },
        {
          name: 'Returning Customers',
          type: 'bar',
          stack: 'total',
          data: returningCustomersData,
          barMaxWidth: 35,
          itemStyle: {
            color: '#f9b248ff'
          }
        }
      ]
    };
    return view;
  }
}

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

export interface DurationDropdownType {
  period: string;
  from: string;
  to: string;
}