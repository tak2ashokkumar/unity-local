import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';
import { OciAccountScheduleHistory, OciAccountType, ResourceDetailsType } from './public-cloud-oci-summary.type';

@Injectable()
export class PublicCloudOciSummaryService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService) { }

  getAccountDetails(): Observable<OciAccountType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<OciAccountType[]>(`/customer/managed/oci/account/`, { params: params });
  }

  getServiceAndResourceDetails(criteria: SearchCriteria): Observable<ResourceDetailsType[]> {
    return this.tableService.getData<ResourceDetailsType[]>(`/customer/managed/oci/account/resource_count_by_type/`, criteria);
  }

  deleteOciAccount(ociAccountId: string): Observable<string> {
    return this.http.delete<string>(`/customer/managed/oci/account/${ociAccountId}`);
  }

  syncNow(accountId: string) {
    return this.http.get<CeleryTask>(`/customer/managed/oci/account/${accountId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  getScheduleHistory(criteria: SearchCriteria, ociAccountId: string): Observable<PaginatedResult<OciAccountScheduleHistory>> {
    return this.tableService.getData(`/customer/managed/oci/account/${ociAccountId}/schedule_history/`, criteria).pipe(
      map((res: PaginatedResult<OciAccountScheduleHistory>) => {
        res.results = res.results.map(history => {
          history.completed_at = history.completed_at ? this.utilSvc.toUnityOneDateFormat(history.completed_at) : null;
          return history;
        });
        return res;
      })
    );
  }

  convertServiceAndResourceViewData(data: ResourceDetailsType[]): ResourceDetailsViewData {
    let view: ResourceDetailsViewData = new ResourceDetailsViewData();
    view.totalResourceTypeCount = data.length;
    data.map(s => {
      let resource = new ResourceCountAndNames();
      resource.name = s.name;
      // resource.displayName = s.name;
      resource.id = s.id;
      resource.resourceCount = s.resource_count;
      resource.iconPath = s.icon_path && s.icon_path != '' ? `${environment.assetsUrl}external-brand/oracle/${s.icon_path}` : null;
      view.resourceCounts.push(resource);
    })
    return view;
  }

  convertOciCustomerListDetailsViewData(data: OciAccountType[]): AccountsDetailListViewData {
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
      view.id = s.id;
      // view.accessKey = s.access_key;
      view.totalResourceCount = s.resource_count;
      totalResources = totalResources + s.resource_count;
      view.totalServicesCount = s.service_count;
      view.manage = s.is_managed;
      view.totalAlertEventCount = s.alert_count.event_count;
      totalInformationAlerts = totalInformationAlerts + s.alert_count.information;
      totalCriticalAlerts = totalCriticalAlerts + s.alert_count.critical;
      totalWarningAlerts = totalWarningAlerts + s.alert_count.warning;
      totalEvent = totalEvent + s.alert_count.event_count;
      view.currentMonthCost.amount = Math.round(s.current_month_cost ? s.current_month_cost.amount : 0);
      totalCost = Math.round(totalCost + (s.current_month_cost ? s.current_month_cost.amount : 0));
      // view.monitoring.configured = s.monitoring.configured;
      // view.monitoring.enabled = s.monitoring.enabled;
      // view.monitoring.observium = s.monitoring.observium;
      // view.monitoring.zabbix = s.monitoring.zabbix;
      // if (!view.monitoring.configured) {
      //   view.statsTooltipMessage = 'Configure monitoring';
      // }
      // if (view.monitoring.configured) {
      //   if (!view.monitoring.enabled) {
      //     view.statsTooltipMessage = 'Enable monitoring';
      //   } else {
      //     view.statsTooltipMessage = 'Oracle account statistics';
      //   }
      // }
      viewData.accountDetails.push(view);
    })
    viewData.totalResources = totalResources;
    viewData.totalOCIAccounts = data.length;
    viewData.totalEvent = totalEvent;
    viewData.totalCost = totalCost;
    viewData.totalInformationAlerts = totalInformationAlerts;
    viewData.totalCriticalAlerts = totalCriticalAlerts;
    viewData.totalWarningAlerts = totalWarningAlerts;
    return viewData;
  }

  resetAccessKeyFormErrors() {
    return {
      'access_key': '',
      'secret_key': ''
    };
  }

  accessKeyValidationMessages = {
    'access_key': {
      'required': 'Access Key is required'
    },
    'secret_key': {
      'required': 'Secret Key is required'
    }
  }

  createAccessKeyForm(view: AccountDetailsViewData): FormGroup {
    return this.builder.group({
      'id': [view.id],
      'access_key': [view.accessKey, [Validators.required, NoWhitespaceValidator]],
      'secret_key': ['', [Validators.required]]
    });
  }

  // updateAPIKeys(ociAccountId: string, data: { id: number, access_key: string, secret_key: string }) {
  //   return this.http.post(`/customer/managed/aws/accounts/${ociAccountId}/change_password/`, data);
  // }

  convertToHistoryViewData(history: OciAccountScheduleHistory[]): OciAccountScheduleHistoryViewData[] {
    let viewData: OciAccountScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: OciAccountScheduleHistoryViewData = new OciAccountScheduleHistoryViewData()
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

export class AccountsDetailListViewData {
  constructor() { }
  totalOCIAccounts: number;
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
  accessKey: string;
  id: number;
  subscriptionId: string;
  uuid: string;
  monitoring: DeviceMonitoringTypeViewData = new DeviceMonitoringTypeViewData();
  totalResourceCount: number;
  totalServicesCount: number;
  manage: boolean;
  currentMonthCost: OCIcurrentMonthCostDetails = new OCIcurrentMonthCostDetails();
  totalAlertEventCount: number;
  statsTooltipMessage: string;
  syncInProgress: boolean = false;
}

export class OCIcurrentMonthCostDetails {
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


export class OciAccountScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}


