import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { AIMLAnalyticsSummary, AIMLEventTimelineByDevice, AIMLEventTimelineItemByDevice, AIMLEventsByDevice, AIMLEventsTrendByDatacenter, AIMLEventsTrendByPrivateCloud, AIMLEventsTrendBySeverity, AIMLNoisyEvents, AIMLNoisyHostEventsByDeviceType, AIMLNoisyHosts } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_AIOPS_ANALYTICS_SUMMARY, GET_AIOPS_EVENT_NOISY_HOSTS, PRIVATE_CLOUD_FAST_BY_DC_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, UnityTimeDuration } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, ChartPluginTypes, UnityChartData } from 'src/app/shared/chart-config.service';
import { AIMLAnalyticsSummaryViewData, AnalyticsFilterFormData } from '../aiml-analytics/aiml-analytics.service';
import { AIOPS_DEVICE_TYPES } from '../aiml.component';
import * as moment from 'moment';
import { ChartDataSets } from 'chart.js';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Injectable()
export class AimlAnalyticsEventsService {
  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private chartConfigService: ChartConfigService,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService) { }

  getDropdownData() {
    const dcs = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const device_types = of(AIOPS_DEVICE_TYPES);
    return forkJoin([dcs, device_types]);
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  buildFilterForm(formData: AnalyticsFilterFormData): FormGroup {
    return this.builder.group({
      'datacenters': [{ value: formData.datacenters, disabled: true }, [Validators.required]],
      'private_clouds': [{ value: formData.private_clouds, disabled: true }, [Validators.required]],
      'device_types': [{ value: formData.device_types, disabled: true }, [Validators.required]],
      'timeline': [{ value: formData.timeline, disabled: true }, [Validators.required]]
    })
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

  getWidgetForm(count?: string): FormGroup {
    let form = this.builder.group({
      'count': [count ? count : 10, [Validators.required]]
    });
    return form;
  }

  getTrendBySeverity(formData: AnalyticsFilterFormData): Observable<AIMLEventsTrendBySeverity[]> {
    return this.http.post<AIMLEventsTrendBySeverity[]>('/customer/aiops/events/events_by_severity/', formData);
  }

  convertToTrendBySeverityChartData(eventsBySeverity: AIMLEventsTrendBySeverity[]): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'bar';
    view.legend = false;
    let data: number[] = [];
    let colors: string[] = [];
    eventsBySeverity.map((es, index) => {
      view.lables.push(es.severity_type);
      data.push(es.severity_count);
      colors.push(es.severity_type == 'Critical' ? '#cc0000' : es.severity_type == 'Warning' ? '#ff8800' : '#378ad8');
    });
    view.datasets.push({ data: [...data], maxBarThickness: 30 });
    view.colors.push({ backgroundColor: colors });
    view.options = this.chartConfigService.getDefaultVerticalBarChartOptions();
    return view;
  }

  getTrendByDatacenter(formData: AnalyticsFilterFormData): Observable<TaskStatus> {
    return this.http.post<CeleryTask>('/customer/aiops/events/events_by_datacenter/', formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 200).pipe(take(1))), take(1));
  }

  convertToTrendByDatacenterChartData(eventsByDC: AIMLEventsTrendByDatacenter): UnityChartData {
    let dcs = Object.keys(eventsByDC);
    if (!dcs.length) {
      return;
    }
    let view: UnityChartData = new UnityChartData();
    view.type = 'horizontalBar';
    view.legend = false;
    let data: number[] = [];
    dcs.map((key, index) => {
      view.lables.push(key);
      data.push(eventsByDC[key]);
    });
    view.datasets.push({ data: [...data], maxBarThickness: 30 });
    view.options = this.chartConfigService.getDefaultHorizantalBarChartOptions();
    view.options.animation = {
      onProgress: function () {
        var chartInstance = this.chart,
          ctx = chartInstance.ctx,
          xaxisScale = chartInstance.scales['x-axis-0'];

        this.data.datasets.forEach(function (dataset, i) {
          var meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach(function (bar, index) {
            ctx.fillText('', bar._model.x, bar._model.y);
          });
        });
      }
    }
    return view;
  }

  getTrendByCloud(formData: AnalyticsFilterFormData): Observable<TaskStatus> {
    return this.http.post<CeleryTask>('/customer/aiops/events/events_by_cloud/', formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 200).pipe(take(1))), take(1));
  }

  convertToTrendByCloudChartData(eventsByCloud: AIMLEventsTrendByPrivateCloud): UnityChartData {
    let clouds = Object.keys(eventsByCloud);
    if (!clouds.length) {
      return;
    }
    let view: UnityChartData = new UnityChartData();
    view.type = 'pie';
    view.legend = true;
    let pc: string[] = [];
    clouds.map((key, index) => {
      view.lables.push(key);
      view.piedata.push(eventsByCloud[key]);
      pc.push(eventsAnalyticsChartColors[index]);
    });
    view.colors.push({ backgroundColor: pc });
    view.options = this.chartConfigService.getDefaultPieChartOptions(ChartPluginTypes.outLabels);
    view.options.legend.position = 'right';
    view.options.legend.labels = { boxWidth: 25, padding: 10, usePointStyle: false };
    return view;
  }

  getNoisyHostsByType(formData: AnalyticsFilterFormData): Observable<AIMLNoisyHostEventsByDeviceType[]> {
    return this.http.post<AIMLNoisyHostEventsByDeviceType[]>('/customer/aiops/events/noisy_host_by_device_type/', formData);
  }

  convertToNoisyHostsByTypeChartData(eventsByHostType: AIMLNoisyHostEventsByDeviceType[]): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'radar';
    view.legend = false;
    let data: number[] = [];
    eventsByHostType.map((eht, index) => {
      view.lables.push(this.utilSvc.getDeviceDisplayName(eht.device_type));
      data.push(eht.event_count);
    });
    view.datasets = [
      {
        data: [...data], fill: true,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
      }
    ];
    view.options = this.chartConfigService.getDefaultRadarChartOptions();
    let maxValue = 0;
    view.datasets.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    view.options.scale.ticks.max = maxValue * (120 / 100);
    return view;
  }

  getNoisyHosts(formData: AnalyticsFilterFormData): Observable<AIMLNoisyHosts[]> {
    // return of(aimlNoisyHosts);
    return this.http.post<AIMLNoisyHosts[]>(GET_AIOPS_EVENT_NOISY_HOSTS(), formData);
  }

  getNoisyEvents(formData: AnalyticsFilterFormData): Observable<AIMLNoisyEvents[]> {
    return this.http.post<AIMLNoisyEvents[]>('/customer/aiops/events/noisy/', formData);
  }

  convertToNoisyEventsChartData(noisyEvents: AIMLNoisyEvents[]): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    view.legend = true;
    let pc: string[] = [];
    noisyEvents.map((e, index) => {
      view.lables.push(e.description);
      view.piedata.push(e.event_count);
      pc.push(eventsAnalyticsChartColors[index]);
    });
    view.colors.push({ backgroundColor: pc });
    view.options = this.chartConfigService.getDefaultPieChartOptions(ChartPluginTypes.outLabels);
    view.options.legend.position = 'right';
    view.options.legend.labels = {
      boxWidth: 25, padding: 10, usePointStyle: false,
      generateLabels: (chart: Chart) => this.chartConfigService.getLegendLabels(chart, 30)
    };
    return view;
  }

  getEventsByDevice(device: string, source: string): Observable<AIMLEventsByDevice> {
    return this.http.get<AIMLEventsByDevice>('/customer/aiops/events/events_by_device/', { params: new HttpParams().set('device_name', device).set('source', source) });
  }

  convertToEventsByDeviceListData(host: AIMLNoisyHosts, events: AIMLEventsByDevice): AIMLEventsByDeviceViewData[] {
    let viewData: AIMLEventsByDeviceViewData[] = [];
    Object.keys(events).map(k => {
      let view: AIMLEventsByDeviceViewData = new AIMLEventsByDeviceViewData();
      view.deviceId = host.device_id;
      view.deviceName = host.device;
      view.deviceType = host.device_type;
      view.source = host.sources;
      view.event = k;
      view.count = events[k];
      viewData.push(view);
    })
    return viewData;
  }

  getDeviceEventChartData(timeline: string, device: string, source: string, description: string): Observable<AIMLEventTimelineByDevice> {
    let obj = { "timeline": timeline, "device_name": device, "description": description, "source": source };
    return this.http.post<AIMLEventTimelineByDevice>(`/customer/aiops/events/trends_graph_by_description/`, obj);
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

  convertToDeviceEventsChartData(timeline: string, tilimelineData: AIMLEventTimelineByDevice): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'line';
    view.legend = false;
    switch (timeline) {
      case UnityTimeDuration.LAST_WEEK: view.lables = this.getLastNDays(7); break;
      case UnityTimeDuration.LAST_MONTH: view.lables = this.getLastNDays(30); break;
      default: view.lables = this.getLastNHours(24); break;
    }
    let datalables: string[] = ['events'];
    datalables.map(dl => {
      let ds: ChartDataSets = {};
      ds.label = dl;
      ds.data = [];
      ds.backgroundColor = '#E2DAFF';
      ds.borderColor = '#6F47FF';
      tilimelineData[dl].forEach(td => {
        ds.data.push(td.count);
      })
      view.linedata.push(ds);
    })
    view.options = this.chartConfigService.getDefaultLineChartOptions();
    view.options.scales.yAxes[0].ticks.precision = 0;
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
}

