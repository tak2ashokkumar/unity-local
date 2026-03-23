import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IstioVirtualServicesType, IstioVirtualServiceStatusType } from './istio-virtual-services.type';
import { GET_ISTIO_VIRTUAL_SERVICE, GET_ISTIO_VIRTUAL_SERVICE_STATUS } from 'src/app/shared/api-endpoint.const';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class IstioVirtualServicesService {

  constructor(private http: HttpClient) { }

  getServices(meshId: string) {
    return this.http.get<IstioVirtualServicesType[]>(GET_ISTIO_VIRTUAL_SERVICE(meshId));
  }

  convertToViewData(services: IstioVirtualServicesType[]) {
    let viewData: IstioVirtualServiceViewData[] = [];
    services.map(vs => {
      let view: IstioVirtualServiceViewData = new IstioVirtualServiceViewData();
      view.name = vs.name;
      view.destinationHost = vs.destination_host;
      view.gateways = vs.gateways;
      view.namespace = vs.namespace;
      viewData.push(view);
    });
    return viewData;
  }

  getVirtualServiceStatus(meshId: string, serviceName: string, namespace: string): Observable<Map<string, string>> {
    return this.http.get(GET_ISTIO_VIRTUAL_SERVICE_STATUS(meshId, serviceName, namespace), { headers: Handle404Header })
      .pipe(
        map((res: IstioVirtualServiceStatusType) => {
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

export class IstioVirtualServiceViewData {
  constructor() { }
  destinationHost: string;
  namespace: string;
  name: string;
  gateways: string;
  status: string;
  statusIcon: string;
}
