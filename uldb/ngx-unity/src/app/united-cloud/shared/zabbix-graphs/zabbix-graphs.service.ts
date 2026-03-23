import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Observable } from 'rxjs';
import { ZABBIX_DEVICE_GRAPH_IMAGE, ZABBIX_DEVICE_GRAPHS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceZabbixMonitoringGraph, ZabbixMonitoringGraph } from './zabbix-graphs.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class ZabbixGraphsService {

  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private tableService: TableApiServiceService,
    private util: AppUtilityService) { }

  getGraphList(deviceType: DeviceMapping, deviceId: string): Observable<ZabbixMonitoringGraph[]> {
    return this.http.get<ZabbixMonitoringGraph[]>(ZABBIX_DEVICE_GRAPHS(deviceType, deviceId));
  }

  getDeviceGraphs(criteria: SearchCriteria): Observable<PaginatedResult<DeviceZabbixMonitoringGraph>> {
    criteria.params[0].device_type = this.util.getDeviceAPIMappingByDeviceMapping(criteria.params[0].device_type);
    let params = this.tableService.getWithParam(criteria);
    console.log('params : ', params);
    return this.http.get<PaginatedResult<DeviceZabbixMonitoringGraph>>(`/customer/zabbix/zabbix-database-graphs/`, { params: params });
  }

  convertGraphsToViewData(graphList: ZabbixMonitoringGraph[]): ZabbixMonitoringGraphViewdata[] {
    let viewData: ZabbixMonitoringGraphViewdata[] = [];
    graphList.map(g => {
      let a = new ZabbixMonitoringGraphViewdata();
      a.graphid = g.graph_id.toString();
      a.name = g.name;
      viewData.push(a);
    })
    return viewData;
  }

  buildForm(dateRange: DateRange): FormGroup {
    this.resetFormErrors();
    return this.buiilder.group({
      'graph_list': [[], [Validators.required]],
      'period': [ZabbixGraphTimeRange.LAST_24_HOURS, [Validators.required]],
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

  getGraph(deviceType: DeviceMapping, deviceId: string, graphId: string, formData: any): Observable<{ [key: string]: string }> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<{ [key: string]: string }>(ZABBIX_DEVICE_GRAPH_IMAGE(deviceType, deviceId, graphId), { params: params })
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
