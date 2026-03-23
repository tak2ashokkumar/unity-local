import { Injectable } from '@angular/core';
import { DatacenterPrivateCloudService } from './datacenter-private-cloud.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PCTabs } from './tabs';

@Injectable()
export class DatacenterPrivateCloudResolverService {

  constructor(private pcService: DatacenterPrivateCloudService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PCTabs[]> {
    let dcId = route.parent.paramMap.get('dcId');
    return this.pcService.getPrivateClouds(dcId);
  }
}
