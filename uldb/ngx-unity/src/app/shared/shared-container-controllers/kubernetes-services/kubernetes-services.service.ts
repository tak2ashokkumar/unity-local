import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_SERVICES, KUBERNETES_SYNC_SERVICES } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesServiceType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Injectable()
export class KubernetesServicesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getServices(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesServiceType>> {
    return this.tableService.getData<PaginatedResult<KubernetesServiceType>>(KUBERNETES_ACCOUNT_SERVICES(controllerId), criteria);
  }

  syncServices(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_SERVICES(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesServiceType[]): KubernetesServicesViewdata[] {
    let viewData: KubernetesServicesViewdata[] = [];
    items.map(item => {
      let a = new KubernetesServicesViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.serviceType = item.service_type ? item.service_type : 'N/A';
      a.clusterIp = item.cluster_ip ? item.cluster_ip : 'N/A';
      a.externalIp = (item.external_ips && item.external_ips.length) ? item.external_ips.join(', ') : 'N/A';
      a.ports = (item.ports && item.ports.length) ? item.ports.map((p) => p.port).join(', ') : 'N/A';
      a.age = item.created_at ? item.created_at : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesServicesViewdata {
  uuid: string;
  name: string;
  namespace: string;
  serviceType: string;
  clusterIp: string;
  externalIp: string;
  ports: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
