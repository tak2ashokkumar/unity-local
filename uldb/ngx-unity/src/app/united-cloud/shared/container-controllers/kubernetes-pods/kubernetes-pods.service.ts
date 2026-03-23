import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { HttpClient } from '@angular/common/http';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { SYNC_KUBERNETES_PODS, GET_KUBERNETES_PODS, DELETE_KUBERNETES_PODS } from 'src/app/app-constants';
import { KubernetesPodType } from 'src/app/shared/SharedEntityTypes/kubernetes-pod.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AppUtilityService, DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class KubernetesPodsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService,) { }

  syncPods(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(SYNC_KUBERNETES_PODS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  getPods(criteria: SearchCriteria): Observable<PaginatedResult<KubernetesPodType>> {
    return this.tableService.getData<PaginatedResult<KubernetesPodType>>(GET_KUBERNETES_PODS(), criteria);
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

  convertToViewdata(pods: KubernetesPodType[]): KubernetesPodsViewdata[] {
    let viewData: KubernetesPodsViewdata[] = [];
    pods.map(pod => {
      let data = new KubernetesPodsViewdata();
      data.podId = pod.uuid;
      data.name = pod.name;
      data.namespace = pod.namespace;
      data.nodeName = pod.node_name;
      data.hostIp = pod.host_ip;
      data.podIp = pod.pod_ip;
      data.cloud = pod.account.cloud ? pod.account.cloud.name + "(" +
        this.utilSvc.getCloudTypeByPlatformType(pod.account.cloud.platform_type) + ")" : 'N/A';
      data.clusterName = pod.account.name;
      data.status = pod.phase;
      data.statusIcon = this.getStatusIcon(pod.phase);
      data.startTime = pod.start_time ? this.utilSvc.toUnityOneDateFormat(pod.start_time) : 'N/A';
      data.updatedAt = pod.updated_at ? this.utilSvc.toUnityOneDateFormat(pod.updated_at) : 'N/A';
      viewData.push(data);
    });
    return viewData;
  }

  deletePod(podId: string) {
    return this.http.delete(DELETE_KUBERNETES_PODS(podId));
  }

}

export class KubernetesPodsViewdata {
  constructor() { }
  podId: string;
  name: string;
  namespace: string;
  nodeName: string;
  hostIp: string;
  podIp: string;
  status: string;
  statusIcon: string
  startTime: string;
  updatedAt: string;
  cloud: string;
  clusterName: string;
} 