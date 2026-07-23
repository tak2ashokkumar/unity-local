import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService, DeviceStatusMapping, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { Observable } from 'rxjs';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { KubernetesNodeType } from 'src/app/shared/SharedEntityTypes/kubernetes-node.type';
import { SYNC_KUBERNETES_NODES, GET_KUBERNETES_NODES, VM_CONSOLE_CLIENT, MANAGEMENT_NOT_ENABLED_MESSAGE, WINDOWS_CONSOLE_VIA_AGENT, WINDOWS_CONSOLE_CLIENT } from 'src/app/app-constants';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';

@Injectable()
export class KubernetesNodesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  syncNodes(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(SYNC_KUBERNETES_NODES(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  getNodes(criteria: SearchCriteria): Observable<PaginatedResult<KubernetesNodeType>> {
    return this.tableService.getData<PaginatedResult<KubernetesNodeType>>(GET_KUBERNETES_NODES(), criteria);
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

  convertToViewdata(nodes: KubernetesNodeType[]): KubernetesNodesViewdata[] {
    let viewData: KubernetesNodesViewdata[] = [];
    nodes.map(node => {
      let a = new KubernetesNodesViewdata();
      a.nodeId = node.uuid;
      a.name = node.name;
      a.memoryRequests = node.memory_requests ? node.memory_requests : 'N/A';
      a.memoryLimits = node.memory_limits ? node.memory_limits : 'N/A';
      a.cpuRequests = node.cpu_requests ? node.cpu_requests : 'N/A';
      a.cpuLimit = node.cpu_limit ? node.cpu_limit : 'N/A';
      a.cloud = node.account.cloud ? node.account.cloud.name + "(" +
        this.utilService.getCloudTypeByPlatformType(node.account.cloud.platform_type) + ")" : 'N/A';
      a.clusterName = node.account ? node.account.name : 'N/A';
      a.status = node.status;
      a.statusIcon = this.getStatusIcon(node.status);
      a.internalIp = node.internal_ip ? node.internal_ip : 'N/A';
      a.externalIp = node.external_ip ? node.external_ip : 'N/A';

      a.os = node.os ? node.os : 'N/A';
      if (node.os) {
        a.hasOS = true;
        a.platformType = node.os_type;
      }

      if (this.user.isManagementEnabled) {
        a.isSameTabEnabled = (!a.internalIp.match('N/A') && a.hasOS && a.platformType.match('linux')) ? true : false;
        if (a.hasOS) {
          switch (a.platformType) {
            case 'windows': a.sameTabTootipMessage = 'Open in same tab option is not available for windows machines';
              break;
            case 'linux': a.sameTabTootipMessage = 'Open in same tab';
              break;
            default: a.sameTabTootipMessage = 'Open in same tab option is not available';
              break;
          }
        } else {
          a.sameTabTootipMessage = 'Open in same tab option is not available';
        }

        a.isNewTabEnabled = (!a.internalIp.match('N/A') && a.hasOS && (a.platformType.match('windows') || a.platformType.match('linux'))) ? true : false;
        if (a.isNewTabEnabled && a.hasOS) {
          switch (a.platformType) {
            case 'windows': a.newTabTootipMessage = 'Open In New Tab';
              a.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), a.internalIp) : WINDOWS_CONSOLE_CLIENT(a.internalIp);
              break;
            case 'linux': a.newTabTootipMessage = 'Open In New Tab';
              a.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
              break;
            default: a.newTabTootipMessage = 'Open in new tab option is not available';
              break;
          }
        } else {
          a.newTabTootipMessage = 'Open in new tab option is not available';
        }
      } else {
        a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.newTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.isSameTabEnabled = false;
        a.isNewTabEnabled = false;
      }

      viewData.push(a);
    });
    return viewData;
  }

  getConsoleAccessInput(node: KubernetesNodesViewdata): ConsoleAccessInput {
    return {
      label: DeviceMapping.KUBERNETES_NODE, deviceType: DeviceMapping.KUBERNETES_NODE,
      deviceId: node.nodeId, newTab: false, deviceName: node.name, managementIp: node.internalIp
    };
  }

}

export class KubernetesNodesViewdata {
  constructor() { }
  nodeId: string;
  name: string;
  memoryRequests: string;
  memoryLimits: string;
  cpuRequests: string;
  status: string;
  statusIcon: string
  internalIp: string;
  externalIp: string;
  cpuLimit: string
  cloud: string;
  clusterName: string;

  hasOS: boolean;
  os: string;
  platformType: string;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabTootipMessage: string;
  newTabConsoleAccessUrl: string;
}
