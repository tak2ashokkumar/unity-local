import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import { AppUtilityService, DateRange, NoWhitespaceValidator, UnityTimeDuration } from 'src/app/shared/app-utility/app-utility.service';
import { OntapMonitoringStatisticsGraphItem } from '../storage-ontap.type';

@Injectable()
export class StorageOntapStatisticsService {

  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private util: AppUtilityService) { }

  getGraphList(clusterId: string, itemName: string): Observable<OntapMonitoringStatisticsGraphItem[]> {
    return this.http.get<OntapMonitoringStatisticsGraphItem[]>(`customer/storagedevices/${clusterId}/monitoring/items/?item_name=${itemName}`)
  }

  convertGraphsToViewData(graphList: OntapMonitoringStatisticsGraphItem[]): StorageOntapStatisticsViewdata[] {
    let viewData: StorageOntapStatisticsViewdata[] = [];
    graphList.map(g => {
      let a = new StorageOntapStatisticsViewdata();
      a.graphid = g.item_id.toString();
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
      'period': [UnityTimeDuration.LAST_24_HOURS, [Validators.required]],
      'from': [new Date(dateRange.from), [Validators.required, NoWhitespaceValidator]],
      'to': [new Date(dateRange.to), [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.dateRangeValidator('from', 'to') });
  }

  getDateRangeByPeriod(graphRange: UnityTimeDuration): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case UnityTimeDuration.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case UnityTimeDuration.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case UnityTimeDuration.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case UnityTimeDuration.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case UnityTimeDuration.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  getGraph(clusterId: string, itemId: string, formData: any): Observable<{ [key: string]: string }> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<{ [key: string]: string }>(`/customer/storagedevices/${clusterId}/monitoring/item_graph_image/${itemId}/`, { params: params });
  }
}

export class StorageOntapStatisticsViewdata {
  graphid: string;
  name: string;
  image?: string;
  constructor() { }
}
