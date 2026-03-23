import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DistributedPortsGroupsType, DistributedSwitchesType, NetworksSummaryType, NetworksType } from './vcenter-networks.type';

@Injectable()
export class VcenterNetworksService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getNetworksSummary(cloudId: string, type: string, clusterId: string): Observable<NetworksSummaryType> {
    if (clusterId) {
      return this.http.get<NetworksSummaryType>(`/rest/vmware/clusters/${clusterId}/networks_summary/`);
    } else {
      return this.http.get<NetworksSummaryType>(`/customer/managed/${type}/accounts/${cloudId}/networks_summary/`);
    }
  }

  convertToNetworksSummaryViewData(data: NetworksSummaryType): NetworksSummaryViewdata {
    let viewData: NetworksSummaryViewdata = new NetworksSummaryViewdata();
    viewData.networks = data.networks ? data.networks : 0;
    viewData.distributedSwitches = data.distributed_switches ? data.distributed_switches : 0;
    viewData.distributedPortGroups = data.distributed_port_groups ? data.distributed_port_groups : 0;
    return viewData;
  }

  getNetworks(criteria: SearchCriteria, cloudId: string, clusterId: string): Observable<PaginatedResult<NetworksType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('cloud_uuid', cloudId);
    if (clusterId) {
      params = params.append('cluster_uuid', clusterId);
    }
    return this.http.get<PaginatedResult<NetworksType>>(`/rest/vmware/networks/`, { params: params });
  }

  convertToNetworksViewData(data: NetworksType[]): NetworksViewdata[] {
    let viewData: NetworksViewdata[] = [];
    data.map(d => {
      let view: NetworksViewdata = new NetworksViewdata();
      view.name = d.name;
      view.status = d.network_status;
      view.type = d.network_type;
      view.hosts = d.host_count ? d.host_count : 0;
      view.vms = d.vm_count ? d.vm_count : 0;
      viewData.push(view);
    })
    return viewData;
  }

  getDistributedSwitches(criteria: SearchCriteria, cloudId: string, clusterId: string): Observable<PaginatedResult<DistributedSwitchesType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('cloud_uuid', cloudId);
    if (clusterId) {
      params = params.append('cluster_uuid', clusterId);
    }
    return this.http.get<PaginatedResult<DistributedSwitchesType>>(`/rest/vmware/distributed_switches/`, { params: params });
  }

  convertToDistributedSwitchesViewData(data: DistributedSwitchesType[]): DistributedSwitchesViewdata[] {
    let viewData: DistributedSwitchesViewdata[] = [];
    data.map(d => {
      let view: DistributedSwitchesViewdata = new DistributedSwitchesViewdata();
      view.name = d.name;
      view.status = d.dvs_status;
      view.version = d.version;
      view.noicVersion = d.nioc_version;
      view.lacpVersion = d.lacp_version;
      viewData.push(view);
    })
    return viewData;
  }

  getDistributedPortGroups(criteria: SearchCriteria, cloudId: string, clusterId: string): Observable<PaginatedResult<DistributedPortsGroupsType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('cloud_uuid', cloudId);
    if (clusterId) {
      params = params.append('cluster_uuid', clusterId);
    }
    return this.http.get<PaginatedResult<DistributedPortsGroupsType>>(`/rest/vmware/distributed_ports/`, { params: params });
  }

  convertToDistributedPortGroupsViewData(data: DistributedPortsGroupsType[]): DistributedPortGroupsViewdata[] {
    let viewData: DistributedPortGroupsViewdata[] = [];
    data.map(d => {
      let view: DistributedPortGroupsViewdata = new DistributedPortGroupsViewdata();
      view.name = d.name;
      view.status = d.port_group_status;
      view.distributedSwitch = d.distributed_switch ? d.distributed_switch : 'NA';
      view.vlanId = d.vlan_id ? d.vlan_id : 'NA';
      view.portBinding = d.port_binding ? d.port_binding : 'NA';
      view.ports = d.port_count ? d.port_count : 0;
      view.vms = d.vm_count ? d.vm_count : 0;
      viewData.push(view);
    })
    return viewData;
  }

}

export class NetworksSummaryViewdata {
  constructor() { }
  networks: number = 0;
  distributedSwitches: number = 0;
  distributedPortGroups: number = 0;
}

export class NetworksViewdata {
  constructor() { }
  name: string;
  status: string;
  type: string;
  vms: number = 0;
  hosts: number = 0;
}

export class DistributedSwitchesViewdata {
  constructor() { }
  name: string;
  status: string;
  version: string;
  noicVersion: string;
  lacpVersion: string;
}

export class DistributedPortGroupsViewdata {
  constructor() { }
  name: string;
  status: string;
  distributedSwitch: string;
  vlanId: string;
  portBinding: string;
  vms: number = 0;
  ports: number = 0;
}