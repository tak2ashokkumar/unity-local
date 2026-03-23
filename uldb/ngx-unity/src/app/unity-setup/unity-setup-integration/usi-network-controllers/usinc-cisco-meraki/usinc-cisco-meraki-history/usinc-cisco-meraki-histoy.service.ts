import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MerakiScheduleHistory } from './usinc-cisco-meraki-history.type';

@Injectable()
export class UsincCiscoMerakiHistoyService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private user: UserInfoService,
    private appService: AppLevelService) { }

  getScheduleHistory(criteria: SearchCriteria, merakiId: string): Observable<MerakiScheduleHistory[]> {
    return this.tableService.getData<MerakiScheduleHistory[]>(`/customer/meraki/accounts/${merakiId}/schedule_history/`, criteria);
  }

  convertToViewData(data: MerakiScheduleHistory[]): MirakiHistoryViewData[] {
    let viewData: MirakiHistoryViewData[] = [];
    data.forEach(d => {
      let view: MirakiHistoryViewData = new MirakiHistoryViewData();
      view.status = d.status;
      view.startedAt = d.started_at ? this.utilSvc.toUnityOneDateFormat(d.started_at) : 'N/A';
      view.completedAt = d.completed_at ? this.utilSvc.toUnityOneDateFormat(d.completed_at) : 'N/A';
      view.duration = d.duration ?  d.duration : 'N/A';
      view.executedBy = d.executed_by;
      viewData.push(view);
    })
    return viewData;
  }
}

export class MirakiHistoryViewData {
  constructor() { };
  status: string;
  startedAt: string;
  completedAt: string;
  duration: string;
  executedBy: string;
}