export class AIMLEventsTrendBySeverityViewData {
  constructor() { }
  loader: string = 'AIMLAnalyticsTrendBySeverityLoader';
  chartData: UnityChartData;
}

export class AIMLEventsTrendByDadacenterViewData {
  constructor() { }
  loader: string = 'AIMLAnalyticsTrendByDatacenterLoader';
  chartData: UnityChartData;
}

export class AIMLEventsTrendByPrivateCloudViewData {
  constructor() { }
  loader: string = 'AIMLAnalyticsTrendByPrivateCloudLoader';
  chartData: UnityChartData;
}

export class AIMLNoisyHostsEventsByTypeViewData {
  constructor() { }
  loader: string = 'AIMLAnalyticsNoisyHostsByTypeLoader';
  viewType: string = 'chart';
  form: FormGroup;
  listData: AIMLEventsByDeviceViewData[] = [];
  chartData: UnityChartData;
  eventChartData: UnityChartData;
}

export class AIMLEventsByDeviceViewData {
  constructor() { }
  deviceId: number;
  deviceName: string;
  deviceType: string;
  source: string;
  event: string;
  count: number;
}

export class AIMLNoisyEventsViewData {
  constructor() { }
  loader: string = 'AIMLAnalyticsNoisyEventsLoader';
  chartData: UnityChartData;
}

export const eventsAnalyticsChartColors: string[] = [
  '#4A90E2', '#FFCB47', '#FF477B', '#59DBFF', '#CB47FF', '#FF884D', '#00897B', '#FF8CCB', '#D0021B', '#F5A623',
];