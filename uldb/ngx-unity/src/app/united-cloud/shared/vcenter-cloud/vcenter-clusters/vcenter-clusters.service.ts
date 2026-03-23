import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { VcenterClusterResourceSummary, VcenterClusterSummary, VcenterClusterType, VirtualDcItem } from './vcenter-clusters.type';

@Injectable()
export class VcenterClustersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getVdcList(cloudId: string): Observable<VirtualDcItem[]> {
    let params = new HttpParams().set('cloud_uuid', cloudId).set('page_size', '0');
    return this.http.get<VirtualDcItem[]>(`/rest/vmware/vdcs/`, { params: params });
  }

  getClusterResourceData(cloudId: string): Observable<VcenterClusterResourceSummary> {
    let params = new HttpParams().set('cloud_uuid', cloudId);
    return this.http.get<VcenterClusterResourceSummary>(`/rest/vmware/clusters/cluster_resources/`, { params: params });
  }

  convertToClusterResourcesViewData(data: VcenterClusterResourceSummary): VcenterClusterResourcesViewData {
    let viewData = new VcenterClusterResourcesViewData();
    viewData.total = data.total;
    viewData.host = data.hosts;
    viewData.vm = data.vms;
    viewData.datastore = data.datastores;
    viewData.network = data.networks;
    return viewData;
  }

  getClusterAlertData(cloudId: string) {
    let params = new HttpParams().set('cloud_uuid', cloudId);
    return this.http.get(`/rest/vmware/clusters/cluster_alerts/`, { params: params });
  }

  convertToClusterAlertsViewData(data: any): VcenterClusterAlertSummaryViewData {
    let viewData = new VcenterClusterAlertSummaryViewData();
    viewData.total = data.total;
    viewData.critical = data.critical;
    viewData.warning = data.warning;
    viewData.information = data.information;
    return viewData;
  }

  getClusterSummary(cloudId: string): Observable<VcenterClusterSummary> {
    let params = new HttpParams().set('cloud_uuid', cloudId);
    return this.http.get<VcenterClusterSummary>(`/rest/vmware/clusters/summary/`, { params: params });
  }

  getClusterList(criteria: SearchCriteria, cloudId: string): Observable<PaginatedResult<VcenterClusterType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('cloud_uuid', cloudId);
    return this.http.get<PaginatedResult<VcenterClusterType>>(`/rest/vmware/clusters/`, { params: params });
  }

  convertToClusterViewData(data: VcenterClusterType[]): VcenterClusterViewData[] {
    let viewData = []
    data.map(d => {
      let view = new VcenterClusterViewData();
      view.clusterId = d.uuid;
      view.name = d.name;
      view.hostCount = d.host_count;
      view.totalProcesssor = d.processor_count;
      view.vmCount = d.vm_count;
      view.datastoreCount = d.datastore_count;
      view.networkCount = d.network_count;

      view.totalMemoryValue = d.memory_usage?.total?.value > 0 ? Number(d.memory_usage.total.value.toFixed(2)) : 0;
      view.totalMemoryUnit = d.memory_usage?.total?.unit ? d.memory_usage.total.unit : 'bytes';
      view.memoryAvailableValue = d.memory_usage?.available?.value > 0 ? Number(d.memory_usage.available.value.toFixed(2)) : 0;
      view.memoryAvailableUnit = d.memory_usage?.available?.unit ? d.memory_usage.available.unit : 'bytes';
      view.memoryUsedValue = d.memory_usage?.used?.value > 0 ? Number(d.memory_usage.used.value.toFixed(2)) : 0;
      view.memoryUsedUnit = d.memory_usage?.used?.unit ? d.memory_usage.used.unit : 'bytes';
      view.memoryUsedPercentageValue = d.memory_usage?.consumed_percentage?.value > 0 ? Number(d.memory_usage.consumed_percentage.value.toFixed(2)) : 0;

      view.totalStorageValue = d.storage_usage?.total?.value > 0 ? Number(d.storage_usage.total.value.toFixed(2)) : 0;
      view.totalStorageUnit = d.storage_usage?.total?.unit ? d.storage_usage?.total?.unit : 'bytes';
      view.storageAvailableValue = d.storage_usage?.available?.value > 0 ? Number(d.storage_usage.available.value.toFixed(2)) : 0;
      view.storageAvailableUnit = d.storage_usage?.available?.unit ? d.storage_usage.available.unit : 'bytes';
      view.storageUsedValue = d.storage_usage?.used?.value > 0 ? Number(d.storage_usage?.used?.value.toFixed(2)) : 0;
      view.storageUsedUnit = d.storage_usage?.used?.unit ? d.storage_usage?.used?.unit : 'bytes';
      view.storageUsedPercentageValue = d.storage_usage?.consumed_percentage?.value > 0 ? Number(d.storage_usage.consumed_percentage.value.toFixed(2)) : 0;

      view.totalCpuValue = d.cpu_usage?.total?.value > 0 ? Number(d.cpu_usage.total.value.toFixed(2)) : 0;
      view.totalCpuUnit = d.cpu_usage?.total?.unit ? d.cpu_usage.total.unit : 'Hz';
      view.cpuAvailableValue = d.cpu_usage?.available?.value > 0 ? Number(d.cpu_usage.available.value.toFixed(2)) : 0;
      view.cpuAvailableUnit = d.cpu_usage?.available?.unit ? d.cpu_usage.available.unit : 'Hz';
      view.cpuUsedValue = d.cpu_usage?.used?.value > 0 ? Number(d.cpu_usage.used.value.toFixed(2)) : 0;
      view.cpuUsedUnit = d.cpu_usage?.used?.unit ? d.cpu_usage.used.unit : 'Hz';
      view.cpuUsedPercentageValue = d.cpu_usage?.consumed_percentage?.value > 0 ? Number(d.cpu_usage.consumed_percentage.value.toFixed(2)) : 0;

      viewData.push(view);
    })
    return viewData;
  }
}

export class VcenterClusterResourcesViewData {
  constructor() { }
  total: number;
  datastore: number;
  host: number;
  vm: number;
  network: number;
}

export class VcenterClusterAlertSummaryViewData {
  constructor() { }
  total: number;
  warning: number;
  information: number;
  critical: number;
}

export class VcenterClusterViewData {
  constructor() { }
  clusterId: string;
  name: string;
  hostCount: number;
  totalProcesssor: number;
  vmCount: number;
  datastoreCount: number;
  networkCount: number;
  clusterStatus: string;
  totalMemoryValue: number;
  totalMemoryUnit: string;
  memoryAvailableValue: number;
  memoryAvailableUnit: string;
  memoryUsedValue: number;
  memoryUsedUnit: string;
  memoryUsedPercentageValue: number;
  totalStorageValue: number;
  totalStorageUnit: string;
  storageAvailableValue: number;
  storageAvailableUnit: string;
  storageUsedValue: number;
  storageUsedUnit: string;
  storageUsedPercentageValue: number;
  totalCpuValue: number;
  totalCpuUnit: string;
  cpuAvailableValue: number;
  cpuAvailableUnit: string;
  cpuUsedValue: number;
  cpuUsedUnit: string;
  cpuUsedPercentageValue: number;
}
