import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ACTIVITY_LOGS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivityLogs } from 'src/app/shared/SharedEntityTypes/activity-logs.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class ActivityLogsService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getActivityLogs(criteria: SearchCriteria): Observable<PaginatedResult<ActivityLogs>> {
    return this.tableService.getData<PaginatedResult<ActivityLogs>>(ACTIVITY_LOGS(), criteria);
  }

  convertToViewData(data: ActivityLogs[]): ActivityLogViewData[] {
    let viewData: ActivityLogViewData[] = [];
    data.map(s => {
      let a: ActivityLogViewData = new ActivityLogViewData();
      a.action = s.action;
      a.actor = s.actor;
      a.changes = s.changes;
      a.content_type = s.content_type;
      a.hijacker = s.hijacker;
      a.object_repr = s.object_repr;
      a.remote_addr = s.remote_addr;
      a.timestamp = s.timestamp ? this.utilSvc.toUnityOneDateFormat(s.timestamp) : 'N/A';

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
      viewData.push(a);
    });
    return viewData;
  }
}

export class ActivityLogViewData {
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

export class ActivityLogAdditionalDataViewData {
  action: Array<string>;
}
export const DOWNLOAD_URL = (end_date: string, start_date: string) => `/rest/activity_logs/download/?end_date=${end_date}&start_date=${start_date}`;