import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { VcenterClusterResourceSummary } from '../vcenter-clusters.type';
import { VcenterClusterAlertSummaryViewData, VcenterClusterResourcesViewData } from '../vcenter-clusters.service';

@Injectable()
export class VcenterClusterItemsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getClusterResourceData(clusterId: string): Observable<VcenterClusterResourceSummary> {
    let params = new HttpParams().set('cluster_uuid', clusterId);
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

  getClusterAlertData(clusterId: string) {
    let params = new HttpParams().set('cluster_uuid', clusterId);
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
}
