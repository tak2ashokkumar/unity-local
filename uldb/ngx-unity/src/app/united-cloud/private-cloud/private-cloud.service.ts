import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PRIVATE_CLOUDS, PRIVATE_CLOUD_BY_ID } from 'src/app/shared/api-endpoint.const';
import { PrivateCloudType, PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { PCTabs } from './tabs';


@Injectable()
export class PrivateCloudService {

  private hideSubTabAnnouncedSource = new Subject<boolean>();
  hideSubTabAnnounced$ = this.hideSubTabAnnouncedSource.asObservable();

  constructor(private http: HttpClient) { }
  getPrivateClouds(): Observable<PCTabs[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<PrivateClouds[]>(PRIVATE_CLOUDS(), { params: params })
      .pipe(map((data: PrivateClouds[]) => {
        let pcTabs: PCTabs[] = [];
        data.forEach(pc => {
          let pcTab: PCTabs = pc;
          pcTab.url = '/unitycloud/pccloud/' + pc.uuid;
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

  hideSubTab(hide: boolean) {
    this.hideSubTabAnnouncedSource.next(hide);
  }

}
