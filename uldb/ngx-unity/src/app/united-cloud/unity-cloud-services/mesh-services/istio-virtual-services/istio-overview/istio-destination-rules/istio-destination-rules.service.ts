import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IstioDestRulesType } from './istio-destination-rules.type';
import { GET_ISTIO_DESTINATION_RULES } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class IstioDestinationRulesService {

  constructor(private http: HttpClient) { }

  getDestinationRules(meshId: string, nameSpace: string) {
    return this.http.get<IstioDestRulesType[]>(GET_ISTIO_DESTINATION_RULES(meshId, nameSpace));
  }

  convertToViewData(dRules: IstioDestRulesType[]) {
    let viewData: IstioDestRulesViewData[] = [];
    dRules.map(dr => {
      let view: IstioDestRulesViewData = new IstioDestRulesViewData();
      view.name = dr.name;
      view.host = dr.host;
      view.labels = dr.labels;
      view.namespace = dr.namespace;
      view.versions = dr.versions;
      viewData.push(view);
    });
    return viewData;
  }
}

export class IstioDestRulesViewData {
  constructor() { }
  host: string;
  labels: string;
  namespace: string;
  name: string;
  versions: string;
}