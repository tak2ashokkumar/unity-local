import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChartDataSets, ChartLegendLabelItem, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label } from 'ng2-charts';
import { GET_AIOPS_ALERTS_COUNT, GET_AIOPS_CONDITIONS_SUMMARY, GET_AIOPS_EVENT_COUNT_BY_TYPE, GET_AIOPS_EVENT_NOISY_HOSTS, GET_AIOPS_NOISY_EVENTS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment.prod';
import { AIMLConditionsSummary, AIMLSummaryAlertCountByDeviceType, AIMLSummaryNoisyEvent, AIMLSummaryNoisyEventHost } from './aiml-summary.type';

@Injectable()
export class AimlSummaryService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
    private userInfo: UserInfoService) { }

  getConditionsSummary() {
    let params: HttpParams = new HttpParams();
    params = params.append('last_n_days', 7);
    params = params.append('last_n_days', 14);
    return this.http.get<AIMLConditionsSummary>(GET_AIOPS_CONDITIONS_SUMMARY(), { params: params });
  }

  getPercentage(last7DaysCount: number, last14DaysCount: number): { percentage: number, isIncreased: boolean } {
    let k: { percentage: number, isIncreased: boolean } = { percentage: 0, isIncreased: false };

    let tillLastWeek = last14DaysCount - last7DaysCount;
    if (tillLastWeek) {
      let difference = last7DaysCount - tillLastWeek;
      if (difference < 0) {
        k.isIncreased = false;
        k.percentage = Math.round((difference / tillLastWeek) * 100);
      } else {
        k.isIncreased = true;
        k.percentage = Math.round((difference / tillLastWeek) * 100);
      }
    } else {
      k.isIncreased = true;
      k.percentage = 100;
    }
    return k;
  }

  convertToSummaryViewdata(summary: AIMLConditionsSummary): AIMLSummaryViewData {
    let a: AIMLSummaryViewData = new AIMLSummaryViewData();
    a.events = summary.total.event_count;
    let eventsIncrease = this.getPercentage(summary.last_7_days.event_count, summary.last_14_days.event_count);
    a.isEventsIncreased = eventsIncrease.isIncreased;
    a.eventsIncreasePercentage = eventsIncrease.percentage;

    a.alerts = summary.total.alert_count;
    let alertsIncrease = this.getPercentage(summary.last_7_days.alert_count, summary.last_14_days.alert_count);
    a.isAlertsIncreased = alertsIncrease.isIncreased;
    a.alertsIncreasePercentage = alertsIncrease.percentage;

    a.conditions = summary.total.condition_count;
    let conditionsIncrease = this.getPercentage(summary.last_7_days.condition_count, summary.last_14_days.condition_count);
    a.isConditionsIncreased = conditionsIncrease.isIncreased;
    a.conditionsIncreasePercentage = conditionsIncrease.percentage;

    a.noiseReductionPercentage = summary.total.noise_reduction;
    a.correlationPercentage = summary.total.correlation_reduction;

    a.eventReductionPercentage = summary.total.event_count ? Math.round(((summary.total.event_count - summary.total.condition_count) / summary.total.event_count) * 100) : 0;
    return a;
  }

  getAlertsCountByDeviceType() {
    return this.http.post<AIMLSummaryAlertCountByDeviceType[]>(GET_AIOPS_ALERTS_COUNT(), {});
  }

  convertToAlertsCountViewdata(alertData: AIMLSummaryAlertCountByDeviceType[]): AIMLSummaryAlertsCountViewData {
    let a: AIMLSummaryAlertsCountViewData = new AIMLSummaryAlertsCountViewData();
    alertData.map(ad => {
      switch (ad.device_type) {
        case 'switch':
        case 'firewall':
        case 'load_balancer': a.network = a.network + ad.alert_count; break;
        case 'hypervisor':
        case 'baremetal':
        case 'vm':
        case 'mac': a.compute += ad.alert_count; break;
        case 'storage': a.storage += ad.alert_count; break;
        default: a.others += ad.alert_count; break;
      }
    })
    return a;
  }

  getNoisyEvents() {
    return this.http.post<AIMLSummaryNoisyEvent[]>(GET_AIOPS_NOISY_EVENTS(), {});
  }

  convertToNoisyEventsViewdata(events: AIMLSummaryNoisyEvent[]): AIMLSummaryNoisyEventsViewData[] {
    let viewData: AIMLSummaryNoisyEventsViewData[] = [];
    events.map(al => {
      let a: AIMLSummaryNoisyEventsViewData = new AIMLSummaryNoisyEventsViewData();
      a.deviceName = al.device_name ? al.device_name : 'NA';
      a.deviceType = al.device_type;
      a.deviceDisplayType = al.device_type ? this.utilSvc.toUpperCase(al.device_type) : 'NA';
      a.count = al.event_count;
      a.description = al.description;
      a.source = al.source;
      a.lastReported = al.last_reported ? this.utilSvc.toUnityOneDateFormat(al.last_reported) : 'N/A';
      a.severity = al.severity;
      switch (al.severity) {
        case 'Critical':
          a.severityClass = 'fas fa-exclamation-triangle text-danger';
          break;
        case 'Warning':
          a.severityClass = 'fas fa-exclamation-circle text-warning fa-lg';
          break
        case 'Information':
          a.severityClass = 'fas fa-info-circle text-primary fa-lg';
          break;
      }
      viewData.push(a);
    })
    return viewData;
  }

  getNoisyHosts() {
    return this.http.post<AIMLSummaryNoisyEventHost[]>(GET_AIOPS_EVENT_NOISY_HOSTS(), {});
  }

  convertToNoisyHostsViewData(hostData: AIMLSummaryNoisyEventHost[]): AIMLSummaryNoisyHostsViewData[] {
    let maxValue = 0;
    hostData.map(hd => {
      if (maxValue < hd.event_count) {
        maxValue = hd.event_count;
      }
    });
    let viewData: AIMLSummaryNoisyHostsViewData[] = [];
    hostData.map(hd => {
      let a: AIMLSummaryNoisyHostsViewData = new AIMLSummaryNoisyHostsViewData();
      a.hostName = hd.device;
      a.hostType = hd.device_type;
      a.events = hd.event_count;
      a.barwidth = maxValue ? (hd.event_count / maxValue) * 100 : 0;
      viewData.push(a);
    })
    return viewData;
  }

  buildEventsCountForm() {
    return this.builder.group({
      'target_type': [eventCountTargets[0]],
      'duration': ['active']
    })
  }

  getEventsCount(formData: any) {
    let obj = { count_by: formData.target_type.key };
    return this.http.post<any[]>(GET_AIOPS_EVENT_COUNT_BY_TYPE(), obj);
  }

  convertToEventsCountEChartData(eventData: any[]): UnityChartDetails {
    eventData.map(ed => {
      ed.target = ed[Object.keys(ed)[0]];
    });
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    eventData.map(ed => {
      data.push({ name: this.utilSvc.toUpperCase(ed.target), value: ed.event_count });
    })
    view.options.series[0].data = data;
    return view;
  }

  convertToEventsCountChartData(eventData: any[]) {
    let view: ChartData = new ChartData();
    view.type = 'pie';
    view.legend = true;

    eventData.map(ed => {
      ed.target = ed[Object.keys(ed)[0]];
    });

    let pc: string[] = [];
    Object.values(eventData).map((d, index) => {
      view.lables.push(this.utilSvc.toUpperCase(d.target));
      view.piedata.push(d.event_count);
      pc.push(VARIANTS_OF_BLUE[index]);
    });
    view.colors.push({ backgroundColor: pc });
    view.options = this.getDefaultPieChartOptions();
    return view;
  }

  getDefaultPieChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: 0 },
      legend: {
        position: 'right',
        labels: {
          padding: 2,
          boxWidth: 25
        },
        onClick: (event: MouseEvent, legendItem: ChartLegendLabelItem) => {
          event.stopPropagation();
        }
      },
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            return `${~~value}`;
          },
          font: { size: 10 },
          color: '#fff'
        },
        outlabels: {
          display: false
        }
      },
    }
  }
}

