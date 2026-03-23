import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ActivityData } from './orchestration-integration-details-activitylogs.type';

@Injectable()
export class OrchestrationIntegrationDetailsActivitylogsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService
  ) { }

  getActivityLogData(scriptId: string, criteria: SearchCriteria): Observable<PaginatedResult<any>> {
    return this.tableService.getData<PaginatedResult<any>>(`/orchestration/scripts/${scriptId}/get_activity_log/`, criteria);
  }

  convertToViewData(data: ActivityData[]) {
    let viewData:ActivityLogViewData[] = [];
    data.map((a) => {
      let view: ActivityLogViewData = new ActivityLogViewData();
      view.username = a.actor;
      view.timestamp = a.timestamp ? this.utilSvc.toUnityOneDateFormat(a.timestamp) : 'NA';;
      view.action = a.action;
      viewData.push(view);
    })
    return viewData;
  }
}

export class ActivityLogViewData {
  constructor() { }
  username: string;
  timestamp: string;
  action: string;
}