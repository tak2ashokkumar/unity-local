import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChartDataSets } from 'chart.js';
import * as moment from 'moment';
import { Observable, forkJoin, of } from 'rxjs';
import { AIMLAlertCountByDeviceType, AIMLAnalyticsSummary, AIMLCorrelationRule, AIMLEventCountByDeviceType, AIMLNoisyHosts, AIMLSuppressionRule, AIMLTendsByTimeline } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { AIOPS_ANALYTICS_CORRELATION_RULES, AIOPS_ANALYTICS_SUPPRESSION_RULES, AIOPS_TRENDS_BY_TIMELINE, DEVICES_FAST_BY_DEVICE_TYPE, GET_AIOPS_ALERTS_COUNT, GET_AIOPS_ANALYTICS_SUMMARY, GET_AIOPS_EVENT_COUNT_BY_TYPE, GET_AIOPS_EVENT_NOISY_HOSTS, PRIVATE_CLOUD_FAST_BY_DC_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, UnityDeviceType, UnityTimeDuration } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { AIOPS_DEVICE_TYPES } from '../aiml.component';

@Injectable()
export class AimlAnalyticsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private chartConfigService: ChartConfigService,
    private echartConfigSvc: UnityChartConfigService,
    private userInfo: UserInfoService) { }

  getDropdownData() {
    const dcs = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const device_types = of(AIOPS_DEVICE_TYPES);
    return forkJoin([dcs, device_types]);
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getForm(timeline: string, type?: string,): FormGroup {
    let form = this.builder.group({
      'timeline': [timeline, [Validators.required]]
    });
    if (type) {
      form.addControl('type', new FormControl(type, [Validators.required]));
    }
    return form;
  }

  buildFilterForm(datacenters: DatacenterFast[], deviceTypes: UnityDeviceType[]): FormGroup {
    let dcs: string[] = [];
    datacenters.map(dc => dcs.push(dc.uuid));
    let dtps: string[] = [];
    deviceTypes.map(dt => dtps.push(dt.modelMapping));
    return this.builder.group({
      'datacenters': [[], [Validators.required]],
      'private_clouds': [[], [Validators.required]],
      'device_types': [[], [Validators.required]],
      'timeline': [UnityTimeDuration.LAST_MONTH, [Validators.required]]
    })
  }

  resetFilterFormErrors() {
    return {
      'datacenters': '',
      'private_clouds': '',
      'device_types': '',
      'timeline': '',
    }
  }

  filterFormValidationMessages = {
    'datacenters': {
      'required': 'Datacenter is required'
    },
    'private_clouds': {
      'required': 'cloud selection is required'
    },
    'device_types': {
      'required': 'Device Type is required',
    },
    'timeline': {
      'required': 'timeline is required',
    },
  }

  getAnalyticsSummary(formData: any) {
    return this.http.post<AIMLAnalyticsSummary>(GET_AIOPS_ANALYTICS_SUMMARY(), formData);
  }

  convertToSummaryViewdata(summary: AIMLAnalyticsSummary): AIMLAnalyticsSummaryViewData {
    let a: AIMLAnalyticsSummaryViewData = new AIMLAnalyticsSummaryViewData();
    a.events = summary.event_count;
    a.alerts = summary.alert_count;
    a.conditions = summary.condition_count;
    a.noiseReductionPercentage = summary.noise_reduction;
    a.correlationPercentage = summary.correlation_reduction;
    a.eventReductionPercentage = summary.event_count ? Math.round(((summary.event_count - summary.condition_count) / summary.event_count) * 100) : 0;
    return a;
  }

  getAlertsCountByDeviceType(formData: any) {
    return this.http.post<AIMLAlertCountByDeviceType[]>(GET_AIOPS_ALERTS_COUNT(), formData);
  }

  convertToAlertsCountViewdata(alertData: AIMLAlertCountByDeviceType[]): AIMLAlertsCountByDeviceTypeViewData {
    let a: AIMLAlertsCountByDeviceTypeViewData = new AIMLAlertsCountByDeviceTypeViewData();
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

  getTrendsByTimeline(formData: any) {
    return this.http.post<AIMLTendsByTimeline>(AIOPS_TRENDS_BY_TIMELINE(), formData);
  }

  getLastNHours(numberOfhours: number): any[] {
    var hours = [];
    for (var i = 0; i < numberOfhours; i++) {
      let hour = moment().subtract(i, "h").startOf("h").format('hh:mm');
      hours.push(hour);
    }
    return hours.reverse();
  }

  getLastNDays(numberOfDaya: number): any[] {
    var days = [];
    for (var i = 0; i < numberOfDaya; i++) {
      let day = moment().subtract(i, "day").startOf("day").format('DD-MMM');
      days.push(day == moment().format('DD-MMM') ? 'Today' : day);
    }
    return days.reverse();
  }

  convertToTrendsByTimelineChartData(timeline: string, tilimelineData: AIMLTendsByTimeline): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'line';
    view.legend = true;
    switch (timeline) {
      case UnityTimeDuration.LAST_WEEK: view.lables = this.getLastNDays(7); break;
      case UnityTimeDuration.LAST_MONTH: view.lables = this.getLastNDays(30); break;
      default: view.lables = this.getLastNHours(24); break;
    }
    let datalables: string[] = ['condition', 'alerts', 'events'];
    datalables.map(dl => {
      let ds: ChartDataSets = {};
      ds.label = dl;
      ds.data = [];
      switch (dl) {
        case 'condition':
          ds.backgroundColor = '#DAF6F5';
          ds.borderColor = '#47D1CB';
          break;
        case 'alerts':
          ds.backgroundColor = '#DAE5FF';
          ds.borderColor = '#477BFF';
          break;
        default:
          ds.backgroundColor = '#E2DAFF';
          ds.borderColor = '#6F47FF';
          break;
      }
      tilimelineData[dl].forEach(td => {
        ds.data.push(td.count);
      })
      view.linedata.push(ds);
    })
    view.options = this.chartConfigService.getDefaultLineChartOptions();
    return view;
  }

  getEventsCountByDeviceType(formData: any) {
    return this.http.post<AIMLEventCountByDeviceType[]>(GET_AIOPS_EVENT_COUNT_BY_TYPE(), formData);
  }

  convertToEventsCountByDeviceTypeChartData(eventData: AIMLEventCountByDeviceType[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.echartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.echartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    eventData.map(ed => {
      data.push({ name: this.utilSvc.toUpperCase(ed.device_type), value: ed.event_count });
    })
    view.options.series[0].radius = '60%';
    view.options.series[0].data = data;
    return view;
  }

  getNoisyHosts(formData: any) {
    return this.http.post<AIMLNoisyHosts[]>(GET_AIOPS_EVENT_NOISY_HOSTS(), formData);
  }

  convertToNoisyHostsListData(hosts: AIMLNoisyHosts[]): AIMLNoisyHostsData[] {
    let viewData: AIMLNoisyHostsData[] = [];
    hosts.map(h => {
      let a = new AIMLNoisyHostsData();
      a.hostName = h.device ? h.device : 'NA';
      a.deviceType = h.device_type ? h.device_type : 'NA';
      a.managementIp = h.management_ip ? h.management_ip : 'NA';
      a.source = h.sources ? h.sources : 'NA';
      a.events = h.event_count ? h.event_count : 0;
      a.critical = h.critical_count ? h.critical_count : 0;
      a.warning = h.warning_count ? h.warning_count : 0;
      a.information = h.info_count ? h.info_count : 0;
      viewData.push(a);
    })
    return viewData;
  }

  convertToNoisyHostsChartData(hosts: AIMLNoisyHostsData[]) {
    let view: UnityChartData = new UnityChartData();
    view.type = 'horizontalBar';
    view.legend = true;
    hosts.map(d => {
      view.lables.push(d.hostName);
    });
    let datalables: string[] = ['Critical', 'Warning', 'Information'];
    datalables.map(dl => {
      let ds: ChartDataSets = {};
      ds.label = dl;
      ds.data = [];
      ds.backgroundColor = dl == 'Critical' ? '#cc0000' : dl == 'Warning' ? '#ff8800' : '#378ad8';
      ds.hoverBackgroundColor = dl == 'Critical' ? '#cc0000' : dl == 'Warning' ? '#ff8800' : '#378ad8';
      ds.maxBarThickness = 35;
      hosts.map(h => {
        ds.data.push(h[dl.toLocaleLowerCase()]);
      })
      view.bardata.push(ds);
    })

    view.options = this.chartConfigService.getDefaultHorizantalStackedBarChartOptions();
    view.options.scales.xAxes[0].ticks.precision = 0;
    view.options.plugins.datalabels.display = false;
    let maxValue = 0;
    view.bardata.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    view.options.scales.xAxes[0].ticks.suggestedMax = maxValue * (110 / 100);
    return view;
  }

  getRules(ruleType: string, formData: string) {
    let url = ruleType == AIMLRulesViewTypes.SUPPRESSION ? AIOPS_ANALYTICS_SUPPRESSION_RULES() : AIOPS_ANALYTICS_CORRELATION_RULES();
    return this.http.post<AIMLSuppressionRule[] | AIMLCorrelationRule[]>(url, formData);
  }

  convertToAIMLRulesViewData(rules: AIMLSuppressionRule[] | AIMLCorrelationRule[]): AIMLRuleData[] {
    let viewData: AIMLRuleData[] = [];
    rules.map((rule: AIMLSuppressionRule | AIMLCorrelationRule) => {
      let a: AIMLRuleData = new AIMLRuleData();
      a.uuid = rule.uuid;
      a.name = rule.name;
      a.user = rule.user;
      a.description = rule.description ? rule.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      a.user = rule.user ? rule.user : 'NA';

      if ('correlators' in rule) {
        a.count = rule.condition_count;
        a.createdAt = rule.created_datetime ? this.utilSvc.toUnityOneDateFormat(rule.created_datetime) : 'N/A';
        a.updatedAt = rule.updated_datetime ? this.utilSvc.toUnityOneDateFormat(rule.updated_datetime) : 'N/A';
        a.correlator = rule.correlators ? this.utilSvc.toUpperCase(rule.correlators) : 'NA';
        a.active = rule.is_active;
      } else {
        a.count = rule.event_count;
        a.createdAt = rule.created_at ? this.utilSvc.toUnityOneDateFormat(rule.created_at) : 'N/A';
        a.updatedAt = rule.updated_at ? this.utilSvc.toUnityOneDateFormat(rule.updated_at) : 'N/A';
        a.active = rule.active;
      }

      if (a.active) {
        a.status = 'Enabled';
        a.statusClass = 'text-success';
      } else {
        a.status = 'Disabled';
        a.statusClass = 'text-warning'
      }
      viewData.push(a);
    })
    return viewData;
  }
}

export class AnalyticsFilterFormData {
  datacenters: string[];
  private_clouds: string[];
  device_types: string[];
  timeline: string;
  type?: string;
  count?: number;
  search?: string;
}

export class AIMLAnalyticsSummaryViewData {
  constructor() { }
  events: number = 0;
  isEventsIncreased: boolean = true;
  eventsIncreasePercentage: string;
  alerts: number = 0;
  isAlertsIncreased: boolean = true;
  alertsIncreasePercentage: string;
  conditions: number = 0;
  isConditionsIncreased: boolean = true;
  conditionsIncreasePercentage: string;
  noiseReductionPercentage: number = 0;
  correlationPercentage: number = 0;
  eventReductionPercentage: number = 0;
}

export class AIMLAlertsCountByDeviceTypeViewData {
  constructor() { }
  compute: number = 0;
  network: number = 0;
  storage: number = 0;
  others: number = 0;
}

export class AIMLTrendByTimelineViewData {
  constructor() { }
  chartData: UnityChartData;
  form: FormGroup;
  loader: string = 'AIMLAnalyticsTrendByTimelineLoader';
}

export class AIMLEventCountByDeviceTypeViewData {
  constructor() { }
  chartData: UnityChartDetails;
  form: FormGroup;
  loader: string = 'AIMLAnalyticsEventCountByDeviceLoader';
}

export class AIMLNoisyHostsViewData {
  constructor() { }
  data: AIMLNoisyHostsData[] = [];
  chartData: UnityChartData;
  form: FormGroup;
  loader: string = 'AIMLAnalyticsNoisyHostsLoader';
}
export class AIMLNoisyHostsData {
  constructor() { }
  hostName: string;
  deviceType: string;
  managementIp: string;
  source: string;
  events: number = 0;
  critical: number = 0;
  warning: number = 0;
  information: number = 0;
}

export enum AIMLRulesViewTypes {
  SUPPRESSION = 'Suppression',
  CORRELATION = 'Correlation',
}
export class AIMLRuleViewData {
  constructor() { }
  data: AIMLRuleData[] = [];
  form: FormGroup;
  loader: string = 'AIMLAnalyticsRulesLoader';
}
export class AIMLRuleData {
  constructor() { }
  uuid: string;
  name: string;
  description: string;
  user: string;
  count: number;
  updatedAt: string;
  createdAt: string;
  active: boolean;
  status: string;
  statusClass: string;

  correlator: string; // for correlation rules
}