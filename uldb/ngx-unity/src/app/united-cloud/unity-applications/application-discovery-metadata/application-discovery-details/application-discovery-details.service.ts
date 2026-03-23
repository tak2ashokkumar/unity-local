import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { DateRange } from 'src/app/unity-services/aiml-summary/aiml-summary.service';
import { DeviceUtilization, LatestMetricValue, ServerUtilization, TopLogsAndTraces } from './application-discovery-details.type';
import { UnityApplicationTopology } from 'src/app/shared/SharedEntityTypes/unity-application-topology.type';

@Injectable()
export class ApplicationDiscoveryDetailsService {
  dateRange: DateRange;

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService,
    private chartConfigSvc: UnityChartConfigService,) { }

  getServerInfo(deviceId: string): Observable<ServerUtilization> {
    return this.http.get<ServerUtilization>(`/apm/monitoring/server_data/?uuid=${deviceId}`);
  }

  convertToServerUtilizationViewData(data: ServerUtilization): ServerUtilizationViewData {
    let viewData: ServerUtilizationViewData = new ServerUtilizationViewData();
    viewData.hostname = data.hostname
    viewData.httpFlavor = data.http_flavor;
    viewData.httpStatus = data.http_status;
    viewData.httpTarget = data.http_target;
    viewData.latency = data.latency;
    viewData.name = data.server_name;
    viewData.hostIp = data.host_ip;
    viewData.sdkLanguage = data.sdk_language;
    viewData.serviceVersion = data.service_version;
    viewData.throughput = data.throughput;
    viewData.userAgent = data.user_agent;
    viewData.port = data.port;
    viewData.filePath = data.filepath;
    viewData.erroRate = data.error_rate;

    return viewData;
  }

  getTopologyData(deviceId: string): Observable<UnityApplicationTopology> {
    return this.http.get<UnityApplicationTopology>(`/apm/monitoring/topology/?uuid=${deviceId}`);
  }

  getUtilizationOverviewData(from: string, to: string, deviceId: string): Observable<any> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any>(`/apm/monitoring/cpu_memory_utilization/?uuid=${deviceId}`, { params: params })
  }

  getChartData(deviceId: string): Observable<any> {
    return this.http.get<any>(`/apm/monitoring/logs/?uuid=${deviceId}`);
  }

  utilizationOverviewViewData(): UtilizationOverviewViewData {
    let view = new UtilizationOverviewViewData();
    view.dropdownOptions = [
      { label: 'Last 7 Days', value: 'last_7_days' },
      { label: 'Last 30 Days', value: 'last_30_days' },
      { label: 'Last 60 Days', value: 'last_60_days' },
      { label: 'Last 90 Days', value: 'last_90_days' },
    ];
    view.defaultSelected = view.dropdownOptions.find(opt => opt.value == 'last_90_days').value;
    return view;
  }

  convertToUtilizationChartViewData(raw: DeviceUtilization): UtilizationChartViewData {
    const chartPoints: LineChartPoint[] = [];

    if (raw.memory_utilization && raw.cpu_utilization) {
      for (let i = 0; i < raw.memory_utilization.length; i++) {
        const mem = raw.memory_utilization[i];
        const cpu = raw.cpu_utilization[i];

        chartPoints.push({
          range: mem.range,
          memoryAvg: mem.average,
          cpuAvg: cpu.average,
        });
      }
    }

    // const xAxisLabels = chartPoints.map(p => p.range);
    // const memoryValues = chartPoints.map(p => p.memoryAvg);
    // const cpuValues = chartPoints.map(p => p.cpuAvg);

    return {
      chartPoints,
      currentMemory: +(raw.current_memory_utilization).toFixed(2),
      averageMemory: +(raw.average_memory_utilization).toFixed(2),
      peakMemory: this.peakUtilization(raw.peak_memory_utilization),

      currentCPU: +(raw.current_cpu_utilization).toFixed(2),
      averageCPU: +(raw.average_cpu_utilization).toFixed(2),
      peakCPU: this.peakUtilization(raw.peak_cpu_utilization)
    };
  }

  getUtilizationChartOptions(data: UtilizationChartViewData): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['CPU Utilization', 'Memory Utilization'],
        bottom: 0
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.chartPoints.map(p => p.range),
        axisLabel: {
          rotate: 45,
          formatter: (val: string) => val
        }
      },
      yAxis: {
        type: 'value',
        name: 'Average Utilization',
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
          name: 'CPU Utilization',
          type: 'line',
          data: data.chartPoints.map(p => p.cpuAvg),
          color: '#3b82f6',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2
          }
        },
        {
          name: 'Memory Utilization',
          type: 'line',
          data: data.chartPoints.map(p => p.memoryAvg),
          color: '#10b981',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2
          }
        }
      ]
    };
    return view;
  }

  convertToLineChartData(graphData: Record<string, number[]>) {
    let view: UnityChartDetails = new UnityChartDetails();
    let colors = [
      { name: 'Line 1', color: '#378AD8' },
      { name: 'Line 2', color: '#FF8800' },
      { name: 'Line 3', color: '#4CAF50' }
    ];

    view.type = UnityChartTypes.LINE;
    view.options = {
      targetEntity: 'LineData',
      // chartName: ChartNames.LINE_CHART_EXAMPLE,
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          return params.map((p: any) => `${p.seriesName}: ${p.value}`).join('<br/>');
        }
      },
      legend: {
        data: colors.map(c => c.name),
        formatter: function (name: string) {
          return `${name}`;
        }
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: colors.map(col => ({
        name: col.name,
        data: graphData[col.name.toLowerCase()] || [],
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { color: col.color },
        itemStyle: { color: col.color }
      }))
    };

    view.extensions = []; // optional: add if you use chart extensions
    return view;
  }



  getMetricsApplicationInfo(deviceId: string): Observable<LatestMetricValue[]> {
    return this.http.get<LatestMetricValue[]>(`apm/monitoring/metrics_application_information/?uuid=${deviceId}`);
  }

  convertToMetricsApplicationViewData(data: LatestMetricValue[]): LatestMetricValueViewData[] {
    let viewData: LatestMetricValueViewData[] = [];
    data.map(s => {
      let view: LatestMetricValueViewData = new LatestMetricValueViewData();
      view.latestTimestamp = s.latest_timestamp;
      view.latestValue = s.latest_value;
      view.metricName = this.toTitleCase(s.metric_name);;
      viewData.push(view);
    })
    return viewData;
  }

  getRecentLogsAndTracesData(deviceId: string): Observable<any> {
    return this.http.get<any>(`/apm/monitoring/top_recent_logs_trace/?uuid=${deviceId}`);
  }

  convertToLogsAndTracesViewData(data: TopLogsAndTraces): TopLogsAndTracesViewData {
    let viewData: TopLogsAndTracesViewData = new TopLogsAndTracesViewData();
    data.top_traces.map(s => {
      let view: TopTracesViewData = new TopTracesViewData();
      view.traceId = s.trace_id;
      view.spanId = s.span_id;
      view.serviceName = s.service_name;
      view.startTime = s.start_time ? this.utilSvc.toUnityOneDateFormat(s.start_time) : 'NA';
      view.endTime = s.end_time ? this.utilSvc.toUnityOneDateFormat(s.end_time) : 'NA';
      view.hostname = s.hostname;
      view.httpUrl = s.http_url;
      view.httpMethod = s.http_method;
      view.sdkLanguage = s.sdk_language;
      view.hostPort = s.host_port;
      view.userAgent = s.user_agent;
      view.status = this.utilSvc.getDeviceStatus(s.status.toString());
      view.statusCode = s.status_code;
      viewData.topTraces.push(view);
    })

    data.top_logs.map(s => {
      let view: TopLogsViewData = new TopLogsViewData();

      view.id = s.id;
      view.hostname = s.hostname;
      view.application = s.application;
      view.timestamp = s.timestamp ? this.utilSvc.toUnityOneDateFormat(s.timestamp) : 'NA';
      view.httpRoute = s.http_route;
      view.serviceName = s.service_name;
      view.tenantId = s.tenant_id;
      view.message = s.message;
      view.severity = s.severity;
      view.traceId = s.trace_id;
      view.spanId = s.span_id;
      view.filePath = s.file_path;
      view.functionName = s.function_name;
      view.lineNumber = s.line_number;
      view.flags = s.flags;
      view.createdAt = s.created_at;
      view.updatedAt = s.updated_at;
      view.app = s.app;
      view.statusCode = s.status_code;
      view.status = s.status;
      if (s.status == "INFO") {
        view.statusIcon = 'text-primary fas fa-info-circle'
      } else if (s.status == "WARNING") {
        view.statusIcon = 'text-warning fas fa-exclamation-circle'
      } else {
        view.statusIcon = 'text-danger fas fa-exclamation-triangle'
      }

      viewData.topLogs.push(view);
    })

    return viewData;
  }

  toTitleCase(snakeStr: string): string {
    return snakeStr
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  peakUtilization(rawPeak : string): string {
    const parts = rawPeak.split('@');
    const numPart = parseFloat(parts[0].trim());
    const roundedNum = numPart.toFixed(2);
    const rest = parts[1] ? parts[1].trim() : '';

    return `${roundedNum} in ${rest}`;
  }

}

