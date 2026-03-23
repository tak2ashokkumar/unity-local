import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GET_GRAPH_BY_GRAPH_TYPE, GET_GRAPH_BY_OBSERVIUM_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { GraphRange } from 'src/app/shared/SharedEntityTypes/graph-range.type';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateRangeInUnix } from 'src/app/shared/SharedEntityTypes/DateRangeInUnix.type';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';

@Injectable()
export class GraphDetailsService {

  constructor(private http: HttpClient,
    private buiilder: FormBuilder, private util: AppUtilityService) { }


  getGraph(data: DeviceGraphDetailType, from: number, to: number): Observable<GraphDetailsType> {
    let params = new HttpParams().set('graph_type', data.graphType).set('from_date', from.toString()).set('to_date', to.toString());
    let url: string;
    if (data.portId) {
      url = GET_GRAPH_BY_OBSERVIUM_ID(data.deviceType, data.deviceId);
      params = params.set('observium_id', data.portId);
    } else {
      url = GET_GRAPH_BY_GRAPH_TYPE(data.deviceType, data.deviceId);
    }
    return this.http.get<GraphDetailsType>(url, { params: params });
  }

  resetFormErrors(): any {
    let formErrors = {
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  validationMessages = {
    'from': {
      'required': 'Subject is required'
    },
    'to': {
      'required': 'Priority is required'
    }
  };

  buildForm(data: DateRangeInUnix): FormGroup {
    this.resetFormErrors();
    return this.buiilder.group({
      'from': [new Date(data.from * 1000), [Validators.required, NoWhitespaceValidator]],
      'to': [new Date(data.to * 1000), [Validators.required, NoWhitespaceValidator]]
    }, { validators: this.util.dateRangeValidator('from', 'to') });
  }


}
export interface GraphDetailsType {
  graph: string;
}

export interface DeviceGraphDetailType extends DeviceGraphType {
  graphRange: GraphRange;
}