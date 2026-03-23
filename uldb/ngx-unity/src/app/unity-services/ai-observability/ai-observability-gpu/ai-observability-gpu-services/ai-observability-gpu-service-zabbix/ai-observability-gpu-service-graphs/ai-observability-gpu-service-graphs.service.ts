import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SeriesOption } from 'echarts';
import moment from 'moment';

import * as echarts from 'echarts';
import { GPUGraphCRUDType } from '../ai-observability-gpu-service-graphs-crud/ai-observability-gpu-service-graphs-crud.service';

@Injectable()
export class AiObservabilityGpuServiceGraphsService {
  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private util: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
  ) { }

  getGraphList(device: DeviceTabData): Observable<PaginatedResult<GPUGraphCRUDType>> {
    let params: HttpParams = new HttpParams();
    // params = params.append('page_size', 0);
    return this.http.get<PaginatedResult<GPUGraphCRUDType>>(`/customer/observability/gpus/${device.uuid}/graphs/`, { params: params });
  }

  convertToLineCharts(data: any[], filterForm: any): UnityChartDetails[] {
    if (!data.length) {
      return;
    }
    let dataPresent: boolean = false;
    data.map(item => {
      if (item.length > 0 || dataPresent) {
        dataPresent = true;
      }
    })

    let viewData: UnityChartDetails[] = [];

    if (dataPresent) {
      data.map(item => {
        let view: UnityChartDetails = new UnityChartDetails();
        view.type = UnityChartTypes.LINE;

        // 1. Extract timestamps
        const isLastTwentyFourHours = this.getChartDateFormate(filterForm);
        const timestamps = item.map((d) => this.util.toUnityOneDateFormat(d.timestamp, isLastTwentyFourHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'));

        // 2. Extract each series
        const metrics = Object.keys(item[0]).filter((k) => k !== "timestamp");

        const series: SeriesOption[] = metrics.map((metric) => ({
          name: metric,
          type: "line",
          data: item.map((d) => d[metric].value),
          smooth: true,
          showSymbol: true,
          lineStyle: {
            width: 4
          }
        }));

        view.options = {
          title: {
            // text: item.metric_name.replace(/_/g, ' '),
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            // formatter: (params: any) => {
            //   return params
            //     .map((p: any) => {
            //       const metric = p.seriesName;
            //       const unit = item[p.dataIndex][metric]?.unit || "";
            //       return `${p.marker} ${p.seriesName}: ${p.value} ${unit}`;
            //     })
            //     .join("<br/>");
            // },
            formatter: (params: any) => {
              const lines = params.map((p: any) => {
                const metric = p.seriesName;
                const unit = item[p.dataIndex][metric]?.unit || "";
                return `${p.marker} ${metric}: ${p.value} ${unit}`;
              });
              return `${params[0].axisValue}<br/>${lines.join("<br/>")}`;
            },
          },
          legend: {
            data: metrics,
            bottom: 0,
            left: 'center',
          },
          xAxis: {
            type: 'category',
            // boundaryGap: false,
            data: timestamps,
            boundaryGap: true,
            offset: 20,
            axisLabel: {
              rotate: 20,
              formatter: (value: string) => echarts.time.format(value, '{MMM} {dd}, {yyyy}, {HH}:{mm}', false),
            }
          },
          grid: {
            left: '10%',
            right: '10%',
            top: '10%',
            bottom: '15%',
            containLabel: true
          },
          yAxis: {
            type: 'value'
          },
          series: series,
        };

        viewData.push(view);
      })
    }
    return viewData;

  }

  getChartDateFormate(fliterFormData: any) {
    const diffInSeconds: number = (new Date(fliterFormData?.to).getTime() - new Date(fliterFormData?.from).getTime()) / 1000;
    let isLastTwentyFourHours: boolean = false;
    if (diffInSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    return isLastTwentyFourHours;
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

  getGraphData(filterForm: any): Observable<any[]> {
    const uuids = filterForm.graph_list;
    const requests = uuids.map((uuid: string) =>
      this.getGraph(uuid, filterForm)
    );

    return forkJoin(requests)
    // .pipe(map((results: any) =>
    //   results.filter(arr => arr.length > 0).flat()));
  }

  getGraph(uuid: string, filterForm: any): Observable<any> {
    const format = new DateRange().format;
    let params = new HttpParams().set('from', moment(filterForm['from']).format(format)).set('to', moment(filterForm['to']).format(format));
    return this.http.get<any>(`/customer/observability/service_graphs/${uuid}/plot_graph/`, { params: params })
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

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}
