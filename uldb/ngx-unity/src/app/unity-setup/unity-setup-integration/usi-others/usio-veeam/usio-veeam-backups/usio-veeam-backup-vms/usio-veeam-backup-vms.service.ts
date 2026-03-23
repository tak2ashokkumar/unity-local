import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsioVeeamBackupVmsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getBackupVMs(criteria: SearchCriteria, backupId: string): Observable<PaginatedResult<VeeamAccountBackupVMsType>> {
    return this.tableService.getData<PaginatedResult<VeeamAccountBackupVMsType>>(`/customer/veeam/backup_jobs/${backupId}/virtual_machines/`, criteria);
  }

  convertToViewData(data: VeeamAccountBackupVMsType[]): VeeamAccountBackupVMsViewData[] {
    let viewData: VeeamAccountBackupVMsViewData[] = [];
    data.forEach(d => {
      let data: VeeamAccountBackupVMsViewData = new VeeamAccountBackupVMsViewData();
      data.vmId = d.uuid;
      data.backupId = d.backup_job_uuid;
      data.name = d.name;
      data.vmStatus = this.utilSvc.getDeviceStatus(d.status);
      data.type = d.vm_type;
      data.osName = d.os_name;
      data.managementIp = d.management_ip;
      data.cloudName = d.cloud_name;
      data.platformType = d.vm_platform_type;
      data.tags = d.tags.filter(tg => tg);
      data.lastBackupTime = d.last_backup_time ? this.utilSvc.toUnityOneDateFormat(d.last_backup_time) : 'NA';
      data.backupStatusIcon = this.getStatusIcon(d.backup_status);
      data.backupStatusTooltip = this.getStatusTooltip(d.backup_status);
      viewData.push(data);
    });
    return viewData;
  }

  getStatusIcon(status: string) {
    switch (status) {
      case `Success`:
        return `fa-check-circle text-success`;
      case `Failed`:
        return `fa-exclamation-circle text-danger`;
      case `Warning`:
      case `None`:
        return `fa-exclamation-circle text-warning`;
      default:
        return;
    }
  }

  getStatusTooltip(status: string) {
    switch (status) {
      case `Success`:
        return `Success`;
      case `Failed`:
        return `Failed`;
      case `Warning`:
        return `Warning`;
      case `None`:
        return `None`;
      default:
        return;
    }
  }

}
export class VeeamAccountBackupVMsViewData {
  constructor() { }
  vmId: string;
  backupId: string;
  name: string;
  vmStatus: string;
  type: string;
  cloudName: string;
  platformType: string;
  tags: string[];
  osName: string;
  statusIcon: string;
  statusTooltip: string;
  managementIp: string;
  lastBackupTime: string;
  backupStatus: string;
  backupStatusIcon: string;
  backupStatusTooltip: string;
}

export interface VeeamAccountBackupVMsType {
  id: number;
  uuid: string;
  name: string;
  vm_type: string;
  vm_platform_type: string;
  management_ip: string;
  os_name: string;
  status: string;
  backup_job_uuid: string;
  cloud_name: string;
  cloud_type: string;
  last_backup_time: string;
  backup_status: string;
  tags: string[];
}