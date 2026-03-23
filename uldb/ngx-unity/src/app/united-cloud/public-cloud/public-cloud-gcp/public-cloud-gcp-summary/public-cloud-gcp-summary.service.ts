import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { GET_GCP_BILLING_ACCOUNTS, GET_GCP_BILLING_DATASETS, UPDATE_GCP_BILLING_DETAILS, UPDATE_GCP_SUSTAINABILITY_DETAILS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';
import { GcpAccountType, GcpResourceDetailsType, GcpScheduleHistoryType } from './public-cloud-gcp-summary.type';

@Injectable()
export class PublicCloudGcpSummaryService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getAccountDetails(): Observable<GcpAccountType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<GcpAccountType[]>(`/customer/managed/gcp/accounts/`, { params: params });
  }

  getServiceAndResourceDetails(criteria: SearchCriteria): Observable<GcpResourceDetailsType[]> {
    return this.tableService.getData<GcpResourceDetailsType[]>(`/customer/managed/gcp/accounts/resource_count_by_type/`, criteria);
  }

  syncNow(accountId: string) {
    return this.http.get<CeleryTask>(`/customer/managed/gcp/accounts/${accountId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  deleteGcpAccount(GcpAccountId: string): Observable<string> {
    return this.http.delete<string>(`/customer/managed/gcp/accounts/${GcpAccountId}`);
  }

  getScheduleHistory(GcpAccountId: string, criteria: SearchCriteria): Observable<PaginatedResult<GcpScheduleHistoryType>> {
    return this.tableService.getData<PaginatedResult<GcpScheduleHistoryType>>(`/customer/managed/gcp/accounts/${GcpAccountId}/schedule_history/`, criteria)
  }

  convertAccountDetailsViewData(data: GcpAccountType[]): AccountDetailListViewData {
    let viewData: AccountDetailListViewData = new AccountDetailListViewData();
    let totalResources = 0;
    let totalCost = 0;
    let totalEvent = 0;
    let totalInformationAlerts = 0;
    let totalCriticalAlerts = 0;
    let totalWarningAlerts = 0;
    data.map(s => {
      let view: AccountDetailsViewData = new AccountDetailsViewData();
      view.id = s.id;
      view.uuid = s.uuid;
      view.accountName = s.name;
      view.totalResourceCount = s.resource_count;
      totalResources = totalResources + s.resource_count;
      view.totalServicesCount = s.service_count;
      view.manage = s.is_managed;
      view.totalAlertEventCount = s.alert_count?.event_count ? s.alert_count.event_count : 0;
      totalInformationAlerts += s.alert_count?.information ? s.alert_count.information : 0;
      totalCriticalAlerts += s.alert_count?.critical ? s.alert_count.critical : 0;
      totalWarningAlerts += s.alert_count?.warning ? s.alert_count.warning : 0;
      totalEvent += s.alert_count?.event_count ? s.alert_count.event_count : 0;
      view.currentMonthCost.amount = Math.round(s.current_month_cost?.amount ? s.current_month_cost.amount : 0);
      totalCost = Math.round(totalCost + (s.current_month_cost?.amount ? s.current_month_cost.amount : 0));
      view.monitoring.configured = s.monitoring.configured;
      view.monitoring.enabled = s.monitoring.enabled;
      view.monitoring.observium = s.monitoring.observium;
      view.monitoring.zabbix = s.monitoring.zabbix;
      view.isCostAnalysis = s.cost_analysis;
      if (!view.monitoring.configured) {
        view.statsTooltipMessage = 'Configure monitoring';
      }
      if (view.monitoring.configured) {
        if (!view.monitoring.enabled) {
          view.statsTooltipMessage = 'Enable monitoring';
        } else {
          view.statsTooltipMessage = 'GCP account statistics';
        }
      }

      // view.billingEnabled = s.billing_enabled;
      // view.billingAccount = s.billing_account ? s.billing_account : '';
      // view.billingDataset = s.dataset ? s.dataset : '';
      // view.isBillingExists = s.project_id && s.project_id.indexOf('istio') > -1 ? true : false;
      // view.co2EmissionEnabled = s.co2emission_enabled ? s.co2emission_enabled : false;
      // view.billingTooltip = view.isBillingExists ? `Add Billing Details` : `Billing Not Enabled`
      // view.sustainabilityTooltip = view.co2EmissionEnabled ? `Add Sustainability Details` : `Sustainability Not Enabled`;
      viewData.accountDetails.push(view);
    })
    viewData.totalResources = totalResources;
    viewData.totalGcpAccounts = data.length;
    viewData.totalEvent = totalEvent;
    viewData.totalCost = totalCost;
    viewData.totalInformationAlerts = totalInformationAlerts;
    viewData.totalCriticalAlerts = totalCriticalAlerts;
    viewData.totalWarningAlerts = totalWarningAlerts;
    return viewData;
  }

  convertServiceAndResourceViewData(data: GcpResourceDetailsType[]): ResourceDetailsViewData {
    let view: ResourceDetailsViewData = new ResourceDetailsViewData;
    view.totalResourceTypeCount = data.length;
    data.map(s => {
      let resource: ResourceCountAndNames = new ResourceCountAndNames();
      resource.name = s.name;
      resource.id = s.id;
      resource.resourceCount = s.resource_count;
      resource.iconPath = s.icon_path && s.icon_path != '' ? `${environment.assetsUrl}external-brand/gcp/${s.icon_path}.svg` : null;
      view.resourceList.push(resource);
    })
    return view;
  }

  convertToHistoryViewData(history: GcpScheduleHistoryType[]): GcpAccountScheduleHistoryViewData[] {
    let viewData: GcpAccountScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: GcpAccountScheduleHistoryViewData = new GcpAccountScheduleHistoryViewData();
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

  // getGCPBillingDatasets(uuid: string): Observable<string[]> {
  //   return this.http.get<string[]>(GET_GCP_BILLING_DATASETS(uuid));
  // }

  // getGCPBillingAccounts(uuid: string): Observable<GCPBillingInfo> {
  //   return this.http.get<GCPBillingInfo>(GET_GCP_BILLING_ACCOUNTS(uuid));
  // }

  // buildBillingForm(input: AccountDetailsViewData): FormGroup {
  //   return this.builder.group({
  //     'uuid': [input.uuid],
  //     'name': [input.accountName, [Validators.required, NoWhitespaceValidator]],
  //     'billing_account': [input.billingAccount ? input.billingAccount : '', [Validators.required]],
  //     'dataset': [input.billingDataset ? input.billingDataset : '', [Validators.required]],
  //   });
  // }

  // resetBillingFormErrors(): any {
  //   let formErrors = {
  //     'name': '',
  //     'billing_account': '',
  //     'dataset': '',
  //   };
  //   return formErrors;
  // }

  // billingFormValidationMessages = {
  //   'name': {
  //     'required': 'Account Name is required'
  //   },
  //   'billing_account': {
  //     'required': 'Billing Account is required',
  //   },
  //   'dataset': {
  //     'required': 'Dataset is required',
  //   }
  // };

  // buildSustainabilityForm(input: AccountDetailsViewData): FormGroup {
  //   return this.builder.group({
  //     'uuid': [input.uuid],
  //     'name': [input.accountName, [Validators.required, NoWhitespaceValidator]],
  //     'billing_account': [input.billingAccount ? input.billingAccount : '', [Validators.required]],
  //     'dataset': [input.billingDataset ? input.billingDataset : '', [Validators.required]],
  //   });
  // }

  // resetSustainabilityFormErrors(): any {
  //   let formErrors = {
  //     'name': '',
  //     'billing_account': '',
  //     'dataset': '',
  //   };
  //   return formErrors;
  // }

  // sustainabilityFormValidationMessages = {
  //   'name': {
  //     'required': 'Account Name is required'
  //   },
  //   'billing_account': {
  //     'required': 'Sustainability Account is required',
  //   },
  //   'dataset': {
  //     'required': 'Dataset is required',
  //   }
  // };

  // updateBillingDetails(data: { uuid: string, name: string, billing_account: string, dataset: string }) {
  //   return this.http.put(UPDATE_GCP_BILLING_DETAILS(data.uuid), data);
  // }

  // updateSustanabilityDetails(data: { uuid: string, name: string, billing_account: string, dataset: string }) {
  //   return this.http.put(UPDATE_GCP_SUSTAINABILITY_DETAILS(data.uuid), data);
  // }

}

export class AccountDetailListViewData {
  constructor() { }
  totalGcpAccounts: number;
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
  id: number;
  uuid: string;
  accountName: string;
  // userName: string;
  manage: boolean;
  totalServicesCount: number;
  totalAlertEventCount: number;
  totalResourceCount: number;
  currentMonthCost: GcpcurrentMonthCostDetails = new GcpcurrentMonthCostDetails();
  costGrowthPercentage: number;
  monitoring: DeviceMonitoringTypeViewData = new DeviceMonitoringTypeViewData();
  statsTooltipMessage: string;
  syncInProgress: boolean = false;
  // accessKey: string;
  // subscriptionId: string; 
  projectId: string;
  // billingEnabled: boolean;
  // billingAccount: string;
  // billingDataset: string;
  // isBillingExists: boolean;
  // billingTooltip: string;
  // co2EmissionEnabled: boolean;
  // sustainabilityTooltip: string;
  isCostAnalysis: boolean;
}

export class GcpcurrentMonthCostDetails {
  amount: number;
  unit: string;
  month: string;
  constructor() { }
}

export class DeviceMonitoringTypeViewData {
  zabbix: boolean;
  observium: boolean;
  configured: boolean;
  enabled: boolean;
  constructor() { }
}

export class ResourceDetailsViewData {
  totalResourceTypeCount: number;
  resourceList: ResourceCountAndNames[] = [];
  constructor() { }
}

export class ResourceCountAndNames {
  constructor() { }
  id: number;
  name: string;
  displayName: string;
  iconPath: string;
  resourceCount: number;
}

export class GcpAccountScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}