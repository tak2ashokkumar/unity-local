import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService, PlatFormMapping, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { VeeamAccountSummaryType, veeamAccountType } from './usio-veeam.type';
import { Observable } from 'rxjs';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Injectable()
export class UsioVeeamService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService) { }

  getVeeamAccountsSummary(): Observable<VeeamAccountSummaryType> {
    return this.http.get<VeeamAccountSummaryType>(`/customer/veeam/accounts/summary/`);
  }

  getVeeamAccounts(criteria: SearchCriteria): Observable<PaginatedResult<veeamAccountType>> {
    return this.tableService.getData<PaginatedResult<veeamAccountType>>(`/customer/veeam/accounts/`, criteria);
  }

  syncNow(veeamId: string) {
    return this.http.get<CeleryTask>(`/customer/veeam/accounts/${veeamId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  convertToVeeamAccountsSummary(data: VeeamAccountSummaryType): VeeamAccountSummaryViewData {
    let view = new VeeamAccountSummaryViewData();
    view.totalVMs = data.virtual_machines?.total;
    view.vmsBackedupCount = data.virtual_machines?.backed_up;
    view.successCount = data.status?.success;
    view.failedCount = data.status?.failed;
    view.warningCount = data.status?.warning;
    view.noneCount = data.status?.none;
    view.totalBackups = data.status?.total;
    return view;
  }

  convertToViewData(data: veeamAccountType[]): VeeamAccountViewData[] {
    let viewData: VeeamAccountViewData[] = [];
    data.forEach(d => {
      let a: VeeamAccountViewData = new VeeamAccountViewData();
      a.name = d.name;
      a.veeamId = d.uuid;
      a.hostName = d.host_name;
      a.username = d.username;
      a.platformType = d.platform_type;
      a.platformTypeImgURL = this.utilSvc.getCloudLogo(d.platform_type);
      a.status = this.utilSvc.getDeviceStatus(d.status);
      a.scheduleType = d.schedule_meta?.schedule_type;
      a.proxyUrl = d.proxy && d.proxy.backend_url ? d.proxy.backend_url : null;
      a.proxyTooltip = a.proxyUrl ? 'Manage In New Tab' : 'Not Configured';
      viewData.push(a);
    });
    return viewData;
  }

  deleteVeeam(veeamId: string) {
    return this.http.delete(`/customer/veeam/accounts/${veeamId}/`);
  }

}

export class VeeamAccountSummaryViewData {
  constructor() { }
  totalVMs: number = 0;
  vmsBackedupCount: number = 0;
  totalBackups: number = 0;
  successCount: number = 0;
  failedCount: number = 0;
  warningCount: number = 0;
  noneCount: number = 0;
}

export class VeeamAccountViewData {
  constructor() { }
  name: string;
  veeamId: string;
  hostName: string;
  platformType: string;
  platformTypeImgURL: string;
  username: string;
  scheduleType: string;
  status: string;
  statusIcon: string;
  statusTooltip: string;
  proxyUrl: string;
  proxyTooltip: string;
  syncInProgress: boolean = false;
}

export const privateCloudTypeList = [
  {
    'label': PlatFormMapping.VMWARE,
    'value': ServerSidePlatFormMapping.VMWARE
  },
  {
    'label': PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER,
    'value': ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER
  },
]

export const scheduleTypeList: LabelValueType[] = [
  {
    'label': 'None',
    'value': 'none'
  },
  {
    'label': 'Hourly',
    'value': 'hourly'
  },
  {
    'label': 'Daily',
    'value': 'daily'
  },
  {
    'label': 'Weekly',
    'value': 'weekly'
  },
  {
    'label': 'Monthly',
    'value': 'monthly'
  }
]

export const statusList: LabelValueType[] = [
  {
    'label': 'Up',
    'value': '1'
  },
  {
    'label': 'Down',
    'value': '0'
  },
  {
    'label': 'Unknown',
    'value': '-1'
  }
]