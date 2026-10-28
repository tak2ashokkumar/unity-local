import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import {
  VERGEIO_ACCOUNT_BY_ID,
  VERGEIO_COMPONENT_SUMMARY,
  VERGEIO_OPERATION,
  VERGEIO_VIRTUAL_MACHINES,
  VERGEIO_VM_ACTION
} from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { VergeIOAccount } from '../usi-vergeio.type';
import {
  VergeIOComponentSummary,
  VergeIOOperation,
  VergeIOVM,
  VergeIOVmActionResponse
} from './usi-vergeio-detail.type';

@Injectable()
export class UsiVergeioDetailService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getAccount(instanceId: string): Observable<VergeIOAccount> {
    return this.http.get<VergeIOAccount>(VERGEIO_ACCOUNT_BY_ID(instanceId));
  }

  getComponentSummary(instanceId: string): Observable<VergeIOComponentSummary> {
    return this.http.get<VergeIOComponentSummary>(VERGEIO_COMPONENT_SUMMARY(instanceId));
  }

  getVms(instanceId: string, criteria: SearchCriteria): Observable<PaginatedResult<VergeIOVM>> {
    return this.tableService.getData<PaginatedResult<VergeIOVM>>(`${VERGEIO_VIRTUAL_MACHINES()}?cloud_id=${instanceId}`, criteria);
  }

  powerAction(vmId: string, action: string): Observable<VergeIOVmActionResponse> {
    return this.http.post<VergeIOVmActionResponse>(VERGEIO_VM_ACTION(vmId), { action });
  }

  getOperation(operationId: string): Observable<VergeIOOperation> {
    return this.http.get<VergeIOOperation>(VERGEIO_OPERATION(operationId));
  }

  convertToSummaryTiles(summary: VergeIOComponentSummary): VergeIOSummaryTile[] {
    if (!summary) {
      return [];
    }
    return [
      { label: 'Virtual Machines', value: summary.vm, icon: 'fa-object-group' },
      { label: 'Clusters', value: summary.cluster, icon: 'fa-code-branch' },
      { label: 'Hosts', value: summary.host, icon: 'fa-server' },
      { label: 'Datastores', value: summary.datastore, icon: 'fa-hdd' },
      { label: 'Networks', value: summary.network, icon: 'fa-sitemap' },
    ];
  }

  convertToVmViewData(data: VergeIOVM[]): VergeIOVmViewData[] {
    let viewData: VergeIOVmViewData[] = [];
    data.forEach(d => {
      let a = new VergeIOVmViewData();
      a.uuid = d.uuid;
      a.name = d.name ? d.name : 'NA';
      a.powerState = d.power_state ? d.power_state : 'NA';
      a.powerStateClass = this.getPowerStateClass(d.power_state);
      a.clusterId = d.cluster_id ? d.cluster_id : 'NA';
      a.hostId = d.host_id ? d.host_id : 'NA';
      a.cpuCores = d.data && d.data.cpu_cores != null ? d.data.cpu_cores.toString() : 'NA';
      a.ram = d.data && d.data.ram != null ? d.data.ram.toString() : 'NA';
      viewData.push(a);
    });
    return viewData;
  }

  private getPowerStateClass(state: string): string {
    switch ((state || '').toLowerCase()) {
      case 'running': return 'text-success';
      case 'stopped': return 'text-danger';
      default: return 'text-muted';
    }
  }
}

export interface VergeIOSummaryTile {
  label: string;
  value: number;
  icon: string;
}

export class VergeIOVmViewData {
  uuid: string;
  name: string;
  powerState: string;
  powerStateClass: string;
  clusterId: string;
  hostId: string;
  cpuCores: string;
  ram: string;
  actionInProgress: boolean = false;
}
