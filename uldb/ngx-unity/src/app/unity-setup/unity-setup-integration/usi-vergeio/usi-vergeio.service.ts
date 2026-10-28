import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { VERGEIO_ACCOUNT_BY_ID, VERGEIO_ACCOUNTS, VERGEIO_CHECK_CONNECTION, VERGEIO_DISCOVERY, VERGEIO_SYNC } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { VergeIOAccount, VergeIODiscoveryHistory } from './usi-vergeio.type';

// Default resource set synced/discovered for a VergeIO account.
export const VERGEIO_SYNC_COMPONENTS: string[] = ['vm', 'cluster', 'host', 'datastore', 'network'];

@Injectable()
export class UsiVergeioService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getAccounts(criteria: SearchCriteria): Observable<PaginatedResult<VergeIOAccount>> {
    return this.tableService.getData<PaginatedResult<VergeIOAccount>>(VERGEIO_ACCOUNTS(), criteria);
  }

  deleteAccount(instanceId: string) {
    return this.http.delete(VERGEIO_ACCOUNT_BY_ID(instanceId));
  }

  toggleEnabled(instanceId: string, enabled: boolean): Observable<VergeIOAccount> {
    return this.http.patch<VergeIOAccount>(VERGEIO_ACCOUNT_BY_ID(instanceId), { enabled });
  }

  // Re-test connectivity for an existing account (uses stored credentials).
  checkConnection(instanceId: string): Observable<{ connected: boolean }> {
    return this.http.post<{ connected: boolean }>(VERGEIO_CHECK_CONNECTION(instanceId), {});
  }

  syncNow(instanceId: string): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(VERGEIO_SYNC(instanceId), { components: VERGEIO_SYNC_COMPONENTS });
  }

  runDiscovery(instanceId: string): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(VERGEIO_DISCOVERY(instanceId), { components: VERGEIO_SYNC_COMPONENTS });
  }

  getDiscoveryHistory(instanceId: string, criteria: SearchCriteria): Observable<PaginatedResult<VergeIODiscoveryHistory>> {
    return this.tableService.getData<PaginatedResult<VergeIODiscoveryHistory>>(VERGEIO_DISCOVERY(instanceId), criteria);
  }

  convertToDiscoveryViewData(history: VergeIODiscoveryHistory[]): VergeIODiscoveryViewData[] {
    let viewData: VergeIODiscoveryViewData[] = [];
    history.forEach(h => {
      let a = new VergeIODiscoveryViewData();
      a.status = h.status ? h.status : 'NA';
      a.statusClass = this.getDiscoveryStatusClass(h.status);
      a.completedAt = h.completed_at ? this.utilSvc.toUnityOneDateFormat(h.completed_at) : 'NA';
      a.error = h.error ? h.error : '';
      a.vm = h.summary && h.summary.vm != null ? h.summary.vm : 0;
      a.cluster = h.summary && h.summary.cluster != null ? h.summary.cluster : 0;
      a.host = h.summary && h.summary.host != null ? h.summary.host : 0;
      a.network = h.summary && h.summary.network != null ? h.summary.network : 0;
      a.datastore = h.summary && h.summary.datastore != null ? h.summary.datastore : 0;
      viewData.push(a);
    });
    return viewData;
  }

  private getDiscoveryStatusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED': return 'text-success';
      case 'FAILED':
      case 'ERROR': return 'text-danger';
      case 'IN_PROGRESS':
      case 'RUNNING':
      case 'SUBMITTED':
      case 'PENDING': return 'text-warning';
      default: return 'text-muted';
    }
  }

  convertToViewData(data: VergeIOAccount[]): VergeIOAccountViewData[] {
    let viewData: VergeIOAccountViewData[] = [];
    data.forEach(v => {
      let view: VergeIOAccountViewData = new VergeIOAccountViewData();
      view.uuid = v.uuid;
      view.name = v.name ? v.name : 'NA';
      view.hostname = v.hostname ? v.hostname : 'NA';
      view.status = v.status ? v.status : 'NA';
      view.statusClass = this.getStatusClass(v.status);
      view.enabled = v.enabled;
      view.enabledIcon = v.enabled ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      view.isManaged = v.is_managed;
      view.isManagedIcon = v.is_managed ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      viewData.push(view);
    });
    return viewData;
  }

  private getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      default: return 'text-muted';
    }
  }
}

export class VergeIOAccountViewData {
  uuid: string;
  name: string;
  hostname: string;
  status: string;
  statusClass: string;
  enabled: boolean;
  enabledIcon: string;
  isManaged: boolean;
  isManagedIcon: string;
  syncInProgress: boolean = false;
  statusInProgress: boolean = false;
  testInProgress: boolean = false;
}

export class VergeIODiscoveryViewData {
  status: string;
  statusClass: string;
  completedAt: string;
  error: string;
  vm: number;
  cluster: number;
  host: number;
  network: number;
  datastore: number;
}
