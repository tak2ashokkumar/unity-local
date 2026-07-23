import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { GET_DOCKER_CONTAINERS, SYNC_DOCKER_CONTAINERS } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { DockerContainerType } from 'src/app/shared/SharedEntityTypes/docker-container.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class DockerContainerService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  syncContainers(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(SYNC_DOCKER_CONTAINERS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  getContainers(criteria: SearchCriteria): Observable<PaginatedResult<DockerContainerType>> {
    return this.tableService.getData<PaginatedResult<DockerContainerType>>(GET_DOCKER_CONTAINERS(), criteria);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case "paused":
        return 'fa-exclamation-circle text-warning';
      case "dead":
        return 'fa-circle text-danger';
      case "exited":
        return 'fa-circle text-danger';
      case "removing":
      case "restarting":
        return 'fa-circle text-dark';
      default:
        return 'fa-circle text-success';
    }
  }

  convertToViewdata(containers: DockerContainerType[]): DockerContainersViewdata[] {
    let viewData: DockerContainersViewdata[] = [];
    containers.map(container => {
      let data = new DockerContainersViewdata();
      data.containerId = container.uuid;
      data.name = container.name;
      data.image = container.image;
      data.status = container.status;
      data.statusIcon = this.getStatusIcon(container.status);
      data.cpuUsage = container.cpu_usage;
      data.memoryUsage = container.memory_usage;
      // data.cloud = container.account.cloud ? container.account.cloud.name + "(" +
      //   this.utilService.getCloudTypeByPlatformType(container.account.cloud.platform_type) + ")" : 'N/A';
      // data.clusterName = container.account.name;
      data.monitoring = container.monitoring;
      data.statsTooltipMessage = 'Statistics';
      container.monitoring?.configured && container.monitoring?.enabled && container.status == 'running' ? data.isStatsButtonEnabled = true : data.isStatsButtonEnabled = false;
      viewData.push(data);
    });
    return viewData;
  }

  getDeviceData(device: DockerContainersViewdata) {
    if (!device.monitoring.configured) {
      if (!device.status) {
        device.status = 'Not Configured';
      }
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.status) {
        device.status = 'Monitoring Disabled';
      }
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    const url = ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.DOCKER_CONTAINER, device.containerId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.status) {
              device.status = value.status;
            }
            device.statsTooltipMessage = 'Container Statistics';
          }
          return device;
        })
      );
  }

}

export class DockerContainersViewdata {
  constructor() { }
  containerId: string;
  name: string;
  image: string;
  status: string;
  cpuUsage: string;
  memoryUsage: string;
  cloud: string;
  clusterName: string;
  statusIcon: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;
}
