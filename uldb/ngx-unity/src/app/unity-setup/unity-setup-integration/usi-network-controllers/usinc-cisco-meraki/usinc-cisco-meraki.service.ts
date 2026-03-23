import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MerakiAccountType } from './usinc-cisco-meraki.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class UsincCiscoMerakiService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private user: UserInfoService,
    private appService: AppLevelService) { }

  getMerakiAccounts(criteria: SearchCriteria): Observable<MerakiAccountType[]> {
    return this.tableService.getData<MerakiAccountType[]>(`/customer/meraki/accounts/`, criteria);
  }

  convertToViewData(data: MerakiAccountType[]): MerakiViewData[] {
    let viewData: MerakiViewData[] = [];
    data.forEach(d => {
      let view: MerakiViewData = new MerakiViewData();
      view.uuid = d.uuid;
      view.name = d.name;
      view.port = d.port;
      view.username = d.username;
      view.accountUrl = d.account_url;
      view.collector = d.collector;
      view.deviceStatus = this.utilSvc.getDeviceStatus(d.status);
      view.schedule = d.schedule_meta?.schedule_type;
      viewData.push(view);
    })
    return viewData;
  }

  formatBreadCrumb(breadCrumbs: string[]) {
    let str = '';
    breadCrumbs.map((b, i) => {
      if (i != (breadCrumbs.length - 1)) {
        str = str + b + '->';
      } else if (i == (breadCrumbs.length - 1)) {
        str = str + b;
      }
    });
    return str;
  }

  syncNow(merakiId: string) {
    return this.http.get<CeleryTask>(`/customer/meraki/accounts/${merakiId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  delete(merakiId: string) {
    return this.http.delete(`/customer/meraki/accounts/${merakiId}/`);
  }
}

export class MerakiViewData {
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
