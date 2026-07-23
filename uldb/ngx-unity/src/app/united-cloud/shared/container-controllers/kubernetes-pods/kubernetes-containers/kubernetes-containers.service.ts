import { Injectable } from '@angular/core';
import { KubernetesContainerType } from 'src/app/shared/SharedEntityTypes/kubernetes-container.type';
import { HttpClient } from '@angular/common/http';
import { GET_KUBERNETES_CONTAINERS } from 'src/app/app-constants';
import { Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class KubernetesContainersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getContainers(criteria: SearchCriteria): Observable<PaginatedResult<KubernetesContainerType>> {
    return this.tableService.getData<PaginatedResult<KubernetesContainerType>>(GET_KUBERNETES_CONTAINERS(), criteria);
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

  convertToViewdata(containers: KubernetesContainerType[]): KubernetesContainersViewdata[] {
    let viewData: KubernetesContainersViewdata[] = [];
    containers.map(container => {
      let data = new KubernetesContainersViewdata();
      data.uuid = container.uuid;
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

export class KubernetesContainersViewdata {
  constructor() { }
  uuid: string;
  name: string;
  image: string;
  status: string;
  statusIcon: string;
  cpuRequest: string;
  memoryRequest: string;
}