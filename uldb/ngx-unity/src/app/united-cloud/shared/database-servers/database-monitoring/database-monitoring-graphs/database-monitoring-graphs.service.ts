import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DB_GRAPHS, DB_GRAPH_IMAGE } from 'src/app/shared/api-endpoint.const';
import * as moment from 'moment';
import { DatabaseMonitoringGraph } from '../database-monitoring.type';

@Injectable()
export class DatabaseMonitoringGraphsService {

  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private util: AppUtilityService) { }

  getGraphList(instanceId: string): Observable<DatabaseMonitoringGraph[]> {
    return this.http.get<DatabaseMonitoringGraph[]>(DB_GRAPHS(instanceId));
  }

  convertGraphsToViewData(graphList: DatabaseMonitoringGraph[]): DBMonitoringGraphView[] {
    let viewData: DBMonitoringGraphView[] = [];
    graphList.map(g => {
      let a: DBMonitoringGraphView = new DBMonitoringGraphView();
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
      'period': [DBGraphRange.LAST_24_HOURS, [Validators.required]],
      'from': [new Date(dateRange.from), [Validators.required, NoWhitespaceValidator]],
      'to': [new Date(dateRange.to), [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.dateRangeValidator('from', 'to') });
  }

  getDateRangeByPeriod(graphRange: DBGraphRange): DateRange {
    switch (graphRange) {
      case DBGraphRange.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format() };
      case DBGraphRange.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(), to: moment().subtract(1, 'd').endOf('d').format() };
      case DBGraphRange.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(), to: moment().subtract(1, 'w').endOf('w').format() };
      case DBGraphRange.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(), to: moment().subtract(1, 'M').endOf('M').format() };
      case DBGraphRange.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(), to: moment().subtract(1, 'y').endOf('y').format() };
      default: return null;
    }
  }

  getGraph(instanceId: string, graphId: string, formData: any): Observable<{ [key: string]: string }> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<{ [key: string]: string }>(DB_GRAPH_IMAGE(instanceId, graphId), { params: params })
  }
}

export enum DBGraphRange {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class DBMonitoringGraphView {
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
