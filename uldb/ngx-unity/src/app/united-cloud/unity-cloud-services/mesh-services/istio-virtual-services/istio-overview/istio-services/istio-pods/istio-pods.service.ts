import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_ISTIO_SERVICE_PODS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IstioPodsType } from './istio-pods.type';

@Injectable()
export class IstioPodsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,) { }

  getpods(meshId: string, nameSpace: string, serviceName: string) {
    return this.http.get<IstioPodsType[]>(GET_ISTIO_SERVICE_PODS(meshId, nameSpace, serviceName));
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case DeviceStatusMapping.PENDING:
        return 'fa-exclamation-circle text-warning';
      case DeviceStatusMapping.FAILED:
        return 'fa-circle text-danger';
      case DeviceStatusMapping.UNKNOWN:
        return 'fa-circle text-dark';
      default:
        return 'fa-circle text-success';
    }
  }

  convertToViewdata(pods: IstioPodsType[]): IstioPodViewdata[] {
    let viewData: IstioPodViewdata[] = [];
    pods.map(pod => {
      let data = new IstioPodViewdata();
      data.name = pod.name;
      data.namespace = pod.namespace;
      data.nodeName = pod.node_name;
      data.hostIp = pod.host_ip;
      data.podIp = pod.pod_ip;
      data.phase = pod.phase;
      data.statusIcon = this.getStatusIcon(pod.phase);
      data.startTime = pod.start_time ? this.utilSvc.toUnityOneDateFormat(pod.start_time) : 'N/A';
      viewData.push(data);
    });
    return viewData;
  }
}

export class IstioPodViewdata {
  constructor() { }
  name: string;
  podIp: string;
  startTime: string;
  namespace: string;
  hostIp: string;
  nodeName: string;
  phase: string;
  statusIcon: string;
}