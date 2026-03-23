import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IstioContainersType } from './istio-containers.type';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { GET_ISTIO_SERVICE_CONTAINERS } from 'src/app/shared/api-endpoint.const';
import { DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class IstioContainersService {

  constructor(
    private http: HttpClient) { }

  getContainers(meshId: string, nameSpace: string, podName: string) {
    return this.http.get<IstioContainersType[]>(GET_ISTIO_SERVICE_CONTAINERS(meshId, nameSpace, podName));
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case DeviceStatusMapping.RUNNING:
        return 'fa-circle text-success';
      case DeviceStatusMapping.TERMINATED:
        return 'fa-circle text-danger';
      default:
        return 'fa-exclamation-circle text-warning';
    }
  }

  convertToViewdata(containers: IstioContainersType[]): IstioContainerViewdata[] {
    let viewData: IstioContainerViewdata[] = [];
    containers.map(container => {
      let data = new IstioContainerViewdata();
      data.name = container.name;
      data.image = container.image;
      data.status = container.status;
      data.statusIcon = this.getStatusIcon(container.status);
      data.cpuRequest = container.cpu_request;
      data.memoryRequest = container.memory_request;
      viewData.push(data);
    });
    return viewData;
  }
}

export class IstioContainerViewdata {
  constructor() { }
  name: string;
  image: string;
  status: string;
  statusIcon: string;
  cpuRequest: string;
  memoryRequest: string;
}