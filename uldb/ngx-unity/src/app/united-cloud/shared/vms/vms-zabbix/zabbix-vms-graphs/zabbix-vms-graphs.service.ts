import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ZABBIX_DEVICE_GRAPHS, ZABBIX_DEVICE_GRAPH_IMAGE } from 'src/app/shared/api-endpoint.const';
import * as moment from 'moment';
import { VmsZabbixMonitoringGraph } from '../vms-zabbix-monitoring.type';

@Injectable()
export class ZabbixVmsGraphsService {
  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private util: AppUtilityService) { }

  getGraphList(deviceId: string, deviceType: DeviceMapping,): Observable<VmsZabbixMonitoringGraph[]> {
    return this.http.get<VmsZabbixMonitoringGraph[]>(ZABBIX_DEVICE_GRAPHS(deviceType, deviceId));
  }

  convertGraphsToViewData(graphList: VmsZabbixMonitoringGraph[]): VmsMonitoringGraphViewdata[] {
    let viewData: VmsMonitoringGraphViewdata[] = [];
    graphList.map(g => {
      let a: VmsMonitoringGraphViewdata = new VmsMonitoringGraphViewdata();
      a.graphid = g.graph_id.toString();
      a.name = g.name;
      viewData.push(a);
    })
    return viewData;
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
      'required': 'From date is required'
    },
    'to': {
      'required': 'To date is required'
    }
  };

  buildForm(dateRange: DateRange): FormGroup {
    this.resetFormErrors();
    return this.buiilder.group({
      'graph_list': [[], [Validators.required]],
      'period': [VmsGraphRange.LAST_24_HOURS, [Validators.required]],
      'from': [new Date(dateRange.from), [Validators.required, NoWhitespaceValidator]],
      'to': [new Date(dateRange.to), [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.dateRangeValidator('from', 'to') });
  }

  getDateRangeByPeriod(graphRange: VmsGraphRange): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case VmsGraphRange.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case VmsGraphRange.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case VmsGraphRange.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case VmsGraphRange.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case VmsGraphRange.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  getGraph(deviceId: string, deviceType: DeviceMapping, graphId: string, formData: any): Observable<{ [key: string]: string }> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<{ [key: string]: string }>(ZABBIX_DEVICE_GRAPH_IMAGE(deviceType, deviceId, graphId), { params: params })
  }
}

export enum VmsGraphRange {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class VmsMonitoringGraphViewdata {
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
