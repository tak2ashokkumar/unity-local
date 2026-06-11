import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserInfoService } from '../shared/user-info.service';
import { TableApiServiceService } from '../shared/table-functionality/table-api-service.service';
import { SearchCriteria } from '../shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../shared/SharedEntityTypes/paginated.type';
import { GET_ACTIVITY_LOG_DASHBOARD, GET_USER_PROFILE_ACTIVITY_LOG } from '../shared/api-endpoint.const';
import { mtpDashboardActivityLog } from './mtp-activity-logs.type';

@Injectable({
  providedIn: 'root'
})
export class MtpActivityLogsService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private tableService: TableApiServiceService,) { }

  getActivityLogData(criteria: SearchCriteria): Observable<PaginatedResult<mtpDashboardActivityLog>> {
    return this.tableService.getData<PaginatedResult<mtpDashboardActivityLog>>(GET_ACTIVITY_LOG_DASHBOARD(), criteria);
  }

  convertActivityLogToViewData(data: mtpDashboardActivityLog[]): mtpDashboardActivityLogViewData[] {
    let view: mtpDashboardActivityLogViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    data.map(s => {
      let a: mtpDashboardActivityLogViewData = new mtpDashboardActivityLogViewData();
      a.action = s.action;
      a.actor = s.actor;
      a.changes = s.changes;
      a.content_type = s.content_type;
      a.hijacker = s.hijacker;
      a.object_repr = s.object_repr;
      a.remote_addr = s.remote_addr;
      a.timestamp = datePipe.transform(s.timestamp.replace(/\s/g, "T"), environment.unityDateFormat);

      if (a.remote_addr == null) {
        a.remote_addr = 'N/A';
      }
      if (a.actor === null) {
        if (a.content_type.app_label == 'user2') {
          a.actor_email = a.object_repr;
        } else {
          a.actor_email = 'System';
        }
      } else {
        a.actor_email = a.actor.email;
      }
      a.additional_data = s.additional_data ? s.additional_data.action : null;
      let changes = JSON.parse(s.changes);
      a.changes_log_keys = Object.keys(changes)
      for (let value of Object.values(changes)) {
        if (a.action == 'Created') {
          value[0] = value[1];
        }
      }
      a.changes_log = changes;
      view.push(a);
    });
    return view;
  }
}


//Activity Log
export class mtpDashboardActivityLogViewData {
  action: string;
  actor: Actor;
  actor_email: string;
  user_value: string;
  changes: string;
  changes_log: string;
  changes_log_keys: Array<string>;
  content_type: ContentType;
  hijacker: string;
  id: string;
  object_id: string;
  object_repr: string;
  remote_addr: string;
  timestamp: string;
  additional_data: Array<string>;
}

export class ContentType {
  app_label: string;
  readable_model_name: string;
}
export class Actor {
  email: string;
}

export const DOWNLOAD_URL = (end_date: string, start_date: string) => `/customer/mtp/download-auditlog/?end_date=${end_date}&start_date=${start_date}`;