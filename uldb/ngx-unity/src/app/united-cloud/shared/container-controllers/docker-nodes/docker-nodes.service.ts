import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { Observable } from 'rxjs';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DockerNodeType } from 'src/app/shared/SharedEntityTypes/docker-node.type';
import { SYNC_DOCKER_NODES, GET_DOCKER_NODES, DELETE_DOCKER_NODE, WINDOWS_CONSOLE_VIA_AGENT, WINDOWS_CONSOLE_CLIENT, VM_CONSOLE_CLIENT, MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';

@Injectable()
export class DockerNodesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  syncNodes(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(SYNC_DOCKER_NODES(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  getNodes(criteria: SearchCriteria): Observable<PaginatedResult<DockerNodeType>> {
    return this.tableService.getData<PaginatedResult<DockerNodeType>>(GET_DOCKER_NODES(), criteria);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case "disconnected":
        return 'fa-exclamation-circle text-warning';
      case "down":
        return 'fa-circle text-danger';
      case "unknown":
        return 'fa-circle text-dark';
      default:
        return 'fa-circle text-success';
    }
  }

  convertToViewdata(nodes: DockerNodeType[]): DockerNodesViewdata[] {
    let viewData: DockerNodesViewdata[] = [];
    nodes.map(node => {
      let a = new DockerNodesViewdata();
      a.nodeId = node.uuid;
      a.hostname = node.hostname;
      a.clusterName = node.account.name;
      a.shortId = node.short_id;
      a.status = node.status;
      a.statusIcon = this.getStatusIcon(node.status);
      a.ipAddress = node.ip_address;
      a.cpus = node.cpus;
      a.memory = node.memory;
      a.cloud = node.account.cloud ? node.account.cloud.name + "(" +
        this.utilService.getCloudTypeByPlatformType(node.account.cloud.platform_type) + ")" : 'N/A';

      a.os = node.os ? node.os : 'N/A';
      if (node.os) {
        a.hasOS = true;
        a.platformType = node.os_type;
      }

      if (this.user.isManagementEnabled) {
        a.isSameTabEnabled = (!a.ipAddress.match('N/A') && a.hasOS && a.platformType.match('linux')) ? true : false;
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

        a.isNewTabEnabled = (!a.ipAddress.match('N/A') && a.hasOS && (a.platformType.match('windows') || a.platformType.match('linux'))) ? true : false;
        if (a.isNewTabEnabled && a.hasOS) {
          switch (a.platformType) {
            case 'windows': a.newTabTootipMessage = 'Open In New Tab';
              a.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), a.ipAddress) : WINDOWS_CONSOLE_CLIENT(a.ipAddress);
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

  deleteNode(nodeId: string) {
    return this.http.delete(DELETE_DOCKER_NODE(nodeId));
  }

  getConsoleAccessInput(node: DockerNodesViewdata): ConsoleAccessInput {
    return {
      label: DeviceMapping.DOCKER_NODE, deviceType: DeviceMapping.DOCKER_NODE,
      deviceId: node.nodeId, newTab: false, deviceName: node.hostname, managementIp: node.ipAddress
    };
  }
}

export class DockerNodesViewdata {
  constructor() { }
  nodeId: string;
  hostname: string;
  shortId: string;
  status: string;
  ipAddress: string;
  cpus: string;
  memory: string;
  cloud: string;
  clusterName: string;
  statusIcon: string

  hasOS: boolean;
  os: string;
  platformType: string;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabTootipMessage: string;
  newTabConsoleAccessUrl: string;
}
