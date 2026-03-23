import { Injectable } from '@angular/core';
import { TableApiServiceService } from '../table-functionality/table-api-service.service';
import { AppUtilityService } from '../app-utility/app-utility.service';
import { SearchCriteria } from '../table-functionality/search-criteria';
import { PaginatedResult } from '../SharedEntityTypes/paginated.type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VmBackupHistoryService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getVMBackupHistory(criteria: SearchCriteria): Observable<PaginatedResult<VMBackupHistoryType>> {
    return this.tableService.getData<PaginatedResult<VMBackupHistoryType>>(`/customer/veeam/backup_sessions/`, criteria);
  }

  convertToViewData(data: VMBackupHistoryType[]): VMBackupHistoryViewData[] {
    let viewData: VMBackupHistoryViewData[] = [];
    data.forEach(h => {
      let data: VMBackupHistoryViewData = new VMBackupHistoryViewData();
      data.name = h.name;
      data.state = h.state;
      data.status = h.status;
      data.progressPercentageValue = h.progress_percentage_value;
      data.creationTime = h.creation_time ? this.utilSvc.toUnityOneDateFormat(h.creation_time) : 'NA';
      data.endTime = h.end_time ? this.utilSvc.toUnityOneDateFormat(h.end_time) : 'NA';
      data.stateIcon = this.getStateIcon(h.state);
      data.stateTooltip = this.getStateTooltip(h.state);
      viewData.push(data);
    });
    return viewData;
  }

  getStateIcon(status: string) {
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

  getStateTooltip(status: string) {
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

export class VMBackupHistoryViewData {
  constructor() { }
  name: string;
  state: string;
  stateIcon: string;
  stateTooltip: string;
  status: string;
  progressPercentageValue: number;
  creationTime: string;
  endTime: string;
}

export interface VMBackupHistoryType {
  uuid: string;
  session_id: string;
  name: string;
  veeam: string;
  veeam_job: string;
  status: string;
  state: string;
  progress_percentage_value: number;
  creation_time: string;
  end_time: string;
}