export class DetailsWidgetGraphViewData {
  loader: string = 'taskWidgetLoader';
  count: number = 0;
  byMemoryChartData: UnityChartDetails;
}

export class UtilizationDataPoint {
  constructor() { }
  timestamp: string;
  value: number;
}

export class UtilizationTrendData {
  constructor() { };
  memoryUtilization: UtilizationDataPoint[];
  cpuUtilization: UtilizationDataPoint[];
}

export class ServerUtilizationViewData {
  constructor() { };
  httpFlavor: string;
  latency: string;
  httpTarget: string;
  throughput: string;
  name: string;
  httpStatus: number;
  sdkLanguage: string;
  hostname: string;
  serviceVersion: string | null;
  userAgent: string;
  hostIp: string;
  port: string;
  filePath: string;
  erroRate: string;
}

export class TopLogsViewData {
  constructor() { };
  id: number;
  hostname: string;
  application: string;
  timestamp: string;
  httpRoute: string;
  serviceName: string;
  tenantId: string;
  message: string;
  severity: string;
  traceId: string;
  spanId: string;
  filePath: string;
  functionName: string;
  lineNumber: number;
  flags: any;
  createdAt: string;
  updatedAt: string;
  app: number;
  statusCode: string;
  statusIcon: string;
  status: string;
}

