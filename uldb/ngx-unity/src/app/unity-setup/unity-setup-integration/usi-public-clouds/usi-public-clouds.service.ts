import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PublicCloudAccount, PublicCloudScheduleHistory } from './usi-public-clouds.type';
@Injectable({
  providedIn: 'root'
})
export class UsiPublicCloudsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getAccounts(criteria: SearchCriteria, cloudName: string): Observable<PaginatedResult<PublicCloudAccount>> {
    return this.tableService.getData<PaginatedResult<PublicCloudAccount>>(`customer/integration/${cloudName}/accounts/`, criteria);
  }

  deleteAccount(instanceId: string, cloudName: string) {
    return this.http.delete(`customer/integration/${cloudName}/accounts/${instanceId}/`);
  }

  getPayloadResponse(data: any, instanceId: string, cloudName: string) {
    return this.http.post(`customer/integration/${cloudName}/accounts/${instanceId}/event_inbound_webhook/test_payload/`, data
      , { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    )
  }

  syncNow(instanceId: string, cloudName: string) {
    return this.http.get<CeleryTask>(`customer/integration/${cloudName}/accounts/${instanceId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  getScheduleHistory(criteria: SearchCriteria, accountId: string, cloudName: string): Observable<PaginatedResult<PublicCloudScheduleHistory>> {
    return this.tableService.getData(`/customer/integration/${cloudName}/accounts/${accountId}/schedule_history/`, criteria);
  }

  convertToViewData(data: PublicCloudAccount[], cloudName: string): PublicCloudAccountViewData[] {
    let viewData: PublicCloudAccountViewData[] = [];
    data.forEach(v => {
      let view: PublicCloudAccountViewData = new PublicCloudAccountViewData();
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
      view.costAnalysis = v.cost_analysis;
      view.costAnalysisIcon = v.cost_analysis ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      view.sustainability = v.sustainability;
      view.sustainabilityIcon = v.sustainability ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      view.azureAdIntegration = v.azure_ad_integ;
      view.azureAdIntegrationIcon = v.azure_ad_integ ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      if (cloudName == 'gcp') {
        view.projectId = v.project_id
      }
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

  convertToHistoryViewData(history: PublicCloudScheduleHistory[]): PublicCloudScheduleHistoryViewData[] {
    let viewData: PublicCloudScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: PublicCloudScheduleHistoryViewData = new PublicCloudScheduleHistoryViewData()
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

export class PublicCloudAccountViewData {
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
  costAnalysis: boolean;
  azureAdIntegration: boolean;
  costAnalysisIcon: string;
  azureAdIntegrationIcon: string;

  // isBillingExists?: boolean;
  // co2EmissionEnabled?: boolean;
  // billingEnabled?: boolean;
  // billingAccount?: string;
  // billingDataset?: string;
  projectId?: string;
  sustainability?: boolean;
  sustainabilityIcon: string;
  //for GCP alone ^^

  region?: string;
}

export class PublicCloudScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}
