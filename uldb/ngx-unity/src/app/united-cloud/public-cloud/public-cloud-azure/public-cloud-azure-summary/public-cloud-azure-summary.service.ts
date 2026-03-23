import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { GET_AZURE_ACCOUNTS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AzureAccountCredentialsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';
import { AzureAccountsType } from '../entities/azure-accounts.type';
import { AzureAccountScheduleHistory, AzureCustomerSummary, ResourceDetailsType } from './public-cloud-azure-summary.type';

@Injectable()
export class PublicCloudAzureSummaryService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getAccountDetails(): Observable<AzureAccountsType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<AzureAccountsType[]>(GET_AZURE_ACCOUNTS(), { params: params });
  }

  getServiceAndResourceDetails(criteria: SearchCriteria): Observable<ResourceDetailsType[]> {
    return this.tableService.getData<ResourceDetailsType[]>(`/customer/managed/azure/accounts/resource_count_by_type/`, criteria)
      .pipe(map(res => res.sort((a, b) => a.display_name.localeCompare(b.display_name))));
  }

  getAzureAccountDetails(): Observable<AzureCustomerSummary> {
    return this.http.get<AzureCustomerSummary>(`/customer/azure/azure_account_details/`);
  }

  syncNow(accountId: string) {
    return this.http.get<CeleryTask>(`/customer/managed/azure/accounts/${accountId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  deleteAzureAccount(azureAccountId: string): Observable<string> {
    return this.http.delete<string>(`/customer/managed/azure/accounts/${azureAccountId}`);
  }

  updateCredentials(azureAccountId: string, data: AzureAccountCredentialsType) {
    return this.http.patch<AzureAccountCredentialsType>(`/customer/managed/azure/accounts/${azureAccountId}/update_credentials/`, data);
  }

  getScheduleHistory(criteria: SearchCriteria, azureAccountId: string): Observable<PaginatedResult<AzureAccountScheduleHistory>> {
    return this.tableService.getData(`/customer/managed/azure/accounts/${azureAccountId}/schedule_history/`, criteria).pipe(
      map((res: PaginatedResult<AzureAccountScheduleHistory>) => {
        res.results = res.results.map(history => {
          history.completed_at = history.completed_at ? this.utilSvc.toUnityOneDateFormat(history.completed_at) : null;
          return history;
        });
        return res;
      })
    );
  }

  buildUpdateCredentialsForm(): FormGroup {
    return this.builder.group({
      'client_id': ['', [Validators.required, NoWhitespaceValidator]],
      'tenant_id': ['', [Validators.required, NoWhitespaceValidator]],
      'client_secret': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetUpdateCredentialsFormErrors() {
    return {
      'client_id': '',
      'tenant_id': '',
      'client_secret': '',
    }
  }

  updateCredentialsFormValidationMessages = {
    'client_id': {
      'required': 'Client ID is required',
    },
    'tenant_id': {
      'required': 'Tenant ID is required'
    },
    'client_secret': {
      'required': 'Client Secret is required'
    },
  }

  convertServiceAndResourceViewData(data: ResourceDetailsType[]): ResourceDetailsViewData {
    let view: ResourceDetailsViewData = new ResourceDetailsViewData();
    view.totalResourceTypeCount = data.length;
    data.map(s => {
      let resource = new ResourceCountAndNames();
      resource.name = s.name;
      resource.displayName = s.display_name;
      resource.id = s.id;
      resource.resourceCount = s.resource_count;
      resource.iconPath = s.icon_path && s.icon_path != '' ? `${environment.assetsUrl}external-brand/azure/Icons/${s.icon_path}.svg` : null;
      view.resourceCounts.push(resource);
    })
    return view;
  }

  convertAzureAccountDetailsViewData(data: AzureCustomerSummary): AzureCustomerSummaryViewData {
    let view: AzureCustomerSummaryViewData = new AzureCustomerSummaryViewData();
    view.totalAccountCount = data.total_account_count;
    view.totalResourceCount = data.total_resource_count;
    view.alters.critical = data.alters.critical;
    view.alters.warning = data.alters.warning;
    view.alters.information = data.alters.information;
    view.alters.eventCount = data.alters.event_count;
    view.currentCost.amount = data.current_cost.amount;
    view.currentCost.unit = data.current_cost.unit;

    return view;
  }

  convertAzureCustomerListDetailsViewData(data: AzureAccountsType[]): AccountsDetailListViewData {
    let viewData: AccountsDetailListViewData = new AccountsDetailListViewData();
    let totalResources = 0;
    let totalCost = 0;
    let totalEvent = 0;
    let totalInformationAlerts = 0;
    let totalCriticalAlerts = 0;
    let totalWarningAlerts = 0;
    data.map(s => {
      let view: AccountDetailsViewData = new AccountDetailsViewData();
      view.uuid = s.uuid;
      view.accountName = s.name;
      view.totalResourceCount = s.resource_count;
      totalResources = totalResources + s.resource_count;
      view.totalServicesCount = s.service_count;
      view.manage = s.is_managed;
      view.totalAlertEventCount = s.alert_count.event_count;
      totalInformationAlerts = totalInformationAlerts + s.alert_count.information;
      totalCriticalAlerts = totalCriticalAlerts + s.alert_count.critical;
      totalWarningAlerts = totalWarningAlerts + s.alert_count.warning;
      totalEvent = totalEvent + s.alert_count.event_count;
      view.cost.amount = s.current_month_cost ? ~~s.current_month_cost.amount : 0;
      totalCost = totalCost + (s.current_month_cost ? ~~s.current_month_cost.amount : 0);
      view.monitoring.configured = s.monitoring.configured;
      view.monitoring.enabled = s.monitoring.enabled;
      view.monitoring.observium = s.monitoring.observium;
      view.monitoring.zabbix = s.monitoring.zabbix;
      view.costAnalysis = s?.cost_analysis;
      if (!view.monitoring.configured) {
        view.statsTooltipMessage = 'Configure Monitoring';
      }
      if (view.monitoring.configured) {
        if (!view.monitoring.enabled) {
          view.statsTooltipMessage = 'Enable monitoring';
        } else {
          view.statsTooltipMessage = 'Azure account statistics';
        }
      }
      viewData.accountDetails.push(view);
    })
    viewData.totalResources = totalResources;
    viewData.totalAzureAccounts = data.length;
    viewData.totalEvent = totalEvent;
    viewData.totalCost = totalCost;
    viewData.totalInformationAlerts = totalInformationAlerts;
    viewData.totalCriticalAlerts = totalCriticalAlerts;
    viewData.totalWarningAlerts = totalWarningAlerts;
    return viewData;
  }

  convertToHistoryViewData(history: AzureAccountScheduleHistory[]): AzureAccountScheduleHistoryViewData[] {
    let viewData: AzureAccountScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: AzureAccountScheduleHistoryViewData = new AzureAccountScheduleHistoryViewData()
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

export class ResourceDetailsViewData {
  totalResourceTypeCount: number;
  resourceCounts: ResourceCountAndNames[] = [];
  constructor() { }
}

export class ResourceCountAndNames {
  constructor() { }
  displayName: string;
  id: number;
  iconPath: string;
  name: string;
  resourceCount: number;
}

export class AzureCustomerSummaryViewData {
  constructor() { }
  totalAccountCount: number;
  currentCost: CurrentCost = new CurrentCost();
  totalResourceCount: number;
  alters: Alters = new Alters();
}

export class CurrentCost {
  amount: number;
  unit: string;
  month: string;
  constructor() { }
}

export class Alters {
  information: number;
  critical: number;
  warning: number;
  eventCount: number;
  constructor() { }
}

export class AccountsDetailListViewData {
  constructor() { }
  totalAzureAccounts: number;
  totalResources: number;
  totalCost: number;
  totalEvent: number;
  totalInformationAlerts: number;
  totalCriticalAlerts: number;
  totalWarningAlerts: number;
  accountDetails: AccountDetailsViewData[] = [];
}

export class AccountDetailsViewData {
  constructor() { }
  accountName: string;
  userName: string;
  subscriptionId: string;
  uuid: string;
  monitoring: DeviceMonitoringTypeViewData = new DeviceMonitoringTypeViewData();
  totalResourceCount: number;
  totalServicesCount: number;
  manage: boolean;
  cost: Current = new Current();
  totalAlertEventCount: number;
  statsTooltipMessage: string;
  syncInProgress: boolean = false;
  costAnalysis: boolean;
}

export class Current {
  amount: number;
  unit: string;
  month: string;
  constructor() { }
}

export class TotalAlertCount {
  information: number;
  critical: number;
  warning: number;
  eventCount: number;
  constructor() { }
}

export class DeviceMonitoringTypeViewData {
  zabbix: boolean;
  observium: boolean;
  configured: boolean;
  enabled: boolean;
  constructor() { }
}

export class AzureAccountScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}
