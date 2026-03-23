import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ZABBIX_GRAPH_PORT_GRAPH } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class GraphPortService {

  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private util: AppUtilityService) { } 
  
  buildForm(dateRange: DateRange): FormGroup {
    this.resetFormErrors();
    return this.buiilder.group({
      'period': [PortGraphRange.LAST_24_HOURS, [Validators.required]],
      'from': [new Date(dateRange.from), [Validators.required, NoWhitespaceValidator]],
      'to': [new Date(dateRange.to), [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.dateRangeValidator('from', 'to') });
  }

  getDateRangeByPeriod(graphRange: PortGraphRange): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case PortGraphRange.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case PortGraphRange.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case PortGraphRange.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case PortGraphRange.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case PortGraphRange.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  validationMessages = {
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

  getGraph(portId: string, formData: any): Observable<{ [key: string]: string }> {
    const format = new DateRange().format;
    const params = new HttpParams().set('uuid', portId).set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<{ [key: string]: string }>(ZABBIX_GRAPH_PORT_GRAPH(portId), { params: params })
  }

  convertGraphsToViewData(graph: {[key: string]: string}): GraphPortViewData[] {
    let viewData: GraphPortViewData[] = [];
    Object.keys(graph).map(key => {
      let a: GraphPortViewData = new GraphPortViewData();
      a.name = key;
      a.image = graph[key];
      viewData.push(a);
    })
    return viewData;
  }
}

export enum PortGraphRange {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class GraphPortViewData {
  name: string;
  image: string;
  constructor() { }
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}