export class AIMLSummaryViewData {
  constructor() { }
  events: number = 0;
  isEventsIncreased: boolean = true;
  eventsIncreasePercentage: number = 0;
  alerts: number = 0;
  isAlertsIncreased: boolean = true;
  alertsIncreasePercentage: number = 0;
  conditions: number = 0;
  isConditionsIncreased: boolean = true;
  conditionsIncreasePercentage: number = 0;
  noiseReductionPercentage: number = 0;
  correlationPercentage: number = 0;
  eventReductionPercentage: number = 0;
}

export class AIMLSummaryAlertsCountViewData {
  constructor() { }
  compute: number = 0;
  network: number = 0;
  storage: number = 0;
  others: number = 0;
}

export class AIMLSummaryNoisyEventsViewData {
  constructor() { }
  deviceName: string;
  deviceType: string;
  deviceDisplayType: string;
  count: number;
  description: string;
  source: string;
  lastReported: string;
  severity: string;
  severityClass: string;
}

export class AIMLSummaryNoisyHostsViewData {
  constructor() { }
  hostName: string;
  hostType: string;
  events: number = 0;
  barwidth: number = 0;
}

export class ChartData {
  type: string;
  lables: Label[] = [];
  options: ChartOptions;
  bardata: ChartDataSets[] = [];
  piedata: number[] = [];
  colors: Color[] = [];
  legend: boolean = false;
  plugins: any = [pluginDataLabels];
  constructor() { }
}

export enum Duration {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export const eventCountTargets: Array<{ name: string, key: string }> = [
  {
    'name': 'Device Type',
    'key': 'device_type'
  },
  {
    'name': 'Event Source',
    'key': 'event_source'
  },
  {
    'name': 'Datacenter',
    'key': 'datacenter'
  },
  {
    'name': 'Cloud',
    'key': 'private_cloud'
  },
  {
    'name': 'Severity',
    'key': 'severity'
  }
];

export const VARIANTS_OF_BLUE: string[] = [
  '#004589',
  '#008AD7',
  '#006EAC',
  '#1684C2',
  '#0080FF',
  '#00588A',
  '#5CB4E5',
  '#0092F2',
  '#00466E',
  '#89C4FF',
  '#4682B4'
];