import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ApplicationFailureAnalysisIntervalType, ApplicationFailureAnalysisType, ApplicationFailureEventsType, ApplicationFailureLogsType } from 'src/app/shared/SharedEntityTypes/application.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { cloneDeep as _clone } from 'lodash-es';

@Injectable()
export class ApplicationDiscoveryFailuresService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,) { }

  getAnalysisData(appId: string, filter: string) {
    let params: HttpParams = new HttpParams().set('app_id', appId).set('filter', filter);
    return this.http.get<ApplicationFailureAnalysisType[]>(`/apm/monitoring/failure_analysis/`, { params: params });
  }

  convertToAnalysisChartData(data: ApplicationFailureAnalysisIntervalType[]): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    let axisLabels = [];
    let seriesData = [];
    data.forEach(d => {
      axisLabels.push(d.label);
      seriesData.push(d.error_rate);
    })

    view.options.grid = {
      left: 60,
      right: 40,
      top: 20,
      bottom: 30
    };
    view.options.tooltip = {
      trigger: 'axis',
      valueFormatter: v => `${v}/min`,
    }

    view.options.xAxis = {
      type: 'category',
      boundaryGap: false,
      data: axisLabels
    }

    view.options.yAxis = {
      type: 'value',
      min: 0,
      max: 'dataMax',
      axisLabel: {
        formatter: '{value}/min',
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dotted'  // dotted lines from Y-axis ✅
        }
      }
    }
    view.options.series = [
      {
        data: seriesData,
        type: 'bar',
        barWidth: 40, // 🔹 Fixed width in pixels
      }
    ]
    return view;
  }

  getEvents(criteria: SearchCriteria): Observable<PaginatedResult<ApplicationFailureEventsType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<ApplicationFailureEventsType>>(`/apm/monitoring/failure_events/`, { params: params });
  }

  convertToEventsViewData(data: ApplicationFailureEventsType[]): ApplicationFailureEventsViewData[] {
    let viewData: ApplicationFailureEventsViewData[] = [];
    data.forEach(d => {
      let view: ApplicationFailureEventsViewData = new ApplicationFailureEventsViewData();
      view.service = d.service;
      view.endpoint = d.endpoint;
      view.reason = d.description;
      view.requests = d.count;
      view.timestamp = d.timestamp && d.timestamp !== 'N/A' ? this.utilSvc.toUnityOneDateFormat(d.timestamp) : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  getLogs(criteria: SearchCriteria): Observable<PaginatedResult<ApplicationFailureLogsType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<ApplicationFailureLogsType>>(`/apm/monitoring/failure_logs/`, { params: params });
  }

  convertToLogsViewData(data: ApplicationFailureLogsType[]): ApplicationFailureLogsViewData[] {
    let viewData: ApplicationFailureLogsViewData[] = [];
    data.forEach(d => {
      let view = new ApplicationFailureLogsViewData();
      view.timestamp = d.timestamp ? this.utilSvc.toUnityOneDateFormat(d.timestamp) : 'NA';
      view.status = d.severity;
      view.statusIcon = d.severity == 'ERROR' ? 'fas fa-exclamation-triangle text-danger' : (d.severity == 'WARNING' ? 'fas fa-exclamation-circle text-warning' : 'fas fa-info-circle text-success');
      view.content = `[${d.severity}] ${d.message}`;
      viewData.push(view);
    })
    return viewData;
  }
}

export class ApplicationFailureAnalysisViewData {
  loader: string = 'executionsOverviewWidgetLoader';
  dropdownOptions: CustomDateRangeType[] = customDateRangeOptions;
  defaultSelected: string = 'last_30_days';
  formData: any;
  chartData?: UnityChartDetails;
}
export const customDateRangeOptions: CustomDateRangeType[] = [
  { label: 'Last 30 mins', value: 'last_30_minutes' },
  { label: 'Last 1 hour', value: 'last_1_hour' },
  { label: 'Last 2 hours', value: 'last_2_hours' },
  { label: 'Last 24 hours', value: 'last_24_hours' },
  { label: 'Last 7 days', value: 'last_1_week' },
  { label: 'Last 30 days', value: 'last_30_days' },
  { label: 'Last 60 days', value: 'last_60_days' },
  { label: 'Last 90 days', value: 'last_90_days' },
  { label: 'Last 1 year', value: 'last_1_year' },
]

export class ApplicationFailureEventsViewData {
  service: string;
  endpoint: string;
  reason: string;
  requests: number;
  timestamp?: string;
}

export class ApplicationFailureLogsViewData {
  timestamp: string;
  status: string;
  statusIcon: string;
  content: string;
}
