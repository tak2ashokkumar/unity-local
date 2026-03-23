import { Injectable } from '@angular/core';
import { DatacenterService } from './datacenter.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { DataCenterTabs } from './tabs';


@Injectable()
export class DatacenterResolverService {

  constructor(private dcService: DatacenterService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DataCenterTabs[]> {
    return this.dcService.getDataCenters();
  }
}