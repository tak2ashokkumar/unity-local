import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsioVeeamBackupsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getBackups(criteria: SearchCriteria): Observable<PaginatedResult<VeeamAccountBackupsType>> {
    return this.tableService.getData<PaginatedResult<VeeamAccountBackupsType>>(`/customer/veeam/backup_jobs/`, criteria);
  }

  convertToViewData(data: VeeamAccountBackupsType[]): VeeamAccountBackupViewData[] {
    let viewData: VeeamAccountBackupViewData[] = [];
    data.forEach(b => {
      let data: VeeamAccountBackupViewData = new VeeamAccountBackupViewData();
      data.backupId = b.uuid;
      data.name = b.name;
      data.platformType = b.platform_type;
      data.platformTypeImgURL = this.utilSvc.getCloudLogo(b.platform_type);
      data.status = b.status;
      data.lastRun = b.last_run ? this.utilSvc.toUnityOneDateFormat(b.last_run) : 'NA';
      data.nextRun = b.next_run ? this.utilSvc.toUnityOneDateFormat(b.next_run) : b.schedule_status ? b.schedule_status : 'NA';
      data.lastResult = b.last_result ? b.last_result : 'NA';
      data.lastResultIcon = this.getStatusIcon(b.last_result);
      data.lastResultTooltip = this.getStatusTooltip(b.last_result);
      data.target = b.target ? b.target : 'NA';
      data.vmCount = b.vm_count ? b.vm_count : 0;
      data.description = b.description ? b.description : 'NA';
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

export class VeeamAccountBackupViewData {
  constructor() { }
  backupId: string;
  name: string;
  platformType: string;
  platformTypeImgURL: string;
  status: string;
  lastRun: string;
  nextRun: string;
  target: string;
  lastResult: string;
  lastResultIcon: string;
  lastResultTooltip: string;
  vmCount: number;
  description: string;
}

export interface VeeamAccountBackupsType {
  uuid: string;
  job_id: string;
  name: string;
  platform_type: string;
  schedule_status: string;
  status: string;
  last_run: string;
  next_run: string;
  last_result: string;
  target: string;
  veeam: string;
  virtual_machines: VeeamAccountBackupsVMsType[];
  description: string;
  vm_count: number;
}

export interface VeeamAccountBackupsVMsType {
  id: number;
  name: string;
  uuid: string;
}

export const statusList = [
  {
    'label': 'Stopped',
    'value': 'Stopped'
  },
  {
    'label': 'Starting',
    'value': 'Starting'
  },
  {
    'label': 'Stopping',
    'value': 'Stopping'
  },
  {
    'label': 'Working',
    'value': 'Working'
  },
  {
    'label': 'Pausing',
    'value': 'Pausing'
  },
  {
    'label': 'Resuming',
    'value': 'Resuming'
  },
  {
    'label': 'WaitingTape',
    'value': 'WaitingTape'
  },
  {
    'label': 'Idle',
    'value': 'Idle'
  },
  {
    'label': 'Postprocessing',
    'value': 'Postprocessing'
  },
  {
    'label': 'WaitingRepository',
    'value': 'WaitingRepository'
  },
  {
    'label': 'WaitingSlot',
    'value': 'WaitingSlot'
  }
]