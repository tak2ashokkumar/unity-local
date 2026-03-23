import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AutoRemediationHistoryType, DisableTriggerType, EventResolveType } from '../auto-remediation.type';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AutoRemediationHistoryService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getAutoRemediationHistory(criteria: SearchCriteria, uuid: string): Observable<PaginatedResult<AutoRemediationHistoryType>> {
    return this.tableService.getData<PaginatedResult<AutoRemediationHistoryType>>(`/ssr/auto_remediation/${uuid}/history/`, criteria);
  }

  convertToViewData(data: AutoRemediationHistoryType[]): AutoRemediationHistoryViewData[] {
    let viewData: AutoRemediationHistoryViewData[] = [];
    data.forEach(item => {
      let td: AutoRemediationHistoryViewData = new AutoRemediationHistoryViewData();
      td.eventId = item.event_id;
      td.eventUuid = item.event_uuid;
      td.deviceName = item.device_name;
      td.triggerName = item.trigger_name;
      td.startTime = item.start_time ? this.utilSvc.toUnityOneDateFormat(item.start_time) : 'N/A';
      td.endTime = item.end_time ? this.utilSvc.toUnityOneDateFormat(item.end_time) : 'N/A';
      td.eventTime = item.event_time ? this.utilSvc.toUnityOneDateFormat(item.event_time) : 'N/A';
      td.resolveTime = item.resolve_time ? this.utilSvc.toUnityOneDateFormat(item.resolve_time) : 'N/A';

      td.status = item.status;
      if (item.status == 'Success') {
        td.statusIcon = "fa fa-check-circle text-success";
        td.tooltipMessage = "Success"
      } else if (item.status == 'Failed') {
        td.statusIcon = "fa fa-exclamation-circle text-danger";
        td.tooltipMessage = "Failed"
      } else {
        td.statusIcon = "fas fa-spinner fa-spin fa-info-circle text-primary";
        td.tooltipMessage = "Running"
      }

      td.isSourceUnity = item.event_source == 'Unity';

      if (item.event_status == 'Resolved') {
        td.triggerDisableBtnTooltipMsg = 'Disabled';
        td.isStatusResolved = true;
        td.resolveBtnTooltipMsg = 'Resolved';
      } else {
        td.triggerDisableBtnTooltipMsg = 'Disable Trigger';
        td.isStatusResolved = false;
        td.resolveBtnTooltipMsg = 'Resolve';
      }

      viewData.push(td);
    });
    return viewData;
  }

  disable(eventId: string): Observable<DisableTriggerType> {
    return this.http.post<DisableTriggerType>(`/customer/aiops/events/${eventId}/disable_trigger/`, {});
  }

  resolve(eventId: string): Observable<EventResolveType> {
    return this.http.post<EventResolveType>(`/customer/aiops/events/${eventId}/resolve/`, {});
  }

}

export class AutoRemediationHistoryViewData {
  eventId: string;
  status: string;
  uuid: string;
  eventUuid: string;
  startTime: string;
  deviceName: string;
  endTime: string;
  resolveTime: string;
  eventTime: string;
  triggerName: string;
  statusIcon: string;
  tooltipMessage: string;
  triggerDisableBtnTooltipMsg: string;
  isSourceUnity: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
}

