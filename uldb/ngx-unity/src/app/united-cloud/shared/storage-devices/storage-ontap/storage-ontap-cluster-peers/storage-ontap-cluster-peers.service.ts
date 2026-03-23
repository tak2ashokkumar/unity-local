import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { StorageOntapClusterPeerType } from './storage-ontap-cluster-peers.type';

@Injectable()
export class StorageOntapClusterPeersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }


  getClusterPeers(clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterPeerType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapClusterPeerType>>(`customer/netapp_cluster/${clusterId}/clusterpeers/`, { params: params });
  }

  convertToViewData(data: StorageOntapClusterPeerType[]): StorageOntapClusterPeerViewData[] {
    let viewData: StorageOntapClusterPeerViewData[] = [];
    data.forEach(d => {
      let pd = new StorageOntapClusterPeerViewData();
      pd.uuid = d.uuid;
      pd.name = d.name ? d.name : 'NA';
      pd.state = d.state ? d.state : 'NA';
      pd.encryptionState = d.encryption_state ? d.encryption_state : 'NA';
      pd.authenticationInUse = d.authentication_in_use ? d.authentication_in_use : 'NA';
      pd.authenticationState = d.authentication_state ? d.authentication_state : 'NA';
      pd.remoteIpAddresses = d.remote_ip_addresses.length ? d.remote_ip_addresses : ['NA'];
      pd.remoteIpAddress = d.remote_ip_addresses.length ? d.remote_ip_addresses.getFirst() : 'NA';
      pd.ipAddressesBadgeCount = d.remote_ip_addresses.length ? d.remote_ip_addresses.length - 1 : 0;
      pd.extraIpAddressList = pd.remoteIpAddresses.length ? pd.remoteIpAddresses.slice(1) : [];
      viewData.push(pd);
    })
    return viewData;
  }
}

export class StorageOntapClusterPeerViewData {
  constructor() { }
  name: string;
  uuid: string;
  state: string;
  encryptionState: string;
  authenticationState: string;
  remoteIpAddresses: string[];
  remoteIpAddress: string;
  extraIpAddressList: string[];
  ipAddressesBadgeCount: number;
  authenticationInUse: string;
}
