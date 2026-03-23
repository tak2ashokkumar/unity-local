import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { ApplicationMonitoringGraphCRUD, GraphResult, MetricsResponse } from './application-discovery-graphs.type';
import moment from 'moment';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { EChartsOption } from 'echarts';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import * as echarts from 'echarts';

@Injectable()
export class ApplicationDiscoveryGraphsService {
  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private tableService: TableApiServiceService,
    private util: AppUtilityService) { }

  getGraphList(device: DeviceTabData): Observable<ApplicationMonitoringGraphCRUD> {
    return this.http.get<ApplicationMonitoringGraphCRUD>(`/apm/monitoring/app_metrics_enabled_list/?uuid=${device.uuid}`);
  }


  convertToViewData(data: MetricsResponse[]) {
    // echarts.time.format(value, isLastTwentyFourHours ? '{HH}:{mm}' : '{MMM} {dd}, {yyyy} {HH}:{mm}', false);

  }

  convertToLineCharts(data: GraphResult[]): UnityChartDetails[] {
    let viewData: UnityChartDetails[] = [];
    data.map(item => {
      const timestamps = item.data.map(point => point.timestamp);
      const values = item.data.map(point => point.value);

      let view: UnityChartDetails = new UnityChartDetails();
      view.options = {
        title: {
          text: item.metric_name.replace(/_/g, ' '),
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const point = params[0];
            const time = echarts.time.format(point.axisValue, '{MMM} {dd}, {yyyy}, {HH}:{mm}', false);
            const value = point.data;
            return `${time}<br/>Value: ${value}`;
          }
        },
        xAxis: {
          type: 'category',
          data: timestamps,
          axisLabel: {
            rotate: 20,
            formatter: (value: string) => echarts.time.format(value, '{MMM} {dd}, {yyyy}, {HH}:{mm}', false)
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: values,
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 2
            }
          }
        ]
      };

      viewData.push(view);
    });
    return viewData;
  }

  buildForm(dateRange: DateRange): FormGroup {
    this.resetFormErrors();
    return this.buiilder.group({
      'graph_list': [[], [Validators.required]],
      'period': [ZabbixGraphTimeRange.LAST_MONTH, [Validators.required]],
      'from': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'to': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.sameOrAfterDateRangeValidator('from', 'to') });
  }

  resetFormErrors(): any {
    let formErrors = {
      'graph_list': '',
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  validationMessages = {
    'graph_list': {
      'required': 'Graph selection is required'
    },
    'period': {
      'required': 'Graph Period is required'
    },
    'from': {
      'required': 'From date is required',
    },
    'to': {
      'required': 'To date is required'
    }
  };

  getDateRangeByPeriod(graphRange: ZabbixGraphTimeRange): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case ZabbixGraphTimeRange.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case ZabbixGraphTimeRange.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case ZabbixGraphTimeRange.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case ZabbixGraphTimeRange.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case ZabbixGraphTimeRange.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  getGraph(deviceId: string, abc: SearchCriteria, filterForm: FormGroup): Observable<any> {
    const format = new DateRange().format;
    let params = new HttpParams()
      .set('uuid', deviceId)
      .set('range', filterForm.get('period').value);

    if (filterForm.get('period')?.value === 'custom') {
      const from = filterForm.get('from')?.value;
      const to = filterForm.get('to')?.value;

      if (from && to) {
        params = params
          .set('from', moment(from).format('YYYY-M-D HH:mm:ss'))
          .set('to', moment(to).format('YYYY-M-D HH:mm:ss'));
      }
    }
    if (filterForm.get('graph_list').value) {
      const graphList: string[] = filterForm.value.graph_list;

      graphList.forEach(metric => {
        params = params.append('metric_names', metric);
      });
    }
    return this.http.get<any>(`/apm/monitoring/active_graphs/`, { params: params })
  }
}

export enum ZabbixGraphTimeRange {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class ZabbixMonitoringGraphViewdata {
  graphid: string;
  name: string;
  image: string;
  constructor() { }
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export class ApplicationMonitoringGraphCRUDViewdata {
  appMetricEnabledList: string[];
}
