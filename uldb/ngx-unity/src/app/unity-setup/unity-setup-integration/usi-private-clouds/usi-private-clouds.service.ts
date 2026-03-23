import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { VMwareVCenterAccount, VMwareVCenterScheduleHistory } from './usi-private-clouds.type';

@Injectable()
export class UsiPrivateCloudsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getAccounts(criteria: SearchCriteria, cloudName: string): Observable<PaginatedResult<VMwareVCenterAccount>> {
    return this.tableService.getData<PaginatedResult<VMwareVCenterAccount>>(`customer/integration/${cloudName}/accounts/`, criteria);
  }

  deleteAccount(instanceId: string, cloudName: string) {
    return this.http.delete(`customer/integration/${cloudName}/accounts/${instanceId}`);
  }

  getPayloadResponse(data: any, instanceId: string, cloudName: string) {
    return this.http.post(`customer/integration/${cloudName}/accounts/${instanceId}/event_inbound_webhook/test_payload/`, data
      , { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    )
  }

  syncNow(instanceId: string, cloudName: string) {
    return this.http.get<CeleryTask>(`customer/integration/${cloudName}/accounts/${instanceId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 60, 100).pipe(take(1))), take(1));
  }

  getScheduleHistory(criteria: SearchCriteria, accountId: string, cloudName: string): Observable<PaginatedResult<VMwareVCenterScheduleHistory>> {
    return this.tableService.getData(`/customer/integration/${cloudName}/accounts/${accountId}/schedule_history/`, criteria).pipe(
      map((res: PaginatedResult<VMwareVCenterScheduleHistory>) => {
        res.results = res.results.map(history => {
          history.completed_at = history.completed_at ? this.utilSvc.toUnityOneDateFormat(history.completed_at) : null;
          return history;
        });
        return res;
      })
    );
  }

  convertToViewData(data: VMwareVCenterAccount[]): VMwareVCenterAccountViewData[] {
    let viewData: VMwareVCenterAccountViewData[] = [];
    data.forEach(v => {
      let view: VMwareVCenterAccountViewData = new VMwareVCenterAccountViewData();
      view.uuid = v.uuid;
      view.name = v.name;
      view.url = v?.event_inbound_webhook?.webhook_url ? v?.event_inbound_webhook?.webhook_url : '';
      view.token = v?.event_inbound_webhook?.token ? v?.event_inbound_webhook?.token : '';
      view.discoverResources = v.discover_resources;
      view.discoverResourcesIcon = v.discover_resources ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      view.discoverDependency = v.discover_dependency;
      view.discoverDependencyIcon = v.discover_dependency ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      view.isManaged = v.is_managed;
      view.isManagedIcon = v.is_managed ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      view.ingestEvent = v.ingest_event;
      view.ingestEventIcon = v.ingest_event ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      viewData.push(view);
    });
    return viewData;
  }

  buildPayloadForm(): FormGroup {
    return this.builder.group({
      'payload': ['', [Validators.required]],
      'response': ['']
    });
  }

  resetPaylodFormErrors() {
    return {
      'payload': '',
      'response': ''
    }
  }

  payloadValidationMessages = {
    'payload': {
      'required': 'Payload is required'
    }
  }

  convertToHistoryViewData(history: VMwareVCenterScheduleHistory[]): VMwareVCenterScheduleHistoryViewData[] {
    let viewData: VMwareVCenterScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: VMwareVCenterScheduleHistoryViewData = new VMwareVCenterScheduleHistoryViewData();
      a.duration = h.duration ? h.duration : 'N/A';
      a.updatedBy = h.executed_by ? h.executed_by : 'N/A';
      a.startedAt = h.started_at ? this.utilSvc.toUnityOneDateFormat(h.started_at) : 'N/A';
      a.lastRun = h.completed_at ? this.utilSvc.toUnityOneDateFormat(h.completed_at) : 'N/A';

      a.isInProgress = h.status == 'Initiated' || h.status == 'IN' ? true : false;
      a.status = a.isInProgress ? 'In Progress' : h.status;
      switch (h.status) {
        case 'Completed': a.statusClass = 'text-success'; break;
        case 'IN':
        case 'Initiated': a.statusClass = 'text-warning'; break;
        case 'Cancelled':
        case 'Failed': a.statusClass = 'text-danger'; break;
        default: a.statusClass = '';
      }
      viewData.push(a);
    })
    return viewData;
  }
}

export class VMwareVCenterAccountViewData {
  uuid: string;
  name: string;
  url: string;
  token: string;
  discoverResources: boolean;
  discoverResourcesIcon: string
  discoverDependency: boolean;
  discoverDependencyIcon: string;
  isManaged: boolean;
  isManagedIcon: string;
  ingestEvent: boolean;
  ingestEventIcon: string;
  syncInProgress: boolean = false;
}

export class VMwareVCenterScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}
