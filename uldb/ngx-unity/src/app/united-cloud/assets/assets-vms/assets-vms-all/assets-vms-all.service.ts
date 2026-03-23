import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_ALL_VMS, SYNC_ALL_VMS, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take, map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AllVM } from 'src/app/shared/SharedEntityTypes/all-vm.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Injectable()
export class AssetsVmsAllService {

  constructor(private http: HttpClient,
    private utilService: AppUtilityService,
    private appService: AppLevelService,
    private tableService: TableApiServiceService,) { }

  getAllVms(criteria: SearchCriteria): Observable<PaginatedResult<AllVM>> {
    return this.tableService.getData<PaginatedResult<AllVM>>(GET_ALL_VMS(), criteria);
  }

  syncAllVms() {
    return this.http.get<CeleryTask>(SYNC_ALL_VMS())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 50).pipe(take(1))), take(1));
  }

  convertToViewData(vms: AllVM[]): AllVMViewData[] {
    let viewData: AllVMViewData[] = [];
    vms.map(vm => {
      let data: AllVMViewData = new AllVMViewData();
      data.cloudName = vm.cloud_name;
      data.cloudType = vm.cloud_type;
      data.vmId = vm.uuid;
      data.os = vm.os;
      data.name = vm.name;
      data.monitoring = vm.monitoring;
      if (vm.last_known_state == 'poweredOn' || vm.last_known_state == 'ACTIVE' || vm.last_known_state == 'running' || vm.last_known_state == 'VM running' ||
        vm.last_known_state == 'RUNNING' || vm.last_known_state == 'POWERED_ON' || vm.last_known_state == 'Running' || vm.last_known_state == 'on') {
        data.powerStatus = 'Up';
      } else if (vm.last_known_state == 'poweredOff' || vm.last_known_state == 'SHUTOFF' || vm.last_known_state == 'stopped' || vm.last_known_state == 'VM deallocated' ||
        vm.last_known_state == 'VM stopped' || vm.last_known_state == 'VM deallocating' || vm.last_known_state == null ||
        vm.last_known_state == 'TERMINATED' || vm.last_known_state == 'POWERED_OFF' || vm.last_known_state == 'Off' || vm.last_known_state == 'off') {
        data.powerStatus = 'Down';
      } else {
        data.powerStatus = 'Unknown';
      }
      viewData.push(data);
    });
    return viewData;
  }

  getDeviceData(device: AllVMViewData) {
    if (!device.monitoring.configured) {
      device.powerStatus = 'Not Configured';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      device.powerStatus = this.utilService.getDeviceStatus('-2');
      return EMPTY;
    }
    const url = (device.monitoring && device.monitoring.observium) ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.CUSTOM_VIRTUAL_MACHINE, device.vmId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.CUSTOM_VIRTUAL_MACHINE, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            device.powerStatus = this.utilService.getDeviceStatus(value.status);
          }
          return device;
        })
      );
  }
}

export class AllVMViewData {
  cloudName: string;
  cloudType: string;
  os: string;
  name: string;
  vmId: string;
  powerStatus: string;
  monitoring?: DeviceMonitoringType;
  constructor() { }
}
