import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_GCP_BILLING_ACCOUNTS, GET_GCP_BILLING_DATASETS, UPDATE_GCP_BILLING_DETAILS, UPDATE_GCP_SUSTAINABILITY_DETAILS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { GcpAccountIntegrationType, GcpAccountScheduleHistory } from 'src/app/app-home/infra-as-a-service/public-cloud/gcp.type';

@Injectable()
export class UsiPublicCloudGcpService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getInstances(criteria: SearchCriteria): Observable<PaginatedResult<GcpAccountIntegrationType>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<GcpAccountIntegrationType>>(`/customer/integration/gcp/accounts/`, { params: params });
  }

  syncNow(accountId: string) {
    return this.http.get<CeleryTask>(`/customer/integration/gcp/accounts/${accountId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  convertToViewData(accounts: GcpAccountIntegrationType[]): GCPAccountViewData[] {
    let viewData: GCPAccountViewData[] = [];
    accounts.map(account => {
      let data = new GCPAccountViewData();
      data.uuid = account.uuid;
      data.userName = account.name;
      data.projectId = account.project_id;
      data.email = account.email;
      data.billingEnabled = account.billing_enabled;
      data.billingAccount = account.billing_account ? account.billing_account : '';
      data.billingDataset = account.dataset ? account.dataset : '';
      data.isBillingExists = account.project_id.indexOf('istio') > -1 ? true : false;
      data.co2EmissionEnabled = account.co2emission_enabled ? account.co2emission_enabled : false;
      data.manage = account.is_managed ? 'True' : 'False';
      viewData.push(data);
    });
    return viewData;
  }

  resetAccessKeyFormErrors() {
    return {
      'email': '',
      'service_account_info': ''
    };
  }

  accessKeyValidationMessages = {
    'email': {
      'required': 'Email is required'
    },
    'service_account_info': {
      'required': 'Service Account Info is required'
    }
  }

  createAccessKeyForm(view: GCPAccountViewData): FormGroup {
    return this.builder.group({
      'email': [view.email, [Validators.required, NoWhitespaceValidator]],
      'service_account_info': ['', [Validators.required]]
    });
  }

  updateAPIKeys(uuid: string, data: { access_key: string, secret_key: string }) {
    return this.http.post(`/customer/integration/gcp/accounts/${uuid}/change_password/`, data);
  }

  deleteInstance(instanceId: string) {
    return this.http.delete(`/customer/integration/gcp/accounts/${instanceId}/`);
  }

  getScheduleHistory(accountId: string, criteria: SearchCriteria): Observable<PaginatedResult<GcpAccountScheduleHistory>> {
    return this.tableService.getData<PaginatedResult<GcpAccountScheduleHistory>>(`/customer/integration/gcp/accounts/${accountId}/schedule_history/`, criteria);
  }

  convertToHistoryViewData(history: GcpAccountScheduleHistory[]): GCPAccountScheduleHistoryViewData[] {
    let viewData: GCPAccountScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: GCPAccountScheduleHistoryViewData = new GCPAccountScheduleHistoryViewData()
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


  getGCPBillingDatasets(uuid: string): Observable<string[]> {
    return this.http.get<string[]>(GET_GCP_BILLING_DATASETS(uuid));
  }

  getGCPBillingAccounts(uuid: string): Observable<GCPBillingInfo> {
    return this.http.get<GCPBillingInfo>(GET_GCP_BILLING_ACCOUNTS(uuid));
  }

  resetBillingFormErrors(): any {
    let formErrors = {
      'name': '',
      'billing_account': '',
      'dataset': '',
    };
    return formErrors;
  }

  billingFormValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'billing_account': {
      'required': 'Billing Account is required',
    },
    'dataset': {
      'required': 'Dataset is required',
    }
  };

  buildBillingForm(input: GCPAccountViewData): FormGroup {
    return this.builder.group({
      'uuid': [input.uuid],
      'name': [input.userName, [Validators.required, NoWhitespaceValidator]],
      'billing_account': [input.billingAccount ? input.billingAccount : '', [Validators.required]],
      'dataset': [input.billingDataset ? input.billingDataset : '', [Validators.required]],
    });
  }

  resetSustainabilityFormErrors(): any {
    let formErrors = {
      'name': '',
      'billing_account': '',
      'dataset': '',
    };
    return formErrors;
  }

  sustainabilityFormValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'billing_account': {
      'required': 'Sustainability Account is required',
    },
    'dataset': {
      'required': 'Dataset is required',
    }
  };

  buildSustainabilityForm(input: GCPAccountViewData): FormGroup {
    return this.builder.group({
      'uuid': [input.uuid],
      'name': [input.userName, [Validators.required, NoWhitespaceValidator]],
      'billing_account': [input.billingAccount ? input.billingAccount : '', [Validators.required]],
      'dataset': [input.billingDataset ? input.billingDataset : '', [Validators.required]],
    });
  }

  updateBillingDetails(data: { uuid: string, name: string, billing_account: string, dataset: string }) {
    return this.http.put(UPDATE_GCP_BILLING_DETAILS(data.uuid), data);
  }

  updateSustanabilityDetails(data: { uuid: string, name: string, billing_account: string, dataset: string }) {
    return this.http.put(UPDATE_GCP_SUSTAINABILITY_DETAILS(data.uuid), data);
  }
}

export class GCPAccountViewData {
  constructor() { }
  userName: string;
  email: string;
  uuid: string;
  projectId: string;
  manage: string;
  billingEnabled: boolean;
  billingAccount: string;
  billingDataset: string;
  isBillingExists: boolean;
  co2EmissionEnabled: boolean;
  syncInProgress: boolean = false;
}

export class GCPAccountScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}

