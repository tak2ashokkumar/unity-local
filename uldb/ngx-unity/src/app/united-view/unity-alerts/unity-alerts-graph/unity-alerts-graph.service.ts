import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartDataSets, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { cloneDeep as _clone, pick as _pick } from 'lodash-es';
import * as moment from 'moment';
import { Color, Label } from 'ng2-charts';
import { Observable } from 'rxjs';
import { GET_ALERTS_BY_DC, GET_ALERTS_BY_SEVERITY, GET_ALERT_TREND_BY_DC, GET_ALERT_TREND_BY_SEVERITY, GET_TOP_10_DEVICES_BY_ALERTS, GET_TOP_10_DEVICES_TREND_BY_ALERTS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { COLOUR_BY_SEVERITY, DEFAULT_BAR_THICKNESS, UnityAlertGraphsUtilService } from './unity-alerts-graph-util.service';
import { AlertsByDCChart, AlertsBySeverityChart, AlertsBySeverityTrend, AlertsInfoData, TopDevicesByAlertsChart, TopDevicesByAlertsTrend, TopDevicesByAlertsTrendData, AlertsTrendByDC } from './unity-alerts-graph.type';



@Injectable()
export class UnityAlertGraphsService {

  constructor(private graphUtil: UnityAlertGraphsUtilService,
    private http: HttpClient,
    private builder: FormBuilder,
    private util: AppUtilityService) { }

  buildFilterForm(dateRange: DateRange): FormGroup {
    this.resetFilterFormErrors();
    return this.builder.group({
      'duration': [Duration.LAST_WEEK, [Validators.required]],
      'start_date': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'end_date': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.dateRangeValidator('start_date', 'end_date') });
  }

  resetFilterFormErrors(): any {
    let formErrors = {
      'duration': '',
      'start_date': '',
      'end_date': '',
    };
    return formErrors;
  }

  filterFormValidationMessages = {
    'duration': {
      'required': 'Duration is required'
    },
    'start_date': {
      'required': 'Start date is required'
    },
    'end_date': {
      'required': 'End date is required'
    }
  };

  getDateRangeByPeriod(graphRange: Duration): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case Duration.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case Duration.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case Duration.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case Duration.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case Duration.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  getAlertCountBySeverity(formData: any): Observable<AlertsBySeverityChart> {
    return this.http.post<AlertsBySeverityChart>(GET_ALERTS_BY_SEVERITY(), formData);
  }

  convertToAlertCountBySeverityChartData(severityData: AlertsBySeverityChart): ChartData {
    let bcd: ChartData = new ChartData();
    bcd.type = 'bar';
    let bd: number[] = [];
    let bc: string[] = [];
    Object.entries(_pick(severityData, unityAlertTypes)).map(d => {
      bcd.lables.push(<string>d.getFirst());
      bd.push(<number>d.getLast());
      bc.push(COLOUR_BY_SEVERITY[<string>d.getFirst()]);
    });
    bcd.bardata.push({ data: [...bd], maxBarThickness: DEFAULT_BAR_THICKNESS });
    bcd.colors.push({ backgroundColor: bc });
    bcd.options = this.graphUtil.getDefaultVerticalBarChartOptions();

    bcd.options.title = { display: true, text: 'Alerts by Severity', fontSize: 15 };
    // bcd.options.scales.xAxes[0].scaleLabel.labelString = 'Alert Severity Types';
    // bcd.options.scales.yAxes[0].scaleLabel.labelString = 'Alerts Count';

    bcd.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...bd) * (110 / 100);
    return bcd;
  }

  getAlertTrendBySeverity(formData: any): Observable<AlertsBySeverityTrend> {
    return this.http.post<AlertsBySeverityTrend>(GET_ALERT_TREND_BY_SEVERITY(), formData);
  }

  getAlertsTrendBySeverityChartData(dataByDevice: AlertsInfoData, linedata: ChartDataSets[]): ChartDataSets[] {
    if (linedata.length) {
      let deviceData = _pick(dataByDevice, unityAlertTypes);
      Object.keys(deviceData).map(dd => {
        let index = linedata.findIndex(bd => bd.label == dd);
        if (index == -1) {
          let d: ChartDataSets;
          d = {
            data: [<number>deviceData[dd]], label: <string>dd, borderColor: COLOUR_BY_SEVERITY[dd], backgroundColor: COLOUR_BY_SEVERITY[dd]
          };
          linedata.push(d);
        } else {
          let bd = <number[]>linedata[index].data;
          bd.push(<number>deviceData[dd]);
        }
      })
    } else {
      let d: ChartDataSets;
      Object.entries(_pick(dataByDevice, unityAlertTypes)).map(dq => {
        d = {
          data: [<number>dq.getLast()], label: <string>dq.getFirst(), borderColor: COLOUR_BY_SEVERITY[<string>dq.getFirst()], backgroundColor: COLOUR_BY_SEVERITY[<string>dq.getFirst()]
        };
        linedata.push(d);
      });
    }
    return linedata;
  }

  convertToAlertTrendBySeverityChartData(severityTrendData: AlertsBySeverityTrend, formData: any): ChartData {
    let lcd: ChartData = new ChartData();
    lcd.type = 'line';
    lcd.legend = true;
    Object.entries(severityTrendData).map(d => {
      lcd.lables.push(<string>d.getFirst());
      lcd.linedata = this.getAlertsTrendBySeverityChartData(_clone(<AlertsInfoData>d.getLast()), lcd.linedata);
    });
    lcd.options = this.graphUtil.getDefaultLineChartOptions();
    lcd.options.title = { display: true, text: 'Alerts by Severity Trends', fontSize: 15 };

    let maxValue = 0;
    lcd.linedata.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    lcd.options.scales.yAxes[0].ticks.suggestedMax = maxValue * (110 / 100);

    // switch (formData.duration) {
    //   case Duration.LAST_24_HOURS: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'hours'; break;
    //   case Duration.LAST_WEEK: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'days'; break;
    //   case Duration.LAST_MONTH: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'weeks'; break;
    //   case Duration.LAST_YEAR: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'months'; break;
    // }
    return lcd;
  }

  getTop10DevicesAlertCount(formData: TopDevicesByAlertsChart[]) {
    return this.http.post<TopDevicesByAlertsChart[]>(GET_TOP_10_DEVICES_BY_ALERTS(), formData);
  }

  getTop10DevivesByAlertsChartData(dataByDevice: TopDevicesByAlertsChart, bardata: ChartDataSets[]): ChartDataSets[] {
    if (bardata.length) {
      let deviceData = _pick(dataByDevice, unityAlertTypes);
      Object.keys(deviceData).map(dd => {
        let index = bardata.findIndex(bd => bd.label == dd);
        if (index == -1) {
          let d: ChartDataSets;
          d = {
            data: [<number>deviceData[dd]], label: dd, backgroundColor: COLOUR_BY_SEVERITY[dd], hoverBackgroundColor: COLOUR_BY_SEVERITY[dd], maxBarThickness: DEFAULT_BAR_THICKNESS, stack: 'a'
          };
          bardata.push(d);
        } else {
          let bd = <number[]>bardata[index].data;
          bd.push(<number>deviceData[dd])
        }
      })
    } else {
      let d: ChartDataSets;
      Object.entries(_pick(dataByDevice, unityAlertTypes)).map(dq => {
        d = {
          data: [<number>dq.getLast()], label: <string>dq.getFirst(), backgroundColor: COLOUR_BY_SEVERITY[<string>dq.getFirst()], hoverBackgroundColor: COLOUR_BY_SEVERITY[<string>dq.getFirst()], maxBarThickness: DEFAULT_BAR_THICKNESS, stack: 'a'
        };
        bardata.push(d);
      });
    }
    return bardata;
  }

  convertToTop10DevivesByAlertsChartData(devicesData: TopDevicesByAlertsChart[]) {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    view.legend = true;

    let lineData: number[] = [];
    devicesData.map(d => {
      view.lables.push(d.device_name);
      lineData.push(d.device_count);
      view.bardata = this.getTop10DevivesByAlertsChartData(_clone(d), view.bardata);
    });

    let dts: ChartDataSets = {};
    dts.data = lineData;
    dts.label = '';
    dts.backgroundColor = 'white';
    dts.borderColor = 'white';
    dts.type = 'bubble';
    view.bardata.push(dts);

    view.options = this.graphUtil.getDefaultVerticalStackedBarChartOptions();
    view.options.title = { display: true, text: 'Top 10 devices by Alerts', fontSize: 15 };
    let maxValue = 0;
    view.bardata.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    view.options.scales.yAxes[0].ticks.suggestedMax = maxValue * (110 / 100);
    return view;
  }

  get10DevivesByAlertsTrend(formData: any): Observable<TopDevicesByAlertsTrend> {
    return this.http.post<TopDevicesByAlertsTrend>(GET_TOP_10_DEVICES_TREND_BY_ALERTS(), formData);
  }

  getTop10DevicesAlertTrendChartData(dataByDevice: TopDevicesByAlertsTrendData, linedata: ChartDataSets[], totalCount: number, index: number): ChartDataSets[] {
    if (linedata.length) {
      let idx = linedata.findIndex(ld => ld.label == dataByDevice.device_name);
      if (idx == -1) {
        let d: ChartDataSets;
        let data: number[] = [];
        Array(totalCount).fill(0).map((e, i) => data.push(i == index ? <number>dataByDevice.device_count : 0));
        d = {
          data: data, label: <string>dataByDevice.device_name
        };
        linedata.push(d);
      } else {
        linedata[idx].data[index] = dataByDevice.device_count;
      }
    } else {
      let d: ChartDataSets;
      let data: number[] = [];
      Array(totalCount).fill(0).map((e, i) => data.push(i == index ? <number>dataByDevice.device_count : 0));
      d = {
        data: data, label: <string>dataByDevice.device_name
      };
      linedata.push(d);
    }
    return linedata;
  }

  convertToTop10DevicesAlertTrendChartData(severityTrendData: TopDevicesByAlertsTrend, formData: any): ChartData {
    let lcd: ChartData = new ChartData();
    lcd.type = 'line';
    lcd.legend = true;

    Object.entries(severityTrendData).map((d, i) => {
      lcd.lables.push(<string>d.getFirst());
      lcd.linedata = this.getTop10DevicesAlertTrendChartData(_clone(<TopDevicesByAlertsTrendData>d.getLast()), lcd.linedata, Object.keys(severityTrendData).length, i);
    });

    lcd.options = this.graphUtil.getDefaultLineChartOptions();
    lcd.options.title = { display: true, text: 'Top devices by Alerts', fontSize: 15 };

    let maxValue = 0;
    lcd.linedata.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    lcd.options.scales.yAxes[0].ticks.suggestedMax = maxValue * (110 / 100);

    // switch (formData.duration) {
    //   case Duration.LAST_24_HOURS: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'hours'; break;
    //   case Duration.LAST_WEEK: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'days'; break;
    //   case Duration.LAST_MONTH: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'weeks'; break;
    //   case Duration.LAST_YEAR: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'months'; break;
    // }
    return lcd;
  }

  getAlertCountByDC(formData: any): Observable<AlertsByDCChart> {
    return this.http.post<AlertsByDCChart>(GET_ALERTS_BY_DC(), formData);
  }

  getAlertCountByDCChartData(dataByDC: AlertsInfoData, bardata: ChartDataSets[]): ChartDataSets[] {
    if (bardata.length) {
      let deviceData = _pick(dataByDC, unityAlertTypes);
      Object.keys(deviceData).map(dd => {
        let index = bardata.findIndex(bd => bd.label == dd);
        if (index == -1) {
          let d: ChartDataSets;
          d = { data: [<number>deviceData[dd]], label: dd, backgroundColor: COLOUR_BY_SEVERITY[dd], hoverBackgroundColor: COLOUR_BY_SEVERITY[dd], maxBarThickness: DEFAULT_BAR_THICKNESS, stack: 'a' };
          bardata.push(d);
        } else {
          let bd = <number[]>bardata[index].data;
          bd.push(<number>deviceData[dd])
        }
      })
    } else {
      let d: ChartDataSets;
      Object.entries(_pick(dataByDC, unityAlertTypes)).map(dq => {
        d = { data: [<number>dq.getLast()], label: <string>dq.getFirst(), backgroundColor: COLOUR_BY_SEVERITY[<string>dq.getFirst()], hoverBackgroundColor: COLOUR_BY_SEVERITY[<string>dq.getFirst()], maxBarThickness: DEFAULT_BAR_THICKNESS, stack: 'a' };
        bardata.push(d);
      });
    }
    return bardata;
  }

  convertToAlertCountByDCChartData(dcData: AlertsByDCChart) {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    view.legend = true;
    let lineData: number[] = [];
    Object.entries(dcData).map(d => {
      view.lables.push(<string>d.getFirst());
      lineData.push((<AlertsInfoData>d.getLast()).device_count);
      view.bardata = this.getAlertCountByDCChartData(<AlertsInfoData>d.getLast(), view.bardata);
    });
    let dts: ChartDataSets = {};
    dts.data = lineData;
    dts.label = '';
    dts.backgroundColor = 'white';
    dts.borderColor = 'white';
    dts.type = 'bubble';
    view.bardata.push(dts);


    view.options = this.graphUtil.getDefaultVerticalStackedBarChartOptions();
    view.options.title = { display: true, text: 'Alerts By Datacenter', fontSize: 15 };
    let maxValue = 0;
    view.bardata.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    view.options.scales.yAxes[0].ticks.suggestedMax = maxValue * (110 / 100);
    return view;
  }

  getAlertCountByDCTrend(formData: any): Observable<AlertsTrendByDC> {
    return this.http.post<AlertsTrendByDC>(GET_ALERT_TREND_BY_DC(), formData);
  }

  getAlertTrendByDCChartData(dataByDC: AlertsByDCChart, linedata: ChartDataSets[], totalCount: number, index: number): ChartDataSets[] {
    if (linedata.length) {
      Object.entries(dataByDC).map(dcData => {
        let idx = linedata.findIndex(ld => ld.label == dcData.getFirst());
        if (idx == -1) {
          let d: ChartDataSets;
          let data: number[] = [];
          Array(totalCount).fill(0).map((e, i) => data.push(i == index ? (<AlertsInfoData>dcData.getLast()).device_count : 0));
          d = {
            data: data, label: <string>dcData.getFirst()
          };
          linedata.push(d);
        } else {
          linedata[idx].data[index] = (<AlertsInfoData>dcData.getLast()).device_count;
        }
      })
    } else {
      Object.entries(dataByDC).map(dcData => {
        let d: ChartDataSets;
        let data: number[] = [];
        Array(totalCount).fill(0).map((e, i) => data.push(i == index ? (<AlertsInfoData>dcData.getLast()).device_count : 0));
        d = {
          data: data, label: <string>dcData.getFirst()
        };
        linedata.push(d);
      })


      // let d: ChartDataSets;
      // let data: number[] = [];
      // Array(totalCount).fill(0).map((e, i) => data.push(i == index ? <number>dataByDevice.device_count : 0));
      // d = {
      //   data: data, label: <string>dataByDevice.device_name
      // };
      // linedata.push(d);
    }
    return linedata;
  }

  convertToAlertTrendByDCChartData(dcTrendData: AlertsTrendByDC, formData: any): ChartData {
    let lcd: ChartData = new ChartData();
    lcd.type = 'line';
    lcd.legend = true;

    Object.entries(dcTrendData).map((d, i) => {
      lcd.lables.push(<string>d.getFirst());
      lcd.linedata = this.getAlertTrendByDCChartData(_clone(<AlertsByDCChart>d.getLast()), lcd.linedata, Object.keys(dcTrendData).length, i);
    });

    lcd.options = this.graphUtil.getDefaultLineChartOptions();
    lcd.options.title = { display: true, text: 'Alerts Trend by Datacenter', fontSize: 15 };

    let maxValue = 0;
    lcd.linedata.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    lcd.options.scales.yAxes[0].ticks.suggestedMax = maxValue * (110 / 100);

    // switch (formData.duration) {
    //   case Duration.LAST_24_HOURS: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'hours'; break;
    //   case Duration.LAST_WEEK: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'days'; break;
    //   case Duration.LAST_MONTH: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'weeks'; break;
    //   case Duration.LAST_YEAR: lcd.options.scales.xAxes[0].scaleLabel.labelString = 'months'; break;
    // }
    return lcd;
  }



}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export enum Duration {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class ChartData {
  type: string;
  lables: Label[] = [];
  options: ChartOptions;
  bardata: ChartDataSets[] = [];
  linedata: ChartDataSets[] = [];
  colors: Color[] = [];
  legend: boolean = false;
  plugins: any = [pluginDataLabels];
  constructor() { }
}

export class ChartView {
  bar: ChartData;
  trend: ChartData;
  constructor() { }
}

export const unityAlertTypes: string[] = ['Critical', 'Warning', 'Information'];
