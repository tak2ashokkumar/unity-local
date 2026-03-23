import { Injectable } from '@angular/core';
import { PCTabs, tabItems } from './tabs';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrivateCloudType, PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { HttpClient } from '@angular/common/http';
import { PRIVATE_CLOUDS_BY_DATACENTER_ID, PRIVATE_CLOUD_BY_ID } from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class DatacenterPrivateCloudService {
  constructor(private http: HttpClient) { }

  getPrivateClouds(dcId: string): Observable<PCTabs[]> {
    return this.http.get<PrivateClouds[]>(PRIVATE_CLOUDS_BY_DATACENTER_ID(dcId))
      .pipe(map((data: PrivateClouds[]) => {
        let pcTabs: PCTabs[] = [];
        data.forEach(pc => {
          let pcTab: PCTabs = pc;
          pcTab.url = '/unitycloud/datacenter/' + dcId + '/pccloud/' + pc.uuid;
          pcTabs.push(pcTab);
        });
        return pcTabs;
      }));
  }

  getPrivateCloudById(pcId: string): Observable<PrivateCloudType> {
    return this.http.get<PrivateCloudType>(PRIVATE_CLOUD_BY_ID(pcId));
  }

  polltoUpdateHypervisorMappingsToVMS(pcId: string): Observable<any> {
    return this.http.get<any>(`/customer/customer_vcenters/${pcId}/host_vm/`);
  }
}