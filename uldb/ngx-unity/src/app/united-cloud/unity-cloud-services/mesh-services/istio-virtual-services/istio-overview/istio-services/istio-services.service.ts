import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IstioServiceType } from './istio-service.type';
import { GET_ISTIO_SERVICES, GET_ISTIO_SERVICE_STATUS } from 'src/app/shared/api-endpoint.const';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class IstioServicesService {

  constructor(private http: HttpClient) { }

  getServices(meshId: string, nameSpace: string) {
    return this.http.get<IstioServiceType[]>(GET_ISTIO_SERVICES(meshId, nameSpace));
  }

  convertToViewData(dRules: IstioServiceType[]) {
    let viewData: IstioServiceViewdata[] = [];
    dRules.map(dr => {
      let view: IstioServiceViewdata = new IstioServiceViewdata();
      view.name = dr.name;
      view.namespace = dr.namespace;
      view.clusterIp = dr.cluster_ip;
      viewData.push(view);
    });
    return viewData;
  }

  getServiceStatus(meshId: string, serviceName: string, namespace: string): Observable<Map<string, string>> {
    return this.http.get(GET_ISTIO_SERVICE_STATUS(meshId, serviceName, namespace), { headers: Handle404Header })
      .pipe(
        map((res: any) => {
          return new Map<string, string>().set(serviceName, res.status);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(serviceName, null));
        })
      );
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case DeviceStatusMapping.RUNNING:
        return 'fa-circle text-success';
      case DeviceStatusMapping.FAILED:
        return 'fa-circle text-danger';
      default:
        return 'fa-exclamation-circle text-warning';
    }
  }
}
export class IstioServiceViewdata {
  constructor() { }
  clusterIp: string;
  namespace: string;
  name: string;
  status: string;
  statusIcon: string;
}