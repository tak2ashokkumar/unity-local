import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { SdWanAccountDetails } from './usio-sdwan.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class UsioSdwanService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private user: UserInfoService,
    private appService: AppLevelService) { }

  getSdWanAccounts(criteria: SearchCriteria): Observable<SdWanAccountDetails[]> {
    return this.tableService.getData<SdWanAccountDetails[]>(`/customer/sdwan/accounts/`, criteria);
  }

  syncNow(accountId: string) {
    return this.http.get<CeleryTask>(`/customer/sdwan/accounts/${accountId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  sdwanDelete(sdwanId: string) {
    return this.http.delete(`/customer/sdwan/accounts/${sdwanId}/`);
  }

  convertToViewData(data: SdWanAccountDetails[]): SdwanViewData[] {
    let viewData: SdwanViewData[] = [];
    data.map((sd) => {
      let vd = new SdwanViewData();
      vd.uuid = sd.uuid;
      vd.name = sd.name;
      vd.port = sd.port;
      vd.username = sd.username;
      vd.accountUrl = sd.account_url;
      vd.collector = sd.collector;
      vd.deviceStatus = this.utilSvc.getDeviceStatus(sd.status);
      vd.schedule = sd.schedule_meta?.schedule_type;
      viewData.push(vd);
    })
    return viewData;
  }
}

export class SdwanViewData {
  constructor() { };
  uuid: string;
  name: string;
  accountUrl: string;
  port: string;
  collector: string;
  username: string;
  deviceStatus: string;
  schedule: string;
  syncInProgress: boolean = false;
}

export const scheduleTypeList: LabelValueType[] = [
  {
    'label': 'None',
    'value': 'none'
  },
  {
    'label': 'Hourly',
    'value': 'hourly'
  },
  {
    'label': 'Daily',
    'value': 'daily'
  },
  {
    'label': 'Weekly',
    'value': 'weekly'
  },
  {
    'label': 'Monthly',
    'value': 'monthly'
  }
]

export const statusList: LabelValueType[] = [
  {
    'label': 'Up',
    'value': '1'
  },
  {
    'label': 'Down',
    'value': '0'
  },
  {
    'label': 'Unknown',
    'value': '-1'
  }
]