import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Injectable()
export class PublicCloudResolverService {

  constructor() { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TabData[]> {
    return of(tabData);
  }
}
const tabData: TabData[] = [
  {
    name: 'AWS',
    url: '/unitycloud/publiccloud/aws',
    icon: 'fab fa-aws'
  },
  {
    name: 'Azure',
    url: '/unitycloud/publiccloud/azure',
    icon: 'cfa-azure'
  },
  {
    name: 'Google Cloud',
    url: '/unitycloud/publiccloud/gcp',
    icon: 'cfa-gcp'
  },
  {
    name: 'Oracle',
    url: '/unitycloud/publiccloud/oracle',
    icon: 'cfa-oci'
  }
];