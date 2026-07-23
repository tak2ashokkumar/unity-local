import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KubernetesPodType } from 'src/app/shared/SharedEntityTypes/kubernetes-pod.type';
import { PRIVATE_CLOUD_CONTAINERS_PODS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceStatusMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AllDevicesContainersService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getAllPods(cloud_uuid: string, criteria: SearchCriteria): Observable<KubernetesPodType[]> {
    return this.tableService.getData<KubernetesPodType[]>(PRIVATE_CLOUD_CONTAINERS_PODS(cloud_uuid), criteria);
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

  convertToViewdata(pods: KubernetesPodType[]): AllDevicePodsViewData[] {
    let viewData: AllDevicePodsViewData[] = [];
    pods.map(pod => {
      let data = new AllDevicePodsViewData();
      data.name = pod.name;
      data.namespace = pod.namespace;
      data.status = pod.phase;
      data.statusIcon = this.getStatusIcon(pod.phase);
      data.clusterName = pod.account.name;
      data.podIp = pod.pod_ip;
      data.startTime = pod.start_time ? this.utilSvc.toUnityOneDateFormat(pod.start_time) : 'N/A';
      viewData.push(data);
    });
    return viewData;
  }
}

export class AllDevicePodsViewData {
  name: string;
  namespace: string;
  status: string;
  statusIcon: string;
  clusterName: string;
  podIp: string;
  startTime: string;
}