export class TopTracesViewData {
  constructor() { };
  traceId: string;
  spanId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  hostname: string;
  httpUrl: string;
  httpMethod: string;
  sdkLanguage: string;
  hostPort: string;
  userAgent: string;
  statusCode: string;
  status: string;
}

export class TopLogsAndTracesViewData {
  constructor() { };
  topLogs: TopLogsViewData[] = [];
  topTraces: TopTracesViewData[] = [];
}

export class LatestMetricValueViewData {
  constructor() { };
  latestValue: number;
  latestTimestamp: string;
  metricName: string;
}

export class UtilizationOverviewViewData {
  loader: string = 'executionsOverviewWidgetLoader';
  dropdownOptions: CustomDateRangeType[];
  defaultSelected: string;
  formData: any;
  utilizationRateChartData?: UnityChartDetails;
  utilizationRateChartDataAndOthers?: any;
  // efficiencyChartData?: UnityChartDetails;
}

export interface LineChartPoint {
  range: string;      // like "00:00-00:59"
  memoryAvg: number;      // memory utilization average for that hour
  cpuAvg: number;         // cpu utilization average for that hour
}

export interface UtilizationChartViewData {
  chartPoints: LineChartPoint[];
  currentMemory: number;
  averageMemory: number;
  peakMemory: string;

  currentCPU: number;
  averageCPU: number;
  peakCPU: string;
}
